import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi } from "../../services/api.js";
import "../../styles/pages/investor/dashboard.css";
import "../../styles/pages/investor/opportunities.css";

function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: "LKR", maximumFractionDigits: 0,
  });
}

// Note: no description field — backend commented it out
function OpportunityCard({ land }) {
  const {
    projectName,
    location,
    totalValue,
    minimumInvestment,
    progressPercentage,
  } = land;

  return (
    <div className="oppCard">

      <div className="oppCardHeader">
        <div>
          <p className="oppCardName">{projectName}</p>
          <p className="oppCardLocation">📍 {location}</p>
        </div>
        <span className="oppBadge">Open</span>
      </div>

      <div className="oppProgress">
        <div className="oppProgressBar">
          <div
            className="oppProgressFill"
            style={{ width: `${progressPercentage ?? 0}%` }}
          />
        </div>
        <span className="oppProgressLabel">
          {progressPercentage ?? 0}% funded
        </span>
      </div>

      <div className="oppCardFooter">
        <div className="oppStat">
          <span className="oppStatLabel">Total value</span>
          <span className="oppStatValue">{fmt(totalValue)}</span>
        </div>
        <div className="oppStat">
          <span className="oppStatLabel">Min. investment</span>
          <span className="oppStatValue">{fmt(minimumInvestment)}</span>
        </div>
      </div>

    </div>
  );
}

export default function InvestorOpportunities() {
  const { token } = useAuth();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await investorApi.getOpportunities(token);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  // AC-5: loading state
  if (loading) {
    return (
      <div className="invPage">
        <div className="invLoading">
          <div className="invSpin" />
          <p>Loading opportunities…</p>
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
          <button className="btn" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  const opportunities = data?.opportunities ?? [];

  return (
    <div className="invPage">

      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">Investment Opportunities</h1>
          <p className="invPageSub">
            {opportunities.length} active project{opportunities.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="invEmpty">
          <span>🌱</span>
          <p>No opportunities available right now. Check back soon.</p>
        </div>
      ) : (
        <div className="invLandGrid">
          {/* AC-6: data comes from API — no hardcoded list */}
          {opportunities.map((land) => (
            <OpportunityCard key={land.landId} land={land} />
          ))}
        </div>
      )}

    </div>
  );
}
