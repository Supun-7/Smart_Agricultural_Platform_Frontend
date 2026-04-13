import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routePaths.js";
import { ROIProjectCard, AnimatedROIValue } from "./ROIProjectCard.jsx";
import { InvestmentBreakdownTable } from "./InvestmentBreakdownTable.jsx";
import "../../styles/components/investor/roi.css";

/**
 * CHC Investor return and risk model
 *
 * ROI still means return on investment. Risk is shown as a separate investment-risk index.
 * Backend is the source of truth for investor-specific return, value, and risk metrics.
 *
 * Projected return % = ((expectedInvestorReturn - amountInvested) / expectedInvestorReturn) × 100
 * Live return %      = projected return % × (progressPercentage / 100)
 *
 * Risk index (0–100) is derived on the backend from four weighted factors:
 * - status risk         = current investment status
 * - execution risk      = remaining unverified progress
 * - return risk         = projected return cushion
 * - concentration risk  = how concentrated the investor position is in that land
 *
 * Risk bands:
 * - 0–29   = Low risk
 * - 30–59  = Medium risk
 * - 60–100 = High risk
 *
 * Historical return tracking is sourced from roi_snapshots. The frontend visualizes the series and
 * compares it against the land-market benchmark returned by the backend.
 */

function fmtCurrency(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  });
}

function formatRoi(roi) {
  return `${Number(roi ?? 0) >= 0 ? "+" : ""}${Number(roi ?? 0).toFixed(1)}%`;
}

function clampProgress(value) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(100, Math.max(0, parsed));
}

function normalizeProjectKey(project) {
  return [project?.landId, project?.projectName, project?.location]
    .filter(Boolean)
    .join("::")
    .trim()
    .toLowerCase();
}

function normalizeRoi(profit, expectedReturn) {
  const expected = Number(expectedReturn ?? 0);
  const gain = Number(profit ?? 0);
  if (!Number.isFinite(expected) || expected <= 0 || !Number.isFinite(gain)) return 0;
  const raw = (gain / expected) * 100;
  return Math.max(-100, Math.min(100, raw));
}

function liveFromProjected(projectedRoiPercentage, progressPercentage) {
  return Number(projectedRoiPercentage ?? 0) * (clampProgress(progressPercentage) / 100);
}

function classifyRisk(score) {
  const numeric = Number(score ?? 0);
  if (numeric < 30) return "LOW";
  if (numeric < 60) return "MEDIUM";
  return "HIGH";
}

function estimateRiskScore({ status, progressPercentage, projectedRoiPercentage, investorOwnershipPercentage }) {
  const normalizedStatus = String(status || "PENDING").toUpperCase();
  const statusRisk = normalizedStatus === "COMPLETED" ? 10 : normalizedStatus === "ACTIVE" ? 35 : normalizedStatus === "PENDING" ? 65 : 95;
  const executionRisk = 100 - clampProgress(progressPercentage);
  const projected = Number(projectedRoiPercentage ?? 0);
  const returnRisk = projected >= 25 ? 10 : projected >= 15 ? 20 : projected >= 8 ? 35 : projected >= 0 ? 50 : 75;
  const ownership = Number(investorOwnershipPercentage ?? 0);
  const concentrationRisk = ownership > 35 ? 65 : ownership > 20 ? 45 : ownership > 10 ? 25 : 10;
  return Math.max(0, Math.min(100, Math.round(statusRisk * 0.35 + executionRisk * 0.35 + returnRisk * 0.2 + concentrationRisk * 0.1)));
}

function TooltipHint({ label, text }) {
  return (
    <span className="roiTooltipWrap">
      {label ? <span className="roiTooltipLabel">{label}</span> : null}
      <button type="button" className="roiTooltipTrigger" aria-label={`${label || "Info"}: ${text}`}>
        i
      </button>
      <span className="roiTooltipBubble" role="tooltip">
        {text}
      </span>
    </span>
  );
}

function groupProjects(investedLands, approvedMilestones) {
  const milestoneMap = approvedMilestones.reduce((acc, milestone) => {
    const key = normalizeProjectKey({
      landId: milestone.landId,
      projectName: milestone.projectName,
      location: milestone.location,
    }) || String(milestone.projectName || "").trim().toLowerCase();

    if (!key) return acc;

    const progress = clampProgress(milestone.progressPercentage);
    const existing = acc[key];
    if (!existing || progress >= existing.progressPercentage) {
      acc[key] = {
        progressPercentage: progress,
        milestoneDate: milestone.milestoneDate || "",
        notes: milestone.notes || "",
      };
    }
    return acc;
  }, {});

  const grouped = investedLands.reduce((acc, investment, index) => {
    const key = normalizeProjectKey(investment) || `project-${index}`;

    if (!acc[key]) {
      acc[key] = {
        stableKey: key,
        investmentId: investment.investmentId,
        landId: investment.landId,
        projectName: investment.projectName || "Untitled project",
        location: investment.location || "",
        cropType: investment.cropType || "",
        amountInvested: 0,
        currentEstimatedValue: 0,
        expectedInvestorReturn: 0,
        projectedProfit: 0,
        liveRoiPercentage: 0,
        projectedRoiPercentage: 0,
        progressPercentage: clampProgress(investment.progressPercentage),
        investmentDate: investment.investmentDate || "",
        status: investment.status || "UNKNOWN",
        investmentCount: 0,
        milestoneDate: "",
        milestoneNotes: "",
        riskScore: 0,
        riskLevel: "HIGH",
        investorOwnershipPercentage: 0,
      };
    }

    const group = acc[key];
    group.amountInvested += Number(investment.amountInvested ?? 0);
    group.currentEstimatedValue += Number(investment.currentEstimatedValue ?? 0);
    group.expectedInvestorReturn += Number(investment.expectedInvestorReturn ?? 0);
    group.projectedProfit += Number(investment.projectedProfit ?? 0);
    group.progressPercentage = Math.max(group.progressPercentage, clampProgress(investment.progressPercentage));
    group.investmentCount += 1;
    group.riskScore = Math.max(group.riskScore, Number(investment.riskScore ?? 0));
    group.investorOwnershipPercentage += Number(investment.investorOwnershipPercentage ?? 0);

    const riskPriority = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    if (riskPriority[String(investment.riskLevel || "HIGH").toUpperCase()] >= riskPriority[String(group.riskLevel || "HIGH").toUpperCase()]) {
      group.riskLevel = String(investment.riskLevel || "HIGH").toUpperCase();
    }

    const currentDate = Date.parse(group.investmentDate || 0) || 0;
    const incomingDate = Date.parse(investment.investmentDate || 0) || 0;
    if (incomingDate >= currentDate) {
      group.investmentDate = investment.investmentDate || group.investmentDate;
      group.status = investment.status || group.status;
      group.investmentId = investment.investmentId || group.investmentId;
      group.cropType = investment.cropType || group.cropType;
    }

    return acc;
  }, {});

  return Object.values(grouped).map((project) => {
    const milestoneKey = normalizeProjectKey(project);
    const fallbackKey = String(project.projectName || "").trim().toLowerCase();
    const milestoneMatch = milestoneMap[milestoneKey] || milestoneMap[fallbackKey];
    const liveProgress = milestoneMatch
      ? Math.max(project.progressPercentage, milestoneMatch.progressPercentage)
      : project.progressPercentage;

    const projectedRoiPercentage = normalizeRoi(project.projectedProfit, project.expectedInvestorReturn);
    const liveRoiPercentage = liveFromProjected(projectedRoiPercentage, liveProgress);
    const derivedRiskScore = estimateRiskScore({
      status: project.status,
      progressPercentage: liveProgress,
      projectedRoiPercentage,
      investorOwnershipPercentage: project.investorOwnershipPercentage,
    });

    return {
      ...project,
      progressPercentage: liveProgress,
      milestoneDate: milestoneMatch?.milestoneDate || "",
      milestoneNotes: milestoneMatch?.notes || "",
      projectedRoiPercentage,
      liveRoiPercentage,
      riskScore: Number(project.riskScore ?? 0) || derivedRiskScore,
      riskLevel: classifyRisk(Number(project.riskScore ?? 0) || derivedRiskScore),
      currentEstimatedValue:
        Number(project.amountInvested ?? 0) + Number(project.projectedProfit ?? 0) * (liveProgress / 100),
    };
  });
}

function buildPortfolioSummary(projects, summaryFromApi) {
  const totalInvested = projects.reduce((sum, project) => sum + Number(project.amountInvested ?? 0), 0);
  const weightedLive = totalInvested > 0
    ? projects.reduce((sum, project) => sum + Number(project.amountInvested ?? 0) * Number(project.liveRoiPercentage ?? 0), 0) / totalInvested
    : 0;
  const weightedProjected = totalInvested > 0
    ? projects.reduce((sum, project) => sum + Number(project.amountInvested ?? 0) * Number(project.projectedRoiPercentage ?? 0), 0) / totalInvested
    : 0;
  const weightedRiskScore = totalInvested > 0
    ? projects.reduce((sum, project) => sum + Number(project.amountInvested ?? 0) * Number(project.riskScore ?? 0), 0) / totalInvested
    : 0;
  const bestProject = [...projects].sort((a, b) => Number(b.liveRoiPercentage ?? 0) - Number(a.liveRoiPercentage ?? 0))[0];

  return {
    totalInvested,
    weightedAverageRoi:
      Number.isFinite(Number(summaryFromApi?.weightedLiveRoiPercentage))
        ? Number(summaryFromApi.weightedLiveRoiPercentage)
        : weightedLive,
    weightedProjectedRoi:
      Number.isFinite(Number(summaryFromApi?.weightedProjectedRoiPercentage))
        ? Number(summaryFromApi.weightedProjectedRoiPercentage)
        : weightedProjected,
    weightedRiskScore:
      Number.isFinite(Number(summaryFromApi?.weightedRiskScore))
        ? Number(summaryFromApi.weightedRiskScore)
        : weightedRiskScore,
    weightedRiskLevel: summaryFromApi?.weightedRiskLevel || classifyRisk(weightedRiskScore),
    bestProjectName: summaryFromApi?.bestPerformingProject || bestProject?.projectName || "—",
    lowestRiskProject: summaryFromApi?.lowestRiskProject || "—",
    projectCount: projects.length,
  };
}

function aggregateProjectHistories(projectHistories = []) {
  const grouped = {};

  projectHistories.forEach((project) => {
    const key = normalizeProjectKey(project);
    if (!key) return;

    if (!grouped[key]) {
      grouped[key] = {
        stableKey: key,
        investmentIds: [],
        landId: project.landId,
        projectName: project.projectName,
        location: project.location,
        cropType: project.cropType || "",
        status: project.status,
        historyByDate: {},
      };
    }

    grouped[key].investmentIds.push(project.investmentId);

    (project.history || []).forEach((point) => {
      const date = point.date;
      if (!grouped[key].historyByDate[date]) {
        grouped[key].historyByDate[date] = {
          date,
          investedAmount: 0,
          currentValue: 0,
        };
      }
      grouped[key].historyByDate[date].investedAmount += Number(point.investedAmount ?? 0);
      grouped[key].historyByDate[date].currentValue += Number(point.currentValue ?? 0);
    });
  });

  return Object.values(grouped).map((project) => {
    const history = Object.values(project.historyByDate)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((point) => {
        const invested = Number(point.investedAmount ?? 0);
        const current = Number(point.currentValue ?? 0);
        const roiPercentage = current > 0 ? Math.max(-100, Math.min(100, ((current - invested) / current) * 100)) : 0;
        return {
          ...point,
          roiPercentage,
        };
      });

    return {
      ...project,
      history,
    };
  });
}

function buildProjectEnhancements(projects, roiHistory, landMarket) {
  const historyGroups = aggregateProjectHistories(roiHistory?.projectHistories || []);
  const historyByKey = historyGroups.reduce((acc, item) => {
    acc[item.stableKey] = item;
    return acc;
  }, {});

  const marketRows = [
    ...(landMarket?.investorComparisons || []),
    ...(landMarket?.marketRows || []),
  ];

  const marketByLandId = marketRows.reduce((acc, item) => {
    if (item?.landId && !acc[item.landId]) {
      acc[item.landId] = item;
    }
    return acc;
  }, {});

  return projects.map((project) => {
    const key = normalizeProjectKey(project);
    const history = historyByKey[key]?.history || [];
    const market = marketByLandId[project.landId] || null;
    const marketProjectedRoiPercentage = Number(market?.marketProjectedRoiPercentage ?? 0);
    const relativeToMarketPercentage = Number.isFinite(Number(market?.relativeToMarketPercentage))
      ? Number(market.relativeToMarketPercentage)
      : Number(project.projectedRoiPercentage ?? 0) - marketProjectedRoiPercentage;

    return {
      ...project,
      history,
      province: market?.province || "Unknown",
      benchmarkConfidence: market?.benchmarkConfidence || "LOW",
      marketProjectedRoiPercentage,
      marketRiskScore: Number(market?.marketRiskScore ?? 0),
      marketRiskLevel: market?.marketRiskLevel || project.riskLevel,
      marketMethod: market?.marketMethod || "—",
      marketNote: market?.marketNote || "No market benchmark available for this land yet.",
      provinceFit: market?.provinceFit || "General",
      relativeToMarketPercentage,
    };
  });
}

function TrendBars({ points = [], kind = "roi" }) {
  if (!points.length) {
    return <div className="roiMiniEmpty">No historical snapshots yet.</div>;
  }

  const values = points.map((point) => Number(kind === "value" ? point.totalCurrentValue : point.portfolioRoiPercentage ?? point.roiPercentage ?? 0));
  const max = Math.max(...values, 1);

  return (
    <div className="roiTrendBars">
      {points.map((point, index) => {
        const value = Number(kind === "value" ? point.totalCurrentValue : point.portfolioRoiPercentage ?? point.roiPercentage ?? 0);
        const height = Math.max(10, (Math.abs(value) / max) * 100);
        return (
          <div key={`${point.date}-${index}`} className="roiTrendPoint">
            <div className="roiTrendBarWrap">
              <div className={`roiTrendBar ${value >= 0 ? "positive" : "negative"}`} style={{ height: `${height}%` }} />
            </div>
            <span className="roiTrendValue">{kind === "value" ? fmtCurrency(value) : formatRoi(value)}</span>
            <span className="roiTrendDate">{String(point.date).slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

function ProjectHistoryModal({ project, onClose }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="roiModalBackdrop" onClick={onClose}>
      <div className="roiModalCard" onClick={(event) => event.stopPropagation()}>
        <div className="roiModalHeader">
          <div>
            <p className="roiProjectEyebrow">Return history</p>
            <h3 className="roiModalTitle">{project.projectName}</h3>
            <p className="roiModalSub">{project.location || "Location pending"} · {project.province || "Unknown province"} · {project.cropType || "Crop pending"}</p>
          </div>
          <button type="button" className="roiModalClose" onClick={onClose} aria-label="Close return history">
            ×
          </button>
        </div>

        <div className="roiModalGrid">
          <div className="roiModalPanel">
            <div className="roiModalPanelHeader">
              <h4>Valuation history</h4>
              <span>{project.history?.length || 0} snapshot{(project.history?.length || 0) !== 1 ? "s" : ""}</span>
            </div>
            <TrendBars points={project.history || []} kind="value" />
          </div>

          <div className="roiModalPanel">
            <div className="roiModalPanelHeader">
              <h4>Return performance over time</h4>
              <span>Live investor return</span>
            </div>
            <TrendBars points={project.history || []} kind="roi" />
          </div>
        </div>

        <div className="roiHistoryTableWrap">
          <table className="roiHistoryTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invested</th>
                <th>Current value</th>
                <th>Return</th>
              </tr>
            </thead>
            <tbody>
              {(project.history || []).map((point) => (
                <tr key={point.date}>
                  <td>{point.date}</td>
                  <td>{fmtCurrency(point.investedAmount)}</td>
                  <td>{fmtCurrency(point.currentValue)}</td>
                  <td>
                    <strong className={Number(point.roiPercentage ?? 0) >= 0 ? "roiValuePositive" : "roiValueNegative"}>
                      {formatRoi(point.roiPercentage)}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ROIDashboardSection({
  investedLands = [],
  approvedMilestones = [],
  investmentBreakdown = {},
  portfolioRoiSummary = null,
  roiHistory = null,
  landMarket = null,
}) {
  const groupedProjects = useMemo(() => groupProjects(investedLands, approvedMilestones), [approvedMilestones, investedLands]);
  const roiProjects = useMemo(
    () => buildProjectEnhancements(groupedProjects, roiHistory, landMarket),
    [groupedProjects, landMarket, roiHistory]
  );
  const portfolioSummary = useMemo(
    () => buildPortfolioSummary(roiProjects, portfolioRoiSummary),
    [portfolioRoiSummary, roiProjects]
  );

  const [selectedInvestmentId, setSelectedInvestmentId] = useState("");
  const [scenarioProgress, setScenarioProgress] = useState(100);
  const [scenarioExpectedValue, setScenarioExpectedValue] = useState(0);
  const [historyProjectKey, setHistoryProjectKey] = useState("");

  useEffect(() => {
    if (!roiProjects.length) {
      setSelectedInvestmentId("");
      return;
    }
    const existing = roiProjects.find((project) => String(project.investmentId) === String(selectedInvestmentId));
    const nextProject = existing || roiProjects[0];
    setSelectedInvestmentId(String(nextProject.investmentId));
    setScenarioProgress(clampProgress(nextProject.progressPercentage || 100));
    setScenarioExpectedValue(Number(nextProject.expectedInvestorReturn ?? 0));
  }, [roiProjects, selectedInvestmentId]);

  const selectedProject = useMemo(
    () => roiProjects.find((project) => String(project.investmentId) === String(selectedInvestmentId)) || roiProjects[0] || null,
    [roiProjects, selectedInvestmentId]
  );

  const historyProject = useMemo(
    () => roiProjects.find((project) => project.stableKey === historyProjectKey) || null,
    [historyProjectKey, roiProjects]
  );

  const calculatorMetrics = useMemo(() => {
    if (!selectedProject) return null;
    const scenarioProjectedRoi = normalizeRoi(
      Number(scenarioExpectedValue ?? 0) - Number(selectedProject.amountInvested ?? 0),
      scenarioExpectedValue
    );
    const scenarioRoi = liveFromProjected(scenarioProjectedRoi, scenarioProgress);
    const scenarioRiskScore = estimateRiskScore({
      status: selectedProject.status,
      progressPercentage: scenarioProgress,
      projectedRoiPercentage: scenarioProjectedRoi,
      investorOwnershipPercentage: selectedProject.investorOwnershipPercentage,
    });
    return {
      scenarioRoi,
      scenarioProjectedRoi,
      scenarioRiskScore,
      scenarioRiskLevel: classifyRisk(scenarioRiskScore),
      roiDelta: scenarioRoi - Number(selectedProject.liveRoiPercentage ?? 0),
      projectedDelta: scenarioProjectedRoi - Number(selectedProject.projectedRoiPercentage ?? 0),
      marketDelta: scenarioProjectedRoi - Number(selectedProject.marketProjectedRoiPercentage ?? 0),
      riskDelta: scenarioRiskScore - Number(selectedProject.riskScore ?? 0),
    };
  }, [scenarioExpectedValue, scenarioProgress, selectedProject]);

  const portfolioTrend = roiHistory?.portfolioTrend || [];
  const marketRows = landMarket?.marketRows || [];
  const investorComparisons = roiProjects
    .map((project) => ({
      stableKey: project.stableKey,
      projectName: project.projectName,
      province: project.province,
      cropType: project.cropType,
      status: project.status,
      projectedRoiPercentage: Number(project.projectedRoiPercentage ?? 0),
      liveRoiPercentage: Number(project.liveRoiPercentage ?? 0),
      riskScore: Number(project.riskScore ?? 0),
      riskLevel: project.riskLevel,
      marketProjectedRoiPercentage: Number(project.marketProjectedRoiPercentage ?? 0),
      relativeToMarketPercentage: Number(project.relativeToMarketPercentage ?? 0),
      historyCount: project.history?.length || 0,
      returnRiskBalance: Number(project.projectedRoiPercentage ?? 0) - Number(project.riskScore ?? 0) * 0.35,
    }))
    .sort((a, b) => b.returnRiskBalance - a.returnRiskBalance || b.projectedRoiPercentage - a.projectedRoiPercentage || a.projectName.localeCompare(b.projectName));

  if (!Array.isArray(investedLands)) {
    return (
      <section className="invSection roiSection">
        <h2 className="invSectionTitle">Investor Return & Risk Dashboard</h2>
        <div className="invError"><span>⚠️</span><p>Return and risk data are unavailable right now.</p></div>
      </section>
    );
  }

  if (!roiProjects.length) {
    return (
      <section className="invSection roiSection">
        <div className="roiSectionHeader">
          <div>
            <h2 className="invSectionTitle">Investor Return & Risk Dashboard</h2>
            <p className="roiSectionSub">See live return progress, projected return at completion, investment risk, land-market benchmarks, and historical return once you fund your first project.</p>
          </div>
        </div>

        <div className="roiEmptyState">
          <div className="roiEmptyStateIcon">🌱</div>
          <h3>No return or risk profile yet</h3>
          <p>Explore current opportunities to start building your investor return and investment-risk profile across active farms.</p>
          <Link to={ROUTES.investorOpportunities} className="roiEmptyCta">Explore opportunities</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="invSection roiSection">
        <div className="roiSectionHeader">
          <div>
            <h2 className="invSectionTitle">Investor Return & Risk Dashboard</h2>

          </div>

          <div className="roiSummaryBarWide">
            <div className="roiSummaryMetric">
              <span className="roiSummaryLabel">Total invested</span>
              <strong className="roiSummaryValue">{fmtCurrency(investmentBreakdown.totalInvested ?? portfolioSummary.totalInvested)}</strong>
            </div>
            <div className="roiSummaryMetric roiSummaryMetricAccent">
              <div className="roiMetricHeader">
                <span className="roiSummaryLabel">Weighted live return</span>
                <TooltipHint text="Live return grows only as verified milestones are approved. A not-started farm can still have projected return while live return remains 0%." />
              </div>
              <AnimatedROIValue value={portfolioSummary.weightedAverageRoi} className="roiSummaryValue roiSummaryValueAccent" />
            </div>
            <div className="roiSummaryMetric roiSummaryMetricProjected">
              <div className="roiMetricHeader">
                <span className="roiSummaryLabel">Weighted projected return</span>
                <TooltipHint text="Projected return is the completion-stage investor return percentage returned by the backend. The land-market benchmark is shown separately below." />
              </div>
              <AnimatedROIValue value={portfolioSummary.weightedProjectedRoi} className="roiSummaryValue roiSummaryValueProjected" />
            </div>
            <div className="roiSummaryMetric">
              <span className="roiSummaryLabel">Portfolio risk index</span>
              <strong className="roiSummaryValue roiSummaryBestProject">{portfolioSummary.weightedRiskLevel} · {Math.round(Number(portfolioSummary.weightedRiskScore ?? 0))}/100</strong>
            </div>
            <div className="roiSummaryMetric">
              <span className="roiSummaryLabel">Best return project</span>
              <strong className="roiSummaryValue roiSummaryBestProject">{portfolioSummary.bestProjectName}</strong>
            </div>
          </div>
        </div>



        <div className="roiProjectGrid">
          {roiProjects.map((project) => (
            <ROIProjectCard key={project.stableKey || project.investmentId} project={project} />
          ))}
        </div>

        <div className="roiPanelGrid">
          <div className="roiTrendPanel">
            <div className="roiBreakdownHeader">
              <div>
                <h3 className="roiBreakdownTitle">Portfolio return trend</h3>
                <p className="roiBreakdownSub">Daily and milestone-triggered valuation history sourced from return snapshots.</p>
              </div>
              <span className="roiBreakdownCount">{portfolioTrend.length} snapshot{portfolioTrend.length !== 1 ? "s" : ""}</span>
            </div>
            <TrendBars points={portfolioTrend} kind="roi" />
          </div>

          <div className="roiTrendPanel roiTrendPanelValue">
            <div className="roiBreakdownHeader">
              <div>
                <h3 className="roiBreakdownTitle">Portfolio value trend</h3>
                <p className="roiBreakdownSub">How your estimated current value changed over time.</p>
              </div>
              <span className="roiBreakdownCount">As of {roiHistory?.asOfDate || "today"}</span>
            </div>
            <TrendBars points={portfolioTrend} kind="value" />
          </div>
        </div>

        <div className="roiCalculatorPanel">
          <div className="roiCalculatorHeader">
            <div>
              <h3 className="roiBreakdownTitle">Advanced Return & Risk Calculator</h3>
              <p className="roiBreakdownSub">Model verified progress, expected return, market delta, and risk for a selected project.</p>
            </div>
          </div>

          {selectedProject && calculatorMetrics ? (
            <div className="roiCalculatorGrid">
              <div className="roiCalculatorControls">
                <label className="roiControlField">
                  <span className="roiControlLabel">Project</span>
                  <select className="roiControlInput" value={selectedInvestmentId} onChange={(event) => setSelectedInvestmentId(event.target.value)}>
                    {roiProjects.map((project) => (
                      <option key={project.stableKey || project.investmentId} value={String(project.investmentId)}>
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="roiControlField">
                  <span className="roiControlLabel">Scenario progress</span>
                  <input className="roiControlInput" type="range" min="0" max="100" step="1" value={scenarioProgress} onChange={(event) => setScenarioProgress(Number(event.target.value))} />
                  <span className="roiRangeValue">{scenarioProgress}%</span>
                </label>

                <label className="roiControlField">
                  <span className="roiControlLabel">Scenario expected investor return</span>
                  <input
                    className="roiControlInput"
                    type="number"
                    min="0"
                    step="1000"
                    value={Number.isFinite(Number(scenarioExpectedValue)) ? Number(scenarioExpectedValue) : 0}
                    onChange={(event) => setScenarioExpectedValue(Number(event.target.value || 0))}
                  />
                </label>
              </div>

              <div className="roiCalculatorResults">
                <div className="roiCalculatorHero">
                  <span className="roiCalculatorProject">{selectedProject.projectName}</span>
                  <p className="roiCalculatorMeta">
                    Invested {fmtCurrency(selectedProject.amountInvested)} · Current progress {selectedProject.progressPercentage}% · Market benchmark {formatRoi(selectedProject.marketProjectedRoiPercentage)}
                  </p>
                </div>

                <div className="roiCalculatorStats">
                  <div className="roiMetricCard">
                    <span className="roiMetricLabel">Current live return</span>
                    <AnimatedROIValue value={selectedProject.liveRoiPercentage} className="roiMetricValue roiMetricValueRoi" />
                  </div>
                  <div className="roiMetricCard roiMetricCardProjected">
                    <span className="roiMetricLabel">Current projected return</span>
                    <AnimatedROIValue value={selectedProject.projectedRoiPercentage} className="roiMetricValue roiMetricValueProjected" />
                  </div>
                  <div className="roiMetricCard roiMetricCardHighlight">
                    <span className="roiMetricLabel">Scenario live return</span>
                    <AnimatedROIValue value={calculatorMetrics.scenarioRoi} className="roiMetricValue roiMetricValueRoi" />
                  </div>
                  <div className="roiMetricCard roiMetricCardProjected">
                    <span className="roiMetricLabel">Scenario projected return</span>
                    <AnimatedROIValue value={calculatorMetrics.scenarioProjectedRoi} className="roiMetricValue roiMetricValueProjected" />
                  </div>
                </div>

                <div className="roiScenarioDeltaRow roiScenarioDeltaRowExpanded">
                  <span className="roiScenarioDeltaLabel">Live return change</span>
                  <strong className={calculatorMetrics.roiDelta >= 0 ? "roiScenarioDeltaPositive" : "roiScenarioDeltaNegative"}>
                    {(calculatorMetrics.roiDelta >= 0 ? "+" : "") + calculatorMetrics.roiDelta.toFixed(1)}%
                  </strong>
                  <span className="roiScenarioDeltaLabel">Projected return change</span>
                  <strong className={calculatorMetrics.projectedDelta >= 0 ? "roiScenarioDeltaPositive" : "roiScenarioDeltaNegative"}>
                    {(calculatorMetrics.projectedDelta >= 0 ? "+" : "") + calculatorMetrics.projectedDelta.toFixed(1)}%
                  </strong>
                  <span className="roiScenarioDeltaLabel">Scenario risk</span>
                  <strong className={calculatorMetrics.riskDelta <= 0 ? "roiScenarioDeltaPositive" : "roiScenarioDeltaNegative"}>
                    {calculatorMetrics.scenarioRiskLevel + " · " + calculatorMetrics.scenarioRiskScore + "/100"}
                  </strong>
                  <span className="roiScenarioDeltaLabel">Vs land market</span>
                  <strong className={calculatorMetrics.marketDelta >= 0 ? "roiScenarioDeltaPositive" : "roiScenarioDeltaNegative"}>
                    {(calculatorMetrics.marketDelta >= 0 ? "+" : "") + calculatorMetrics.marketDelta.toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="roiBreakdownPanel">
          <div className="roiBreakdownHeader">
            <div>
              <h3 className="roiBreakdownTitle">Investment Breakdown</h3>
              <p className="roiBreakdownSub">Grouped by project, with live return, projected return, current value, expected return, and investment risk.</p>
            </div>
            <span className="roiBreakdownCount">{portfolioSummary.projectCount} project{portfolioSummary.projectCount !== 1 ? "s" : ""}</span>
          </div>

          <InvestmentBreakdownTable projects={roiProjects} />
        </div>

        <div className="roiBreakdownPanel">
          <div className="roiBreakdownHeader">
            <div>
              <h3 className="roiBreakdownTitle">Compare projects by return and risk</h3>
              <p className="roiBreakdownSub">Use return, risk, and land-market context together to see which positions offer the best balance rather than only the highest return.</p>
            </div>
            <span className="roiBreakdownCount">{investorComparisons.length} tracked</span>
          </div>

          <div className="roiCompareTableWrap">
            <table className="roiCompareTable">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Province</th>
                  <th>Projected return</th>
                  <th>Risk</th>
                  <th>Land-market return</th>
                  <th>Balance</th>
                  <th>Delta</th>
                  <th>History</th>
                </tr>
              </thead>
              <tbody>
                {investorComparisons.map((row) => (
                  <tr key={row.stableKey}>
                    <td>
                      <div className="roiCompareNameCell">
                        <strong>{row.projectName}</strong>
                        <span>{row.cropType || "Crop pending"}</span>
                      </div>
                    </td>
                    <td>{row.province || "Unknown"}</td>
                    <td><strong className="roiValuePositive">{formatRoi(row.projectedRoiPercentage)}</strong></td>
                    <td>
                      <span className={`roiRiskBadge roiRiskInline roiRisk${String(row.riskLevel || "HIGH").charAt(0) + String(row.riskLevel || "HIGH").slice(1).toLowerCase()}`}>
                        {row.riskLevel} · {row.riskScore}/100
                      </span>
                    </td>
                    <td>{formatRoi(row.marketProjectedRoiPercentage)}</td>
                    <td>
                      <strong className={row.returnRiskBalance >= 0 ? "roiValuePositive" : "roiValueNegative"}>
                        {(row.returnRiskBalance >= 0 ? "+" : "") + row.returnRiskBalance.toFixed(1)}
                      </strong>
                    </td>
                    <td>
                      <strong className={row.relativeToMarketPercentage >= 0 ? "roiValuePositive" : "roiValueNegative"}>
                        {(row.relativeToMarketPercentage >= 0 ? "+" : "") + row.relativeToMarketPercentage.toFixed(1)}%
                      </strong>
                    </td>
                    <td>
                      <button type="button" className="roiHistoryBtn" onClick={() => setHistoryProjectKey(row.stableKey)}>
                        {row.historyCount > 0 ? `View (${row.historyCount})` : "Open"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="roiBreakdownPanel roiMarketPanel">
          <div className="roiBreakdownHeader">
            <div>
              <h3 className="roiBreakdownTitle">Sri Lanka land market return & risk</h3>
              <p className="roiBreakdownSub">Province-and-crop benchmark return and benchmark risk across the land market. Official benchmark crops use Sri Lankan cost and price data; other crop families are marked as indicative.</p>
            </div>
            <span className="roiBreakdownCount">{landMarket?.summary?.updatedAt || "Updated today"}</span>
          </div>

          <div className="roiMethodologyList">
            {(landMarket?.methodology || []).map((item, index) => (
              <div key={index} className="roiMethodologyItem">{item}</div>
            ))}
          </div>

          <div className="roiMarketSummaryGrid">
            <div className="roiSummaryMetric">
              <span className="roiSummaryLabel">Coverage</span>
              <strong className="roiSummaryValue">{landMarket?.summary?.coverageCount ?? marketRows.length} lands</strong>
            </div>
            <div className="roiSummaryMetric roiSummaryMetricProjected">
              <span className="roiSummaryLabel">Top province</span>
              <strong className="roiSummaryValue roiSummaryValueProjected">{landMarket?.summary?.topProvince || "—"}</strong>
            </div>
            <div className="roiSummaryMetric roiSummaryMetricAccent">
              <span className="roiSummaryLabel">Top crop benchmark</span>
              <strong className="roiSummaryValue roiSummaryValueAccent">{landMarket?.summary?.topCrop || "—"}</strong>
            </div>
            <div className="roiSummaryMetric">
              <span className="roiSummaryLabel">Top benchmark return</span>
              <strong className="roiSummaryValue">{formatRoi(landMarket?.summary?.topBenchmarkRoiPercentage || 0)}</strong>
            </div>
          </div>

          <div className="roiMarketTableWrap">
            <table className="roiMarketTable">
              <thead>
                <tr>
                  <th>Land / Project</th>
                  <th>Province</th>
                  <th>Crop</th>
                  <th>Market return</th>
                  <th>Market risk</th>
                  <th>Confidence</th>
                  <th>Fit</th>
                </tr>
              </thead>
              <tbody>
                {marketRows.slice(0, 12).map((row) => (
                  <tr key={row.landId} className={row.investedByCurrentUser ? "roiMarketRowActive" : ""}>
                    <td>
                      <div className="roiCompareNameCell">
                        <strong>{row.projectName}</strong>
                        <span>{row.location || "Location pending"}</span>
                      </div>
                    </td>
                    <td>{row.province || "Unknown"}</td>
                    <td>{row.cropType || "Other"}</td>
                    <td><strong className="roiValuePositive">{formatRoi(row.marketProjectedRoiPercentage)}</strong></td>
                    <td>
                      <span className={`roiRiskBadge roiRiskInline roiRisk${String(row.marketRiskLevel || "HIGH").charAt(0) + String(row.marketRiskLevel || "HIGH").slice(1).toLowerCase()}`}>
                        {row.marketRiskLevel} · {row.marketRiskScore}/100
                      </span>
                    </td>
                    <td>
                      <span className={`roiTableBadge ${String(row.benchmarkConfidence || "LOW").toLowerCase() === "high" ? "roiTableBadgeSuccess" : String(row.benchmarkConfidence || "LOW").toLowerCase() === "medium" ? "roiTableBadgePending" : "roiTableBadgeMuted"}`}>
                        {row.benchmarkConfidence}
                      </span>
                    </td>
                    <td>{row.provinceFit || "General"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ProjectHistoryModal project={historyProject} onClose={() => setHistoryProjectKey("")} />
    </>
  );
}
