import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi } from "../../services/api.js";
import "../../styles/pages/investor/dashboard.css";
import "../../styles/pages/investor/opportunities.css";

function fmt(val, currency = "LKR") {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

function OpportunityCard({ land, walletBalance, currency }) {
  const navigate = useNavigate();
  const {
    landId,
    projectName,
    location,
    totalValue,
    minimumInvestment,
    progressPercentage,
    description,
    cropType,
    sizeAcres,
    imageUrls,
    farmerName,
  } = land;

  const coverImage = imageUrls?.split(",").find(Boolean);
  const walletLoaded = walletBalance !== null;
  const canAfford = walletLoaded && walletBalance >= Number(minimumInvestment);
  const pct = Math.min(progressPercentage ?? 0, 100);
  const remaining = Math.max(Number(totalValue ?? 0) - Number(minimumInvestment ?? 0), 0);

  return (
    <article className="oppCard" onClick={() => navigate(`/investor/lands/${landId}`)}>
      <div className="oppCoverWrap">
        {coverImage ? (
          <img className="oppCover" src={coverImage} alt={projectName} />
        ) : (
          <div className="oppCoverPlaceholder">Land</div>
        )}

        <div className="oppCoverBadges">
          {cropType ? <span className="oppCropTag">{cropType}</span> : null}
          <span className="oppOpenTag">Open now</span>
        </div>

        <div className="oppCoverOverlay">
          <span className="oppCoverLocation">{location || "Location pending"}</span>
          <strong className="oppCoverValue">{fmt(totalValue, currency)}</strong>
        </div>

        <div className="oppCoverProgress">
          <div className="oppCoverProgressFill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="oppCardBody">
        <div className="oppCardTop">
          <div>
            <p className="oppCardName">{projectName}</p>
            <p className="oppCardLocation">{location || "Location unavailable"}</p>
          </div>
          <span className="oppCardSignal">{pct}% funded</span>
        </div>

        <p className="oppCardDesc">
          {description
            ? description.length > 110
              ? `${description.slice(0, 110)}...`
              : description
            : "A verified agricultural investment opportunity with transparent funding progress."}
        </p>

        <div className="oppMetaRow">
          {sizeAcres ? <span className="oppMetaChip">{sizeAcres} acres</span> : null}
          {farmerName ? <span className="oppMetaChip">{farmerName}</span> : null}
          <span className="oppMetaChip">Remaining from {fmt(remaining, currency)}</span>
        </div>

        <div className="oppProgressWrap">
          <div className="oppProgressBar">
            <div className="oppProgressFill" style={{ width: `${pct}%` }} />
          </div>
          <div className="oppProgressMeta">
            <span className="oppProgressLabel">{pct}% funded</span>
            <span className="oppProgressTarget">Min {fmt(minimumInvestment, currency)}</span>
          </div>
        </div>

        <div className="oppPricing">
          <div className="oppPricingItem">
            <span className="oppPricingLabel">Minimum investment</span>
            <span className="oppPricingValue">{fmt(minimumInvestment, currency)}</span>
          </div>
          <div className="oppPricingItem">
            <span className="oppPricingLabel">Project size</span>
            <span className="oppPricingValue oppPricingMuted">{fmt(totalValue, currency)}</span>
          </div>
        </div>

        <div className="oppCardActions" onClick={(event) => event.stopPropagation()}>
          <button className="oppViewBtn" onClick={() => navigate(`/investor/lands/${landId}`)}>
            View details
          </button>
          <button
            className={"oppBuyBtn" + (canAfford ? "" : " oppBuyBtnLow")}
            onClick={() => navigate(`/investor/lands/${landId}?buy=true`)}
            disabled={!walletLoaded}
          >
            {!walletLoaded ? "Loading..." : canAfford ? "Invest now" : "Top up wallet"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function InvestorOpportunities() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const [currency, setCurrency] = useState("LKR");
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("ALL");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [opportunities, wallet] = await Promise.all([
        investorApi.getOpportunities(token),
        investorApi.getWallet(token),
      ]);
      setData(opportunities);
      setWalletBalance(Number(wallet.balance));
      setCurrency(wallet.currency ?? "LKR");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  const allOpportunities = data?.opportunities ?? [];

  const cropOptions = useMemo(() => {
    const values = Array.from(
      new Set(allOpportunities.map((item) => item.cropType).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    return ["ALL", ...values.slice(0, 6)];
  }, [allOpportunities]);

  const filtered = useMemo(() => {
    return allOpportunities.filter((land) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = !query ||
        land.projectName?.toLowerCase().includes(query) ||
        land.location?.toLowerCase().includes(query) ||
        land.cropType?.toLowerCase().includes(query) ||
        land.farmerName?.toLowerCase().includes(query);

      const matchesCrop = cropFilter === "ALL" || land.cropType === cropFilter;

      return matchesSearch && matchesCrop;
    });
  }, [allOpportunities, cropFilter, search]);

  const totalMarketValue = filtered.reduce((sum, item) => sum + Number(item.totalValue ?? 0), 0);
  const averageFunding = filtered.length > 0
    ? Math.round(filtered.reduce((sum, item) => sum + Number(item.progressPercentage ?? 0), 0) / filtered.length)
    : 0;
  const affordableCount = filtered.filter((item) => walletBalance !== null && walletBalance >= Number(item.minimumInvestment ?? 0)).length;

  if (loading) {
    return (
      <div className="invPage">
        <div className="invLoading">
          <div className="invSpin" />
          <p>Loading opportunities...</p>
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
          <button className="btn" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="invPage invOpportunitiesPage">
      <section className="oppHero">
        <div className="oppHeroMain">
          <span className="oppHeroEyebrow">Land marketplace</span>
          <h1 className="oppHeroTitle">Discover investment-ready farms without losing clarity.</h1>
          <p className="oppHeroText">
            Browse verified agricultural projects with stronger visibility into location, funding momentum, and your wallet readiness.
          </p>

          <div className="oppHeroActions">
            <button className="btn" onClick={() => navigate("/investor/wallet")}>
              Open wallet
            </button>
            <button className="btn btnGhost oppHeroGhost" onClick={() => navigate("/investor/portfolio")}>
              View portfolio
            </button>
          </div>
        </div>

        <div className="oppHeroSide">
          <div className="oppWalletPanel" onClick={() => navigate("/investor/wallet")}>
            <span className="oppWalletChipLabel">Wallet balance</span>
            <strong className="oppWalletChipValue">
              {walletBalance === null ? "Loading..." : fmt(walletBalance, currency)}
            </strong>
            <span className="oppWalletPanelText">Use your balance to move quickly on promising land opportunities.</span>
          </div>

          <div className="oppHeroMiniGrid">
            <div className="oppHeroMiniStat">
              <span>Active listings</span>
              <strong>{allOpportunities.length}</strong>
            </div>
            <div className="oppHeroMiniStat">
              <span>Affordable now</span>
              <strong>{affordableCount}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="oppSummaryGrid">
        <div className="oppSummaryCard">
          <span className="oppSummaryLabel">Visible market value</span>
          <strong>{fmt(totalMarketValue, currency)}</strong>
        </div>
        <div className="oppSummaryCard">
          <span className="oppSummaryLabel">Average funding</span>
          <strong>{averageFunding}%</strong>
        </div>
        <div className="oppSummaryCard">
          <span className="oppSummaryLabel">Filtered results</span>
          <strong>{filtered.length}</strong>
        </div>
      </section>

      <section className="oppToolbar">
        <div className="oppSearchWrap">
          <input
            className="oppSearch"
            type="text"
            placeholder="Search by project, location, crop, or farmer"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="oppFilterRow">
          {cropOptions.map((option) => (
            <button
              key={option}
              className={"oppFilterChip" + (cropFilter === option ? " active" : "")}
              onClick={() => setCropFilter(option)}
            >
              {option === "ALL" ? "All crops" : option}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="invEmpty">
          <span>0</span>
          <p>{search || cropFilter !== "ALL" ? "No opportunities match your current filters." : "No opportunities available right now. Check back soon."}</p>
        </div>
      ) : (
        <div className="oppEcomGrid">
          {filtered.map((land) => (
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
