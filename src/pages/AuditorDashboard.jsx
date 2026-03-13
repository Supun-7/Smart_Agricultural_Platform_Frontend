import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import logo from "../assets/logo.png";
import "../styles/pages/auditor.css";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const AUDIT_STATS = [
  { label: "Pending Reviews",  value: "27",  delta: "Requires action", icon: "⏳", accent: "#c8a84b" },
  { label: "Reviewed Today",   value: "8",   delta: "+3 vs yesterday",  icon: "✅", accent: "#59c173" },
  { label: "Flagged",          value: "5",   delta: "Needs escalation", icon: "🚩", accent: "#ff5c7a" },
  { label: "Approved (Month)", value: "143", delta: "This month",       icon: "📋", accent: "#30a2ff" },
];

const QUEUE = [
  { id: "CHC-003", farmer: "Ranjith Kumara",    investor: "Nimal Silva",       amount: "Rs 400,000",   submitted: "2025-05-10", risk: "low",    priority: "normal" },
  { id: "CHC-004", farmer: "Gayan Bandara",      investor: "Sanduni Madushani", amount: "Rs 1,500,000", submitted: "2025-05-12", risk: "medium", priority: "high"   },
  { id: "CHC-005", farmer: "Dilshan Ratna",      investor: "Tharuka Senanayake",amount: "Rs 900,000",   submitted: "2025-05-14", risk: "high",   priority: "urgent" },
  { id: "CHC-007", farmer: "Pradeep Jayaratne",  investor: "Malini Wijesekera", amount: "Rs 2,200,000", submitted: "2025-05-15", risk: "medium", priority: "high"   },
  { id: "CHC-008", farmer: "Suranga Dissanayake",investor: "Roshan Gunaratna",  amount: "Rs 750,000",   submitted: "2025-05-16", risk: "low",    priority: "normal" },
  { id: "CHC-009", farmer: "Chaminda Senarathne",investor: "Lasith Malinga",    amount: "Rs 3,500,000", submitted: "2025-05-17", risk: "high",   priority: "urgent" },
];

const HISTORY = [
  { id: "CHC-001", farmer: "Kamal Perera",    amount: "Rs 1,800,000", decision: "approved",  date: "2025-05-08", note: "All milestones verified. Clean record." },
  { id: "CHC-002", farmer: "Sunil Fernando",  amount: "Rs 600,000",   decision: "approved",  date: "2025-05-07", note: "Documentation complete. Land verified." },
  { id: "CHC-006", farmer: "Kamal Perera",    amount: "Rs 3,000,000", decision: "rejected",  date: "2025-05-05", note: "Incomplete land ownership documents." },
  { id: "CHC-010", farmer: "Nirosha Bandara", amount: "Rs 500,000",   decision: "flagged",   date: "2025-05-03", note: "Escalated to admin for further review." },
  { id: "CHC-011", farmer: "Ashan Perera",    amount: "Rs 1,100,000", decision: "approved",  date: "2025-05-01", note: "Soil report and investment plan verified." },
];

const CHECKLIST = [
  "Land ownership documents verified",
  "Soil and crop assessment report reviewed",
  "Investor accreditation confirmed",
  "Milestone plan is realistic and documented",
  "No prior contract violations on record",
  "KYC completed for both parties",
];

const NAV_ITEMS = [
  { id: "queue",    label: "Review Queue", icon: "⏳" },
  { id: "history",  label: "History",      icon: "📋" },
  { id: "stats",    label: "My Stats",     icon: "📊" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function RiskBadge({ risk }) {
  const map = { low: "#59c173", medium: "#c8a84b", high: "#ff5c7a" };
  return (
    <span className="aud-badge" style={{ background: `${map[risk]}22`, color: map[risk], border: `1px solid ${map[risk]}44` }}>
      {risk}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const map = { normal: "#9ab0a0", high: "#30a2ff", urgent: "#ff5c7a" };
  return (
    <span className="aud-badge" style={{ background: `${map[priority]}22`, color: map[priority], border: `1px solid ${map[priority]}44` }}>
      {priority}
    </span>
  );
}

function DecisionBadge({ decision }) {
  const map = { approved: "#59c173", rejected: "#ff5c7a", flagged: "#c8a84b" };
  return (
    <span className="aud-badge" style={{ background: `${map[decision]}22`, color: map[decision], border: `1px solid ${map[decision]}44` }}>
      {decision}
    </span>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, onSignOut, user, open }) {
  return (
    <aside className={`aud-sidebar ${open ? "open" : ""}`}>
      <div className="aud-sidebar-brand">
        <img src={logo} alt="CHC" className="aud-sidebar-logo" />
        <div>
          <div className="aud-sidebar-title">CHC Auditor</div>
          <div className="aud-sidebar-sub">Review Portal</div>
        </div>
      </div>

      <nav className="aud-sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`aud-nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => onNav(item.id)}
          >
            <span className="aud-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="aud-sidebar-footer">
        <div className="aud-user-chip">
          <div className="aud-user-avatar">
            {(user?.fullName || "A")[0].toUpperCase()}
          </div>
          <div className="aud-user-info">
            <div className="aud-user-name">{user?.fullName || "Auditor"}</div>
            <div className="aud-user-role">Contract Auditor</div>
          </div>
        </div>
        <button className="aud-signout" onClick={onSignOut}>
          ↩ Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ contract, onClose }) {
  const [checks, setChecks] = useState(Array(CHECKLIST.length).fill(false));
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const allChecked = checks.every(Boolean);

  function toggle(i) {
    setChecks((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  function submit(dec) {
    setDecision(dec);
    setSubmitted(true);
  }

  return (
    <div className="aud-modal-backdrop" onClick={onClose}>
      <div className="aud-modal" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="aud-modal-done">
            <div className="aud-done-icon">{decision === "approved" ? "✅" : decision === "rejected" ? "❌" : "🚩"}</div>
            <div className="aud-done-title">Review Submitted</div>
            <div className="aud-done-sub">Contract {contract.id} has been <strong>{decision}</strong>.</div>
            <button className="aud-btn aud-btn-ghost" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="aud-modal-header">
              <div>
                <div className="aud-modal-title">Review Contract</div>
                <div className="aud-modal-sub">{contract.id} · {contract.farmer} → {contract.investor}</div>
              </div>
              <button className="aud-close" onClick={onClose}>✕</button>
            </div>

            <div className="aud-modal-meta">
              <span><strong>Amount:</strong> {contract.amount}</span>
              <span><strong>Submitted:</strong> {contract.submitted}</span>
              <RiskBadge risk={contract.risk} />
            </div>

            <div className="aud-modal-section">
              <div className="aud-section-title">Audit Checklist</div>
              {CHECKLIST.map((item, i) => (
                <label className="aud-check-row" key={i}>
                  <input
                    type="checkbox"
                    className="aud-checkbox"
                    checked={checks[i]}
                    onChange={() => toggle(i)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>

            <div className="aud-modal-section">
              <div className="aud-section-title">Auditor Notes</div>
              <textarea
                className="aud-textarea"
                placeholder="Add your findings, observations, or concerns…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="aud-modal-actions">
              <button
                className="aud-btn aud-btn-success"
                disabled={!allChecked}
                onClick={() => submit("approved")}
              >
                ✅ Approve
              </button>
              <button
                className="aud-btn aud-btn-danger"
                onClick={() => submit("rejected")}
              >
                ❌ Reject
              </button>
              <button
                className="aud-btn aud-btn-warn"
                onClick={() => submit("flagged")}
              >
                🚩 Flag / Escalate
              </button>
            </div>
            {!allChecked && (
              <div className="aud-checklist-warn">Complete all checklist items to approve.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Queue Panel ─────────────────────────────────────────────────────────────
function QueuePanel() {
  const [selected, setSelected] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = priorityFilter === "all" ? QUEUE : QUEUE.filter((c) => c.priority === priorityFilter);

  return (
    <div className="aud-panel fade-in">
      {selected && <ReviewModal contract={selected} onClose={() => setSelected(null)} />}

      <div className="aud-panel-header">
        <h2 className="aud-panel-title">Review Queue</h2>
        <span className="aud-panel-sub">{QUEUE.length} contracts awaiting review</span>
      </div>

      <div className="aud-toolbar">
        <div className="aud-filter-tabs">
          {["all", "urgent", "high", "normal"].map((f) => (
            <button key={f} className={`aud-filter-tab ${priorityFilter === f ? "active" : ""}`} onClick={() => setPriorityFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="aud-queue-list">
        {filtered.map((c) => (
          <div className="aud-queue-card" key={c.id}>
            <div className="aud-queue-top">
              <span className="aud-contract-id">{c.id}</span>
              <div className="aud-queue-badges">
                <RiskBadge risk={c.risk} />
                <PriorityBadge priority={c.priority} />
              </div>
            </div>
            <div className="aud-queue-parties">
              <span>🌾 {c.farmer}</span>
              <span className="aud-arrow">→</span>
              <span>💼 {c.investor}</span>
            </div>
            <div className="aud-queue-bottom">
              <span className="aud-amount">{c.amount}</span>
              <span className="aud-muted">Submitted {c.submitted}</span>
              <button className="aud-review-btn" onClick={() => setSelected(c)}>
                Start Review →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel() {
  return (
    <div className="aud-panel fade-in">
      <div className="aud-panel-header">
        <h2 className="aud-panel-title">Review History</h2>
        <span className="aud-panel-sub">{HISTORY.length} completed reviews</span>
      </div>

      <div className="aud-table-wrap">
        <table className="aud-table">
          <thead>
            <tr>
              <th>Contract</th>
              <th>Farmer</th>
              <th>Amount</th>
              <th>Decision</th>
              <th>Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((h) => (
              <tr key={h.id}>
                <td><span className="aud-contract-id">{h.id}</span></td>
                <td>{h.farmer}</td>
                <td className="aud-amount">{h.amount}</td>
                <td><DecisionBadge decision={h.decision} /></td>
                <td className="aud-muted">{h.date}</td>
                <td className="aud-muted aud-note">{h.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────
function StatsPanel() {
  return (
    <div className="aud-panel fade-in">
      <div className="aud-panel-header">
        <h2 className="aud-panel-title">My Performance</h2>
        <span className="aud-panel-sub">Current month · May 2025</span>
      </div>

      <div className="aud-stats-grid">
        {AUDIT_STATS.map((s) => (
          <div className="aud-stat-card" key={s.label} style={{ "--accent": s.accent }}>
            <div className="aud-stat-icon">{s.icon}</div>
            <div className="aud-stat-value">{s.value}</div>
            <div className="aud-stat-label">{s.label}</div>
            <div className="aud-stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="aud-two-col">
        <div className="aud-inner-card">
          <div className="aud-inner-title">Decision Breakdown</div>
          {[
            { label: "Approved", count: 143, pct: 74, color: "#59c173" },
            { label: "Rejected", count: 29,  pct: 15, color: "#ff5c7a" },
            { label: "Flagged",  count: 21,  pct: 11, color: "#c8a84b" },
          ].map((r) => (
            <div className="aud-bar-row" key={r.label}>
              <span className="aud-bar-label">{r.label}</span>
              <div className="aud-bar-track">
                <div className="aud-bar-fill" style={{ width: `${r.pct}%`, background: r.color }} />
              </div>
              <span className="aud-bar-count">{r.count}</span>
            </div>
          ))}
        </div>

        <div className="aud-inner-card">
          <div className="aud-inner-title">Avg. Review Time</div>
          <div className="aud-big-metric">
            <span className="aud-big-num">14</span>
            <span className="aud-big-unit">min / contract</span>
          </div>
          <div className="aud-muted" style={{ fontSize: ".83rem" }}>Team average: 22 min. You're 36% faster.</div>
          <div style={{ height: 12 }} />
          <div className="aud-inner-title">Accuracy Rating</div>
          <div className="aud-big-metric">
            <span className="aud-big-num" style={{ color: "#59c173" }}>98.2%</span>
          </div>
          <div className="aud-muted" style={{ fontSize: ".83rem" }}>No appeals overturned this month.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AuditorDashboard() {
  const [activeNav, setActiveNav] = useState("queue");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate(ROUTES.home);
  }

  const panels = {
    queue:   <QueuePanel />,
    history: <HistoryPanel />,
    stats:   <StatsPanel />,
  };

  return (
    <div className="aud-wrap">
      <div className="aud-shell">
        <Sidebar
          active={activeNav}
          onNav={(id) => { setActiveNav(id); setSidebarOpen(false); }}
          onSignOut={handleSignOut}
          user={user}
          open={sidebarOpen}
        />

        {sidebarOpen && <div className="aud-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="aud-main">
          <div className="aud-topbar">
            <button className="aud-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span /><span /><span />
            </button>
            <span className="aud-topbar-title">
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
            </span>
          </div>

          <div className="aud-content">
            {panels[activeNav]}
          </div>
        </div>
      </div>
    </div>
  );
}
