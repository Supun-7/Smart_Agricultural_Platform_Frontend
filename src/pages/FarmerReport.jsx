import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { LineChart } from "../components/LineChart.jsx";
import { CircularProgress } from "../components/CircularProgress.jsx";
import { computeMilestoneCompletionPct, computePerformanceScore } from "../services/performanceScore.js";
import { loadFarmerFunds, loadFarmerLands, loadFarmerMilestones, loadFarmerProfile, loadFarmerProjects, loadFarmerTransactions } from "../mock/storage.js";
import "../styles/pages/roleDash.css";

function buildCumulativeReleased(txns) {
  const released = txns
    .filter((t) => String(t.status || "").toLowerCase() === "released")
    .slice()
    .reverse();

  let acc = 0;
  return released.map((t) => {
    acc += Number(t.amount || 0);
    return acc;
  });
}

export default function FarmerReport() {
  const { user } = useAuth();
  const loc = useLocation();
  const profile = useMemo(() => loadFarmerProfile(), []);
  const lands = useMemo(() => loadFarmerLands(), []);
  const projects = useMemo(() => loadFarmerProjects(), []);
  const milestoneGroups = useMemo(() => loadFarmerMilestones(), []);
  const funds = useMemo(() => loadFarmerFunds(), []);
  const txns = useMemo(() => loadFarmerTransactions(), []);

  const milestonePct = useMemo(() => computeMilestoneCompletionPct(milestoneGroups), [milestoneGroups]);
  const score = useMemo(() => computePerformanceScore({ projects, milestoneGroups, transactions: txns }), [projects, milestoneGroups, txns]);

  const growth = useMemo(() => {
    const series = buildCumulativeReleased(txns);
    return series.length ? series : [0, 0, 0, 0];
  }, [txns]);

  const isInvestor = String(user?.role || "").toLowerCase() === "investor";
  const reportTitle = isInvestor ? "Investor Report" : "Farmer Report";
  const nameLabel = user?.fullName || profile.name || (isInvestor ? "Investor" : "Farmer");

  // Auto-print when opened from the Dashboard "Export PDF report" button.
  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    if (params.get("print") !== "1") return;
    const t = setTimeout(() => window.print(), 320);
    return () => clearTimeout(t);
  }, [loc.search]);

  return (
    <div className="dashPage">
      <div className="pageTop" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="pageTitle">{reportTitle}</h1>
          <p className="sectionSubtitle" style={{ marginTop: 6 }}>
            Print-ready summary. Use <strong>Export PDF</strong> to save as PDF.
          </p>
        </div>

        <div className="noPrint" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="secondaryBtn" type="button" onClick={() => window.print()}>
            Export PDF
          </button>
        </div>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Snapshot</h2>
        <p className="sectionSubtitle">Prepared for {nameLabel} • Currency: {funds.currency || "LKR"}</p>

        <div className="cardGrid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ fontWeight: 900 }}>Performance Score</div>
            <div style={{ marginTop: 10 }}>
              <CircularProgress value={score} label="Elite KPI" />
            </div>
          </div>

          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ fontWeight: 900 }}>Milestone Completion</div>
            <div style={{ marginTop: 10 }}>
              <CircularProgress value={milestonePct} label="Across projects" />
            </div>
          </div>

          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ fontWeight: 900 }}>Assets</div>
            <div style={{ marginTop: 10, opacity: 0.85 }}>
              <div>Registered lands: <strong>{lands.length}</strong></div>
              <div style={{ marginTop: 6 }}>Active projects: <strong>{projects.length}</strong></div>
              <div style={{ marginTop: 6 }}>Transactions: <strong>{txns.length}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Financial Growth</h2>
        <p className="sectionSubtitle">Cumulative released funds over time (from transactions).</p>

        <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
          <LineChart data={growth} />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Funds</h2>
        <p className="sectionSubtitle">Totals based on your local mock data.</p>

        <div className="cardGrid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Total Raised</div>
            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{funds.currency || "LKR"} {Number(funds.totalRaised || 0).toLocaleString()}</div>
          </div>
          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Released</div>
            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{funds.currency || "LKR"} {Number(funds.released || 0).toLocaleString()}</div>
          </div>
          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Escrow Balance</div>
            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{funds.currency || "LKR"} {Number(funds.escrowBalance || 0).toLocaleString()}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
