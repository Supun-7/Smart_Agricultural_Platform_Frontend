import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/pages/investor/contract.css";

const fmt = (val, cur = "LKR") =>
  Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: cur, maximumFractionDigits: 0,
  });

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

function HashRow({ label, value }) {
  return (
    <div className="cpHashRow">
      <span className="cpHashLabel">{label}</span>
      <div className="cpHashValue">
        <code className="cpHash">{value}</code>
        <button className="cpCopyBtn" onClick={() => copyToClipboard(value)} title="Copy">
          📋
        </button>
      </div>
    </div>
  );
}

export default function ContractPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const r = state?.result;

  useEffect(() => {
    if (!r) navigate("/investor/opportunities", { replace: true });
  }, [r, navigate]);

  if (!r) return null;

  const dateStr = r.investedAt
    ? new Date(r.investedAt).toLocaleString("en-LK", {
        dateStyle: "long", timeStyle: "medium",
      })
    : "—";

  // Build the PolygonScan link from the tx hash returned by the backend.
  // Works for both real hashes (production) and shows nothing for mock/error hashes.
  const isMockOrError =
    !r.blockchainTxHash ||
    r.blockchainTxHash.startsWith("BLOCKCHAIN_ERROR") ||
    r.blockchainTxHash.startsWith("PENDING") ||
    r.blockchainTxHash.length > 66;

  const polygonScanUrl = isMockOrError
    ? null
    : `https://amoy.polygonscan.com/tx/${r.blockchainTxHash}`;

  const networkLabel = r.network === "POLYGON_AMOY"
    ? "Polygon · Amoy Testnet"
    : r.network === "MOCK"
    ? "Mock Network (Dev)"
    : "Polygon · Amoy Testnet";

  return (
    <div className="cpPage">
      <div className="cpCard">

        {/* ── Success header ── */}
        <div className="cpHeader">
          <div className="cpSuccessRing">
            <div className="cpSuccessIcon">✓</div>
          </div>
          <h1 className="cpTitle">Investment Successful!</h1>
          <p className="cpSubtitle">
            Your smart contract has been recorded on the blockchain.
          </p>
        </div>

        {/* ── Two-column summary ── */}
        <div className="cpBody">

          {/* Investment Details */}
          <section className="cpSection">
            <h2 className="cpSectionTitle">
              <span className="cpSectionIcon">📋</span> Contract Details
            </h2>
            <div className="cpDetailsGrid">
              {[
                ["Project",           r.projectName],
                ["Location",          r.location],
                ["Crop Type",         r.cropType || "—"],
                ["Land Size",         r.sizeAcres ? `${r.sizeAcres} acres` : "—"],
                ["Farmer",            r.farmerName || "—"],
                ["Amount Invested",   fmt(r.amountInvested, r.currency)],
                ["Remaining Balance", fmt(r.newWalletBalance, r.currency)],
                ["Date",              dateStr],
                ["Reference",         r.ledgerReference],
              ].map(([label, val]) => (
                <div key={label} className="cpDetailRow">
                  <span className="cpDetailLabel">{label}</span>
                  <span className="cpDetailVal">{val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Blockchain section */}
          <section className="cpSection cpBlockchainSection">
            <h2 className="cpSectionTitle">
              <span className="cpSectionIcon">⛓️</span> Blockchain Contract
            </h2>

            <div className="cpChainInfo">
              {/* ── Network label: now shows Polygon Amoy, not Ethereum Sepolia ── */}
              <div className="cpChainTag">{networkLabel}</div>
              <p className="cpChainDesc">
                This investment has been immutably recorded on the Polygon blockchain.
                Gas fees are covered by the CHC platform — you don't need a crypto wallet.
                Funds are released to the farmer in milestone-based tranches.
              </p>
            </div>

            <HashRow label="Transaction Hash" value={r.blockchainTxHash} />
            <HashRow label="Contract Address"  value={r.contractAddress} />

            {/* ── Link goes to PolygonScan (Amoy), not Etherscan ── */}
            {polygonScanUrl ? (
              <a
                className="cpEtherscanBtn"
                href={polygonScanUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="cpEtherscanIcon">🔗</span>
                View on PolygonScan (Blockchain Explorer)
                <span className="cpEtherscanArrow">↗</span>
              </a>
            ) : (
              <div className="cpEtherscanBtn" style={{ opacity: 0.4, cursor: "default" }}>
                <span className="cpEtherscanIcon">🔗</span>
                PolygonScan link not available (dev mode)
              </div>
            )}

            <div className="cpContractFeatures">
              {[
                ["🔒", "Immutable Record",   "Contract permanently stored on Polygon Amoy"],
                ["📊", "Milestone Releases", "Funds released in verified tranches"],
                ["🔍", "Auditor-Verified",   "Independent auditors validate progress"],
                ["⛽", "Gas-Free for You",   "CHC platform covers all blockchain fees"],
              ].map(([icon, heading, detail]) => (
                <div key={heading} className="cpFeature">
                  <span className="cpFeatureIcon">{icon}</span>
                  <div>
                    <p className="cpFeatureHead">{heading}</p>
                    <p className="cpFeatureDetail">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── Actions ── */}
        <div className="cpActions">
          <button
            className="cpBtnOutline"
            onClick={() => navigate("/investor/opportunities")}
          >
            Browse More Lands
          </button>
          <button
            className="cpBtnPrimary"
            onClick={() => navigate("/investor/dashboard")}
          >
            Go to Dashboard →
          </button>
        </div>

      </div>
    </div>
  );
}
