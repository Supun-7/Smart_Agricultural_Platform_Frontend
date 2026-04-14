import { useMemo, useState } from "react";

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

function TooltipHint({ text }) {
  return (
    <span className="roiInlineTooltip">
      <button type="button" className="roiTooltipTrigger" aria-label={text}>
        i
      </button>
      <span className="roiTooltipBubble" role="tooltip">
        {text}
      </span>
    </span>
  );
}

export function InvestmentBreakdownTable({ projects = [] }) {
  const [sortConfig, setSortConfig] = useState({ key: "riskScore", direction: "asc" });

  function toggleSort(key) {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  }

  const sortedProjects = useMemo(() => {
    const sorted = [...projects];

    sorted.sort((a, b) => {
      const left = a[sortConfig.key];
      const right = b[sortConfig.key];
      if (typeof left === "string" || typeof right === "string") {
        const result = String(left ?? "").localeCompare(String(right ?? ""));
        return sortConfig.direction === "asc" ? result : -result;
      }
      const result = Number(left ?? 0) - Number(right ?? 0);
      return sortConfig.direction === "asc" ? result : -result;
    });

    return sorted;
  }, [projects, sortConfig]);

  function sortIndicator(key) {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  }

  return (
    <div className="roiTableWrap">
      <table className="roiTable">
        <thead>
          <tr>
            <th>
              <button type="button" className="roiSortButton" onClick={() => toggleSort("projectName")}>
                Project {sortIndicator("projectName")}
              </button>
            </th>
            <th>
              <button type="button" className="roiSortButton" onClick={() => toggleSort("amountInvested")}>
                Amount invested {sortIndicator("amountInvested")}
              </button>
            </th>
            <th>Current value</th>
            <th>Expected return</th>
            <th>
              <div className="roiTableHeadInline">
                <button type="button" className="roiSortButton" onClick={() => toggleSort("liveRoiPercentage")}>
                  Live return % {sortIndicator("liveRoiPercentage")}
                </button>
                <TooltipHint text="Live return is the portion of investor return already unlocked by verified progress. It is separate from the risk score." />
              </div>
            </th>
            <th>
              <div className="roiTableHeadInline">
                <button type="button" className="roiSortButton" onClick={() => toggleSort("projectedRoiPercentage")}>
                  Projected return % {sortIndicator("projectedRoiPercentage")}
                </button>
                <TooltipHint text="Projected return is the completion-stage upside for this investor position. Risk uses a separate index." />
              </div>
            </th>
            <th>Progress</th>
            <th>
              <div className="roiTableHeadInline">
                <button type="button" className="roiSortButton" onClick={() => toggleSort("riskScore")}>
                  Risk index {sortIndicator("riskScore")}
                </button>
                <TooltipHint text="Risk index combines project status, remaining progress, return cushion, and position concentration. Lower is safer." />
              </div>
            </th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {sortedProjects.map((project) => {
            const projectStatus = project.status || "UNKNOWN";
            const roiClass = Number(project.liveRoiPercentage ?? 0) > 0 ? "roiValuePositive" : "roiValueFlat";
            const projectedRoiClass = Number(project.projectedRoiPercentage ?? 0) > 0 ? "roiValueProjected" : "roiValueFlat";
            const statusClass =
              projectStatus === "ACTIVE"
                ? "roiTableBadgePositive"
                : projectStatus === "PENDING"
                  ? "roiTableBadgePending"
                  : projectStatus === "COMPLETED"
                    ? "roiTableBadgeCompleted"
                    : "roiTableBadgeMuted";

            return (
              <tr key={project.stableKey || project.investmentId}>
                <td>
                  <div className="roiTableProjectCell">
                    <strong>{project.projectName}</strong>
                    <span>{project.location || "Location pending"}</span>
                  </div>
                </td>
                <td>{fmtCurrency(project.amountInvested)}</td>
                <td>{fmtCurrency(project.currentEstimatedValue)}</td>
                <td>{fmtCurrency(project.expectedInvestorReturn)}</td>
                <td><strong className={roiClass}>{formatRoi(project.liveRoiPercentage)}</strong></td>
                <td><strong className={projectedRoiClass}>{formatRoi(project.projectedRoiPercentage)}</strong></td>
                <td>
                  <div className="roiTableProgressCell">
                    <div className="roiTableProgressTrack">
                      <div className="roiTableProgressFill" style={{ width: `${Number(project.progressPercentage ?? 0)}%` }} />
                    </div>
                    <span>{Number(project.progressPercentage ?? 0)}%</span>
                  </div>
                </td>
                <td>
                  <span className={`roiRiskBadge roiRiskInline roiRisk${String(project.riskLevel || 'HIGH').charAt(0) + String(project.riskLevel || 'HIGH').slice(1).toLowerCase()}`}>
                    {(project.riskLevel || "HIGH") + " · " + Number(project.riskScore ?? 0) + "/100"}
                  </span>
                </td>
                <td>
                  <span className={`roiTableBadge ${statusClass}`}>{projectStatus}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
