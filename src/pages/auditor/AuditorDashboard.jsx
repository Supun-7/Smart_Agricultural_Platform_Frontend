import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routePaths";
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
    PENDING:  { background: "rgba(245, 200, 66, 0.12)",  color: "#f5c842", border: "rgba(245, 200, 66, 0.24)" },
    APPROVED: { background: "rgba(89, 193, 115, 0.12)",  color: "#59c173", border: "rgba(89, 193, 115, 0.24)" },
    REJECTED: { background: "rgba(255, 92, 122, 0.12)",  color: "#ff5c7a", border: "rgba(255, 92, 122, 0.24)" },
  };
  return palette[status] || palette.PENDING;
}

function StatusBadge({ status }) {
  const style = badgeStyles(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: ".35rem .8rem", borderRadius: 999, fontSize: ".75rem",
      fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
      background: style.background, color: style.color, border: `1px solid ${style.border}`,
    }}>
      {formatStatus(status)}
    </span>
  );
}

function actionButton(kind = "default") {
  const themes = {
    default: { border: "#39513d",                    color: "var(--text)",  background: "transparent" },
    approve: { border: "rgba(89, 193, 115, 0.4)",   color: "#59c173",      background: "transparent" },
    reject:  { border: "rgba(255, 92, 122, 0.4)",   color: "#ff5c7a",      background: "transparent" },
    primary: { border: "rgba(162, 206, 58, 0.4)",   color: "#111",         background: "var(--brand)" },
  };
  return {
    border: `1px solid ${themes[kind].border}`, color: themes[kind].color,
    background: themes[kind].background, borderRadius: 10, padding: ".7rem 1rem",
    cursor: "pointer", fontWeight: 700, fontSize: ".9rem",
  };
}

function StatCard({ label, value, helper }) {
  return (
    <div style={{
      background: "#111611", border: "1px solid #1f2b22", borderRadius: 16,
      padding: "1.2rem 1.3rem", minWidth: 180, flex: "1 1 180px",
    }}>
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

// AC-3: Investor activity summary widget
function InvestorActivityCard({ activity }) {
  if (!activity) return null;
  const fmt = (v) =>
    Number(v ?? 0).toLocaleString("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });
  return (
    <div style={{
      background: "#0d1610", border: "1px solid rgba(89,193,115,.2)", borderRadius: 18,
      padding: "1.3rem 1.5rem", marginBottom: "1.5rem",
    }}>
      <div style={{ color: "var(--brand)", fontSize: ".75rem", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
        Investor Activity Summary
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>
            Total Investors
          </div>
          <div style={{ color: "var(--text)", fontSize: "1.6rem", fontWeight: 800, marginTop: 4 }}>
            {activity.totalInvestors ?? 0}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>
            Pending KYC Reviews
          </div>
          <div style={{ color: "#f5c842", fontSize: "1.6rem", fontWeight: 800, marginTop: 4 }}>
            {activity.pendingKycCount ?? 0}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>
            Total Invested (Platform)
          </div>
          <div style={{ color: "#59c173", fontSize: "1.6rem", fontWeight: 800, marginTop: 4 }}>
            {fmt(activity.totalInvestedPlatform)}
          </div>
        </div>
      </div>
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
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
      display: "grid", placeItems: "center", zIndex: 1000, padding: "1rem",
    }}>
      <div style={{
        width: "100%", maxWidth: 520, background: "#101510",
        border: "1px solid rgba(255, 92, 122, 0.32)", borderRadius: 18,
        padding: "1.4rem", boxShadow: "0 18px 48px rgba(0,0,0,.35)",
      }}>
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
            width: "100%", boxSizing: "border-box", resize: "vertical",
            background: "#0b0f0b", color: "var(--text)",
            border: reason.trim() === "" && reason.length > 0
              ? "1px solid rgba(255,92,122,.5)"
              : "1px solid #263228",
            borderRadius: 12, padding: ".9rem 1rem", outline: "none",
          }}
        />
        {/* AC-5: required field notice */}
        <p style={{ color: "var(--muted)", fontSize: ".82rem", margin: ".4rem 0 0" }}>
          A rejection reason is mandatory and will be shown to the farmer.
        </p>
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
  const [validFiles, setValidFiles] = useState([]);
  const [checking, setChecking] = useState(false);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    let isMounted = true;
    if (!Array.isArray(files) || files.length === 0) {
      if (isMounted) setValidFiles([]);
      return;
    }
    setChecking(true);
    async function checkFiles() {
      const checks = files.map(async (file, index) => {
        let fileUrl = file?.url || "";
        let fileName = file?.name || `Evidence file ${index + 1}`;
        if (typeof file === "string") { fileUrl = file; fileName = file.split("/").pop(); }
        if (fileUrl && !fileUrl.startsWith("http")) {
          if (!supabaseUrl) return null;
          let cleanPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
          if (!cleanPath.startsWith("milestones/")) cleanPath = `milestones/${cleanPath}`;
          fileUrl = `${supabaseUrl}/storage/v1/object/public/milestone-evidence/${cleanPath}`;
        }
        try {
          const res = await fetch(fileUrl, { method: "HEAD" });
          if (res.ok) return { url: fileUrl, name: fileName };
        } catch (_) { /* CORS/network — treat as missing */ }
        return null;
      });
      const checkedFiles = await Promise.all(checks);
      if (isMounted) { setValidFiles(checkedFiles.filter(Boolean)); setChecking(false); }
    }
    checkFiles();
    return () => { isMounted = false; };
  }, [files, supabaseUrl]);

  if (!Array.isArray(files) || files.length === 0)
    return <p style={{ color: "var(--muted)", margin: 0 }}>No evidence uploaded yet.</p>;
  if (checking)
    return <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.85rem" }}>Verifying evidence files...</p>;
  if (validFiles.length === 0)
    return <p style={{ color: "var(--muted)", margin: 0 }}>No valid evidence files found.</p>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {validFiles.map((file, index) => {
        const fileUrl = file.url;
        const fileName = file.name;
        const isImage = fileUrl.match(/\.(jpeg|jpg|png|gif)(?:\?.*)?$/i) || fileName.match(/\.(jpeg|jpg|png|gif)$/i);
        const isPdf = fileUrl.match(/\.pdf(?:\?.*)?$/i) || fileName.match(/\.pdf$/i);
        if (isImage) {
          return (
            <a key={`${fileUrl}-${index}`} href={fileUrl} target="_blank" rel="noreferrer"
              style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{ border: "1px solid #1f2b22", borderRadius: 8, overflow: "hidden", background: "#0e130e", padding: "4px" }}>
                <img src={fileUrl} alt={fileName} style={{ display: "block", width: "120px", height: "80px", objectFit: "cover", borderRadius: 4 }} title="Click to enlarge" />
                <div style={{ padding: "4px", fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</div>
              </div>
            </a>
          );
        }
        return (
          <a key={`${fileUrl}-${index}`} href={fileUrl} target="_blank" rel="noreferrer"
            style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center",
              textDecoration: "none", color: "var(--text)", background: "#0e130e",
              border: "1px solid #1f2b22", borderRadius: 12, padding: ".85rem 1rem", width: "100%" }}>
            <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              {isPdf ? "📄" : "📎"} {fileName}
            </span>
            <span style={{ color: "var(--brand)", fontSize: ".9rem" }}>Open ↗</span>
          </a>
        );
      })}
    </div>
  );
}

function MilestoneRow({ item, detail, detailLoading, actionLoading, onToggle, onApprove, onReject }) {
  // AC-8: already actioned milestones — buttons disabled, message shown
  const isActioned = item.status !== "PENDING";

  return (
    <article style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, overflow: "hidden" }}>
      <div style={{ padding: "1.15rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <h3 style={{ margin: 0, color: "var(--text)" }}>{item.projectName || "Untitled project"}</h3>
            <div style={{ color: "var(--muted)", fontSize: ".92rem" }}>Farmer: {item.farmerName || "—"}</div>
          </div>
          <StatusBadge status={item.status} />
        </div>

        {/* AC-2: farmer name, project, progress %, notes, date all shown */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: "1rem" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Progress</div>
            <div style={{ color: "var(--text)", fontWeight: 700, marginTop: 4 }}>{item.progressPercentage ?? 0}%</div>
          </div>
          {/* AC-2 + Story3/AC-2: submission date visible */}
          <div>
            <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase" }}>Submission date</div>
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
          {/* AC-8: disabled when already actioned */}
          <button
            type="button"
            disabled={isActioned || actionLoading}
            onClick={() => onApprove(item.id)}
            style={{ ...actionButton("approve"), opacity: isActioned ? 0.45 : 1, cursor: isActioned ? "not-allowed" : "pointer" }}
          >
            {actionLoading === `approve-${item.id}` ? "Approving..." : "Approve"}
          </button>
          <button
            type="button"
            disabled={isActioned || actionLoading}
            onClick={() => onReject(item.id)}
            style={{ ...actionButton("reject"), opacity: isActioned ? 0.45 : 1, cursor: isActioned ? "not-allowed" : "pointer" }}
          >
            Reject
          </button>
        </div>

        {/* AC-8: explicit message when already actioned */}
        {isActioned ? (
          <p style={{ marginBottom: 0, marginTop: ".8rem", color: "var(--muted)", fontSize: ".9rem" }}>
            This milestone has already been actioned and can no longer be approved or rejected.
          </p>
        ) : null}
      </div>

      {/* AC-3: evidence detail panel */}
      {detail || detailLoading === item.id ? (
        <div style={{ borderTop: "1px solid #1f2b22", padding: "1.15rem 1.25rem", background: "#0d110d" }}>
          {detailLoading === item.id ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>Loading milestone detail...</p>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
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
  const navigate = useNavigate();

  const [items, setItems]               = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [details, setDetails]           = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [detailLoading, setDetailLoading] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast]               = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const pendingCount = useMemo(
    () => items.filter((item) => item.status === "PENDING").length,
    [items]
  );

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      // AC-1 / AC-3 (Story3): load pending milestones + investor activity together
      const [milestonesRes, dashRes] = await Promise.all([
        auditorApi.getPendingMilestones(token),
        auditorApi.getDashboard(token),
      ]);
      setItems(Array.isArray(milestonesRes?.items) ? milestonesRes.items : []);
      setDashboardData(dashRes);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function toggleDetail(id) {
    if (details[id]) {
      setDetails((current) => { const next = { ...current }; delete next[id]; return next; });
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
      {/* Toast */}
      {toast ? (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 1100,
          background: toast.type === "error" ? "#8d1f35" : "#72ad28",
          color: "#fff", padding: ".85rem 1.1rem", borderRadius: 12,
          boxShadow: "0 12px 32px rgba(0,0,0,.24)", fontWeight: 700,
        }}>
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

      {/* AC-4 (Story3): loading state */}
      {loading ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "2rem", color: "var(--muted)" }}>
          Loading dashboard data...
        </div>
      ) : error ? (
        /* AC-4 (Story3): error state with retry */
        <div style={{ background: "rgba(255,92,122,.08)", border: "1px solid rgba(255,92,122,.28)", borderRadius: 18, padding: "1.2rem 1.3rem" }}>
          <div style={{ color: "#ff9caf", fontWeight: 700 }}>Could not load dashboard</div>
          <p style={{ color: "#f5d2d9", marginBottom: "1rem" }}>{error}</p>
          <button type="button" onClick={loadDashboard} style={actionButton("reject")}>Retry</button>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <StatCard label="Pending milestones" value={pendingCount} helper="Requires auditor review" />
            <StatCard label="Evidence review" value={items.length ? "Ready" : "Clear"} helper="Open a milestone to inspect files" />
            <StatCard label="KYC pending" value={dashboardData?.kycCount ?? 0} helper="Investor verifications" />
            <StatCard label="Farmer applications" value={dashboardData?.farmerCount ?? 0} helper="Awaiting review" />
            <div
              onClick={() => navigate(ROUTES.auditorProjects)}
              style={{ background: "#111611", border: "1px solid rgba(162,206,58,.3)", borderRadius: 16, padding: "1.2rem 1.3rem", minWidth: 180, flex: "1 1 180px", cursor: "pointer" }}
            >
              <div style={{ color: "var(--muted)", fontSize: ".8rem", textTransform: "uppercase", letterSpacing: ".06em" }}>Pending projects</div>
              <div style={{ color: "var(--brand)", fontSize: "2rem", fontWeight: 800, marginTop: 8 }}>{dashboardData?.projectCount ?? 0}</div>
              <div style={{ color: "var(--brand)", fontSize: ".82rem", marginTop: 6, fontWeight: 600 }}>Review projects →</div>
            </div>
          </div>

          {/* AC-3 (Story3): investor activity summary */}
          <InvestorActivityCard activity={dashboardData?.investorActivity} />

          {/* KYC Pending Queue */}
          {dashboardData?.pendingKyc?.length > 0 ? (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text)" }}>🪪 Pending KYC Reviews <span style={{ color: "#f5c842", fontSize: ".9rem" }}>({dashboardData.pendingKyc.length})</span></h2>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {dashboardData.pendingKyc.map((kyc) => (
                  <div
                    key={kyc.id}
                    onClick={() => navigate(ROUTES.auditorKycDetail.replace(":id", kyc.id))}
                    style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 14, padding: "1rem 1.3rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(96,165,250,.35)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1f2b22"; }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "1rem" }}>{kyc.fullName || kyc.email || "—"}</div>
                      <div style={{ color: "var(--muted)", fontSize: ".84rem", marginTop: 3 }}>{kyc.email} · {kyc.nationality || "—"} · {kyc.idType || "—"}: {kyc.idNumber || "—"}</div>
                      <div style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 2 }}>Submitted: {formatDate(kyc.submittedAt)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ padding: ".3rem .8rem", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", background: "rgba(245,200,66,.12)", color: "#f5c842", border: "1px solid rgba(245,200,66,.28)" }}>PENDING</span>
                      <span style={{ color: "#60a5fa", fontSize: ".85rem", fontWeight: 600 }}>Review →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Farmer Applications Queue */}
          {dashboardData?.pendingFarmers?.length > 0 ? (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text)" }}>🌾 Pending Farmer Applications <span style={{ color: "#f5c842", fontSize: ".9rem" }}>({dashboardData.pendingFarmers.length})</span></h2>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {dashboardData.pendingFarmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    onClick={() => navigate(ROUTES.auditorFarmerDetail.replace(":id", farmer.id))}
                    style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 14, padding: "1rem 1.3rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(251,146,60,.35)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1f2b22"; }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "1rem" }}>{farmer.farmerName} {farmer.surname}</div>
                      <div style={{ color: "var(--muted)", fontSize: ".84rem", marginTop: 3 }}>{farmer.email} · {farmer.farmLocation || "—"} · {farmer.landSizeAcres} acres · {farmer.cropTypes || "—"}</div>
                      <div style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 2 }}>Submitted: {formatDate(farmer.submittedAt)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ padding: ".3rem .8rem", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", background: "rgba(245,200,66,.12)", color: "#f5c842", border: "1px solid rgba(245,200,66,.28)" }}>PENDING</span>
                      <span style={{ color: "#fb923c", fontSize: ".85rem", fontWeight: 600 }}>Review →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Milestone list */}
          {items.length === 0 ? (
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
        </>
      )}
    </section>
  );
}
