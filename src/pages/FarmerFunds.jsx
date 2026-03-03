import { useMemo, useState } from "react";
import { StatCard } from "../components/StatCard.jsx";
import { LineChart } from "../components/LineChart.jsx";
import { IconCoin, IconTrend, IconCheck, IconClock } from "../components/icons.jsx";
import "../styles/pages/roleDash.css";

import { loadFarmerFunds, loadFarmerTransactions } from "../mock/storage.js";

function toCsvRow(values) {
  return values
    .map((v) => {
      const s = String(v ?? "");
      // escape quotes and wrap if needed
      const needsWrap = /[",\n]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsWrap ? `"${escaped}"` : escaped;
    })
    .join(",");
}

function exportTxnsCsv(currency, txns) {
  const headers = ["Date", "Description", "Amount", "Status", "Reference"];
  const rows = txns.map((t) => [t.date, t.description, t.amount, t.status, t.id]);
  const csv = [toCsvRow(headers), ...rows.map((r) => toCsvRow(r))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `transactions_${currency}.csv`;
  a.click();
}

function buildGrowthSeries(currency, txns) {
  // Cumulative released as a growth indicator.
  const released = txns
    .filter((t) => String(t.status || "").toLowerCase() === "released")
    .slice()
    .reverse();

  let acc = 0;
  const series = released.map((t) => {
    acc += Number(t.amount || 0);
    return acc;
  });
  return series.length ? series : [0, 0, 0, 0];
}

export default function FarmerFunds() {
  const funds = useMemo(() => loadFarmerFunds(), []);
  const allTxns = useMemo(() => loadFarmerTransactions(), []);
  const currency = funds.currency || "LKR";

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("date_desc");

  const txns = useMemo(() => {
    let list = [...allTxns];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((t) =>
        String(t.description || "").toLowerCase().includes(q) ||
        String(t.id || "").toLowerCase().includes(q)
      );
    }

    if (status !== "all") {
      list = list.filter((t) => String(t.status || "").toLowerCase() === status);
    }

    list.sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      const aa = Number(a.amount || 0);
      const ab = Number(b.amount || 0);

      switch (sort) {
        case "date_asc":
          return da - db;
        case "amount_desc":
          return ab - aa;
        case "amount_asc":
          return aa - ab;
        case "date_desc":
        default:
          return db - da;
      }
    });

    return list;
  }, [allTxns, query, status, sort]);

  const growth = useMemo(() => buildGrowthSeries(currency, allTxns), [currency, allTxns]);

  return (
    <div className="dashPage">
      <div className="pageTop" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="pageTitle">Funds & Escrow</h1>
          <p className="sectionSubtitle" style={{ marginTop: 6 }}>
            Advanced filters, export, and a growth chart.
          </p>
        </div>

        <div className="noPrint" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="secondaryBtn" type="button" onClick={() => exportTxnsCsv(currency, txns)}>
            Export CSV
          </button>
        </div>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Summary</h2>
        <p className="sectionSubtitle">Totals auto-update when milestones release funds.</p>

        <div className="statGrid">
          <StatCard variant="plain" kicker="Total Raised" valueTop={currency} value={Number(funds.totalRaised || 0).toLocaleString()} icon={<IconCoin />} />
          <StatCard variant="green" kicker="Funds Released" valueTop={currency} value={Number(funds.released || 0).toLocaleString()} icon={<IconCheck />} />
          <StatCard variant="brown" kicker="Escrow Balance" valueTop={currency} value={Number(funds.escrowBalance || 0).toLocaleString()} icon={<IconTrend />} />
          <StatCard variant="plain" kicker="Last Payment" value={funds.lastPaymentDate || "—"} sub="Most recent release" icon={<IconClock />} />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Financial Growth</h2>
        <p className="sectionSubtitle">Cumulative released funds based on your transaction history.</p>

        <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
          <LineChart data={growth} />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Transactions</h2>
        <p className="sectionSubtitle">Search, filter by status, and sort by date/amount.</p>

        <div className="filterBar" style={{ marginTop: 14 }}>
          <input
            className="filterInput"
            placeholder="Search by description or reference…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select className="filterSelect" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="released">Released</option>
            <option value="in escrow">In Escrow</option>
          </select>

          <select className="filterSelect" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort transactions">
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Amount high → low</option>
            <option value="amount_asc">Amount low → high</option>
          </select>
        </div>

        {txns.length === 0 ? (
          <div className="filterInput" style={{ padding: 16, borderRadius: 18, marginTop: 14 }}>
            No transactions match your filters.
          </div>
        ) : (
          <div className="tableWrap" style={{ marginTop: 14 }}>
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id}>
                    <td className="cap">{t.date}</td>
                    <td>{t.description}</td>
                    <td style={{ fontWeight: 900 }}>{currency} {Number(t.amount || 0).toLocaleString()}</td>
                    <td className="cap">{t.status}</td>
                    <td style={{ opacity: 0.8 }}>{t.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
