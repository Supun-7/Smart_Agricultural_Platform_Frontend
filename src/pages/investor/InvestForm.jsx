import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi, investmentApi } from "../../services/api.js";
import { ROUTES } from "../../routes/routePaths.js";
import "../../styles/pages/investor/dashboard.css";
import "../../styles/pages/investor/investForm.css";

function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: "LKR", maximumFractionDigits: 0,
  });
}

// ── Step indicator ──────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ["Select Land", "Enter Amount", "Confirm"];
  return (
    <div className="ifSteps">
      {steps.map((label, i) => (
        <div key={i} className={"ifStep" + (i + 1 === step ? " ifStepActive" : i + 1 < step ? " ifStepDone" : "")}>
          <div className="ifStepCircle">{i + 1 < step ? "✓" : i + 1}</div>
          <span className="ifStepLabel">{label}</span>
          {i < steps.length - 1 && <div className="ifStepLine" />}
        </div>
      ))}
    </div>
  );
}

export default function InvestForm() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // If navigated from AvailableLands, a land may be pre-selected
  const preSelected = location.state?.selectedLand ?? null;

  const [step,         setStep]         = useState(preSelected ? 2 : 1);
  const [opportunities,setOpportunities] = useState([]);
  const [loadingLands, setLoadingLands]  = useState(true);
  const [landsError,   setLandsError]    = useState("");

  const [selectedLand, setSelectedLand]  = useState(preSelected);
  const [amount,       setAmount]        = useState("");
  const [amountError,  setAmountError]   = useState("");

  const [submitting,   setSubmitting]    = useState(false);
  const [result,       setResult]        = useState(null);   // success payload
  const [submitError,  setSubmitError]   = useState("");

  // Load available lands
  useEffect(() => {
    async function load() {
      setLoadingLands(true);
      setLandsError("");
      try {
        const res = await investorApi.getOpportunities(token);
        setOpportunities(res?.opportunities ?? []);
      } catch (err) {
        setLandsError(err.message);
      } finally {
        setLoadingLands(false);
      }
    }
    load();
  }, [token]);

  // ── Step 1: Land selector ────────────────────────────────
  function handleSelectLand(land) {
    setSelectedLand(land);
    setAmount("");
    setAmountError("");
    setStep(2);
  }

  // ── Step 2: Amount validation ────────────────────────────
  function handleAmountNext() {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setAmountError("Please enter a valid positive amount.");
      return;
    }
    const min = Number(selectedLand?.minimumInvestment ?? 0);
    if (num < min) {
      setAmountError(`Minimum investment is ${fmt(min)}.`);
      return;
    }
    setAmountError("");
    setStep(3);
  }

  // ── Step 3: Confirm & submit ──────────────────────────────
  async function handleConfirm() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await investmentApi.fund(token, {
        landId: selectedLand.landId,
        amount: Number(amount),
      });
      setResult(res);
      setStep(4); // success view
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  // Success screen
  if (step === 4 && result) {
    return (
      <div className="invPage">
        <div className="ifSuccess">
          <div className="ifSuccessIcon">🎉</div>
          <h2 className="ifSuccessTitle">Investment Successful!</h2>
          <p className="ifSuccessSub">Your investment has been recorded on-chain.</p>

          <div className="ifSummaryCard">
            <div className="ifSummaryRow">
              <span>Investment ID</span>
              <strong>#{result.investmentId}</strong>
            </div>
            <div className="ifSummaryRow">
              <span>Land</span>
              <strong>{selectedLand?.projectName}</strong>
            </div>
            <div className="ifSummaryRow">
              <span>Amount Invested</span>
              <strong>{fmt(result.amountInvested)}</strong>
            </div>
            <div className="ifSummaryRow">
              <span>Wallet Balance</span>
              <strong>{fmt(result.walletBalance)}</strong>
            </div>
            <div className="ifSummaryRow">
              <span>Blockchain Status</span>
              <strong className={result.blockchainStatus === "CONTRACT_DEPLOYED" ? "ifChainOk" : "ifChainPending"}>
                {result.blockchainStatus === "CONTRACT_DEPLOYED" ? "✓ Contract Deployed" : "⏳ Pending"}
              </strong>
            </div>
            {result.contractLink && result.contractLink !== "Pending" && (
              <div className="ifSummaryRow">
                <span>Contract</span>
                <a
                  href={result.contractLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ifContractLink"
                >
                  View on PolygonScan ↗
                </a>
              </div>
            )}
          </div>

          <div className="ifSuccessActions">
            <button className="btn" onClick={() => navigate(ROUTES.investorContracts)}>
              View My Contracts
            </button>
            <button className="btn btnGhost" onClick={() => navigate(ROUTES.investorDashboard)}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invPage">

      {/* Page header */}
      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">New Investment</h1>
          <p className="invPageSub">Fund a land project in three simple steps</p>
        </div>
      </div>

      <StepIndicator step={step} />

      {/* ── Step 1 — Choose a land ────────────────────────── */}
      {step === 1 && (
        <div className="ifPanel">
          <h2 className="ifPanelTitle">Select a Land</h2>

          {loadingLands && (
            <div className="invLoading">
              <div className="invSpin" />
              <p>Loading available lands…</p>
            </div>
          )}

          {landsError && (
            <div className="invError">
              <span>⚠️</span>
              <p>{landsError}</p>
            </div>
          )}

          {!loadingLands && !landsError && opportunities.length === 0 && (
            <div className="invEmpty">
              <span>🌱</span>
              <p>No lands available right now.</p>
            </div>
          )}

          {!loadingLands && !landsError && (
            <div className="ifLandList">
              {opportunities.map(land => (
                <button
                  key={land.landId}
                  className={"ifLandOption" + (selectedLand?.landId === land.landId ? " ifLandOptionSel" : "")}
                  onClick={() => handleSelectLand(land)}
                >
                  <div className="ifLandOptionLeft">
                    <p className="ifLandOptionName">{land.projectName}</p>
                    <p className="ifLandOptionSub">📍 {land.location}</p>
                  </div>
                  <div className="ifLandOptionRight">
                    <p className="ifLandOptionVal">{fmt(land.totalValue)}</p>
                    <p className="ifLandOptionMin">Min: {fmt(land.minimumInvestment)}</p>
                  </div>
                  <span className="ifLandOptionArrow">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2 — Enter amount ─────────────────────────── */}
      {step === 2 && selectedLand && (
        <div className="ifPanel">
          <h2 className="ifPanelTitle">Enter Investment Amount</h2>

          {/* Selected land recap */}
          <div className="ifSelectedLandBanner">
            <div>
              <p className="ifBannerName">{selectedLand.projectName}</p>
              <p className="ifBannerSub">📍 {selectedLand.location}</p>
            </div>
            <button className="ifChangeLand" onClick={() => setStep(1)}>
              Change
            </button>
          </div>

          <div className="ifAmountWrap">
            <label className="ifLabel">Investment Amount (LKR)</label>
            <div className="ifAmountInputRow">
              <span className="ifCurrencyTag">LKR</span>
              <input
                className={"input ifAmountInput" + (amountError ? " ifInputErr" : "")}
                type="number"
                min={selectedLand.minimumInvestment}
                step="1000"
                placeholder={`Min. ${fmt(selectedLand.minimumInvestment)}`}
                value={amount}
                onChange={e => { setAmount(e.target.value); setAmountError(""); }}
                onKeyDown={e => e.key === "Enter" && handleAmountNext()}
              />
            </div>
            {amountError && <p className="ifFieldErr">{amountError}</p>}

            {/* Quick fill buttons */}
            <div className="ifQuickFill">
              {[1, 2, 5].map(mult => {
                const val = Number(selectedLand.minimumInvestment) * mult;
                return (
                  <button
                    key={mult}
                    className="ifQuickBtn"
                    onClick={() => { setAmount(String(val)); setAmountError(""); }}
                  >
                    {fmt(val)}
                  </button>
                );
              })}
            </div>

            <p className="ifMinNote">
              Minimum investment: <strong>{fmt(selectedLand.minimumInvestment)}</strong>
            </p>
          </div>

          <div className="ifActions">
            <button className="btn btnGhost" onClick={() => setStep(1)}>Back</button>
            <button className="btn" onClick={handleAmountNext}>Continue →</button>
          </div>
        </div>
      )}

      {/* ── Step 3 — Confirm ─────────────────────────────── */}
      {step === 3 && selectedLand && (
        <div className="ifPanel">
          <h2 className="ifPanelTitle">Confirm Investment</h2>
          <p className="ifPanelSub">Review the details below before confirming.</p>

          <div className="ifSummaryCard">
            <div className="ifSummaryRow">
              <span>Project</span>
              <strong>{selectedLand.projectName}</strong>
            </div>
            <div className="ifSummaryRow">
              <span>Location</span>
              <strong>{selectedLand.location}</strong>
            </div>
            <div className="ifSummaryRow">
              <span>Total Project Value</span>
              <strong>{fmt(selectedLand.totalValue)}</strong>
            </div>
            <div className="ifSummaryRow">
              <span>Your Investment</span>
              <strong className="ifHighlight">{fmt(Number(amount))}</strong>
            </div>
            <div className="ifSummaryRow">
              <span>Est. Return</span>
              <strong className="ifReturn">18% p.a.</strong>
            </div>
            <div className="ifSummaryRow">
              <span>Harvest Period</span>
              <strong>~6 months</strong>
            </div>
            <div className="ifSummaryRow">
              <span>Smart Contract</span>
              <strong>Auto-deployed on Polygon</strong>
            </div>
          </div>

          <div className="ifDisclaimer">
            ⚠️ By confirming, you authorise the deduction of{" "}
            <strong>{fmt(Number(amount))}</strong> from your wallet. This action
            cannot be undone once processed.
          </div>

          {submitError && (
            <div className="ifSubmitError">⚠️ {submitError}</div>
          )}

          <div className="ifActions">
            <button className="btn btnGhost" onClick={() => setStep(2)} disabled={submitting}>
              Back
            </button>
            <button className="btn ifConfirmBtn" onClick={handleConfirm} disabled={submitting}>
              {submitting ? (
                <><span className="invSpin ifBtnSpin" />Confirming…</>
              ) : (
                "✓ Confirm Investment"
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
