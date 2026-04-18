import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { auditorApi } from "../../services/api";
import { ROUTES } from "../../routes/routePaths";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatCurrency(v) {
  return Number(v ?? 0).toLocaleString("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });
}

function StatusBadge({ status }) {
  const palette = {
    PENDING:  { bg: "rgba(245,200,66,.12)",  color: "#f5c842", border: "rgba(245,200,66,.28)" },
    VERIFIED: { bg: "rgba(89,193,115,.12)",  color: "#59c173", border: "rgba(89,193,115,.28)" },
    APPROVED: { bg: "rgba(89,193,115,.12)",  color: "#59c173", border: "rgba(89,193,115,.28)" },
    REJECTED: { bg: "rgba(255,92,122,.12)",  color: "#ff5c7a", border: "rgba(255,92,122,.28)" },
    NOT_SUBMITTED: { bg: "rgba(120,120,120,.12)", color: "#888", border: "rgba(120,120,120,.28)" },
  };
  const s = palette[status] || palette.PENDING;
  return (
    <span style={{ display: "inline-flex", padding: ".35rem .9rem", borderRadius: 999, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {String(status || "PENDING").replaceAll("_", " ")}
    </span>
  );
}

function FarmerVerificationBadge({ status }) {
  return (
    <span style={{
      display: "inline-flex", padding: ".3rem .8rem", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
      background: status === "VERIFIED" ? "rgba(89,193,115,.12)" : "rgba(245,200,66,.12)",
      color: status === "VERIFIED" ? "#59c173" : "#f5c842",
      border: `1px solid ${status === "VERIFIED" ? "rgba(89,193,115,.28)" : "rgba(245,200,66,.28)"}`,
    }}>
      Farmer: {String(status || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}

function DecisionModal({ open, loading, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");
  useEffect(() => { if (!open) setReason(""); }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "grid", placeItems: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 520, background: "#101510", border: "1px solid rgba(255,92,122,.32)", borderRadius: 18, padding: "1.6rem" }}>
        <h3 style={{ marginTop: 0, color: "var(--text)" }}>Reject project</h3>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>Provide a reason that the farmer will see. Required.</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={5}
          placeholder="Explain why this project is being rejected..."
          style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "#0b0f0b", color: "var(--text)", border: "1px solid #263228", borderRadius: 12, padding: ".9rem 1rem", outline: "none" }} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: "1rem" }}>
          <button type="button" onClick={onCancel} disabled={loading} style={{ border: "1px solid #39513d", color: "var(--text)", background: "transparent", borderRadius: 10, padding: ".7rem 1.1rem", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
          <button type="button" disabled={loading} onClick={() => { const c = reason.trim(); if (!c) { alert("Rejection reason is required."); return; } onConfirm(c); }}
            style={{ border: "1px solid rgba(255,92,122,.4)", color: "#ff5c7a", background: "transparent", borderRadius: 10, padding: ".7rem 1.1rem", cursor: "pointer", fontWeight: 700 }}>
            {loading ? "Rejecting..." : "Confirm reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div style={{ color: "var(--text)", fontWeight: 600, marginTop: 4 }}>{value != null ? String(value) : "—"}</div>
    </div>
  );
}

function ProjectImageGrid({ urlsString }) {
  if (!urlsString) return <span style={{ color: "#555" }}>No images uploaded</span>;
  const urls = urlsString.split(",").map((u) => u.trim()).filter(Boolean);
  if (urls.length === 0) return <span style={{ color: "#555" }}>No images uploaded</span>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
      {urls.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none", border: "1px solid #1f2b22", borderRadius: 12, overflow: "hidden" }}>
          <img src={url} alt={`Project image ${i + 1}`} style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
          <div style={{ padding: ".4rem .8rem", color: "var(--brand)", fontSize: ".8rem", fontWeight: 600 }}>Image {i + 1} ↗</div>
        </a>
      ))}
    </div>
  );
}

export default function ProjectDetailPage() {
  const { landId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const load = useCallback(async () => {
    if (!token || !landId) return;
    setLoading(true); setError("");
    try {
      const data = await auditorApi.getProjectDetail(token, landId);
      setProject(data);
    } catch (err) {
      setError(err.message || "Failed to load project details.");
    } finally { setLoading(false); }
  }, [token, landId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleApprove() {
    setActionLoading("approve");
    try {
      await auditorApi.approveProject(token, landId);
      setToast({ type: "success", message: "Project approved successfully." });
      setTimeout(() => navigate(ROUTES.auditorProjects), 1500);
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to approve project." });
    } finally { setActionLoading(""); }
  }

  async function handleReject(reason) {
    setActionLoading("reject");
    try {
      await auditorApi.rejectProject(token, landId, reason);
      setShowRejectModal(false);
      setToast({ type: "success", message: "Project rejected." });
      setTimeout(() => navigate(ROUTES.auditorProjects), 1500);
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to reject project." });
    } finally { setActionLoading(""); }
  }

  const isPending = project?.reviewStatus === "PENDING";

  return (
    <section style={{ minHeight: "100vh", color: "var(--text)", padding: "2rem" }}>
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 1100, background: toast.type === "error" ? "#8d1f35" : "#72ad28", color: "#fff", padding: ".85rem 1.1rem", borderRadius: 12, fontWeight: 700 }}>
          {toast.message}
        </div>
      )}

      <DecisionModal open={showRejectModal} loading={actionLoading === "reject"} onCancel={() => setShowRejectModal(false)} onConfirm={handleReject} />

      <header style={{ marginBottom: "1.6rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <button type="button" onClick={() => navigate(ROUTES.auditorProjects)} style={{ background: "transparent", border: "1px solid #1f2b22", color: "var(--muted)", borderRadius: 8, padding: ".45rem .9rem", cursor: "pointer", fontSize: ".85rem", marginBottom: ".7rem" }}>← Back to projects</button>
          <span style={{ display: "block", color: "var(--brand)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", fontSize: ".8rem" }}>Project Review</span>
          <h1 style={{ margin: ".3rem 0 0", fontSize: "1.9rem" }}>
            {project?.projectName || "Loading..."}
          </h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {project && <StatusBadge status={project.reviewStatus} />}
          {project?.farmerVerificationStatus && <FarmerVerificationBadge status={project.farmerVerificationStatus} />}
        </div>
      </header>

      {loading ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "2rem", color: "var(--muted)" }}>Loading project details...</div>
      ) : error ? (
        <div style={{ background: "rgba(255,92,122,.08)", border: "1px solid rgba(255,92,122,.28)", borderRadius: 18, padding: "1.3rem" }}>
          <div style={{ color: "#ff9caf", fontWeight: 700 }}>Failed to load</div>
          <p style={{ color: "#f5d2d9", margin: ".5rem 0 1rem" }}>{error}</p>
          <button type="button" onClick={load} style={{ border: "1px solid rgba(255,92,122,.4)", color: "#ff5c7a", background: "transparent", borderRadius: 10, padding: ".6rem 1rem", cursor: "pointer", fontWeight: 700 }}>Retry</button>
        </div>
      ) : project ? (
        <div style={{ display: "grid", gap: 20 }}>

          {/* Project Details */}
          <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.4rem" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "var(--brand)" }}>Project Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <InfoRow label="Location" value={project.location} />
              <InfoRow label="Crop Type" value={project.cropType} />
              <InfoRow label="Size (Acres)" value={project.sizeAcres} />
              <InfoRow label="Total Value" value={`LKR ${Number(project.totalValue ?? 0).toLocaleString()}`} />
              <InfoRow label="Min. Investment" value={`LKR ${Number(project.minimumInvestment ?? 0).toLocaleString()}`} />
              <InfoRow label="Progress" value={`${project.progressPercentage ?? 0}%`} />
              <InfoRow label="Active" value={project.isActive ? "Yes" : "No"} />
              <InfoRow label="Submitted" value={formatDate(project.createdAt)} />
            </div>
            {project.description && (
              <div style={{ marginTop: 16 }}>
                <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase", marginBottom: 6 }}>Description</div>
                <p style={{ color: "var(--text)", lineHeight: 1.65, margin: 0 }}>{project.description}</p>
              </div>
            )}
            {project.rejectionReason && (
              <div style={{ marginTop: 16, background: "rgba(255,92,122,.08)", border: "1px solid rgba(255,92,122,.2)", borderRadius: 10, padding: "1rem" }}>
                <div style={{ color: "#ff5c7a", fontSize: ".78rem", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Rejection Reason</div>
                <div style={{ color: "#f5d2d9" }}>{project.rejectionReason}</div>
              </div>
            )}
          </div>

          {/* Farmer Info */}
          <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.4rem" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "var(--brand)" }}>Farmer Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <InfoRow label="Farmer Name" value={project.farmerFullName} />
              <InfoRow label="Farmer Email" value={project.farmerEmail} />
              <InfoRow label="Farmer User ID" value={project.farmerUserId} />
              <div>
                <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase", marginBottom: 6 }}>Verification Status</div>
                <FarmerVerificationBadge status={project.farmerVerificationStatus} />
              </div>
            </div>
          </div>

          {/* Project Images */}
          <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.4rem" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "var(--brand)" }}>Project Images</h2>
            <ProjectImageGrid urlsString={project.imageUrls} />
          </div>

          {/* Actions */}
          {isPending ? (
            <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.4rem", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button type="button" disabled={!!actionLoading} onClick={handleApprove}
                style={{ border: "1px solid rgba(89,193,115,.4)", color: "#59c173", background: "transparent", borderRadius: 10, padding: ".75rem 1.4rem", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
                {actionLoading === "approve" ? "Approving..." : "✓ Approve Project"}
              </button>
              <button type="button" disabled={!!actionLoading} onClick={() => setShowRejectModal(true)}
                style={{ border: "1px solid rgba(255,92,122,.4)", color: "#ff5c7a", background: "transparent", borderRadius: 10, padding: ".75rem 1.4rem", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
                ✕ Reject Project
              </button>
            </div>
          ) : (
            <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.2rem", color: "var(--muted)" }}>
              This project has already been actioned and cannot be reviewed again.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
