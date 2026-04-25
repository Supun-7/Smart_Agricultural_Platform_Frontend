import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { auditorApi } from "../../services/api";
import { ROUTES } from "../../routes/routePaths";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function DecisionBadge({ decision }) {
  const isApproved = decision === "APPROVED";
  return (
    <span style={{
      display: "inline-flex", padding: ".3rem .8rem", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em",
      background: isApproved ? "rgba(89,193,115,.12)" : "rgba(255,92,122,.12)",
      color: isApproved ? "#59c173" : "#ff5c7a",
      border: `1px solid ${isApproved ? "rgba(89,193,115,.28)" : "rgba(255,92,122,.28)"}`,
    }}>
      {decision || "—"}
    </span>
  );
}

function ReviewTypeBadge({ type }) {
  const palette = {
    KYC: { bg: "rgba(96,165,250,.12)", color: "#60a5fa", border: "rgba(96,165,250,.28)" },
    FARMER_APPLICATION: { bg: "rgba(251,146,60,.12)", color: "#fb923c", border: "rgba(251,146,60,.28)" },
    PROJECT: { bg: "rgba(167,139,250,.12)", color: "#a78bfa", border: "rgba(167,139,250,.28)" },
  };
  const s = palette[type] || { bg: "rgba(120,120,120,.12)", color: "#888", border: "rgba(120,120,120,.28)" };
  const labels = { KYC: "KYC", FARMER_APPLICATION: "Farmer", PROJECT: "Project" };
  return (
    <span style={{ display: "inline-flex", padding: ".3rem .8rem", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {labels[type] || type}
    </span>
  );
}

function HistoryRow({ item }) {
  return (
    <article style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 14, padding: "1rem 1.3rem", display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: "0 16px", alignItems: "start", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1" }}>
        <ReviewTypeBadge type={item.reviewType} />
      </div>
      <div style={{ gridColumn: "2" }}>
        <div style={{ color: "var(--text)", fontWeight: 700, fontSize: "1rem" }}>{item.subjectName || "—"}</div>
        <div style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 3 }}>{formatDate(item.reviewedAt)}</div>
        {item.rejectionReason && (
          <div style={{ marginTop: 8, color: "#ffb3bf", fontSize: ".85rem", lineHeight: 1.5 }}>
            <span style={{ color: "#ff5c7a", fontWeight: 600 }}>Reason: </span>{item.rejectionReason}
          </div>
        )}
      </div>
      <div style={{ gridColumn: "3", paddingTop: 2 }}>
        <DecisionBadge decision={item.decision} />
      </div>
      <div style={{ gridColumn: "4", color: "var(--muted)", fontSize: ".78rem", paddingTop: 4, whiteSpace: "nowrap" }}>
        ID: {String(item.referenceId || "—").substring(0, 8)}{String(item.referenceId || "").length > 8 ? "…" : ""}
      </div>
    </article>
  );
}

const FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "KYC", label: "KYC" },
  { value: "FARMER_APPLICATION", label: "Farmer" },
  { value: "PROJECT", label: "Project" },
];

export default function FullHistoryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const res = await auditorApi.getFullHistory(token);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load history.");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const allItems = useMemo(() => {
    const list = data?.items || [];
    // Sort newest first
    return [...list].sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
  }, [data]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return allItems;
    return allItems.filter((item) => item.reviewType === filter);
  }, [allItems, filter]);

  const stats = useMemo(() => ({
    total: allItems.length,
    approved: allItems.filter((i) => i.decision === "APPROVED").length,
    rejected: allItems.filter((i) => i.decision === "REJECTED").length,
    kyc: allItems.filter((i) => i.reviewType === "KYC").length,
    farmer: allItems.filter((i) => i.reviewType === "FARMER_APPLICATION").length,
    project: allItems.filter((i) => i.reviewType === "PROJECT").length,
  }), [allItems]);

  return (
    <section style={{ minHeight: "100vh", color: "var(--text)", padding: "2rem" }}>
      <header style={{ marginBottom: "1.6rem" }}>
        <button type="button" onClick={() => navigate(ROUTES.auditorDashboard)} style={{ background: "transparent", border: "1px solid #1f2b22", color: "var(--muted)", borderRadius: 8, padding: ".45rem .9rem", cursor: "pointer", fontSize: ".85rem", marginBottom: ".7rem" }}>← Back to dashboard</button>
        <span style={{ display: "block", color: "var(--brand)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", fontSize: ".8rem" }}>Auditor Portal</span>
        <h1 style={{ margin: ".3rem 0 0", fontSize: "1.9rem" }}>Full Review History</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6, marginTop: ".4rem" }}>
          All KYC, farmer application, and project decisions you have made.
        </p>
      </header>

      {/* Stats */}
      {!loading && !error && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {[
            { label: "Total", value: stats.total, color: "var(--text)" },
            { label: "Approved", value: stats.approved, color: "#59c173" },
            { label: "Rejected", value: stats.rejected, color: "#ff5c7a" },
            { label: "KYC", value: stats.kyc, color: "#60a5fa" },
            { label: "Farmer", value: stats.farmer, color: "#fb923c" },
            { label: "Project", value: stats.project, color: "#a78bfa" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 14, padding: ".9rem 1.2rem", flex: "1 1 100px" }}>
              <div style={{ color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: "1.7rem", fontWeight: 800, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && !error && (
        <div style={{ display: "flex", gap: 8, marginBottom: "1.3rem", flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              style={{
                border: filter === opt.value ? "1px solid rgba(162,206,58,.5)" : "1px solid #1f2b22",
                color: filter === opt.value ? "var(--brand)" : "var(--muted)",
                background: filter === opt.value ? "rgba(162,206,58,.08)" : "transparent",
                borderRadius: 10, padding: ".5rem 1rem", cursor: "pointer", fontWeight: 700, fontSize: ".85rem",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "2rem", color: "var(--muted)" }}>Loading history...</div>
      ) : error ? (
        <div style={{ background: "rgba(255,92,122,.08)", border: "1px solid rgba(255,92,122,.28)", borderRadius: 18, padding: "1.3rem" }}>
          <div style={{ color: "#ff9caf", fontWeight: 700 }}>Could not load history</div>
          <p style={{ color: "#f5d2d9", margin: ".5rem 0 1rem" }}>{error}</p>
          <button type="button" onClick={load} style={{ border: "1px solid rgba(255,92,122,.4)", color: "#ff5c7a", background: "transparent", borderRadius: 10, padding: ".6rem 1rem", cursor: "pointer", fontWeight: 700 }}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h3 style={{ marginTop: 0 }}>No history found</h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {filter === "ALL" ? "No reviews have been made yet." : `No ${filter} reviews found.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((item, i) => (
            <HistoryRow key={`${item.referenceId}-${i}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
