import { useNavigate } from "react-router-dom";
import { useInvestorDashboard } from "../../hooks/useInvestorDashboard.js";
import { ROIDashboardSection } from "../../components/investor/ROIDashboardSection.jsx";
import { ROUTES } from "../../routes/routePaths.js";
import "../../styles/pages/investor/dashboard.css";

export default function InvestorReturnRisk() {
  const navigate = useNavigate();
  const { dashboard, loading, error, reload } = useInvestorDashboard();

  if (loading) {
    return (
      <div className="invPage">
        <div className="invLoading">
          <div className="invSpin" />
          <p>Loading return and risk dashboard...</p>
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
    investedLands = [],
    approvedMilestones = [],
    investmentBreakdown = {},
    portfolioRoiSummary = null,
  } = dashboard;

  return (
    <div className="invPage">
      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">Investor Return &amp; Risk Dashboard</h1>
          <p className="invPageSub">Detailed ROI, risk, benchmark, and project-level return analysis in one focused page.</p>
        </div>
        <button className="invInlineAction" onClick={() => navigate(ROUTES.investorDashboard)}>
          Back to dashboard
        </button>
      </div>

      <ROIDashboardSection
        investedLands={investedLands}
        approvedMilestones={approvedMilestones}
        investmentBreakdown={investmentBreakdown}
        portfolioRoiSummary={portfolioRoiSummary}
      />
    </div>
  );
}
