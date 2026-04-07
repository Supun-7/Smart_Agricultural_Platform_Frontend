import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi } from "../../services/api.js";
import "../../styles/pages/investor/dashboard.css";
import "../../styles/pages/investor/opportunities.css";

function fmt(val, currency = "LKR") {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency, maximumFractionDigits: 0,
  });
}

function OpportunityCard({ land, walletBalance, currency }) {
  const navigate = useNavigate();
  const {
    landId, projectName, location, totalValue, minimumInvestment,
    progressPercentage, description, cropType, sizeAcres,
    imageUrls, farmerName,
  } = land;

  const coverImage   = imageUrls?.split(",").find(Boolean);
  const walletLoaded = walletBalance !== null;
  const canAfford    = walletLoaded && walletBalance >= Number(minimumInvestment);
  const pct          = Math.min(progressPercentage ?? 0, 100);

  return (
    <div className="oppCard" onClick={() => navigate(`/investor/lands/${landId}`)}>
      <div className="oppCoverWrap">
        {coverImage ? (
          <img className="oppCover" src={coverImage} alt={projectName} />
        ) : (
          <div className="oppCoverPlaceholder">🌾</div>
        )}
        <div className="oppCoverBadges">
          {cropType && <span className="oppCropTag">{cropType}</span>}
          <span className="oppOpenTag">● Open</span>
        </div>
        <div className="oppCoverProgress">
          <div className="oppCoverProgressFill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="oppCardBody">
        <div className="oppCardTop">
          <p className="oppCardName">{projectName}</p>
          <p className="oppCardLocation">📍 {location}</p>
        </div>

        {description && (
          <p className="oppCardDesc">
            {description.length > 90 ? description.slice(0, 90) + "…" : description}
          </p>
        )}

        <div className="oppMetaRow">
          {sizeAcres && <span className="oppMetaChip">📐 {sizeAcres} acres</span>}
          {farmerName && <span className="oppMetaChip">👨‍🌾 {farmerName}</span>}
        </div>

        <div className="oppProgressWrap">
          <div className="oppProgressBar">
            <div className="oppProgressFill" style={{ width: `${pct}%` }} />
          </div>
          <div className="oppProgressMeta">
            <span className="oppProgressLabel">{pct}% funded</span>
            <span className="oppProgressTarget">{fmt(totalValue)}</span>
          </div>
        </div>

        <div className="oppPricing">
          <div className="oppPricingItem">
            <span className="oppPricingLabel">Min. Investment</span>
            <span className="oppPricingValue">{fmt(minimumInvestment)}</span>
          </div>
          <div className="oppPricingItem">
            <span className="oppPricingLabel">Total Value</span>
            <span className="oppPricingValue oppPricingMuted">{fmt(totalValue)}</span>
          </div>
        </div>

        <div className="oppCardActions" onClick={e => e.stopPropagation()}>
          <button
            className="oppViewBtn"
            onClick={() => navigate(`/investor/lands/${landId}`)}
          >
            View Details
          </button>
          <button
            className={"oppBuyBtn" + (canAfford ? "" : " oppBuyBtnLow")}
            onClick={() => navigate(`/investor/lands/${landId}?buy=true`)}
            disabled={!walletLoaded}
          >
            {!walletLoaded ? "…" : canAfford ? "🛒 Buy Now" : "⚠️ Top Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvestorOpportunities() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const [currency,      setCurrency]      = useState("LKR");
  const [search,        setSearch]        = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const [opps, wallet] = await Promise.all([
        investorApi.getOpportunities(token),
        investorApi.getWallet(token),
      ]);
      setData(opps);
      setWalletBalance(Number(wallet.balance));
      setCurrency(wallet.currency ?? "LKR");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  if (loading) return (
    <div className="invPage">
      <div className="invLoading"><div className="invSpin" /><p>Loading opportunities…</p></div>
    </div>
  );

  if (error) return (
    <div className="invPage">
      <div className="invError">
        <span>⚠️</span><p>{error}</p>
        <button className="btn" onClick={load}>Retry</button>
      </div>
    </div>
  );

  const allOpps = data?.opportunities ?? [];
  const filtered = search.trim()
    ? allOpps.filter(l =>
        l.projectName?.toLowerCase().includes(search.toLowerCase()) ||
        l.location?.toLowerCase().includes(search.toLowerCase()) ||
        l.cropType?.toLowerCase().includes(search.toLowerCase())
      )
    : allOpps;

  return (
    <div className="invPage">
      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">Investment Opportunities</h1>
          <p className="invPageSub">
            {allOpps.length} active project{allOpps.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <button className="oppWalletChip" onClick={() => navigate("/investor/wallet")}>
          <span>💰</span>
          <div>
            <span className="oppWalletChipLabel">Your wallet</span>
            <span className="oppWalletChipValue">
              {walletBalance === null ? "…" : fmt(walletBalance, currency)}
            </span>
          </div>
        </button>
      </div>

      {allOpps.length > 2 && (
        <div className="oppSearchWrap">
          <input
            className="oppSearch"
            type="text"
            placeholder="🔍  Search by project, location or crop type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="invEmpty">
          <span>🌱</span>
          <p>{search ? "No results match your search." : "No opportunities available right now. Check back soon."}</p>
        </div>
      ) : (
        <div className="oppEcomGrid">
          {filtered.map(land => (
            <OpportunityCard
              key={land.landId}
              land={land}
              walletBalance={walletBalance}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
}
