/**
 * ComplianceScorePanel.jsx
 *
 * AC-4: Compliance scores are visible to admins on their dashboard.
 *
 * Read-only panel — admins can view scores but cannot modify them
 * (scoring is restricted to AUDITOR role per AC-3).
 */

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function scoreColor(score) {
  if (score === null || score === undefined) return "#9ab0a0";
  const n = Number(score);
  if (n >= 80) return "#59c173";
  if (n >= 50) return "#f5c842";
  return "#ff5c7a";
}

function scoreLabel(score) {
  if (score === null || score === undefined) return "Not scored";
  const n = Number(score);
  if (n >= 80) return "Compliant";
  if (n >= 50) return "Needs improvement";
  return "Non-compliant";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryRow({ farmers }) {
  const scored = farmers.filter(
    (f) => f.complianceScore !== null && f.complianceScore !== undefined
  );
  const avg =
    scored.length > 0
      ? (scored.reduce((s, f) => s + Number(f.complianceScore), 0) / scored.length).toFixed(1)
      : null;

  const tiles = [
    { label: "Total farmers",    value: farmers.length,                                  color: "var(--text)" },
    { label: "Scored",           value: scored.length,                                   color: "var(--text)" },
    { label: "Unscored",         value: farmers.length - scored.length,                  color: "#f5c842" },
    { label: "Compliant (≥80)",  value: scored.filter((f) => Number(f.complianceScore) >= 80).length,  color: "#59c173" },
    { label: "Non-compliant",    value: scored.filter((f) => Number(f.complianceScore) < 50).length,   color: "#ff5c7a" },
    { label: "Platform avg",     value: avg ?? "—",                                      color: "var(--brand)" },
  ];

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1.2rem" }}>
      {tiles.map((t) => (
        <div
          key={t.label}
          style={{
            background: "#0d1610",
            border: "1px solid #1f2b22",
            borderRadius: 12,
            padding: ".8rem 1rem",
            flex: "1 1 100px",
            minWidth: 90,
          }}
        >
          <div
            style={{
              color: "var(--muted)",
              fontSize: ".68rem",
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            {t.label}
          </div>
          <div style={{ color: t.color, fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>
            {t.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function FarmerScoreRow({ farmer }) {
  const color = scoreColor(farmer.complianceScore);
  const hasScore =
    farmer.complianceScore !== null && farmer.complianceScore !== undefined;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        alignItems: "start",
        background: "#111611",
        border: "1px solid #1f2b22",
        borderRadius: 12,
        padding: ".9rem 1.1rem",
      }}
    >
      {/* Left: farmer info */}
      <div>
        <div style={{ fontWeight: 700, color: "var(--text)", fontSize: ".95rem" }}>
          {farmer.farmerFullName || "—"}
        </div>
        <div style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 2 }}>
          {farmer.farmerEmail}
        </div>
        {hasScore && (
          <div style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 4 }}>
            Scored by {farmer.scoredByFullName || "—"} · {fmtDate(farmer.complianceScoredAt)}
          </div>
        )}
        {farmer.complianceNotes && (
          <div
            style={{
              color: "var(--muted)",
              fontSize: ".78rem",
              marginTop: 4,
              fontStyle: "italic",
              maxWidth: 480,
            }}
          >
            "{farmer.complianceNotes}"
          </div>
        )}
      </div>

      {/* Right: score badge */}
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            display: "inline-block",
            background: `${color}18`,
            border: `1px solid ${color}44`,
            color,
            borderRadius: 999,
            padding: ".3rem .85rem",
            fontWeight: 800,
            fontSize: ".9rem",
            marginBottom: 4,
          }}
        >
          {hasScore ? `${Number(farmer.complianceScore).toFixed(1)}` : "—"}
        </div>
        <div style={{ color, fontSize: ".72rem", fontWeight: 700, textAlign: "right" }}>
          {scoreLabel(farmer.complianceScore)}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Drop this panel anywhere in the Admin dashboard.
 *
 * Usage:
 *   import ComplianceScorePanel from "../../components/admin/ComplianceScorePanel";
 *   <ComplianceScorePanel />
 */
export default function ComplianceScorePanel() {
  const { token } = useAuth();

  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.listComplianceScores(token);
      setFarmers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load compliance scores.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const visible = farmers.filter((f) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      f.farmerFullName?.toLowerCase().includes(q) ||
      f.farmerEmail?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        background: "#0b0f0c",
        border: "1px solid #1f2b22",
        borderRadius: 18,
        overflow: "hidden",
        marginBottom: "1.5rem",
      }}
    >
      {/* Panel header */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.4rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text)",
        }}
      >
        <div>
          <div
            style={{
              color: "var(--brand)",
              fontSize: ".72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: 4,
            }}
          >
            Compliance Overview
          </div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>
            Farmer Compliance Scores
          </div>
        </div>
        <span style={{ color: "var(--muted)", fontSize: ".88rem" }}>
          {collapsed ? "Expand ▼" : "Collapse ▲"}
        </span>
      </button>

      {!collapsed && (
        <div style={{ padding: "0 1.4rem 1.4rem", borderTop: "1px solid #1a211b" }}>
          {loading ? (
            <p style={{ color: "var(--muted)", marginTop: "1rem" }}>Loading compliance data…</p>
          ) : error ? (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ color: "#ff9caf", margin: "0 0 .6rem" }}>{error}</p>
              <button
                type="button"
                onClick={load}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,92,122,.4)",
                  color: "#ff5c7a",
                  borderRadius: 8,
                  padding: ".45rem .85rem",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: ".85rem",
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Summary tiles */}
              <div style={{ marginTop: "1rem" }}>
                <SummaryRow farmers={farmers} />
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search farmers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#111611",
                  border: "1px solid #1f2b22",
                  borderRadius: 10,
                  color: "var(--text)",
                  padding: ".55rem 1rem",
                  fontSize: ".88rem",
                  outline: "none",
                  marginBottom: "1rem",
                }}
              />

              {/* Read-only note */}
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: ".78rem",
                  marginTop: 0,
                  marginBottom: ".9rem",
                  fontStyle: "italic",
                }}
              >
                Scores are assigned by auditors. Admins have read-only access.
              </p>

              {/* Farmer rows */}
              {visible.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>
                  {farmers.length === 0
                    ? "No verified farmers exist yet."
                    : "No farmers match your search."}
                </p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {visible.map((f) => (
                    <FarmerScoreRow key={f.farmerId} farmer={f} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
