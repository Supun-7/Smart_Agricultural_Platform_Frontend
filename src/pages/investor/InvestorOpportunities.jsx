import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi } from "../../services/api.js";
import { ROUTES } from "../../routes/routePaths.js";
import "../../styles/pages/investor/dashboard.css";
import "../../styles/pages/investor/opportunities.css";

function fmt(val, currency = "LKR") {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency, maximumFractionDigits: 0,
  });
}

// ── Invest Modal ──────────────────────────────────────────────────────────────

function InvestModal({ land, walletBalance, currency, onClose, onSuccess }) {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [amount, setAmount] = useState(String(land.minimumInvestment ?? ""));
  const [busy,   setBusy]   = useState(false);
  const [error,  setError]  = useState("");

  const parsed   = Number(amount);
  const invalid  = !amount || isNaN(parsed) || parsed <= 0;
  const tooLow   = !invalid && parsed < Number(land.minimumInvestment);
  const tooHigh  = !invalid && parsed > walletBalance;
  const canSubmit = !invalid && !tooLow && !tooHigh && !busy;
  const afterBal  = walletBalance - (invalid ? 0 : parsed);

  async function handleConfirm() {
    setBusy(true);
    setError("");
    try {
      const res = await investorApi.invest(token, land.landId, parsed);
      onSuccess(res);
    } catch (err) {
      setError(err.message || "Investment failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={e => e.stopPropagation()}>

        <div className="modalHeader">
          <div>
            <h2 className="modalTitle">Invest in {land.projectName}</h2>
            <p className="modalSub">📍 {land.location} · {land.cropType || "Agriculture"}</p>
          </div>
          <button className="modalClose" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Current balance */}
        <div className="modalBalanceRow">
          <span className="modalBalanceLabel">Wallet balance</span>
          <span className="modalBalanceValue">{fmt(walletBalance, currency)}</span>
        </div>

        {/* Amount input */}
        <div className="modalField">
          <label className="modalFieldLabel">Investment amount (LKR)</label>
          <input
            className={"modalInput" + (tooLow || tooHigh ? " modalInputErr" : "")}
            type="number"
            min={land.minimumInvestment}
            max={walletBalance}
            step="any"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError(""); }}
            disabled={busy}
            autoFocus
          />
          <span className="modalFieldHint">
            Minimum: {fmt(land.minimumInvestment, currency)}
          </span>
        </div>

        {/* Live balance-after preview */}
        {!invalid && !tooHigh && (
          <div className="modalPreviewRow">
            <span>Balance after</span>
            <span style={{ color: afterBal >= 0 ? "var(--brand)" : "var(--danger)", fontWeight: 700 }}>
              {fmt(afterBal, currency)}
            </span>
          </div>
        )}

        {/* Inline errors */}
        {tooLow && (
          <p className="modalErr">
            Amount is below the minimum of {fmt(land.minimumInvestment, currency)}.
          </p>
        )}
        {tooHigh && (
          <p className="modalErr">
            Not enough funds.{" "}
            <button className="modalErrLink" onClick={() => navigate(ROUTES.investorWallet)}>
              Top up wallet →
            </button>
          </p>
        )}
        {error && <p className="modalErr">{error}</p>}

        <div className="modalActions">
          <button className="modalBtnCancel" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="modalBtnConfirm" onClick={handleConfirm} disabled={!canSubmit}>
            {busy ? "Processing…" : "Confirm Investment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Success toast ─────────────────────────────────────────────────────────────

function SuccessToast({ result, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="successToast">
      <span className="successToastIcon">✅</span>
      <div className="successToastBody">
        <strong>Investment confirmed!</strong>
        <p>
          {fmt(result.amountInvested)} invested in <em>{result.projectName}</em>.
          New balance: {fmt(result.newWalletBalance, result.currency)}.
        </p>
      </div>
      <button className="modalClose" onClick={onClose}>✕</button>
    </div>
  );
}

// ── Opportunity card ──────────────────────────────────────────────────────────

function OpportunityCard({ land, walletBalance, currency, onInvest }) {
  const {
    projectName, location, totalValue, minimumInvestment,
    progressPercentage, description, cropType, sizeAcres,
    imageUrls, farmerName,
  } = land;

  const coverImage = imageUrls?.split(",").find(Boolean);
  const walletLoaded = walletBalance !== null;
  const canAfford    = walletLoaded && walletBalance >= Number(minimumInvestment);

  return (
    <div className="oppCard">
      {coverImage ? (
        <img className="oppCover" src={coverImage} alt={projectName} />
      ) : (
        <div className="oppCoverPlaceholder">🌾 No image available</div>
      )}

      <div className="oppCardHeader">
        <div>
          <p className="oppCardName">{projectName}</p>
          <p className="oppCardLocation">📍 {location}</p>
        </div>
        <span className="oppBadge">Open</span>
      </div>

      <p className="oppCardDescription">{description || "No description provided for this land listing."}</p>

      <div className="oppMetaGrid">
        <div className="oppStat">
          <span className="oppStatLabel">Crop type</span>
          <span className="oppStatValue">{cropType || "—"}</span>
        </div>
        <div className="oppStat">
          <span className="oppStatLabel">Land size</span>
          <span className="oppStatValue">{sizeAcres ? `${sizeAcres} acres` : "—"}</span>
        </div>
        <div className="oppStat">
          <span className="oppStatLabel">Farmer</span>
          <span className="oppStatValue">{farmerName || "—"}</span>
        </div>
      </div>

      <div className="oppProgress">
        <div className="oppProgressBar">
          <div className="oppProgressFill" style={{ width: `${progressPercentage ?? 0}%` }} />
        </div>
        <span className="oppProgressLabel">{progressPercentage ?? 0}% funded</span>
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

      {/* ── Invest button ── */}
      <button
        className={"oppInvestBtn" + (canAfford ? "" : " oppInvestBtnLow")}
        onClick={() => onInvest(land)}
        disabled={!walletLoaded}
      >
        {!walletLoaded
          ? "Loading…"
          : canAfford
            ? "💰 Invest Now"
            : "⚠️ Top Up Wallet to Invest"}
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InvestorOpportunities() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const [currency,      setCurrency]      = useState("LKR");
  const [selectedLand,  setSelectedLand]  = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
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

  function handleInvestSuccess(result) {
    setSelectedLand(null);
    setSuccessResult(result);
    setWalletBalance(Number(result.newWalletBalance));
  }

  if (loading) {
    return (
      <div className="invPage">
        <div className="invLoading"><div className="invSpin" /><p>Loading opportunities…</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invPage">
        <div className="invError">
          <span>⚠️</span><p>{error}</p>
          <button className="btn" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  const opportunities = data?.opportunities ?? [];

  return (
    <div className="invPage">

      {successResult && (
        <SuccessToast result={successResult} onClose={() => setSuccessResult(null)} />
      )}

      {/* ── Header ── */}
      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">Investment Opportunities</h1>
          <p className="invPageSub">
            {opportunities.length} active project{opportunities.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Wallet balance chip */}
        <button className="oppWalletChip" onClick={() => navigate(ROUTES.investorWallet)}>
          <span>💰</span>
          <div>
            <span className="oppWalletChipLabel">Your wallet</span>
            <span className="oppWalletChipValue">
              {walletBalance === null ? "…" : fmt(walletBalance, currency)}
            </span>
          </div>
        </button>
      </div>

      {opportunities.length === 0 ? (
        <div className="invEmpty">
          <span>🌱</span>
          <p>No opportunities available right now. Check back soon.</p>
        </div>
      ) : (
        <div className="invLandGrid">
          {opportunities.map(land => (
            <OpportunityCard
              key={land.landId}
              land={land}
              walletBalance={walletBalance}
              currency={currency}
              onInvest={setSelectedLand}
            />
          ))}
        </div>
      )}

      {selectedLand && (
        <InvestModal
          land={selectedLand}
          walletBalance={walletBalance}
          currency={currency}
          onClose={() => setSelectedLand(null)}
          onSuccess={handleInvestSuccess}
        />
      )}
    </div>
  );
}
