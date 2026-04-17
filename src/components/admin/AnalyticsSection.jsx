import { useState, useCallback } from "react";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics.js";
import "../../styles/pages/admin/analytics.css";

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(val) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(val ?? 0));
}

function fmtShort(val) {
  const n = Number(val ?? 0);
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `LKR ${(n / 1_000).toFixed(0)}K`;
  return `LKR ${n.toFixed(0)}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

/** AC-2 – Total platform investment card */
function TotalInvestmentCard({ value }) {
  return (
    <div className="anlCard anlCardAccent">
      <div className="anlCardIcon">💰</div>
      <div className="anlCardBody">
        <span className="anlCardLabel">Total Platform Investment</span>
        <span className="anlCardValue">{fmt(value)}</span>
        <span className="anlCardSub">Across all active projects</span>
      </div>
    </div>
  );
}

/** AC-3 – Active users broken down by role */
function ActiveUsersPanel({ data }) {
  const roles = [
    { key: "farmers",   label: "Farmers",   icon: "🌾", color: "var(--brand)" },
    { key: "investors", label: "Investors", icon: "💼", color: "#30a2ff" },
    { key: "auditors",  label: "Auditors",  icon: "🔍", color: "#ffc107" },
  ];

  return (
    <div className="anlPanel">
      <h3 className="anlPanelTitle">Active Users by Role</h3>
      <div className="anlRoleGrid">
        {roles.map(({ key, label, icon, color }) => (
          <div key={key} className="anlRoleCard" style={{ "--role-color": color }}>
            <span className="anlRoleIcon">{icon}</span>
            <span className="anlRoleCount">{data?.[key] ?? 0}</span>
            <span className="anlRoleLabel">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** AC-4 – Project status counts */
function ProjectStatusPanel({ data }) {
  const statuses = [
    {
      key: "active",
      label: "Active",
      desc: "Open for investment",
      icon: "🟢",
      cls: "anlStatusActive",
    },
    {
      key: "funded",
      label: "Funded",
      desc: "Target reached",
      icon: "✅",
      cls: "anlStatusFunded",
    },
    {
      key: "completed",
      label: "Completed",
      desc: "Closed / harvested",
      icon: "🏁",
      cls: "anlStatusCompleted",
    },
  ];

  return (
    <div className="anlPanel">
      <h3 className="anlPanelTitle">Project Status</h3>
      <div className="anlStatusList">
        {statuses.map(({ key, label, desc, icon, cls }) => (
          <div key={key} className={`anlStatusRow ${cls}`}>
            <span className="anlStatusIcon">{icon}</span>
            <div className="anlStatusInfo">
              <span className="anlStatusLabel">{label}</span>
              <span className="anlStatusDesc">{desc}</span>
            </div>
            <span className="anlStatusCount">{data?.[key] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * AC-5 – Investment distribution bar chart (pure CSS / SVG, no library).
 * Shows the top 8 projects by total invested amount.
 */
function InvestmentDistributionChart({ data = [] }) {
  const TOP_N = 8;
  const items = data.slice(0, TOP_N);

  if (items.length === 0) {
    return (
      <div className="anlPanel">
        <h3 className="anlPanelTitle">Investment Distribution</h3>
        <div className="anlEmpty">
          <span>📊</span>
          <p>No investment data available yet.</p>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...items.map((i) => Number(i.totalInvested ?? 0)), 1);

  // SVG bar chart dimensions
  const BAR_H      = 26;
  const BAR_GAP    = 14;
  const LABEL_W    = 130;
  const VALUE_W    = 90;
  const CHART_W    = 320;
  const PADDING    = 12;
  const ROW_H      = BAR_H + BAR_GAP;
  const SVG_H      = items.length * ROW_H + PADDING * 2 - BAR_GAP;
  const SVG_W      = LABEL_W + CHART_W + VALUE_W + PADDING * 2;

  return (
    <div className="anlPanel anlPanelWide">
      <h3 className="anlPanelTitle">
        Investment Distribution
        <span className="anlChartNote"> — top {items.length} projects by amount</span>
      </h3>

      <div className="anlChartWrap">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="anlBarChart"
          aria-label="Investment distribution bar chart"
          role="img"
        >
          {items.map((item, idx) => {
            const y       = PADDING + idx * ROW_H;
            const ratio   = Number(item.totalInvested ?? 0) / maxVal;
            const barW    = Math.max(4, ratio * CHART_W);
            const barX    = LABEL_W + PADDING;
            const valX    = barX + CHART_W + 8;
            const name    = (item.projectName ?? `Project #${item.landId}`)
                              .slice(0, 16);
            // Alternating green shades for visual rhythm
            const green   = idx % 2 === 0
              ? "rgba(89,193,115,0.80)"
              : "rgba(89,193,115,0.50)";

            return (
              <g key={item.landId ?? idx}>
                {/* Project label */}
                <text
                  x={LABEL_W - 8}
                  y={y + BAR_H / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="anlBarLabel"
                >
                  {name}
                </text>

                {/* Bar track (background) */}
                <rect
                  x={barX}
                  y={y}
                  width={CHART_W}
                  height={BAR_H}
                  rx={6}
                  className="anlBarTrack"
                />

                {/* Filled bar */}
                <rect
                  x={barX}
                  y={y}
                  width={barW}
                  height={BAR_H}
                  rx={6}
                  fill={green}
                />

                {/* Value label */}
                <text
                  x={valX}
                  y={y + BAR_H / 2 + 1}
                  dominantBaseline="middle"
                  className="anlBarValue"
                >
                  {fmtShort(item.totalInvested)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Main exported component ────────────────────────────────────────────────

/**
 * AC-1 – The analytics section rendered inside the admin dashboard.
 *
 * All data is fetched from the live backend via useAdminAnalytics (AC-6).
 * Displays:
 *   AC-2 – totalInvestment
 *   AC-3 – activeUsersByRole (Farmer, Investor, Auditor)
 *   AC-4 – projectStats (active, funded, completed)
 *   AC-5 – investmentDistribution bar chart
 */
export default function AnalyticsSection() {
  const { analytics, loading, error, reload } = useAdminAnalytics();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading && !analytics) {
    return (
      <div className="anlRoot">
        <div className="anlSectionHeader">
          <h2 className="anlSectionTitle">Platform Analytics</h2>
        </div>
        <div className="anlLoading">
          <div className="anlSpin" />
          <p>Loading analytics…</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error && !analytics) {
    return (
      <div className="anlRoot">
        <div className="anlSectionHeader">
          <h2 className="anlSectionTitle">Platform Analytics</h2>
        </div>
        <div className="anlError">
          <span>⚠️</span>
          <p>{error}</p>
          <button className="btn btnSmall" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="anlRoot">
      {/* Section header with refresh */}
      <div className="anlSectionHeader">
        <h2 className="anlSectionTitle">Platform Analytics</h2>
        <button
          type="button"
          className="adminRefreshBtn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* AC-2: Total investment */}
      <TotalInvestmentCard value={analytics.totalInvestment} />

      {/* AC-3 + AC-4: users & project status side-by-side */}
      <div className="anlRow">
        <ActiveUsersPanel  data={analytics.activeUsersByRole} />
        <ProjectStatusPanel data={analytics.projectStats} />
      </div>

      {/* AC-5: Bar chart */}
      <InvestmentDistributionChart data={analytics.investmentDistribution ?? []} />

      {/* Stale-data warning while a background refresh is running */}
      {error && analytics && (
        <p className="anlStaleWarn">⚠️ Could not refresh: {error}</p>
      )}
    </div>
  );
}
