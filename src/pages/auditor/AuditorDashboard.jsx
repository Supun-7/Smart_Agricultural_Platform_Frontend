import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { auditorApi } from "../../services/api";

function formatStatus(status) {
  return String(status || "PENDING").replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function badgeStyles(status) {
  const palette = {
    PENDING: { background: "rgba(245, 200, 66, 0.12)", color: "#f5c842", border: "rgba(245, 200, 66, 0.24)" },
    APPROVED: { background: "rgba(89, 193, 115, 0.12)", color: "#59c173", border: "rgba(89, 193, 115, 0.24)" },
    REJECTED: { background: "rgba(255, 92, 122, 0.12)", color: "#ff5c7a", border: "rgba(255, 92, 122, 0.24)" },
  };
  return palette[status] || palette.PENDING;
}

function StatusBadge({ status }) {
  const style = badgeStyles(status);
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
      {formatStatus(status)}
    </span>
  );
}

function actionButton(kind = "default") {
  const themes = {
    default: { border: "#39513d", color: "var(--text)", background: "transparent" },
    approve: { border: "rgba(89, 193, 115, 0.4)", color: "#59c173", background: "transparent" },
    reject: { border: "rgba(255, 92, 122, 0.4)", color: "#ff5c7a", background: "transparent" },
    primary: { border: "rgba(162, 206, 58, 0.4)", color: "#111", background: "var(--brand)" },
  };

  return {
    border: `1px solid ${themes[kind].border}`,
    color: themes[kind].color,
    background: themes[kind].background,
    borderRadius: 10,
    padding: ".7rem 1rem",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: ".9rem",
  };
}

function StatCard({ label, value, helper }) {
  return (
    <div
      style={{
        background: "#111611",
        border: "1px solid #1f2b22",
        borderRadius: 16,
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
      {helper ? <div style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 6 }}>{helper}</div> : null}
    </div>
  );
}

function RejectModal({ open, loading, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.7)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#101510",
          border: "1px solid rgba(255, 92, 122, 0.32)",
          borderRadius: 18,
          padding: "1.4rem",
          boxShadow: "0 18px 48px rgba(0,0,0,.35)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: ".5rem", color: "var(--text)" }}>Reject milestone</h3>
        <p style={{ marginTop: 0, color: "var(--muted)", lineHeight: 1.5 }}>
          Add the rejection note that the farmer will see. This field is required.
        </p>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={5}
          placeholder="Explain why this milestone update is being rejected..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            resize: "vertical",
            background: "#0b0f0b",
            color: "var(--text)",
            border: "1px solid #263228",
            borderRadius: 12,
            padding: ".9rem 1rem",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: "1rem" }}>
          <button type="button" onClick={onCancel} disabled={loading} style={actionButton()}>
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const cleaned = reason.trim();
              if (!cleaned) {
                window.alert("Rejection reason is required.");
                return;
              }
              onConfirm(cleaned);
            }}
            style={actionButton("reject")}
          >
            {loading ? "Rejecting..." : "Confirm reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EvidenceList({ files }) {
  if (!Array.isArray(files) || files.length === 0) {
    return <p style={{ color: "var(--muted)", margin: 0 }}>No evidence files uploaded.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {files.map((file, index) => (
        <a
          key={`${file.url}-${index}`}
          href={file.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            textDecoration: "none",
            color: "var(--text)",
            background: "#0e130e",
            border: "1px solid #1f2b22",
            borderRadius: 12,
            padding: ".85rem 1rem",
          }}
        >
          <span style={{ fontWeight: 600 }}>{file.name || `Evidence file ${index + 1}`}</span>
          <span style={{ color: "var(--brand)", fontSize: ".9rem" }}>Open ↗</span>
        </a>
      ))}
    </div>
  );
}

function MilestoneRow({ item, detail, detailLoading, actionLoading, onToggle, onApprove, onReject }) {
  const isActioned = item.status !== "PENDING";

  return (
    <article
      style={{
        background: "#111611",
        border: "1px solid #1f2b22",
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "1.15rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <h3 style={{ margin: 0, color: "var(--text)" }}>{item.projectName || "Untitled project"}</h3>
            <div style={{ color: "var(--muted)", fontSize: ".92rem" }}>Farmer: {item.farmerName || "—"}</div>
          </div>
          <StatusBadge status={item.status} />
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
            <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Progress</div>
            <div style={{ color: "var(--text)", fontWeight: 700, marginTop: 4 }}>{item.progressPercentage ?? 0}%</div>
          </div>
          <div>
            <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Date</div>
            <div style={{ color: "var(--text)", fontWeight: 700, marginTop: 4 }}>{formatDate(item.milestoneDate)}</div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Notes</div>
            <div style={{ color: "var(--text)", marginTop: 4, lineHeight: 1.55 }}>{item.notes || "No notes provided."}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "1rem" }}>
          <button type="button" onClick={() => onToggle(item.id)} style={actionButton()}>
            {detail ? "Hide details" : "View details"}
          </button>
          <button
            type="button"
            disabled={isActioned || actionLoading}
            onClick={() => onApprove(item.id)}
            style={{ ...actionButton("approve"), opacity: isActioned ? 0.55 : 1 }}
          >
            {actionLoading === `approve-${item.id}` ? "Approving..." : "Approve"}
          </button>
          <button
            type="button"
            disabled={isActioned || actionLoading}
            onClick={() => onReject(item.id)}
            style={{ ...actionButton("reject"), opacity: isActioned ? 0.55 : 1 }}
          >
            Reject
          </button>
        </div>

        {isActioned ? (
          <p style={{ marginBottom: 0, marginTop: ".8rem", color: "var(--muted)", fontSize: ".9rem" }}>
            This milestone has already been actioned and can no longer be approved or rejected.
          </p>
        ) : null}
      </div>

      {detail || detailLoading === item.id ? (
        <div style={{ borderTop: "1px solid #1f2b22", padding: "1.15rem 1.25rem", background: "#0d110d" }}>
          {detailLoading === item.id ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>Loading milestone detail...</p>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Reviewed by</div>
                  <div style={{ marginTop: 4 }}>{detail?.reviewedBy || "—"}</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Reviewed at</div>
                  <div style={{ marginTop: 4 }}>{formatDate(detail?.reviewedAt)}</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Farmer email</div>
                  <div style={{ marginTop: 4 }}>{detail?.farmerEmail || "—"}</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Created at</div>
                  <div style={{ marginTop: 4 }}>{formatDate(detail?.createdAt)}</div>
                </div>
              </div>

              {detail?.rejectionReason ? (
                <div>
                  <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Rejection reason</div>
                  <div style={{ color: "#ffb3bf", marginTop: 4 }}>{detail.rejectionReason}</div>
                </div>
              ) : null}

              <div>
                <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase", marginBottom: 8 }}>
                  Evidence files
                </div>
                <EvidenceList files={detail?.evidenceFiles} />
              </div>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

export default function AuditorDashboard() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailLoading, setDetailLoading] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const pendingCount = useMemo(
    () => items.filter((item) => item.status === "PENDING").length,
    [items]
  );

  const loadMilestones = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await auditorApi.getPendingMilestones(token);
      setItems(Array.isArray(response?.items) ? response.items : []);
    } catch (err) {
      setError(err.message || "Failed to load pending milestones.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function toggleDetail(id) {
    if (details[id]) {
      setDetails((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }

    setDetailLoading(id);
    try {
      const detail = await auditorApi.getMilestoneDetail(token, id);
      setDetails((current) => ({ ...current, [id]: detail }));
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to load milestone detail." });
    } finally {
      setDetailLoading(null);
    }
  }

  async function handleApprove(id) {
    setActionLoading(`approve-${id}`);
    try {
      const response = await auditorApi.approveMilestone(token, id);
      setDetails((current) => ({ ...current, [id]: response?.milestone ?? current[id] }));
      setItems((current) => current.filter((item) => item.id !== id));
      setToast({ type: "success", message: "Milestone approved successfully." });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Unable to approve milestone." });
    } finally {
      setActionLoading("");
    }
  }

  async function handleReject(reason) {
    if (!rejectTarget) return;
    setActionLoading(`reject-${rejectTarget}`);
    try {
      const response = await auditorApi.rejectMilestone(token, rejectTarget, reason);
      setDetails((current) => ({ ...current, [rejectTarget]: response?.milestone ?? current[rejectTarget] }));
      setItems((current) => current.filter((item) => item.id !== rejectTarget));
      setRejectTarget(null);
      setToast({ type: "success", message: "Milestone rejected successfully." });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Unable to reject milestone." });
    } finally {
      setActionLoading("");
    }
  }

  return (
    <section style={{ minHeight: "100vh", color: "var(--text)", padding: "2rem" }}>
      {toast ? (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 1100,
            background: toast.type === "error" ? "#8d1f35" : "#72ad28",
            color: "#fff",
            padding: ".85rem 1.1rem",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,.24)",
            fontWeight: 700,
          }}
        >
          {toast.message}
        </div>
      ) : null}

      <RejectModal
        open={Boolean(rejectTarget)}
        loading={actionLoading === `reject-${rejectTarget}`}
        onCancel={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />

      <header style={{ marginBottom: "1.6rem" }}>
        <span style={{ color: "var(--brand)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", fontSize: ".8rem" }}>
          Auditor Dashboard
        </span>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "2rem" }}>Pending farmer milestones</h1>
        <p style={{ color: "var(--muted)", maxWidth: 760, lineHeight: 1.6 }}>
          Review submitted milestone updates, open evidence, and approve or reject only pending items.
        </p>
      </header>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <StatCard label="Pending milestones" value={pendingCount} helper="Visible on the auditor dashboard" />
        <StatCard label="Evidence review" value={items.length ? "Ready" : "Clear"} helper="Open a milestone to inspect uploaded files" />
      </div>

      {loading ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "2rem", color: "var(--muted)" }}>
          Loading pending milestones...
        </div>
      ) : error ? (
        <div style={{ background: "rgba(255,92,122,.08)", border: "1px solid rgba(255,92,122,.28)", borderRadius: 18, padding: "1.2rem 1.3rem" }}>
          <div style={{ color: "#ff9caf", fontWeight: 700 }}>Could not load milestones</div>
          <p style={{ color: "#f5d2d9", marginBottom: "1rem" }}>{error}</p>
          <button type="button" onClick={loadMilestones} style={actionButton("reject")}>Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "2rem" }}>
          <h3 style={{ marginTop: 0 }}>No pending milestones</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            All milestone updates have already been actioned.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {items.map((item) => (
            <MilestoneRow
              key={item.id}
              item={item}
              detail={details[item.id]}
              detailLoading={detailLoading}
              actionLoading={actionLoading}
              onToggle={toggleDetail}
              onApprove={handleApprove}
              onReject={setRejectTarget}
            />
          ))}
        </div>
      )}
    </section>
  );
}
