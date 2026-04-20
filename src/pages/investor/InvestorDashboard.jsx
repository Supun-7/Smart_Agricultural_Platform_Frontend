import { useNavigate } from "react-router-dom";
import { useInvestorDashboard } from "../../hooks/useInvestorDashboard.js";
import { StatCard } from "../../components/investor/StatCard.jsx";
import { ROUTES } from "../../routes/routePaths.js";
import "../../styles/pages/investor/dashboard.css";

function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  });
}

function getKycTone(status) {
  return status === "VERIFIED" ? "kycVerified" : "kycPending";
}

export default function InvestorDashboard() {
  const { dashboard, loading, error, reload } = useInvestorDashboard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="invPage">
        <div className="invLoading">
          <div className="invSpin" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invPage">
        <div className="invError">
          <span>!</span>
          <p>{error}</p>
          <button className="btn" onClick={reload}>Retry</button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const {
    investorName,
    walletBalance,
    kycStatus,
    investedLands = [],
    investmentBreakdown = {},
    approvedMilestones = [],
    portfolioRoiSummary = null,
  } = dashboard;

  const {
    totalInvested = 0,
    activeInvestments = 0,
    pendingInvestments = 0,
    completedInvestments = 0,
    totalLandCount = 0,
    activeLandCount = 0,
  } = investmentBreakdown;

  const summaryCards = [
    {
      label: "Portfolio",
      value: `${investedLands.length} investments`,
      text: `${activeLandCount} active lands in your portfolio.`,
      action: "View portfolio",
      onClick: () => navigate(ROUTES.investorPortfolio),
    },
    {
      label: "Opportunities",
      value: `${approvedMilestones.length} milestone updates`,
      text: "Explore market opportunities and watch current verified progress.",
      action: "Open land market",
      onClick: () => navigate(ROUTES.investorOpportunities),
    },
    {
      label: "Return & Risk",
      value: `${Number(portfolioRoiSummary?.weightedLiveRoiPercentage ?? 0).toFixed(1)}% live ROI`,
      text: "Open the detailed ROI and risk page for deeper analytics.",
      action: "Open analytics",
      onClick: () => navigate(ROUTES.investorReturnRisk),
    },
    {
      label: "Contracts",
      value: `${totalLandCount} tracked lands`,
      text: `${pendingInvestments > 0 ? `${fmt(pendingInvestments)} pending processing.` : "Review your latest contracts and blockchain status."}`,
      action: "View contracts",
      onClick: () => navigate(ROUTES.investorContracts),
    },
  ];

  return (
    <div className="invPage invDashboardPage">
      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">Welcome back, {investorName}</h1>
          <p className="invPageSub">A short overview of your investor account and portfolio summary.</p>
        </div>
        <span className={"kycBadge " + getKycTone(kycStatus)}>
          {kycStatus === "VERIFIED" ? "KYC verified" : `KYC ${String(kycStatus || "pending").toLowerCase()}`}
        </span>
      </div>

      <div className="invStatGrid">
        <StatCard icon="LKR" label="Wallet balance" value={fmt(walletBalance)} sub="Available in wallet" accent tone="brand" />
        <StatCard icon="ROI" label="Total invested" value={fmt(totalInvested)} sub={`${investedLands.length} positions`} tone="default" />
        <StatCard icon="ACT" label="Active investments" value={fmt(activeInvestments)} sub={`${activeLandCount} active lands`} tone="sky" />
        <StatCard icon="FIN" label="Completed" value={fmt(completedInvestments)} sub={`${totalLandCount} total lands`} tone="gold" />
      </div>

      <section className="invSection">
        <div className="invSectionHeaderBand">
          <div>
            <h2 className="invSectionTitle">Overview</h2>
            <p className="invSectionSub">Open any section below to see more details.</p>
          </div>
        </div>

        <div className="invInsightGrid">
          {summaryCards.map((card) => (
            <div key={card.label} className="invInsightCard">
              <span className="invInsightLabel">{card.label}</span>
              <strong className="invInsightValue">{card.value}</strong>
              <p className="invInsightText">{card.text}</p>
              <button className="invInlineAction invInlineActionSmall" onClick={card.onClick}>
                {card.action}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
