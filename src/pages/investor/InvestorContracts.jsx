import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi, investmentApi } from "../../services/api.js";
import "../../styles/pages/investor/dashboard.css";
import "../../styles/pages/investor/contracts.css";

function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: "LKR", maximumFractionDigits: 0,
  });
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-LK", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return dateStr; }
}

function shortenAddress(addr) {
  if (!addr || addr === "Pending") return addr;
  return addr.length > 12
    ? `${addr.slice(0, 6)}…${addr.slice(-4)}`
    : addr;
}

const STATUS_STYLES = {
  ACTIVE:    { label: "Active",    cls: "ctBadgeActive"    },
  PENDING:   { label: "Pending",   cls: "ctBadgePending"   },
  COMPLETED: { label: "Completed", cls: "ctBadgeDone"      },
  CANCELLED: { label: "Cancelled", cls: "ctBadgeMuted"     },
};

// ── Individual contract card ──────────────────────────────────
function ContractCard({ investment }) {
  const {
    investmentId,
    projectName,
    location,
    amountInvested,
    landTotalValue,
    progressPercentage,
    investmentDate,
    status,
    contractAddress,
    contractLink,
  } = investment;

  const badge     = STATUS_STYLES[status] ?? { label: status, cls: "ctBadgeMuted" };
  const hasChain  = contractAddress && contractAddress !== "Pending";
  const pct       = progressPercentage ?? 0;

  return (
    <div className="ctCard">

      {/* Card header */}
      <div className="ctCardHeader">
        <div className="ctCardHeaderLeft">
          <div className="ctCardIcon">📄</div>
          <div>
            <p className="ctCardTitle">{projectName}</p>
            <p className="ctCardSub">📍 {location}</p>
          </div>
        </div>
        <span className={"ctBadge " + badge.cls}>{badge.label}</span>
      </div>

      {/* Progress */}
      <div className="ctProgress">
        <div className="ctProgressBar">
          <div className="ctProgressFill" style={{ width: `${pct}%` }} />
        </div>
        <span className="ctProgressLabel">{pct}% complete</span>
      </div>

      {/* Details grid */}
      <div className="ctDetailGrid">
        <div className="ctDetail">
          <span className="ctDetailLabel">Contract ID</span>
          <span className="ctDetailValue">#{investmentId}</span>
        </div>
        <div className="ctDetail">
          <span className="ctDetailLabel">Amount Invested</span>
          <span className="ctDetailValue ctGreen">{fmt(amountInvested)}</span>
        </div>
        <div className="ctDetail">
          <span className="ctDetailLabel">Project Value</span>
          <span className="ctDetailValue">{fmt(landTotalValue)}</span>
        </div>
        <div className="ctDetail">
          <span className="ctDetailLabel">Investment Date</span>
          <span className="ctDetailValue">{fmtDate(investmentDate)}</span>
        </div>
        <div className="ctDetail">
          <span className="ctDetailLabel">Est. Return</span>
          <span className="ctDetailValue ctGreen">18% p.a.</span>
        </div>
        <div className="ctDetail">
          <span className="ctDetailLabel">Harvest Period</span>
          <span className="ctDetailValue">~6 months</span>
        </div>
      </div>

      {/* Blockchain section */}
      <div className={"ctChainSection " + (hasChain ? "ctChainDeployed" : "ctChainPending")}>
        <div className="ctChainHeader">
          <span className="ctChainIcon">{hasChain ? "🔗" : "⏳"}</span>
          <span className="ctChainStatus">
            {hasChain ? "Smart Contract Deployed" : "Contract Deployment Pending"}
          </span>
        </div>

        {hasChain ? (
          <div className="ctChainBody">
            <div className="ctChainRow">
              <span className="ctChainLabel">Contract Address</span>
              <span className="ctChainAddr" title={contractAddress}>
                {shortenAddress(contractAddress)}
              </span>
            </div>
            <div className="ctChainRow">
              <span className="ctChainLabel">Network</span>
              <span className="ctChainValue">Polygon</span>
            </div>
            {contractLink && contractLink !== "Pending" && (
              <a
                href={contractLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ctPolygonLink"
              >
                View on PolygonScan ↗
              </a>
            )}
          </div>
        ) : (
          <p className="ctChainNote">
            Your contract will be deployed on the Polygon blockchain shortly.
          </p>
        )}
      </div>

      {/* Parties */}
      <div className="ctParties">
        <div className="ctParty">
          <span className="ctPartyRole">Investor</span>
          <span className="ctPartyName">You</span>
        </div>
        <div className="ctPartySep">⇌</div>
        <div className="ctParty ctPartyRight">
          <span className="ctPartyRole">Farmer / Project</span>
          <span className="ctPartyName">{projectName}</span>
        </div>
      </div>

      {/* Legal note */}
      <p className="ctLegalNote">
        This smart contract governs the terms of your investment and auto-executes
        returns upon harvest completion. Investment ID #{investmentId}.
      </p>

    </div>
  );
}

// ── Contracts page ─────────────────────────────────────────────
export default function InvestorContracts() {
  const { token } = useAuth();

  const [portfolio, setPortfolio] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  // We enrich the portfolio items with contract details from the investment endpoint
  const [contractMap, setContractMap] = useState({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await investorApi.getPortfolio(token);
      setPortfolio(res);

      // For each investment that has a chain status, fetch contract detail
      const map = {};
      const items = res?.investments ?? [];
      await Promise.all(
        items.map(async (inv) => {
          try {
            const contractRes = await investmentApi.getContract(token, inv.investmentId);
            map[inv.investmentId] = contractRes;
          } catch {
            // silently ignore — contract details just won't appear
          }
        })
      );
      setContractMap(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  if (loading) {
    return (
      <div className="invPage">
        <div className="invLoading">
          <div className="invSpin" />
          <p>Loading your contracts…</p>
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

  const investments = portfolio?.investments ?? [];

  // Merge contract details into investment objects
  const enriched = investments.map(inv => ({
    ...inv,
    contractAddress: contractMap[inv.investmentId]?.contractAddress ?? "Pending",
    contractLink:    contractMap[inv.investmentId]?.contractLink    ?? null,
  }));

  const deployed = enriched.filter(i => i.contractAddress && i.contractAddress !== "Pending");
  const pending  = enriched.filter(i => !i.contractAddress || i.contractAddress === "Pending");

  return (
    <div className="invPage">

      {/* Header */}
      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">My Contracts</h1>
          <p className="invPageSub">
            {investments.length} contract{investments.length !== 1 ? "s" : ""} in your portfolio
          </p>
        </div>
      </div>

      {/* Stats strip */}
      {investments.length > 0 && (
        <div className="ctStatsStrip">
          <div className="ctStatItem">
            <span className="ctStatIcon">📄</span>
            <div>
              <p className="ctStatVal">{investments.length}</p>
              <p className="ctStatLbl">Total Contracts</p>
            </div>
          </div>
          <div className="ctStatItem">
            <span className="ctStatIcon">🔗</span>
            <div>
              <p className="ctStatVal">{deployed.length}</p>
              <p className="ctStatLbl">On-chain</p>
            </div>
          </div>
          <div className="ctStatItem">
            <span className="ctStatIcon">💰</span>
            <div>
              <p className="ctStatVal">
                {fmt(portfolio?.totalInvested ?? 0)}
              </p>
              <p className="ctStatLbl">Total Invested</p>
            </div>
          </div>
          <div className="ctStatItem">
            <span className="ctStatIcon">📈</span>
            <div>
              <p className="ctStatVal">{fmt(portfolio?.activeAmount ?? 0)}</p>
              <p className="ctStatLbl">Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {investments.length === 0 && (
        <div className="invEmpty">
          <span>📄</span>
          <p>You have no contracts yet. Make your first investment to generate a smart contract.</p>
        </div>
      )}

      {/* Deployed contracts */}
      {deployed.length > 0 && (
        <div className="invSection">
          <h2 className="invSectionTitle">Active Contracts</h2>
          <div className="ctGrid">
            {deployed.map(inv => (
              <ContractCard key={inv.investmentId} investment={inv} />
            ))}
          </div>
        </div>
      )}

      {/* Pending contracts */}
      {pending.length > 0 && (
        <div className="invSection">
          <h2 className="invSectionTitle">Pending Deployment</h2>
          <div className="ctGrid">
            {pending.map(inv => (
              <ContractCard key={inv.investmentId} investment={inv} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
