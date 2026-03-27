import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { investorApi } from "../../services/api.js";
import { LandCardLinked } from "../../components/investor/LandCardLinked.jsx";
import "../../styles/pages/investor/dashboard.css";

const FILTERS = ["ALL", "ACTIVE", "PENDING", "COMPLETED", "CANCELLED"];

function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: "LKR", maximumFractionDigits: 0,
  });
}

export default function InvestorPortfolio() {
  const { token } = useAuth();

  const [portfolio, setPortfolio] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("ALL");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await investorApi.getPortfolio(token);
      setPortfolio(data);
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
          <p>Loading portfolio…</p>
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

  const investments = portfolio?.investments ?? [];

  const filtered = filter === "ALL"
    ? investments
    : investments.filter((inv) => inv.status === filter);

  return (
    <div className="invPage">

      <div className="invPageHeader">
        <div>
          <h1 className="invPageTitle">Portfolio</h1>
          <p className="invPageSub">
            {investments.length} investment{investments.length !== 1 ? "s" : ""}
            {" — "}Total: {fmt(portfolio?.totalInvested)}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="invFilterRow">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={"invFilterBtn" + (filter === f ? " active" : "")}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="invEmpty">
          <span>📭</span>
          <p>
            No {filter !== "ALL" ? filter.toLowerCase() : ""} investments found.
          </p>
        </div>
      ) : (
        <div className="invLandGrid">
          {filtered.map((inv) => (
            <LandCardLinked key={inv.investmentId} investment={inv} />
          ))}
        </div>
      )}

    </div>
  );
}
