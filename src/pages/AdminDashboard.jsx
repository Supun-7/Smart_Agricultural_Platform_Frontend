import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import logo from "../assets/logo.png";
import "../styles/pages/admin.css";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Users",       value: "1,284",  delta: "+38 this month",  icon: "👥", accent: "#59c173" },
  { label: "Active Contracts",  value: "342",    delta: "+14 this week",   icon: "📜", accent: "#30a2ff" },
  { label: "Capital Deployed",  value: "Rs 48M", delta: "+Rs 3.2M",        icon: "💰", accent: "#c8a84b" },
  { label: "Pending Reviews",   value: "27",     delta: "Needs attention",  icon: "⏳", accent: "#ff5c7a" },
];

const USERS = [
  { id: 1,  name: "Kamal Perera",    email: "kamal@gmail.com",    role: "farmer",   status: "active",   joined: "2025-01-12" },
  { id: 2,  name: "Nimal Silva",     email: "nimal@gmail.com",    role: "investor", status: "active",   joined: "2025-02-03" },
  { id: 3,  name: "Sunil Fernando",  email: "sunil@gmail.com",    role: "farmer",   status: "active",   joined: "2025-02-18" },
  { id: 4,  name: "Amara Jayawardena",email: "amara@gmail.com",   role: "investor", status: "suspended",joined: "2025-03-01" },
  { id: 5,  name: "Ranjith Kumara",  email: "ranjith@gmail.com",  role: "farmer",   status: "active",   joined: "2025-03-14" },
  { id: 6,  name: "Priya Wickrama",  email: "priya@gmail.com",    role: "investor", status: "active",   joined: "2025-04-05" },
  { id: 7,  name: "Dilshan Ratna",   email: "dilshan@gmail.com",  role: "farmer",   status: "pending",  joined: "2025-04-20" },
  { id: 8,  name: "Sanduni Madushani",email:"sanduni@gmail.com",  role: "investor", status: "active",   joined: "2025-05-01" },
  { id: 9,  name: "Gayan Bandara",   email: "gayan@gmail.com",    role: "farmer",   status: "active",   joined: "2025-05-15" },
  { id: 10, name: "Tharuka Senanayake",email:"tharuka@gmail.com", role: "investor", status: "active",   joined: "2025-06-02" },
];

const CONTRACTS = [
  { id: "CHC-001", farmer: "Kamal Perera",    investor: "Nimal Silva",     amount: "Rs 1,800,000", status: "active",   created: "2025-01-15" },
  { id: "CHC-002", farmer: "Sunil Fernando",  investor: "Priya Wickrama",  amount: "Rs 600,000",   status: "active",   created: "2025-02-10" },
  { id: "CHC-003", farmer: "Ranjith Kumara",  investor: "Nimal Silva",     amount: "Rs 400,000",   status: "pending",  created: "2025-03-05" },
  { id: "CHC-004", farmer: "Gayan Bandara",   investor: "Sanduni Madushani",amount:"Rs 1,500,000", status: "pending",  created: "2025-04-01" },
  { id: "CHC-005", farmer: "Dilshan Ratna",   investor: "Tharuka Senanayake",amount:"Rs 900,000",  status: "review",   created: "2025-05-12" },
  { id: "CHC-006", farmer: "Kamal Perera",    investor: "Amara Jayawardena",amount:"Rs 3,000,000", status: "completed",created: "2024-11-20" },
];

const ACTIVITY = [
  { time: "2 min ago",  text: "New investor registered: Sanduni Madushani",  type: "info" },
  { time: "18 min ago", text: "Contract CHC-005 flagged for review",          type: "warn" },
  { time: "1 hr ago",   text: "Farmer Dilshan Ratna completed KYC",           type: "success" },
  { time: "3 hr ago",   text: "Capital deployment Rs 900,000 approved",       type: "success" },
  { time: "5 hr ago",   text: "User Amara Jayawardena account suspended",     type: "danger" },
  { time: "Yesterday",  text: "Monthly report generated successfully",         type: "info" },
];

const NAV_ITEMS = [
  { id: "overview",   label: "Overview",    icon: "⚡" },
  { id: "users",      label: "Users",       icon: "👥" },
  { id: "contracts",  label: "Contracts",   icon: "📜" },
  { id: "activity",   label: "Activity",    icon: "📋" },
];

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const map = { farmer: "#59c173", investor: "#30a2ff", admin: "#c8a84b", auditor: "#ff9f43" };
  return (
    <span className="adm-badge" style={{ background: `${map[role] || "#999"}22`, color: map[role] || "#999", border: `1px solid ${map[role] || "#999"}44` }}>
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = { active: "#59c173", pending: "#c8a84b", suspended: "#ff5c7a", review: "#30a2ff", completed: "#9ab0a0" };
  return (
    <span className="adm-badge" style={{ background: `${map[status] || "#999"}22`, color: map[status] || "#999", border: `1px solid ${map[status] || "#999"}44` }}>
      {status}
    </span>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, onSignOut, user, open }) {
  return (
    <aside className={`adm-sidebar ${open ? "open" : ""}`}>
      <div className="adm-sidebar-brand">
        <img src={logo} alt="CHC" className="adm-sidebar-logo" />
        <div>
          <div className="adm-sidebar-title">CHC Admin</div>
          <div className="adm-sidebar-sub">Control Panel</div>
        </div>
      </div>

      <nav className="adm-sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`adm-nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => onNav(item.id)}
          >
            <span className="adm-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="adm-sidebar-footer">
        <div className="adm-user-chip">
          <div className="adm-user-avatar">
            {(user?.fullName || "A")[0].toUpperCase()}
          </div>
          <div className="adm-user-info">
            <div className="adm-user-name">{user?.fullName || "Admin"}</div>
            <div className="adm-user-role">Administrator</div>
          </div>
        </div>
        <button className="adm-signout" onClick={onSignOut}>
          ↩ Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Overview Panel ───────────────────────────────────────────────────────────
function OverviewPanel() {
  return (
    <div className="adm-panel fade-in">
      <div className="adm-panel-header">
        <h2 className="adm-panel-title">Platform Overview</h2>
        <span className="adm-panel-sub">Live snapshot · {new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}</span>
      </div>

      <div className="adm-stats-grid">
        {STATS.map((s) => (
          <div className="adm-stat-card" key={s.label} style={{ "--accent": s.accent }}>
            <div className="adm-stat-icon">{s.icon}</div>
            <div className="adm-stat-value">{s.value}</div>
            <div className="adm-stat-label">{s.label}</div>
            <div className="adm-stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="adm-two-col">
        {/* Role Distribution */}
        <div className="adm-inner-card">
          <div className="adm-inner-title">User Distribution</div>
          {[
            { role: "Farmers",   count: 680, pct: 53, color: "#59c173" },
            { role: "Investors", count: 504, pct: 39, color: "#30a2ff" },
            { role: "Auditors",  count: 62,  pct: 5,  color: "#ff9f43" },
            { role: "Admins",    count: 38,  pct: 3,  color: "#c8a84b" },
          ].map((r) => (
            <div className="adm-bar-row" key={r.role}>
              <span className="adm-bar-label">{r.role}</span>
              <div className="adm-bar-track">
                <div className="adm-bar-fill" style={{ width: `${r.pct}%`, background: r.color }} />
              </div>
              <span className="adm-bar-count">{r.count}</span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="adm-inner-card">
          <div className="adm-inner-title">Recent Activity</div>
          <div className="adm-activity-list">
            {ACTIVITY.slice(0, 4).map((a, i) => (
              <div className="adm-activity-item" key={i}>
                <span className={`adm-activity-dot dot-${a.type}`} />
                <div>
                  <div className="adm-activity-text">{a.text}</div>
                  <div className="adm-activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Users Panel ──────────────────────────────────────────────────────────────
function UsersPanel() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = USERS.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.role === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="adm-panel fade-in">
      <div className="adm-panel-header">
        <h2 className="adm-panel-title">User Management</h2>
        <span className="adm-panel-sub">{USERS.length} total users</span>
      </div>

      <div className="adm-toolbar">
        <input
          className="adm-search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="adm-filter-tabs">
          {["all", "farmer", "investor"].map((f) => (
            <button key={f} className={`adm-filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td><span className="adm-user-dot">{u.name[0]}</span>{u.name}</td>
                <td className="adm-muted">{u.email}</td>
                <td><RoleBadge role={u.role} /></td>
                <td><StatusBadge status={u.status} /></td>
                <td className="adm-muted">{u.joined}</td>
                <td>
                  <div className="adm-actions">
                    <button className="adm-act-btn view">View</button>
                    {u.status === "active"
                      ? <button className="adm-act-btn danger">Suspend</button>
                      : <button className="adm-act-btn success">Activate</button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="adm-empty">No users match your search.</div>}
      </div>
    </div>
  );
}

// ─── Contracts Panel ──────────────────────────────────────────────────────────
function ContractsPanel() {
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = statusFilter === "all" ? CONTRACTS : CONTRACTS.filter((c) => c.status === statusFilter);

  return (
    <div className="adm-panel fade-in">
      <div className="adm-panel-header">
        <h2 className="adm-panel-title">Contract Registry</h2>
        <span className="adm-panel-sub">{CONTRACTS.length} total contracts</span>
      </div>

      <div className="adm-toolbar">
        <div className="adm-filter-tabs">
          {["all", "active", "pending", "review", "completed"].map((f) => (
            <button key={f} className={`adm-filter-tab ${statusFilter === f ? "active" : ""}`} onClick={() => setStatusFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Contract ID</th>
              <th>Farmer</th>
              <th>Investor</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td><span className="adm-contract-id">{c.id}</span></td>
                <td>{c.farmer}</td>
                <td>{c.investor}</td>
                <td className="adm-amount">{c.amount}</td>
                <td><StatusBadge status={c.status} /></td>
                <td className="adm-muted">{c.created}</td>
                <td>
                  <div className="adm-actions">
                    <button className="adm-act-btn view">View</button>
                    {c.status === "pending" && <button className="adm-act-btn success">Approve</button>}
                    {c.status === "review" && <button className="adm-act-btn warn">Escalate</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Activity Panel ───────────────────────────────────────────────────────────
function ActivityPanel() {
  return (
    <div className="adm-panel fade-in">
      <div className="adm-panel-header">
        <h2 className="adm-panel-title">Activity Log</h2>
        <span className="adm-panel-sub">All platform events</span>
      </div>
      <div className="adm-activity-full">
        {ACTIVITY.map((a, i) => (
          <div className="adm-activity-row" key={i}>
            <div className="adm-activity-timeline">
              <span className={`adm-activity-dot dot-${a.type}`} />
              {i < ACTIVITY.length - 1 && <div className="adm-timeline-line" />}
            </div>
            <div className="adm-activity-content">
              <div className="adm-activity-text">{a.text}</div>
              <div className="adm-activity-time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate(ROUTES.home);
  }

  const panels = {
    overview: <OverviewPanel />,
    users: <UsersPanel />,
    contracts: <ContractsPanel />,
    activity: <ActivityPanel />,
  };

  return (
    <div className="adm-wrap">
      <div className="adm-shell">
        <Sidebar
          active={activeNav}
          onNav={(id) => { setActiveNav(id); setSidebarOpen(false); }}
          onSignOut={handleSignOut}
          user={user}
          open={sidebarOpen}
        />

        {/* Mobile overlay */}
        {sidebarOpen && <div className="adm-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="adm-main">
          {/* Mobile topbar */}
          <div className="adm-topbar">
            <button className="adm-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span /><span /><span />
            </button>
            <span className="adm-topbar-title">
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
            </span>
          </div>

          <div className="adm-content">
            {panels[activeNav]}
          </div>
        </div>
      </div>
    </div>
  );
}
