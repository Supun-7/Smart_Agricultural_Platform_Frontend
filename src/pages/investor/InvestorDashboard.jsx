import { useInvestorDashboard } from "../../hooks/useInvestorDashboard.js";
import { StatCard } from "../../components/investor/StatCard.jsx";
import { LandCard } from "../../components/investor/LandCard.jsx";
import "../../styles/pages/investor/dashboard.css";

function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: "LKR", maximumFractionDigits: 0,
  });
}

export default function InvestorDashboard() {
  // AC-5: loading and error from hook
  const { dashboard, loading, error, reload } = useInvestorDashboard();

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

    </div>
  );
}
