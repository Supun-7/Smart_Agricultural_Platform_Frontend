import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi } from "../../services/api.js";
import { ROUTES } from "../../routes/routePaths.js";
import "../../styles/pages/investor/dashboard.css";
import "../../styles/pages/investor/availableLands.css";

function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: "LKR", maximumFractionDigits: 0,
  });
}

function LandListingCard({ land, onInvest }) {
  const {
    landId,
    projectName,
    location,
    totalValue,
    minimumInvestment,
    progressPercentage,
  } = land;

  const pct = progressPercentage ?? 0;

  return (
    <div className="aLandCard">
      <div className="aLandCardTop">
        <div className="aLandInfo">
          <p className="aLandName">{projectName}</p>
          <p className="aLandLocation">📍 {location}</p>
        </div>
        <span className="aLandBadge">Available</span>
      </div>

      <div className="aLandProgress">
        <div className="aLandProgressBar">
          <div className="aLandProgressFill" style={{ width: `${pct}%` }} />
        </div>
        <span className="aLandProgressLabel">{pct}% funded</span>
      </div>

      <div className="aLandStats">
        <div className="aLandStat">
          <span className="aLandStatLabel">Total Project Value</span>
          <span className="aLandStatValue">{fmt(totalValue)}</span>
        </div>
        <div className="aLandStat">
          <span className="aLandStatLabel">Min. Investment</span>
          <span className="aLandStatValue aLandMinInv">{fmt(minimumInvestment)}</span>
        </div>
        <div className="aLandStat">
          <span className="aLandStatLabel">Est. Return</span>
          <span className="aLandStatValue aLandReturn">18% p.a.</span>
        </div>
      </div>

      <button
        className="btn btnBlock aLandInvestBtn"
        onClick={() => onInvest(land)}
      >
        Invest Now
      </button>
    </div>
  );
}

export default function AvailableLands() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");

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

  function handleInvest(land) {
    // Navigate to opportunities page with land pre-selected via state
    navigate(ROUTES.investorOpportunities, { state: { selectedLand: land } });
  }

  if (loading) {
    return (
      <div className="invPage">
        <div className="invLoading">
          <div className="invSpin" />
          <p>Loading available lands…</p>
        </div>
      </div>
    );
  }

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

  const all = data?.opportunities ?? [];
  const filtered = search.trim()
    ? all.filter(l =>
        l.projectName?.toLowerCase().includes(search.toLowerCase()) ||
        l.location?.toLowerCase().includes(search.toLowerCase())
      )
    : all;

  return (
    <div className="invPage">

      {/* Header */}
      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">Available Lands</h1>
          <p className="invPageSub">
            {all.length} land{all.length !== 1 ? "s" : ""} open for investment
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="aLandSearchRow">
        <div className="aLandSearchWrap">
          <span className="aLandSearchIcon">🔍</span>
          <input
            className="input aLandSearch"
            type="text"
            placeholder="Search by project name or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button className="aLandClear" onClick={() => setSearch("")}>✕ Clear</button>
        )}
      </div>

      {/* Summary strip */}
      <div className="aLandSummary">
        <div className="aLandSummaryItem">
          <span className="aLandSummaryIcon">🌾</span>
          <div>
            <p className="aLandSummaryVal">{all.length}</p>
            <p className="aLandSummaryLbl">Total Available</p>
          </div>
        </div>
        <div className="aLandSummaryItem">
          <span className="aLandSummaryIcon">💰</span>
          <div>
            <p className="aLandSummaryVal">
              {fmt(all.reduce((s, l) => s + Number(l.totalValue ?? 0), 0))}
            </p>
            <p className="aLandSummaryLbl">Combined Value</p>
          </div>
        </div>
        <div className="aLandSummaryItem">
          <span className="aLandSummaryIcon">📈</span>
          <div>
            <p className="aLandSummaryVal">18% p.a.</p>
            <p className="aLandSummaryLbl">Est. Return</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="invEmpty">
          <span>🌱</span>
          <p>
            {search
              ? "No lands match your search. Try a different keyword."
              : "No lands are available for investment right now. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="aLandGrid">
          {filtered.map(land => (
            <LandListingCard
              key={land.landId}
              land={land}
              onInvest={handleInvest}
            />
          ))}
        </div>
      )}

    </div>
  );
}
