import { useState } from "react";
import { useAdminDashboard } from "../../hooks/useAdminDashboard.js";
import { StatCard } from "../../components/investor/StatCard.jsx";
import "../../styles/pages/admin/dashboard.css";

function fmt(val) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency", currency: "LKR", maximumFractionDigits: 2,
  }).format(Number(val ?? 0));
}

function StatusBadge({ status }) {
  const map = {
    VERIFIED:      "adminBadgeVerified",
    PENDING:       "adminBadgePending",
    REJECTED:      "adminBadgeRejected",
    NOT_SUBMITTED: "adminBadgeMuted",
  };
  return (
    <span className={"adminBadge " + (map[status] ?? "adminBadgeMuted")}>
      {status?.replaceAll("_", " ") ?? "—"}
    </span>
  );
}

function UserTable({ users = [], searchPlaceholder, emptyEmoji }) {
  const [query, setQuery] = useState("");

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(query.toLowerCase()) ||
    u.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="adminTableWrap">
      <div className="adminTableTop">
        <input
          className="input adminTableSearch"
          placeholder={searchPlaceholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="adminEmpty">
          <span>{emptyEmoji}</span>
          <p>No records found.</p>
        </div>
      ) : (
        <div className="adminTableScroll">
          <table className="adminTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="adminTdMuted">#{u.id}</td>
                  <td className="adminTdName">{u.name}</td>
                  <td className="adminTdMuted">{u.email}</td>
                  <td>{u.role}</td>
                  <td><StatusBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { dashboard, loading, error, reload } = useAdminDashboard();

  return (
    <div className="adminPage">
      {/* Header */}
      <div className="adminPageHeader">
        <div>
          <span className="adminPageEyebrow">Admin Dashboard</span>
          <h1 className="adminPageTitle">Platform Overview</h1>
          <p className="adminPageSub">Live data across all farmers, investors, and investments</p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="adminLoading">
          <div className="adminSpin"/>
          <p>Loading dashboard…</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="adminError">
          <span>⚠️</span>
          <p>{error}</p>
          <button className="btn" onClick={reload}>Retry</button>
        </div>
      )}

      {/* Dashboard content — only shown when not loading and no error */}
      {!loading && !error && dashboard && (
        <>
          {/* Summary stat cards */}
          <div className="adminStatGrid">
            <StatCard icon="🌾" label="Registered Farmers"   value={dashboard.totalFarmers}               />
            <StatCard icon="💼" label="Registered Investors" value={dashboard.totalInvestors}  accent      />
            <StatCard icon="💰" label="Total Investment"     value={fmt(dashboard.totalInvestment)} accent />
          </div>

          {/* Farmers table */}
          <div className="adminSection">
            <h2 className="adminSectionTitle">All Farmers</h2>
            <UserTable users={dashboard.farmers} searchPlaceholder="Search farmers by name or email…" emptyEmoji="🌾" />
          </div>

          {/* Investors table */}
          <div className="adminSection">
            <h2 className="adminSectionTitle">All Investors</h2>
            <UserTable users={dashboard.investors} searchPlaceholder="Search investors by name or email…" emptyEmoji="💼" />
          </div>
        </>
      )}
    </div>
  );
}
