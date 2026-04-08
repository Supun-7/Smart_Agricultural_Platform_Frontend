import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi } from "../../services/api.js";
import "../../styles/pages/investor/contracts-list.css";

const fmt = (val, cur = "LKR") =>
  Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: cur, maximumFractionDigits: 0,
  });

function StatusBadge({ status }) {
  const map = {
    ACTIVE:    { bg: "rgba(89,193,115,.14)", color: "#59c173", label: "Active" },
    COMPLETED: { bg: "rgba(99,179,237,.14)", color: "#63b3ed", label: "Completed" },
    PENDING:   { bg: "rgba(255,193,7,.12)",  color: "#ffc107", label: "Pending" },
    CANCELLED: { bg: "rgba(255,92,122,.12)", color: "#ff5c7a", label: "Cancelled" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className="iclStatusBadge" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

function HashChip({ value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const truncated = value.length > 20 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;
  return (
    <span
      className="iclHashChip"
      title={value}
      onClick={() => {
        copyToClipboard(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      <code>{truncated}</code>
      <span className="iclHashCopyIcon">{copied ? "✓" : "📋"}</span>
    </span>
  );
}

export default function InvestorContractsPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [contracts, setContracts] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("ALL");
  const [expanded,  setExpanded]  = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await investorApi.getContracts(token);
      setContracts(data.contracts || []);
    } catch (err) {
      setError(err.message || "Failed to load contracts.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const FILTERS = ["ALL", "ACTIVE", "COMPLETED", "PENDING", "CANCELLED"];

  const visible = filter === "ALL"
    ? contracts
    : contracts.filter((c) => c.status === filter);

  const isMock = (c) =>
    !c.blockchainTxHash ||
    c.blockchainTxHash.startsWith("BLOCKCHAIN_ERROR") ||
    c.blockchainTxHash.startsWith("PENDING") ||
    c.blockchainTxHash.length > 66;

  if (loading) {
    return (
      <div className="iclPage">
        <div className="iclLoading">
          <div className="iclSpinner" />
          <p>Loading your contracts…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="iclPage">
        <div className="iclError">
          <span>⚠️</span>
          <p>{error}</p>
          <button className="iclRetryBtn" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="iclPage">

      {/* ── Page header ── */}
      <div className="iclHeader">
        <div>
          <h1 className="iclTitle">My Contracts</h1>
          <p className="iclSub">
            All investment contracts you have created, with on-chain blockchain records.
          </p>
        </div>
        <div className="iclHeaderMeta">
          <span className="iclTotalBadge">
            {contracts.length} contract{contracts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Blockchain trust bar ── */}
      <div className="iclTrustBar">
        <span className="iclTrustItem">⛓️ <strong>Immutable</strong> — Recorded on Polygon Blockchain</span>
        <span className="iclTrustDot" />
        <span className="iclTrustItem">🔒 <strong>Tamper-proof</strong> — Cannot be altered</span>
        <span className="iclTrustDot" />
        <span className="iclTrustItem">🔍 <strong>Transparent</strong> — Publicly verifiable</span>
      </div>

      {/* ── Filter tabs ── */}
      <div className="iclFilterRow">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={"iclFilterBtn" + (filter === f ? " active" : "")}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? `All (${contracts.length})` : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* ── Contract list ── */}
      {visible.length === 0 ? (
        <div className="iclEmpty">
          <span>📄</span>
          <p>No contracts found{filter !== "ALL" ? ` with status "${filter}"` : ""}.</p>
          {contracts.length === 0 && (
            <button className="iclRetryBtn" onClick={() => navigate("/investor/opportunities")}>
              Browse Opportunities
            </button>
          )}
        </div>
      ) : (
        <div className="iclList">
          {visible.map((c) => {
            const isOpen    = expanded === c.investmentId;
            const hasLink   = !isMock(c) && c.polygonScanUrl;
            const dateStr   = c.investmentDate
              ? new Date(c.investmentDate).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" })
              : "—";

            return (
              <div
                key={c.investmentId}
                className={"iclCard" + (isOpen ? " iclCardOpen" : "")}
              >
                {/* ── Card header (always visible) ── */}
                <div
                  className="iclCardHead"
                  onClick={() => setExpanded(isOpen ? null : c.investmentId)}
                >
                  <div className="iclCardLeft">
                    <div className="iclCardIcon">📋</div>
                    <div>
                      <p className="iclCardProject">{c.projectName}</p>
                      <p className="iclCardMeta">
                        📍 {c.location} &nbsp;·&nbsp; 👨‍🌾 {c.farmerName}
                      </p>
                    </div>
                  </div>
                  <div className="iclCardRight">
                    <p className="iclCardAmount">{fmt(c.amountInvested)}</p>
                    <div className="iclCardBadgeRow">
                      <StatusBadge status={c.status} />
                      {hasLink && (
                        <span className="iclOnchainDot" title="Verified on blockchain">⛓️</span>
                      )}
                    </div>
                    <span className="iclCardDate">{dateStr}</span>
                  </div>
                  <span className="iclChevron">{isOpen ? "▲" : "▼"}</span>
                </div>

                {/* ── Expanded detail panel ── */}
                {isOpen && (
                  <div className="iclCardBody">

                    {/* Details grid */}
                    <div className="iclDetailGrid">
                      {[
                        ["Investment ID",   `#${c.investmentId}`],
                        ["Project",         c.projectName],
                        ["Location",        c.location],
                        ["Crop Type",       c.cropType || "—"],
                        ["Land Size",       c.sizeAcres ? `${c.sizeAcres} acres` : "—"],
                        ["Farmer",          c.farmerName],
                        ["Amount",          fmt(c.amountInvested)],
                        ["Date",            dateStr],
                        ["Status",          c.status],
                      ].map(([label, val]) => (
                        <div key={label} className="iclDetailRow">
                          <span className="iclDetailLabel">{label}</span>
                          <span className="iclDetailVal">{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Blockchain section */}
                    <div className="iclBlockchainPanel">
                      <p className="iclBlockchainTitle">
                        <span>⛓️</span> Blockchain Record
                      </p>

                      {hasLink ? (
                        <>
                          <div className="iclHashRow">
                            <span className="iclHashLabel">Transaction Hash</span>
                            <HashChip value={c.blockchainTxHash} />
                          </div>
                          <div className="iclHashRow">
                            <span className="iclHashLabel">Contract Address</span>
                            <HashChip value={c.contractAddress} />
                          </div>
                          <a
                            href={c.polygonScanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="iclPolygonBtn"
                          >
                            <span>🔗</span>
                            View on PolygonScan (Blockchain Explorer)
                            <span className="iclPolygonArrow">↗</span>
                          </a>
                          <p className="iclBlockchainDesc">
                            This investment is permanently and immutably recorded on the Polygon Amoy blockchain.
                            Click the link above to verify it independently at any time.
                          </p>
                        </>
                      ) : (
                        <div className="iclMockNote">
                          <span>🔧</span>
                          <span>Blockchain record pending (development environment)</span>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
