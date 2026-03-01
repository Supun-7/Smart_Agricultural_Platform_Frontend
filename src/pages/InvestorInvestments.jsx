import { useMemo, useState } from "react";
import { StatCard } from "../components/StatCard.jsx";
import { ContractCard } from "../components/ContractCard.jsx";
import { IconCoin, IconCheck, IconClock, IconGrid } from "../components/icons.jsx";
import "../styles/pages/roleDash.css";
import { loadContracts } from "../mock/storage.js";

export default function InvestorInvestments() {
  const [contracts] = useState(() => loadContracts());

  const stats = useMemo(() => {
    const total = contracts.reduce((s, r) => s + Number(r.amount || 0), 0);
    const active = contracts.filter((r) => r.status === "active").length;
    const pending = contracts.filter((r) => r.status === "pending").length;
    return { total, active, pending, count: contracts.length };
  }, [contracts]);

  return (
    <div className="dashPage">
      <div className="pageTop">
        <h1 className="pageTitle">Investments</h1>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Portfolio Snapshot</h2>
        <p className="sectionSubtitle">Your contracts and invested amounts (saved in this browser)</p>

        <div className="statGrid">
          <StatCard variant="plain" kicker="Contracts" value={String(stats.count)} icon={<IconGrid />} />
          <StatCard variant="plain" kicker="Total Invested" valueTop="LKR" value={stats.total.toLocaleString()} icon={<IconCoin />} />
          <StatCard variant="green" kicker="Active" value={String(stats.active)} icon={<IconCheck />} />
          <StatCard variant="brown" kicker="Pending" value={String(stats.pending)} icon={<IconClock />} />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Contracts</h2>
        <p className="sectionSubtitle">All contracts you created</p>

        {contracts.length === 0 ? (
          <p className="sectionSubtitle">No contracts yet.</p>
        ) : (
          <div className="cardGrid">
            {contracts.map((c) => (
              <ContractCard
                key={c.contract_id}
                contract={{
                  contract_id: c.contract_id,
                  farmer_id: c.project_id,
                  amount: c.amount,
                  start_date: c.start_date,
                  end_date: c.end_date,
                  status: c.status,
                  project_title: c.project_title
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
