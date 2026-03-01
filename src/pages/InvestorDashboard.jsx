import { useMemo, useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { OpportunityCard } from "../components/OpportunityCard.jsx";
import { Modal } from "../components/Modal.jsx";
import { ContractCard } from "../components/ContractCard.jsx";
import { IconTrend, IconCoin, IconCheck, IconPercent } from "../components/icons.jsx";
import "../styles/pages/roleDash.css";
import { MOCK_PROJECTS } from "../mock/mockData.js";
import { loadContracts, saveContracts } from "../mock/storage.js";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addMonthsISO(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + Number(months || 0));
  return d.toISOString().slice(0, 10);
}

export default function InvestorDashboard() {
  const [projects] = useState(MOCK_PROJECTS);
  const [contracts, setContracts] = useState(() => loadContracts());

  const stats = useMemo(() => {
    const opportunities = projects.length;
    const totalTarget = projects.reduce((s, p) => s + Number(p.target || 0), 0);
    const alreadyFunded = projects.reduce((s, p) => s + Number(p.raised || 0), 0);
    const avgRoi = opportunities
      ? projects.reduce((s, p) => s + Number(p.roi || 0), 0) / opportunities
      : 0;
    return { opportunities, totalTarget, alreadyFunded, avgRoi };
  }, [projects]);

  const [investOpen, setInvestOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(addMonthsISO(12));
  const [formErr, setFormErr] = useState("");

  function openInvest(project) {
    setSelected(project);
    setAmount("");
    setStartDate(todayISO());
    setEndDate(addMonthsISO(project?.durationMonths || 12));
    setFormErr("");
    setInvestOpen(true);
  }

  function submitInvestment(e) {
    e.preventDefault();
    setFormErr("");

    if (!selected) {
      setFormErr("Select a project first.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setFormErr("Enter a valid amount.");
      return;
    }

    const next = [
      {
        contract_id: `CN-${Date.now()}`,
        project_id: selected.id,
        project_title: selected.title,
        amount: Number(amount),
        start_date: startDate,
        end_date: endDate,
        status: "active"
      },
      ...contracts
    ];

    setContracts(next);
    saveContracts(next);
    setInvestOpen(false);
  }

  return (
    <div className="dashPage">
      <div className="pageTop">
        <h1 className="pageTitle">Investor Dashboard</h1>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Portfolio Snapshot</h2>
        <p className="sectionSubtitle">A quick view of projects and expected returns (mock data)</p>

        <div className="statGrid">
          <StatCard
            variant="green"
            kicker="Opportunities"
            value={String(stats.opportunities)}
            icon={<IconTrend />}
          />
          <StatCard
            variant="plain"
            kicker="Total Funding Target"
            valueTop="LKR"
            value={stats.totalTarget.toLocaleString()}
            icon={<IconCoin />}
          />
          <StatCard
            variant="plain"
            kicker="Already Funded"
            valueTop="LKR"
            value={stats.alreadyFunded.toLocaleString()}
            icon={<IconCheck />}
          />
          <StatCard
            variant="brown"
            kicker="Avg ROI"
            value={`${stats.avgRoi.toFixed(1)}%`}
            sub="Projected returns"
            icon={<IconPercent />}
          />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Projects</h2>
        <p className="sectionSubtitle">Browse projects and create a contract</p>

        <div className="cardGrid">
          {projects.map((p) => (
            <OpportunityCard
              key={p.id}
              project={p}
              action={
                <button className="secondaryBtn" type="button" onClick={() => openInvest(p)}>
                  Invest
                </button>
              }
            />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Contracts</h2>
        <p className="sectionSubtitle">Contracts you created in this browser (saved in localStorage)</p>

        {contracts.length === 0 ? (
          <p className="sectionSubtitle">No contracts yet.</p>
        ) : (
          <div className="cardGrid">
            {contracts.slice(0, 6).map((c) => (
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

      <Modal
        open={investOpen}
        title={selected ? `Invest in ${selected.title}` : "Invest"}
        onClose={() => setInvestOpen(false)}
      >
        <ErrorBanner message={formErr} />

        <form className="form" onSubmit={submitInvestment}>
          <label className="filterField">
            <span>Amount (LKR)</span>
            <input
              className="filterInput"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500000"
              required
            />
          </label>

          <div className="modalGrid2">
            <label className="filterField">
              <span>Start date</span>
              <input className="filterInput" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>

            <label className="filterField">
              <span>End date</span>
              <input className="filterInput" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>

          <button className="primaryBtn" type="submit">
            Create contract
          </button>
        </form>
      </Modal>
    </div>
  );
}
