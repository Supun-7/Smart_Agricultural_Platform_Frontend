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
    <span style={{ display: "inline-flex", alignItems: "center", padding: ".35rem .9rem", borderRadius: 999, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {String(status || "PENDING").replaceAll("_", " ")}
    </span>
  );
}

function DocumentViewer({ label, url }) {
  if (!url) return (
    <div style={{ background: "#0e130e", border: "1px solid #1f2b22", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
      <div style={{ color: "var(--muted)", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <span style={{ color: "#555" }}>Not uploaded</span>
    </div>
  );
  const isImage = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
  return (
    <div style={{ background: "#0e130e", border: "1px solid #1f2b22", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".06em", padding: ".7rem 1rem .4rem" }}>{label}</div>
      {isImage ? (
        <a href={url} target="_blank" rel="noreferrer" style={{ display: "block" }}>
          <img src={url} alt={label} style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
          <div style={{ padding: ".5rem 1rem", color: "var(--brand)", fontSize: ".82rem", fontWeight: 600 }}>Open full size ↗</div>
        </a>
      ) : (
        <a href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", color: "var(--text)", textDecoration: "none" }}>
          <span>📄 {label}</span><span style={{ color: "var(--brand)" }}>Open ↗</span>
        </a>
      )}
    </div>
  );
}

function DecisionModal({ open, loading, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");
  useEffect(() => { if (!open) setReason(""); }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "grid", placeItems: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 520, background: "#101510", border: "1px solid rgba(255,92,122,.32)", borderRadius: 18, padding: "1.6rem" }}>
        <h3 style={{ marginTop: 0, color: "var(--text)" }}>Reject farmer application</h3>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>Provide a reason that the farmer will see. Required.</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={5}
          placeholder="Explain why this application is being rejected..."
          style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "#0b0f0b", color: "var(--text)", border: "1px solid #263228", borderRadius: 12, padding: ".9rem 1rem", outline: "none" }} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: "1rem" }}>
          <button type="button" onClick={onCancel} disabled={loading} style={{ border: "1px solid #39513d", color: "var(--text)", background: "transparent", borderRadius: 10, padding: ".7rem 1.1rem", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
          <button type="button" disabled={loading} onClick={() => { const c = reason.trim(); if (!c) { alert("Rejection reason is required."); return; } onConfirm(c); }} style={{ border: "1px solid rgba(255,92,122,.4)", color: "#ff5c7a", background: "transparent", borderRadius: 10, padding: ".7rem 1.1rem", cursor: "pointer", fontWeight: 700 }}>
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

function LandPhotoGrid({ urlsString }) {
  if (!urlsString) return <span style={{ color: "#555" }}>No photos uploaded</span>;
  const urls = urlsString.split(",").map((u) => u.trim()).filter(Boolean);
  if (urls.length === 0) return <span style={{ color: "#555" }}>No photos uploaded</span>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
      {urls.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none", border: "1px solid #1f2b22", borderRadius: 10, overflow: "hidden" }}>
          <img src={url} alt={`Land photo ${i + 1}`} style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
          <div style={{ padding: ".4rem .6rem", color: "var(--brand)", fontSize: ".78rem", fontWeight: 600 }}>Photo {i + 1} ↗</div>
        </a>
      ))}
    </div>
  );
}

export default function FarmerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true); setError("");
    try {
      const data = await auditorApi.getFarmerDetail(token, id);
      setFarmer(data);
    } catch (err) {
      setError(err.message || "Failed to load farmer application.");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleApprove() {
    setActionLoading("approve");
    try {
      await auditorApi.approveFarmer(token, id);
      setToast({ type: "success", message: "Farmer application approved." });
      setTimeout(() => navigate(ROUTES.auditorDashboard), 1500);
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to approve." });
    } finally { setActionLoading(""); }
  }

  async function handleReject(reason) {
    setActionLoading("reject");
    try {
      await auditorApi.rejectFarmer(token, id, reason);
      setShowRejectModal(false);
      setToast({ type: "success", message: "Farmer application rejected." });
      setTimeout(() => navigate(ROUTES.auditorDashboard), 1500);
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to reject." });
    } finally { setActionLoading(""); }
  }

  const isPending = farmer?.status === "PENDING";

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
          <button type="button" onClick={() => navigate(ROUTES.auditorDashboard)} style={{ background: "transparent", border: "1px solid #1f2b22", color: "var(--muted)", borderRadius: 8, padding: ".45rem .9rem", cursor: "pointer", fontSize: ".85rem", marginBottom: ".7rem" }}>← Back to dashboard</button>
          <span style={{ display: "block", color: "var(--brand)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", fontSize: ".8rem" }}>Farmer Application Review</span>
          <h1 style={{ margin: ".3rem 0 0", fontSize: "1.9rem" }}>
            {farmer ? `${farmer.farmerName || ""} ${farmer.surname || ""}`.trim() || "Farmer Application" : "Loading..."}
          </h1>
        </div>
        {farmer && <StatusBadge status={farmer.status} />}
      </header>

      {loading ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "2rem", color: "var(--muted)" }}>Loading application details...</div>
      ) : error ? (
        <div style={{ background: "rgba(255,92,122,.08)", border: "1px solid rgba(255,92,122,.28)", borderRadius: 18, padding: "1.3rem" }}>
          <div style={{ color: "#ff9caf", fontWeight: 700 }}>Failed to load</div>
          <p style={{ color: "#f5d2d9", margin: ".5rem 0 1rem" }}>{error}</p>
          <button type="button" onClick={load} style={{ border: "1px solid rgba(255,92,122,.4)", color: "#ff5c7a", background: "transparent", borderRadius: 10, padding: ".6rem 1rem", cursor: "pointer", fontWeight: 700 }}>Retry</button>
        </div>
      ) : farmer ? (
        <div style={{ display: "grid", gap: 20 }}>

          {/* Personal + Farm details */}
          <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.4rem" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "var(--brand)" }}>Farmer Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <InfoRow label="Email" value={farmer.email} />
              <InfoRow label="Farmer Name" value={farmer.farmerName} />
              <InfoRow label="Surname" value={farmer.surname} />
              <InfoRow label="Family Name" value={farmer.familyName} />
              <InfoRow label="NIC Number" value={farmer.nicNumber} />
              <InfoRow label="Year Started" value={farmer.yearStarted} />
              <InfoRow label="Farm Location" value={farmer.farmLocation} />
              <InfoRow label="Land Size (Acres)" value={farmer.landSizeAcres} />
              <InfoRow label="Crop Types" value={farmer.cropTypes} />
              <InfoRow label="Land Measurements" value={farmer.landMeasurements} />
              <InfoRow label="Submitted" value={formatDate(farmer.submittedAt)} />
              {farmer.reviewedAt && <InfoRow label="Reviewed" value={formatDate(farmer.reviewedAt)} />}
            </div>
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <InfoRow label="Home Address" value={farmer.address} />
              <InfoRow label="Farm Address" value={farmer.farmAddress} />
            </div>
            {farmer.rejectionReason && (
              <div style={{ marginTop: 14, background: "rgba(255,92,122,.08)", border: "1px solid rgba(255,92,122,.2)", borderRadius: 10, padding: "1rem" }}>
                <div style={{ color: "#ff5c7a", fontSize: ".78rem", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Rejection Reason</div>
                <div style={{ color: "#f5d2d9" }}>{farmer.rejectionReason}</div>
              </div>
            )}
          </div>

          {/* NIC Documents */}
          <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.4rem" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "var(--brand)" }}>NIC Documents</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
              <DocumentViewer label="NIC Front" url={farmer.nicFrontUrl} />
              <DocumentViewer label="NIC Back" url={farmer.nicBackUrl} />
            </div>
          </div>

          {/* Land Photos */}
          <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.4rem" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "var(--brand)" }}>Land Photos</h2>
            <LandPhotoGrid urlsString={farmer.landPhotoUrls} />
          </div>

          {/* Actions */}
          {isPending ? (
            <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.4rem", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="button" disabled={!!actionLoading} onClick={handleApprove}
                style={{ border: "1px solid rgba(89,193,115,.4)", color: "#59c173", background: "transparent", borderRadius: 10, padding: ".75rem 1.4rem", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
                {actionLoading === "approve" ? "Approving..." : "✓ Approve Application"}
              </button>
              <button type="button" disabled={!!actionLoading} onClick={() => setShowRejectModal(true)}
                style={{ border: "1px solid rgba(255,92,122,.4)", color: "#ff5c7a", background: "transparent", borderRadius: 10, padding: ".75rem 1.4rem", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
                ✕ Reject Application
              </button>
            </div>
          ) : (
            <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.2rem", color: "var(--muted)" }}>
              This application has already been actioned and cannot be reviewed again.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
