import { useCallback, useEffect, useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { auditorApi } from "../../services/api";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function StatusBadge({ status }) {
  const palette = {
    APPROVED: { background: "rgba(89, 193, 115, 0.12)", color: "#59c173", border: "rgba(89, 193, 115, 0.24)" },
    REJECTED: { background: "rgba(255, 92, 122, 0.12)", color: "#ff5c7a", border: "rgba(255, 92, 122, 0.24)" },
  };
  const style = palette[status] || { background: "rgba(245, 200, 66, 0.12)", color: "#f5c842", border: "rgba(245, 200, 66, 0.24)" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: ".35rem .8rem",
        borderRadius: 999,
        fontSize: ".75rem",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        background: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "#111611",
        border: "1px solid #1f2b22",
        borderRadius: 18,
        padding: "1.2rem 1.3rem",
        minWidth: 180,
        flex: "1 1 180px",
      }}
    >
      <div style={{ color: "var(--muted)", fontSize: ".8rem", textTransform: "uppercase", letterSpacing: ".06em" }}>
        {label}
      </div>
      <div style={{ color: "var(--text)", fontSize: "2rem", fontWeight: 800, marginTop: 8 }}>
        {value}
      </div>
    </div>
  );
}

function LogRow({ item }) {
  return (
    <article
      style={{
        background: "#111611",
        border: "1px solid #1f2b22",
        borderRadius: 18,
        overflow: "hidden",
        padding: "1.15rem 1.25rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <h3 style={{ margin: 0, color: "var(--text)" }}>Farmer: {item.farmerName || "—"}</h3>
          <div style={{ color: "var(--muted)", fontSize: ".92rem" }}>Milestone ID: {item.milestoneId || "—"}</div>
        </div>
        <div>
          <StatusBadge status={item.actionType} />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginTop: "1rem",
        }}
      >
        <div>
          <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Timestamp</div>
          <div style={{ color: "var(--text)", fontWeight: 700, marginTop: 4 }}>{formatDate(item.actionedAt)}</div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Log Entry ID</div>
          <div style={{ color: "var(--text)", fontWeight: 700, marginTop: 4 }}>{item.auditLogId}</div>
        </div>
      </div>
    </article>
  );
}

export default function AuditHistory() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await auditorApi.getAuditHistory(token);
      setData(response);
    } catch (err) {
      setError(err.message || "Failed to load audit history.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const stats = useMemo(() => {
    const items = data?.items || [];
    return {
      total: data?.count ?? items.length,
      approved: items.filter((item) => item.actionType === "APPROVED").length,
      rejected: items.filter((item) => item.actionType === "REJECTED").length,
    };
  }, [data]);

  const items = data?.items || [];

  return (
    <section style={{ minHeight: "100vh", color: "var(--text)", padding: "2rem" }}>
      <header style={{ marginBottom: "1.6rem" }}>
        <span style={{ color: "var(--brand)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", fontSize: ".8rem" }}>
          Auditor Portal
        </span>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "2rem" }}>Audit History</h1>
        <p style={{ color: "var(--muted)", maxWidth: 760, lineHeight: 1.6 }}>
          A read-only activity log of all milestone updates you have actioned.
        </p>
      </header>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <StatCard label="Total actions" value={stats.total} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Rejected" value={stats.rejected} />
      </div>

      {loading ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "2rem", color: "var(--muted)" }}>
          Loading audit history...
        </div>
      ) : error ? (
        <div style={{ background: "rgba(255,92,122,.08)", border: "1px solid rgba(255,92,122,.28)", borderRadius: 18, padding: "1.2rem 1.3rem" }}>
          <div style={{ color: "#ff9caf", fontWeight: 700 }}>Could not load history</div>
          <p style={{ color: "#f5d2d9", marginBottom: "1rem" }}>{error}</p>
          <button
            type="button"
            onClick={loadHistory}
            style={{
              border: "1px solid rgba(255, 92, 122, 0.4)",
              color: "#ff5c7a",
              background: "transparent",
              borderRadius: 10,
              padding: ".7rem 1rem",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: ".9rem",
            }}
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h3 style={{ marginTop: 0 }}>No audit history found</h3>
          <p style={{ color: "var(--muted)", margin: "0 auto", maxWidth: 400 }}>
            You haven't actioned any milestones yet. When you approve or reject a milestone, it will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {items.map((item) => (
            <LogRow key={item.auditLogId} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
