import { useEffect, useMemo, useState } from "react";

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

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function getStatusTone(status, liveRoi) {
  const normalized = String(status ?? "").toUpperCase();
  if (normalized === "COMPLETED") return "roiCardBadgeCompleted";
  if (normalized === "PENDING") return "roiCardBadgePending";
  if (normalized === "CANCELLED") return "roiCardBadgeMuted";
  if (Number(liveRoi ?? 0) <= 0) return "roiCardBadgeFlat";
  return "roiCardBadgePositive";
}

function getRiskTone(riskLevel) {
  const normalized = String(riskLevel ?? "").toUpperCase();
  if (normalized === "LOW") return "roiRiskLow";
  if (normalized === "MEDIUM") return "roiRiskMedium";
  return "roiRiskHigh";
}

function TooltipHint({ text }) {
  return (
    <span className="roiTooltipWrap roiTooltipWrapCompact">
      <button type="button" className="roiTooltipTrigger" aria-label={text}>
        i
      </button>
      <span className="roiTooltipBubble" role="tooltip">
        {text}
      </span>
    </span>
  );
}

export function AnimatedROIValue({ value, className = "", duration = 900 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number.isFinite(Number(value)) ? Number(value) : 0;
    let frameId = 0;
    let startTime = 0;

    function tick(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);
      if (progress < 1) frameId = window.requestAnimationFrame(tick);
    }

    setDisplayValue(0);
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [duration, value]);

  return <span className={className}>{formatRoi(displayValue)}</span>;
}

export function ROIProjectCard({ project }) {
  const {
    projectName,
    location,
    amountInvested,
    expectedInvestorReturn,
    currentEstimatedValue,
    liveRoiPercentage,
    projectedRoiPercentage,
    progressPercentage,
    status,
    milestoneDate,
    investmentCount,
    riskLevel,
    riskScore,
    marketProjectedRoiPercentage,
    relativeToMarketPercentage,
  } = project;

  const badgeClass = getStatusTone(status, liveRoiPercentage);
  const verifiedProgress = clamp(Number(progressPercentage ?? 0), 0, 100);
  const riskRingValue = clamp(Number(riskScore ?? 0), 0, 100);

  const roiToneClass = useMemo(() => {
    const level = String(riskLevel ?? "HIGH").toUpperCase();
    if (level === "LOW") return "roiRingPositive";
    if (level === "MEDIUM") return "roiRingPending";
    return "roiRingFlat";
  }, [riskLevel]);

  return (
    <article className="roiProjectCard">
      <div className="roiProjectCardTop">
        <div className="roiProjectIdentity">
          <p className="roiProjectEyebrow">Return & Risk View</p>
          <h3 className="roiProjectTitle">{projectName}</h3>
          <p className="roiProjectMeta">📍 {location || "Location pending"}</p>
        </div>

        <div className="roiCardTopBadges">
          <span className={`roiCardBadge ${badgeClass}`}>{status || "UNKNOWN"}</span>
          <span className={`roiRiskBadge ${getRiskTone(riskLevel)}`}>{riskLevel || "HIGH"} risk · {Number(riskScore ?? 0)}/100</span>
        </div>
      </div>

      <div className="roiProjectHero">
        <div className="roiRingPanel">
          <div
            className={`roiRing ${roiToneClass}`}
            style={{ "--roi-progress": `${riskRingValue}%` }}
            aria-label={`${riskRingValue} out of 100 investment risk score`}
          >
            <div className="roiRingInner">
              <span className="roiRingLabel">Risk index</span>
              <strong className="roiRingValue">{riskRingValue}/100</strong>
            </div>
          </div>

          <div className="roiRingCaption">
            <span className="roiRingCaptionTitle">Risk band</span>
            <strong className="roiRingCaptionValue">{riskLevel || "HIGH"}</strong>
          </div>
        </div>

        <div className="roiProjectMetrics">
          <div className="roiMetricCard">
            <span className="roiMetricLabel">Amount invested</span>
            <strong className="roiMetricValue roiMetricValueMoney">{fmtCurrency(amountInvested)}</strong>
          </div>

          <div className="roiMetricCard">
            <span className="roiMetricLabel">Current estimated value</span>
            <strong className="roiMetricValue roiMetricValueMoney">{fmtCurrency(currentEstimatedValue)}</strong>
          </div>

          <div className="roiMetricCard roiMetricCardHighlight">
            <div className="roiMetricHeader">
              <span className="roiMetricLabel">Live return</span>
              <TooltipHint text="Live return shows the portion of investor return already unlocked by verified farm progress. It is not the same thing as risk." />
            </div>
            <AnimatedROIValue value={liveRoiPercentage} className="roiMetricValue roiMetricValueRoi" />
          </div>

          <div className="roiMetricCard roiMetricCardProjected">
            <div className="roiMetricHeader">
              <span className="roiMetricLabel">Projected return</span>
              <TooltipHint text="Projected return shows the completion-stage upside for this investor position. Risk is calculated separately from status, remaining progress, return cushion, and concentration." />
            </div>
            <AnimatedROIValue value={projectedRoiPercentage} className="roiMetricValue roiMetricValueProjected" />
          </div>

          <div className="roiMetricCard">
            <span className="roiMetricLabel">Expected investor return</span>
            <strong className="roiMetricValue roiMetricValueMoney">{fmtCurrency(expectedInvestorReturn)}</strong>
          </div>

          <div className="roiMetricCard">
            <span className="roiMetricLabel">Land-market return</span>
            <strong className="roiMetricValue roiMetricValueProjected">{formatRoi(marketProjectedRoiPercentage)}</strong>
          </div>

          <div className="roiMetricCard">
            <span className="roiMetricLabel">Return vs market</span>
            <strong className={`roiMetricValue ${Number(relativeToMarketPercentage ?? 0) >= 0 ? "roiValuePositive" : "roiValueNegative"}`}>
              {(Number(relativeToMarketPercentage ?? 0) >= 0 ? "+" : "") + Number(relativeToMarketPercentage ?? 0).toFixed(1)}%
            </strong>
          </div>

          <div className="roiMetricCard">
            <span className="roiMetricLabel">Position summary</span>
            <strong className="roiMetricValue">{investmentCount || 1} contribution{Number(investmentCount) > 1 ? "s" : ""}</strong>
          </div>
        </div>
      </div>

      <div className="roiProjectFooter">
        <div className="roiProgressRail">
          <div className="roiProgressRailFill" style={{ width: `${verifiedProgress}%` }} />
        </div>

        <div className="roiProjectFootnoteRow">
          <span className="roiProjectFootnote">{verifiedProgress}% verified progress</span>
          <span className="roiProjectFootnote">{milestoneDate ? `Updated ${milestoneDate}` : "Awaiting newer milestone approvals"}</span>
          <span className="roiProjectFootnote">Return model + risk model</span>
        </div>
      </div>
    </article>
  );
}
