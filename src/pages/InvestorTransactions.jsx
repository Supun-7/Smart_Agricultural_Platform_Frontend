import { useMemo } from "react";
import "../styles/pages/roleDash.css";
import { loadTransactions } from "../mock/storage.js";

export default function InvestorTransactions() {
  const txns = useMemo(() => loadTransactions(), []);

  return (
    <div className="dashPage">
      <div className="pageTop">
        <h1 className="pageTitle">Transactions</h1>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Activity</h2>
        <p className="sectionSubtitle">Mock transactions (no database connection).</p>

        {txns.length === 0 ? (
          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            No transactions to display.
          </div>
        ) : (
          <div className="cardGrid">
            {txns.map((t) => (
              <div key={t.id} className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{t.type}</strong>
                  <span className="cap">{t.date}</span>
                </div>
                <div style={{ marginTop: 6, opacity: 0.9 }}>{t.description}</div>
                <div style={{ marginTop: 10, fontWeight: 700 }}>
                  LKR {Number(t.amount || 0).toLocaleString()}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>Ref: {t.id}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
