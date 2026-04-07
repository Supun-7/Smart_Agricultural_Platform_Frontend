import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi } from "../../services/api.js";
import "../../styles/pages/investor/landDetail.css";

const fmt = (val, cur = "LKR") =>
  Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: cur, maximumFractionDigits: 0,
  });

// ── Image Gallery ──────────────────────────────────────────────────────────────
function Gallery({ images, projectName }) {
  const [active, setActive] = useState(0);
  if (!images.length) {
    return (
      <div className="ldGalleryPlaceholder">
        <span>🌾</span>
        <p>No images available</p>
      </div>
    );
  }
  return (
    <div className="ldGallery">
      <div className="ldGalleryHero">
        <img src={images[active]} alt={projectName} className="ldGalleryMain" />
        <div className="ldGalleryOverlay">
          <span className="ldGalleryBadge">🌿 Agricultural Land</span>
        </div>
      </div>
      {images.length > 1 && (
        <div className="ldGalleryThumbs">
          {images.map((url, i) => (
            <button
              key={i}
              className={"ldThumb" + (i === active ? " ldThumbActive" : "")}
              onClick={() => setActive(i)}
            >
              <img src={url} alt={`View ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Invest Panel (right sidebar) ───────────────────────────────────────────────
function InvestPanel({ land, wallet, autoBuy, onSuccess }) {
  const navigate = useNavigate();
  const [amount,  setAmount]  = useState(String(land.minimumInvestment ?? ""));
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState("");
  const [open,    setOpen]    = useState(autoBuy ?? false);
  const { token } = useAuth();

  const balance   = Number(wallet?.balance ?? 0);
  const currency  = wallet?.currency ?? "LKR";
  const parsed    = Number(amount);
  const tooLow    = parsed > 0 && parsed < Number(land.minimumInvestment);
  const tooHigh   = parsed > 0 && parsed > balance;
  const canSubmit = parsed > 0 && !tooLow && !tooHigh && !busy;
  const afterBal  = balance - (parsed || 0);

  async function handleInvest() {
    setBusy(true); setError("");
    try {
      const res = await investorApi.invest(token, land.landId, parsed);
      onSuccess(res);
    } catch (e) {
      setError(e.message || "Investment failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ldPanel">

      {/* ── Wallet balance card ── */}
      <div className="ldWalletCard">
        <div className="ldWalletLeft">
          <span className="ldWalletIcon">💰</span>
          <div>
            <p className="ldWalletLabel">Your Wallet Balance</p>
            <p className="ldWalletValue">{fmt(balance, currency)}</p>
          </div>
        </div>
        <button className="ldTopUpBtn" onClick={() => navigate("/investor/wallet")}>
          Add More Funds
        </button>
      </div>

      {/* ── Price block ── */}
      <div className="ldPriceBlock">
        <div className="ldPriceRow">
          <span className="ldPriceLabel">Minimum Investment</span>
          <span className="ldPrice">{fmt(land.minimumInvestment)}</span>
        </div>
        <div className="ldPriceRow ldPriceTotal">
          <span className="ldPriceLabel">Total Land Value</span>
          <span className="ldPriceSub">{fmt(land.totalValue)}</span>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="ldPanelProgress">
        <div className="ldPanelProgressBar">
          <div className="ldPanelProgressFill"
            style={{ width: `${Math.min(land.progressPercentage ?? 0, 100)}%` }} />
        </div>
        <div className="ldPanelProgressMeta">
          <span>{land.progressPercentage ?? 0}% funded</span>
          <span>Target: {fmt(land.totalValue)}</span>
        </div>
      </div>

      {/* ── CTA / Invest form ── */}
      {!open ? (
        <button className="ldBuyNowBtn" onClick={() => setOpen(true)}>
          🛒 Invest Now
        </button>
      ) : (
        <div className="ldInvestForm">
          <label className="ldFormLabel">Investment Amount (LKR)</label>
          <input
            className={"ldFormInput" + (tooLow || tooHigh ? " ldFormInputErr" : "")}
            type="number"
            min={land.minimumInvestment}
            value={amount}
            onChange={e => { setAmount(e.target.value); setError(""); }}
            disabled={busy}
            autoFocus
          />
          <span className="ldFormHint">Min: {fmt(land.minimumInvestment)}</span>

          {/* Live balance preview */}
          {parsed > 0 && !tooHigh && (
            <div className="ldBalPreview">
              <span>Balance after</span>
              <span style={{ color: afterBal >= 0 ? "var(--brand)" : "var(--danger)", fontWeight: 700 }}>
                {fmt(afterBal, currency)}
              </span>
            </div>
          )}

          {tooLow && (
            <p className="ldFormErr">
              ⚠️ Below the minimum of {fmt(land.minimumInvestment)}
            </p>
          )}
          {tooHigh && (
            <p className="ldFormErr">
              ⚠️ Insufficient balance.{" "}
              <button className="ldErrLink" onClick={() => navigate("/investor/wallet")}>
                Top up wallet →
              </button>
            </p>
          )}
          {error && <p className="ldFormErr">⚠️ {error}</p>}

          <div className="ldFormActions">
            <button className="ldCancelBtn" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </button>
            <button className="ldConfirmBtn" onClick={handleInvest} disabled={!canSubmit}>
              {busy ? "Processing…" : "Confirm & Invest"}
            </button>
          </div>
        </div>
      )}

      {/* ── Trust signals ── */}
      <div className="ldTrust">
        <div className="ldTrustItem">
          <span>🔒</span> Blockchain-secured smart contract
        </div>
        <div className="ldTrustItem">
          <span>📋</span> KYC-verified farmer
        </div>
        <div className="ldTrustItem">
          <span>⚡</span> Instant wallet deduction
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LandDetailPage() {
  const { landId }    = useParams();
  const { token }     = useAuth();
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  const [land,    setLand]    = useState(null);
  const [wallet,  setWallet]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const autoBuy = searchParams.get("buy") === "true";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [l, w] = await Promise.all([
          investorApi.getLandById(token, landId),
          investorApi.getWallet(token),
        ]);
        setLand(l);
        setWallet(w);
      } catch (e) {
        setError(e.message || "Failed to load land details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, landId]);

  function handleSuccess(result) {
    navigate("/investor/contract", { state: { result } });
  }

  if (loading) {
    return (
      <div className="ldPage">
        <div className="ldLoading">
          <div className="ldSpinner" />
          <p>Loading land details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ldPage">
        <div className="ldErrorState">
          <span>⚠️</span>
          <p>{error}</p>
          <button className="ldBackBtn" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    );
  }

  const images = (land.imageUrls || "").split(",").filter(Boolean);

  return (
    <div className="ldPage">

      {/* ── Breadcrumb ── */}
      <div className="ldBreadcrumb">
        <button onClick={() => navigate("/investor/opportunities")} className="ldBreadLink">
          Opportunities
        </button>
        <span className="ldBreadSep">›</span>
        <span className="ldBreadCurrent">{land.projectName}</span>
      </div>

      {/* ── Main layout ── */}
      <div className="ldLayout">

        {/* ── LEFT COLUMN ── */}
        <div className="ldLeft">

          {/* Gallery */}
          <Gallery images={images} projectName={land.projectName} />

          {/* Title + meta */}
          <div className="ldMeta">
            <div className="ldMetaBadges">
              {land.cropType && <span className="ldCropBadge">🌱 {land.cropType}</span>}
              <span className="ldOpenBadge">● Open for Investment</span>
            </div>
            <h1 className="ldTitle">{land.projectName}</h1>
            <p className="ldLocation">📍 {land.location}</p>
          </div>

          {/* Description */}
          <div className="ldDescBox">
            <h3 className="ldSectionHead">About This Project</h3>
            <p className="ldDesc">{land.description || "No description provided for this land project."}</p>
          </div>

          {/* Stats grid */}
          <div className="ldStatsSection">
            <h3 className="ldSectionHead">Land Details</h3>
            <div className="ldStatsGrid">
              {[
                ["🌾 Crop Type",        land.cropType || "—"],
                ["📐 Land Size",        land.sizeAcres ? `${land.sizeAcres} acres` : "—"],
                ["👨‍🌾 Farmer",           land.farmerName || "—"],
                ["💵 Total Value",      fmt(land.totalValue)],
                ["📉 Min. Investment",  fmt(land.minimumInvestment)],
                ["📊 Progress",         `${land.progressPercentage ?? 0}% funded`],
              ].map(([label, val]) => (
                <div key={label} className="ldStat">
                  <span className="ldStatLabel">{label}</span>
                  <span className="ldStatValue">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain info */}
          <div className="ldBlockchainNote">
            <h3 className="ldSectionHead">⛓️ Blockchain-Backed Contract</h3>
            <p className="ldDesc">
              Every investment on this platform creates an immutable smart contract on the
              Ethereum blockchain. Funds are released to the farmer in milestone-based tranches,
              verified by independent auditors. Your investment is protected by on-chain logic —
              not just a paper agreement.
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="ldRight">
          <InvestPanel
            land={land}
            wallet={wallet}
            autoBuy={autoBuy}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
