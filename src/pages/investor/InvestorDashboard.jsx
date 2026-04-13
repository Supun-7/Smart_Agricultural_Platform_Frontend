import { useInvestorDashboard } from "../../hooks/useInvestorDashboard.js";
import { StatCard } from "../../components/investor/StatCard.jsx";
import { LandCard } from "../../components/investor/LandCard.jsx";
import { ROIDashboardSection } from "../../components/investor/ROIDashboardSection.jsx";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routePaths.js";
import "../../styles/pages/investor/dashboard.css";

function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: "LKR", maximumFractionDigits: 0,
  });
}

export default function InvestorDashboard() {
  // AC-5: loading and error from hook
  const { dashboard, loading, error, reload } = useInvestorDashboard();
  const navigate = useNavigate();

  // AC-5: loading state
  if (loading) {
    return (
      <div className="invPage">
        <div className="invLoading">
          <div className="invSpin" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // AC-5: error state with retry
  if (error) {
    return (
      <div className="invPage">
        <div className="invError">
          <span>⚠️</span>
          <p>{error}</p>
          <button className="btn" onClick={reload}>Retry</button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  // AC-3: walletBalance from API — no hardcoded value
  const {
    investorName,
    walletBalance,
    currency            = "LKR",
    kycStatus,
    investedLands       = [],
    investmentBreakdown = {},
    approvedMilestones  = [],
    portfolioRoiSummary = null,
  } = dashboard;

  // AC-4: all breakdown figures from API
  const {
    totalInvested        = 0,
    activeInvestments    = 0,
    pendingInvestments   = 0,
    completedInvestments = 0,
    totalLandCount       = 0,
    activeLandCount      = 0,
  } = investmentBreakdown;

  return (
    <div className="invPage">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">Welcome back, {investorName} 👋</h1>
          <p className="invPageSub">Here's your portfolio at a glance</p>
        </div>
        <span className={"kycBadge " + (kycStatus === "VERIFIED" ? "kycVerified" : "kycPending")}>
          {kycStatus === "VERIFIED" ? "✓ KYC Verified" : "⏳ " + kycStatus}
        </span>
      </div>

      {/* ── AC-3: Wallet + AC-4: breakdown stats ────────── */}
      <div className="invStatGrid">
        <StatCard
          icon="💰"
          label="Wallet Balance"
          value={fmt(walletBalance)}
          accent
        />
        <StatCard
          icon="📊"
          label="Total Invested"
          value={fmt(totalInvested)}
        />
        <StatCard
          icon="🌱"
          label="Active Investments"
          value={fmt(activeInvestments)}
          sub={`${activeLandCount} land${activeLandCount !== 1 ? "s" : ""}`}
        />
        <StatCard
          icon="✅"
          label="Completed"
          value={fmt(completedInvestments)}
          sub={`${totalLandCount} total land${totalLandCount !== 1 ? "s" : ""}`}
        />
      </div>

      {/* ── AC-2: All invested lands from API ───────────── */}
      <div className="invSection">
        <h2 className="invSectionTitle">Your Invested Lands</h2>

        {investedLands.length === 0 ? (
          <div className="invEmpty">
            <span>🌾</span>
            <p>No investments yet. Explore opportunities to get started.</p>
          </div>
        ) : (
          <div className="invLandGrid">
            {/* AC-6: investedLands comes from API — no hardcoded data */}
            {investedLands.map((inv) => (
              <LandCard key={inv.investmentId} investment={inv} />
            ))}
          </div>
        )}
      </div>

      <ROIDashboardSection
        investedLands={investedLands}
        approvedMilestones={approvedMilestones}
        investmentBreakdown={investmentBreakdown}
        portfolioRoiSummary={portfolioRoiSummary}
      />

      <div className="invSection">
        <h2 className="invSectionTitle">Approved Milestones</h2>

        {approvedMilestones.length === 0 ? (
          <div className="invEmpty">
            <span>📝</span>
            <p>No approved milestone updates yet.</p>
          </div>
        ) : (
          <div className="invLandGrid">
            {approvedMilestones.map((milestone) => (
              <div key={milestone.id} className="landCard">
                <div className="landCardHeader">
                  <div>
                    <p className="landCardName">{milestone.projectName}</p>
                    <p className="landCardLocation">👨‍🌾 {milestone.farmerName}</p>
                  </div>
                  <span className="landBadge landBadgeDone">Approved</span>
                </div>

                <div className="landCardProgress">
                  <div className="landCardBar">
                    <div className="landCardFill" style={{ width: `${milestone.progressPercentage ?? 0}%` }} />
                  </div>
                  <span className="landCardProgressLabel">
                    {milestone.progressPercentage ?? 0}% verified progress
                  </span>
                </div>

                <div className="landCardFooter">
                  <div className="landCardStat" style={{ gridColumn: "1 / -1" }}>
                    <span className="landCardStatLabel">Latest note</span>
                    <span className="landCardStatValue">{milestone.notes || "No notes provided."}</span>
                  </div>
                  <div className="landCardStat">
                    <span className="landCardStatLabel">Milestone date</span>
                    <span className="landCardStatValue">{milestone.milestoneDate || "—"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pending row — shown only when non-zero ──────── */}
      {Number(pendingInvestments) > 0 && (
        <div className="invSection">
          <h2 className="invSectionTitle">Pending</h2>
          <div className="invStatGrid">
            <StatCard icon="⏳" label="Pending Investments" value={fmt(pendingInvestments)} />
          </div>
        </div>
      )}

      {/* ── Contracts section ────────────────────────────── */}
      <div className="invSection">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem" }}>
          <h2 className="invSectionTitle" style={{ margin: 0, borderBottom: "none", paddingBottom: 0 }}>
            My Contracts
          </h2>
          <button
            onClick={() => navigate(ROUTES.investorContracts)}
            style={{
              padding: ".38rem 1rem",
              background: "rgba(89,193,115,.1)",
              border: "1px solid rgba(89,193,115,.3)",
              borderRadius: "999px",
              color: "var(--brand)",
              fontSize: ".8rem",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(89,193,115,.18)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(89,193,115,.1)")}
          >
            View All Contracts →
          </button>
        </div>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,.08)", marginBottom: ".25rem" }} />

        {investedLands.length === 0 ? (
          <div className="invEmpty">
            <span>📋</span>
            <p>No contracts yet. Invest in a land to create your first contract.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
            {investedLands.slice(0, 3).map((inv) => {
              const hasLink =
                inv.polygonScanUrl &&
                inv.blockchainTxHash &&
                !inv.blockchainTxHash.startsWith("BLOCKCHAIN_ERROR") &&
                !inv.blockchainTxHash.startsWith("PENDING") &&
                inv.blockchainTxHash.length <= 66;

              const dateStr = inv.investmentDate
                ? new Date(inv.investmentDate).toLocaleDateString("en-LK", { dateStyle: "medium" })
                : "—";

              const statusColors = {
                ACTIVE:    { bg: "rgba(89,193,115,.12)", color: "#59c173" },
                COMPLETED: { bg: "rgba(99,179,237,.12)", color: "#63b3ed" },
                PENDING:   { bg: "rgba(255,193,7,.1)",   color: "#ffc107" },
                CANCELLED: { bg: "rgba(255,92,122,.1)",  color: "#ff5c7a" },
              };
              const sc = statusColors[inv.status] || statusColors.PENDING;

              return (
                <div
                  key={inv.investmentId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    padding: ".85rem 1.1rem",
                    background: "rgba(255,255,255,.025)",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderRadius: "12px",
                    transition: "border-color .15s",
                  }}
                >
                  {/* Left — project info */}
                  <div style={{ display: "flex", alignItems: "center", gap: ".75rem", minWidth: 0 }}>
                    <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>📋</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "var(--text)", fontSize: ".9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {inv.projectName}
                      </p>
                      <p style={{ margin: ".15rem 0 0", fontSize: ".75rem", color: "var(--muted)" }}>
                        📍 {inv.location} &nbsp;·&nbsp; 👨‍🌾 {inv.farmerName || "—"} &nbsp;·&nbsp; {dateStr}
                      </p>
                    </div>
                  </div>

                  {/* Right — amount, status, blockchain link */}
                  <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexShrink: 0, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, color: "var(--brand)", fontSize: ".95rem" }}>
                      {fmt(inv.amountInvested)}
                    </span>
                    <span style={{
                      padding: ".2rem .6rem",
                      borderRadius: "999px",
                      fontSize: ".72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: sc.bg,
                      color: sc.color,
                    }}>
                      {inv.status}
                    </span>
                    {hasLink ? (
                      <a
                        href={inv.polygonScanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: ".35rem",
                          padding: ".28rem .75rem",
                          background: "rgba(89,193,115,.08)",
                          border: "1px solid rgba(89,193,115,.28)",
                          borderRadius: "8px",
                          color: "var(--brand)",
                          fontSize: ".75rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                        title="View this contract on the Polygon blockchain explorer"
                      >
                        ⛓️ View Contract ↗
                      </a>
                    ) : (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: ".35rem",
                        padding: ".28rem .75rem",
                        background: "rgba(255,255,255,.04)",
                        border: "1px solid rgba(255,255,255,.08)",
                        borderRadius: "8px",
                        color: "var(--muted)",
                        fontSize: ".75rem",
                        fontWeight: 600,
                      }}>
                        ⛓️ Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Show "View All" link if there are more than 3 */}
            {investedLands.length > 3 && (
              <button
                onClick={() => navigate(ROUTES.investorContracts)}
                style={{
                  alignSelf: "flex-start",
                  padding: ".4rem 1rem",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: "8px",
                  color: "var(--muted)",
                  fontSize: ".82rem",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                +{investedLands.length - 3} more contracts — View All
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
