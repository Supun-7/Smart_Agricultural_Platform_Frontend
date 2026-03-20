import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi } from "../../services/api.js";
import { StatCard } from "../../components/investor/StatCard.jsx";
import "../../styles/pages/investor/dashboard.css";

export default function InvestorReports() {
  const { token } = useAuth();

  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await investorApi.getReports(token);
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  // AC-5: loading state
  if (loading) {
    return (
      <div className="invPage">
        <div className="invLoading">
          <div className="invSpin" />
          <p>Loading reports…</p>
        </div>
      </div>
    );
  }

  // AC-5: error state with retry
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

  // data.summary — exact backend field names from InvestorDashboardServiceImpl
  const s = reports?.summary ?? {};

  function fmt(val) {
    return Number(val ?? 0).toLocaleString("en-LK", {
      style: "currency", currency: s.currency ?? "LKR", maximumFractionDigits: 0,
    });
  }

  return (
    <div className="invPage">

      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">Financial Reports</h1>
          <p className="invPageSub">Complete summary of your investment activity</p>
        </div>
      </div>

      <div className="invSection">
        <h2 className="invSectionTitle">Investment Summary</h2>
        <div className="invStatGrid">
          <StatCard icon="💰" label="Wallet Balance"      value={fmt(s.walletBalance)}      accent />
          <StatCard icon="📊" label="Total Invested"      value={fmt(s.totalInvested)} />
          <StatCard icon="🌱" label="Active Investments"  value={fmt(s.activeInvestments)}
            sub={`${s.activeLands ?? 0} active land${s.activeLands !== 1 ? "s" : ""}`} />
          <StatCard icon="✅" label="Completed Returns"   value={fmt(s.completedReturns)} />
        </div>
      </div>

      <div className="invSection">
        <h2 className="invSectionTitle">Land Summary</h2>
        <div className="invStatGrid">
          <StatCard icon="🗺️" label="Total Lands"         value={s.totalLands  ?? 0} />
          <StatCard icon="✅" label="Active Lands"         value={s.activeLands ?? 0} />
          <StatCard icon="⏳" label="Pending Investments"  value={fmt(s.pendingInvestments)} />
        </div>
      </div>

    </div>
  );
}
