/**
 * FarmerCompliancePage.jsx
 *
 * AC-3  Auditor can assign or update a compliance score for any farmer.
 * AC-4  Compliance score is visible to auditor on their dashboard.
 * AC-5  Score updates are saved immediately and reflected without page reload.
 *
 * Scoring criteria (AC-1):
 *   Component                       Weight
 *   ─────────────────────────────────────
 *   Milestone update frequency       40 pts
 *   Evidence quality                 40 pts
 *   Timeliness of submissions        20 pts
 *   ─────────────────────────────────────
 *   Total                           100 pts
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { auditorApi } from "../../services/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  if (score === null || score === undefined) return "#9ab0a0"; // muted — unscored
  const n = Number(score);
  if (n >= 80) return "#59c173";   // green
  if (n >= 50) return "#f5c842";   // amber
  return "#ff5c7a";                // red
}

function scoreLabel(score) {
  if (score === null || score === undefined) return "Not scored";
  const n = Number(score);
  if (n >= 80) return "Compliant";
  if (n >= 50) return "Needs improvement";
  return "Non-compliant";
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 1200,
        background: toast.type === "error" ? "#8d1f35" : "#2d6a3f",
        color: "#fff",
        padding: ".85rem 1.2rem",
        borderRadius: 12,
        boxShadow: "0 12px 32px rgba(0,0,0,.28)",
        fontWeight: 700,
        fontSize: ".95rem",
        maxWidth: 360,
      }}
    >
      {toast.message}
    </div>
  );
}

/** AC-1: The rubric card shown at the top so auditors understand the scoring rules. */
function ScoringRulesCard() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: "#0d1610",
        border: "1px solid rgba(89,193,115,.2)",
        borderRadius: 16,
        marginBottom: "1.5rem",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          border: "none",
          padding: "1rem 1.4rem",
          cursor: "pointer",
          color: "var(--text)",
        }}
      >
        <span style={{ fontWeight: 700, color: "var(--brand)", letterSpacing: ".04em" }}>
          📋 AC-1 — Compliance Scoring Rules
        </span>
        <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          {open ? "Hide ▲" : "Show ▼"}
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 1.4rem 1.2rem", borderTop: "1px solid rgba(89,193,115,.12)" }}>
          <p style={{ color: "var(--muted)", marginTop: "1rem", lineHeight: 1.6 }}>
            Assign a score from <strong style={{ color: "var(--text)" }}>0 to 100</strong> based
            on the three criteria below. Scores are visible to both auditors and admins.
          </p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: ".9rem",
              marginTop: ".5rem",
            }}
          >
            <thead>
              <tr style={{ color: "var(--muted)", textAlign: "left" }}>
                <th style={{ padding: ".5rem .75rem", borderBottom: "1px solid #1f2b22" }}>
                  Component
                </th>
                <th style={{ padding: ".5rem .75rem", borderBottom: "1px solid #1f2b22", textAlign: "right" }}>
                  Max pts
                </th>
                <th style={{ padding: ".5rem .75rem", borderBottom: "1px solid #1f2b22" }}>
                  Guidance
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  component: "Milestone update frequency",
                  pts: 40,
                  guidance: "How regularly does the farmer submit milestone updates?",
                },
                {
                  component: "Evidence quality",
                  pts: 40,
                  guidance: "Are uploaded photos/docs clear, relevant, and sufficient?",
                },
                {
                  component: "Timeliness of submissions",
                  pts: 20,
                  guidance: "Are milestones submitted on or before due dates?",
                },
              ].map((row) => (
                <tr key={row.component}>
                  <td style={{ padding: ".6rem .75rem", color: "var(--text)", fontWeight: 600 }}>
                    {row.component}
                  </td>
                  <td
                    style={{
                      padding: ".6rem .75rem",
                      color: "var(--brand)",
                      fontWeight: 800,
                      textAlign: "right",
                    }}
                  >
                    {row.pts}
                  </td>
                  <td style={{ padding: ".6rem .75rem", color: "var(--muted)" }}>
                    {row.guidance}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: "1px solid #1f2b22" }}>
                <td style={{ padding: ".6rem .75rem", color: "var(--text)", fontWeight: 800 }}>
                  Total
                </td>
                <td
                  style={{
                    padding: ".6rem .75rem",
                    color: "var(--brand)",
                    fontWeight: 800,
                    textAlign: "right",
                  }}
                >
                  100
                </td>
                <td />
              </tr>
            </tbody>
          </table>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: "1rem",
              flexWrap: "wrap",
              fontSize: ".82rem",
            }}
          >
            {[
              { range: "80 – 100", label: "Compliant", color: "#59c173" },
              { range: "50 – 79", label: "Needs improvement", color: "#f5c842" },
              { range: "0 – 49", label: "Non-compliant", color: "#ff5c7a" },
            ].map((tier) => (
              <span
                key={tier.range}
                style={{
                  background: `${tier.color}18`,
                  border: `1px solid ${tier.color}44`,
                  color: tier.color,
                  borderRadius: 8,
                  padding: ".3rem .7rem",
                  fontWeight: 700,
                }}
              >
                {tier.range} — {tier.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * AC-3 / AC-5: Inline score editor.
 * On save the PUT response is returned and the parent state is updated optimistically
 * — no page reload required.
 */
function ScoreEditor({ farmer, token, onSaved }) {
  const existing = farmer.complianceScore;
  const [editing, setEditing]   = useState(false);
  const [score, setScore]       = useState(existing !== null && existing !== undefined ? String(existing) : "");
  const [notes, setNotes]       = useState(farmer.complianceNotes || "");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  // Reset local state whenever the parent record changes (e.g. after a save)
  useEffect(() => {
    setScore(existing !== null && existing !== undefined ? String(existing) : "");
    setNotes(farmer.complianceNotes || "");
  }, [existing, farmer.complianceNotes]);

  async function handleSave() {
    const parsed = parseFloat(score);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      setError("Score must be a number between 0 and 100.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      // AC-5: PUT request — saved immediately, response returned in same call
      const result = await auditorApi.assignComplianceScore(
        token,
        farmer.farmerId,
        parsed,
        notes.trim() || null
      );
      // AC-5: update parent state without page reload
      onSaved(farmer.farmerId, result.score);
      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to save score.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setScore(existing !== null && existing !== undefined ? String(existing) : "");
    setNotes(farmer.complianceNotes || "");
    setError("");
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        style={{
          background: "transparent",
          border: "1px solid rgba(162,206,58,.35)",
          color: "var(--brand)",
          borderRadius: 8,
          padding: ".45rem .9rem",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: ".82rem",
          whiteSpace: "nowrap",
        }}
      >
        {existing !== null && existing !== undefined ? "Edit score" : "Assign score"}
      </button>
    );
  }

  return (
    <div
      style={{
        background: "#0d1610",
        border: "1px solid rgba(162,206,58,.22)",
        borderRadius: 14,
        padding: "1rem 1.1rem",
        minWidth: 240,
      }}
    >
      <div style={{ marginBottom: ".6rem" }}>
        <label
          style={{
            display: "block",
            color: "var(--muted)",
            fontSize: ".76rem",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 6,
          }}
        >
          Score (0 – 100)
        </label>
        {/* Range slider + numeric input kept in sync */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={score === "" ? 0 : parseFloat(score) || 0}
            onChange={(e) => setScore(e.target.value)}
            style={{ flex: 1, accentColor: "var(--brand)" }}
          />
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            style={{
              width: 64,
              background: "#111611",
              border: "1px solid #263228",
              borderRadius: 8,
              color: "var(--text)",
              padding: ".35rem .5rem",
              fontSize: ".95rem",
              textAlign: "center",
            }}
          />
        </div>
        {/* Live tier label */}
        {score !== "" && !Number.isNaN(parseFloat(score)) && (
          <div
            style={{
              marginTop: 6,
              fontSize: ".78rem",
              fontWeight: 700,
              color: scoreColor(parseFloat(score)),
            }}
          >
            {scoreLabel(parseFloat(score))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: ".8rem" }}>
        <label
          style={{
            display: "block",
            color: "var(--muted)",
            fontSize: ".76rem",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 6,
          }}
        >
          Notes (optional)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Explain the score rationale..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            resize: "vertical",
            background: "#111611",
            border: "1px solid #263228",
            borderRadius: 10,
            color: "var(--text)",
            padding: ".6rem .75rem",
            fontSize: ".88rem",
            outline: "none",
          }}
        />
      </div>

      {error && (
        <p style={{ color: "#ff9caf", fontSize: ".82rem", margin: "0 0 .6rem" }}>{error}</p>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1,
            background: "var(--brand)",
            border: "none",
            borderRadius: 8,
            color: "#0b0f0c",
            fontWeight: 800,
            padding: ".55rem .9rem",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            fontSize: ".88rem",
          }}
        >
          {saving ? "Saving…" : "Save score"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          style={{
            background: "transparent",
            border: "1px solid #263228",
            borderRadius: 8,
            color: "var(--muted)",
            fontWeight: 700,
            padding: ".55rem .9rem",
            cursor: "pointer",
            fontSize: ".88rem",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/** One row in the farmer compliance table. */
function FarmerRow({ farmer, token, onSaved }) {
  const color = scoreColor(farmer.complianceScore);
  const label = scoreLabel(farmer.complianceScore);
  const hasScore = farmer.complianceScore !== null && farmer.complianceScore !== undefined;

  return (
    <article
      style={{
        background: "#111611",
        border: "1px solid #1f2b22",
        borderRadius: 16,
        padding: "1.1rem 1.25rem",
        display: "grid",
        gap: 12,
      }}
    >
      {/* Top row: farmer name + score badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "1rem" }}>
            {farmer.farmerFullName || "—"}
          </div>
          <div style={{ color: "var(--muted)", fontSize: ".84rem", marginTop: 3 }}>
            {farmer.farmerEmail} · {farmer.verificationStatus?.replaceAll("_", " ") || "—"}
          </div>
        </div>

        {/* Score pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              background: `${color}18`,
              border: `1px solid ${color}44`,
              color,
              borderRadius: 999,
              padding: ".35rem .9rem",
              fontWeight: 800,
              fontSize: ".88rem",
              minWidth: 60,
              textAlign: "center",
            }}
          >
            {hasScore ? `${Number(farmer.complianceScore).toFixed(1)} / 100` : "—"}
          </div>
          <span style={{ color, fontSize: ".78rem", fontWeight: 700 }}>{label}</span>
        </div>
      </div>

      {/* Meta row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              color: "var(--muted)",
              fontSize: ".72rem",
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Last scored
          </div>
          <div style={{ color: "var(--text)", marginTop: 3, fontSize: ".88rem" }}>
            {fmtDate(farmer.complianceScoredAt)}
          </div>
        </div>
        <div>
          <div
            style={{
              color: "var(--muted)",
              fontSize: ".72rem",
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Scored by
          </div>
          <div style={{ color: "var(--text)", marginTop: 3, fontSize: ".88rem" }}>
            {farmer.scoredByFullName || "—"}
          </div>
        </div>
        {farmer.complianceNotes && (
          <div style={{ gridColumn: "1 / -1" }}>
            <div
              style={{
                color: "var(--muted)",
                fontSize: ".72rem",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Notes
            </div>
            <div
              style={{
                color: "var(--text)",
                marginTop: 3,
                fontSize: ".88rem",
                lineHeight: 1.5,
              }}
            >
              {farmer.complianceNotes}
            </div>
          </div>
        )}
      </div>

      {/* AC-3: Score editor */}
      <ScoreEditor farmer={farmer} token={token} onSaved={onSaved} />
    </article>
  );
}

// ── Summary stats bar ────────────────────────────────────────────────────────

function SummaryBar({ farmers }) {
  const scored   = farmers.filter((f) => f.complianceScore !== null && f.complianceScore !== undefined);
  const compliant       = scored.filter((f) => Number(f.complianceScore) >= 80).length;
  const needsImprovement = scored.filter((f) => {
    const n = Number(f.complianceScore);
    return n >= 50 && n < 80;
  }).length;
  const nonCompliant = scored.filter((f) => Number(f.complianceScore) < 50).length;
  const avgScore =
    scored.length > 0
      ? (scored.reduce((sum, f) => sum + Number(f.complianceScore), 0) / scored.length).toFixed(1)
      : null;

  const cards = [
    { label: "Total farmers",     value: farmers.length,  color: "var(--text)" },
    { label: "Scored",            value: scored.length,   color: "var(--text)" },
    { label: "Not yet scored",    value: farmers.length - scored.length, color: "#f5c842" },
    { label: "Compliant (≥80)",   value: compliant,       color: "#59c173" },
    { label: "Needs improvement", value: needsImprovement, color: "#f5c842" },
    { label: "Non-compliant",     value: nonCompliant,    color: "#ff5c7a" },
    { label: "Platform avg score",value: avgScore !== null ? `${avgScore}` : "—", color: "var(--brand)" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: "1.5rem",
      }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: "#111611",
            border: "1px solid #1f2b22",
            borderRadius: 14,
            padding: "1rem 1.2rem",
            flex: "1 1 130px",
            minWidth: 120,
          }}
        >
          <div
            style={{
              color: "var(--muted)",
              fontSize: ".72rem",
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            {c.label}
          </div>
          <div
            style={{
              color: c.color,
              fontSize: "1.7rem",
              fontWeight: 800,
              marginTop: 6,
            }}
          >
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function FarmerCompliancePage() {
  const { token } = useAuth();

  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [toast, setToast]     = useState(null);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("ALL"); // ALL | SCORED | UNSCORED | COMPLIANT | NEEDS_IMPROVEMENT | NON_COMPLIANT

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadFarmers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await auditorApi.listComplianceScores(token);
      setFarmers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load farmer compliance data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadFarmers(); }, [loadFarmers]);

  /**
   * AC-5: Called by ScoreEditor after a successful PUT.
   * Merges the returned score data into local state — no reload needed.
   */
  function handleSaved(farmerId, updatedScore) {
    setFarmers((prev) =>
      prev.map((f) =>
        f.farmerId === farmerId
          ? {
              ...f,
              complianceScore:    updatedScore.complianceScore,
              complianceNotes:    updatedScore.complianceNotes,
              complianceScoredAt: updatedScore.complianceScoredAt,
              scoredByFullName:   updatedScore.scoredByFullName,
            }
          : f
      )
    );
    showToast("success", "Compliance score saved successfully.");
  }

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = farmers.filter((f) => {
    // Text search
    const q = search.toLowerCase();
    if (
      q &&
      !f.farmerFullName?.toLowerCase().includes(q) &&
      !f.farmerEmail?.toLowerCase().includes(q)
    ) {
      return false;
    }
    // Status filter
    if (filter === "SCORED")   return f.complianceScore !== null && f.complianceScore !== undefined;
    if (filter === "UNSCORED") return f.complianceScore === null || f.complianceScore === undefined;
    if (filter === "COMPLIANT") {
      return f.complianceScore !== null && f.complianceScore !== undefined && Number(f.complianceScore) >= 80;
    }
    if (filter === "NEEDS_IMPROVEMENT") {
      const n = Number(f.complianceScore);
      return f.complianceScore !== null && f.complianceScore !== undefined && n >= 50 && n < 80;
    }
    if (filter === "NON_COMPLIANT") {
      return f.complianceScore !== null && f.complianceScore !== undefined && Number(f.complianceScore) < 50;
    }
    return true;
  });

  const filterOptions = [
    { value: "ALL",              label: "All farmers" },
    { value: "UNSCORED",         label: "Not yet scored" },
    { value: "SCORED",           label: "Scored" },
    { value: "COMPLIANT",        label: "Compliant (≥80)" },
    { value: "NEEDS_IMPROVEMENT",label: "Needs improvement (50–79)" },
    { value: "NON_COMPLIANT",    label: "Non-compliant (<50)" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section style={{ minHeight: "100vh", color: "var(--text)", padding: "2rem" }}>
      <Toast toast={toast} />

      {/* Header */}
      <header style={{ marginBottom: "1.6rem" }}>
        <span
          style={{
            color: "var(--brand)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            fontSize: ".78rem",
          }}
        >
          Auditor · Compliance
        </span>
        <h1 style={{ margin: ".4rem 0 0", fontSize: "2rem" }}>Farmer Compliance Scoring</h1>
        <p style={{ color: "var(--muted)", maxWidth: 680, lineHeight: 1.6, marginTop: ".4rem" }}>
          Assign or update a compliance score for each verified farmer. Scores are saved
          immediately and visible to admins on their dashboard.
        </p>
      </header>

      {/* AC-1: Scoring rules card */}
      <ScoringRulesCard />

      {/* Loading / error */}
      {loading ? (
        <div
          style={{
            background: "#111611",
            border: "1px solid #1f2b22",
            borderRadius: 16,
            padding: "2rem",
            color: "var(--muted)",
          }}
        >
          Loading farmer compliance data…
        </div>
      ) : error ? (
        <div
          style={{
            background: "rgba(255,92,122,.08)",
            border: "1px solid rgba(255,92,122,.28)",
            borderRadius: 16,
            padding: "1.2rem 1.4rem",
          }}
        >
          <div style={{ color: "#ff9caf", fontWeight: 700, marginBottom: ".5rem" }}>
            Could not load data
          </div>
          <p style={{ color: "#f5d2d9", margin: "0 0 1rem" }}>{error}</p>
          <button
            type="button"
            onClick={loadFarmers}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,92,122,.4)",
              color: "#ff5c7a",
              borderRadius: 8,
              padding: ".55rem 1rem",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* AC-4: Summary stats */}
          <SummaryBar farmers={farmers} />

          {/* Search + filter controls */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: "1.2rem",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1 1 220px",
                background: "#111611",
                border: "1px solid #1f2b22",
                borderRadius: 10,
                color: "var(--text)",
                padding: ".6rem 1rem",
                fontSize: ".9rem",
                outline: "none",
              }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                background: "#111611",
                border: "1px solid #1f2b22",
                borderRadius: 10,
                color: "var(--text)",
                padding: ".6rem 1rem",
                fontSize: ".9rem",
                cursor: "pointer",
              }}
            >
              {filterOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span style={{ color: "var(--muted)", fontSize: ".85rem", whiteSpace: "nowrap" }}>
              {filtered.length} of {farmers.length} farmers
            </span>
          </div>

          {/* Farmer list */}
          {filtered.length === 0 ? (
            <div
              style={{
                background: "#111611",
                border: "1px solid #1f2b22",
                borderRadius: 16,
                padding: "2rem",
              }}
            >
              <h3 style={{ marginTop: 0, color: "var(--text)" }}>No farmers found</h3>
              <p style={{ color: "var(--muted)", margin: 0 }}>
                {farmers.length === 0
                  ? "No verified farmers exist yet. Farmers appear here once their applications are approved."
                  : "No farmers match the current search or filter."}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {filtered.map((farmer) => (
                <FarmerRow
                  key={farmer.farmerId}
                  farmer={farmer}
                  token={token}
                  onSaved={handleSaved}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
