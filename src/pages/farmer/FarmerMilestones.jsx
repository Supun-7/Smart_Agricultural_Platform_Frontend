import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { farmerApi } from "../../services/api.js";
import "../../styles/pages/farmerDashboard.css";

function StatusBadge({ status }) {
  const palette = {
    PENDING:  { bg: "rgba(245,200,66,.12)",  color: "#f5c842", border: "rgba(245,200,66,.24)"  },
    APPROVED: { bg: "rgba(89,193,115,.12)",  color: "#59c173", border: "rgba(89,193,115,.24)"  },
    REJECTED: { bg: "rgba(255,92,122,.12)",  color: "#ff5c7a", border: "rgba(255,92,122,.24)"  },
  };
  const s = palette[status] || palette.PENDING;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: ".3rem .75rem",
      borderRadius: 999, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".04em",
      textTransform: "uppercase", background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {status}
    </span>
  );
}

// AC-6: Show rejection reason to farmer when milestone is REJECTED
function RejectionReasonBox({ reason }) {
  if (!reason) return null;
  return (
    <div style={{
      marginTop: "1rem", padding: "1rem 1.1rem",
      background: "rgba(255,92,122,.07)", border: "1px solid rgba(255,92,122,.28)",
      borderRadius: 12,
    }}>
      <div style={{ color: "#ff9caf", fontSize: ".75rem", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
        Rejection Reason
      </div>
      <p style={{ margin: 0, color: "#f5d2d9", lineHeight: 1.55 }}>{reason}</p>
      <p style={{ margin: ".6rem 0 0", color: "var(--muted)", fontSize: ".82rem" }}>
        Please address the issue above and submit a new evidence upload for this milestone.
      </p>
    </div>
  );
}

export default function FarmerMilestones() {
  const { token } = useAuth();

  const [milestones, setMilestones]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [files, setFiles]                 = useState([]);
  const [uploading, setUploading]         = useState(false);
  const [submitError, setSubmitError]     = useState("");
  const [successMsg, setSuccessMsg]       = useState("");

  const loadMilestones = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const data = await farmerApi.getDashboard(token);
      const all = data.milestones || [];
      setMilestones(all);
      if (!selectedMilestone) {
        const firstPending = all.find((m) => m.status === "PENDING");
        if (firstPending) setSelectedMilestone(firstPending.id);
      }
    } catch (err) {
      setFetchError(err.message || "Failed to load milestones.");
    } finally {
      setLoading(false);
    }
  }, [token, selectedMilestone]);

  useEffect(() => { if (token) loadMilestones(); }, [token, loadMilestones]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const mapped = selected.map((file) => {
      let error = null;
      const isJpeg = file.type === "image/jpeg" || file.name.match(/\.(jpg|jpeg)$/i);
      const isPng  = file.type === "image/png"  || file.name.match(/\.png$/i);
      const isPdf  = file.type === "application/pdf" || file.name.match(/\.pdf$/i);
      if (!isJpeg && !isPng && !isPdf) error = "Only JPG, PNG, and PDF files are accepted.";
      else if (file.size > 5 * 1024 * 1024) error = "File size must not exceed 5MB per file.";
      return { file, error, id: Math.random().toString(36).substring(7) };
    });
    setFiles((prev) => [...prev, ...mapped]);
    setSubmitError("");
    setSuccessMsg("");
    e.target.value = "";
  };

  const removeFile = (idToRemove) => {
    setFiles(files.filter((f) => f.id !== idToRemove));
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSuccessMsg("");
    if (!selectedMilestone) { setSubmitError("Please select a milestone first."); return; }
    if (files.length === 0)  { setSubmitError("Please select at least one file to upload."); return; }
    if (files.some((f) => f.error)) { setSubmitError("Please remove invalid files before uploading."); return; }
    setUploading(true);
    try {
      const filesToUpload = files.filter((f) => !f.error).map((f) => f.file);
      await farmerApi.uploadMilestoneEvidence(token, selectedMilestone, filesToUpload);
      const count = filesToUpload.length;
      setSuccessMsg(`Evidence uploaded successfully. ${count} file(s) attached to milestone.`);
      setFiles([]);
    } catch (err) {
      setSubmitError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.includes("pdf") || file.name.endsWith(".pdf")) return "📄";
    if (file.type.includes("image") || file.name.match(/\.(jpg|jpeg|png)$/i)) return "🖼️";
    return "📎";
  };

  const selectedObj = milestones.find((m) => String(m.id) === String(selectedMilestone));
  const canUpload = selectedObj?.status === "PENDING";

  return (
    <section className="farmerDashboard">
      <div className="container farmerDashboardInner">
        <div className="farmerDashboardHeader card">
          <div className="farmerDashboardTitleBlock">
            <span className="farmerDashboardEyebrow">Milestones</span>
            <h1 className="farmerDashboardTitle">Upload Evidence</h1>
            <p className="farmerDashboardSub">
              Submit progress photos and documents for your pending milestones.
            </p>
          </div>
        </div>

        {/* Loading / error */}
        {loading && (
          <div style={{ padding: "1rem", color: "var(--muted)" }}>Loading milestones...</div>
        )}
        {fetchError && (
          <div style={{ padding: "1rem", background: "rgba(255,92,122,.12)", color: "#ff5c7a", borderRadius: 8, marginBottom: "1rem" }}>
            {fetchError}
            <button onClick={loadMilestones} style={{ marginLeft: 12, background: "none", border: "none", color: "#ff5c7a", cursor: "pointer", fontWeight: 700 }}>
              Retry
            </button>
          </div>
        )}

        {/* AC-6: milestone status list — shows rejection reasons */}
        {!loading && milestones.length > 0 && (
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginTop: 0, fontSize: "1rem", color: "var(--text)" }}>Your Milestones</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {milestones.map((m) => (
                <div key={m.id} style={{
                  padding: "1rem", background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.08)", borderRadius: 10,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>
                        {m.projectName || "Untitled"} — {m.milestoneDate}
                      </div>
                      <div style={{ fontSize: ".82rem", color: "var(--muted)", marginTop: 2 }}>
                        Progress: {m.progressPercentage ?? 0}%
                      </div>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  {/* AC-6: rejection reason visible to farmer */}
                  <RejectionReasonBox reason={m.rejectionReason} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload form — only for PENDING milestones */}
        <div className="card" style={{ maxWidth: 640 }}>
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Select Milestone</span>
              <select
                className="input"
                value={selectedMilestone}
                onChange={(e) => { setSelectedMilestone(e.target.value); setSubmitError(""); setSuccessMsg(""); }}
                disabled={loading || uploading}
                style={{ appearance: "auto" }}
              >
                <option value="" disabled>-- Select a milestone --</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.projectName || "Untitled"} — {m.milestoneDate} ({m.status})
                  </option>
                ))}
              </select>
            </label>

            {/* Warn if selected milestone is not PENDING */}
            {selectedObj && !canUpload && (
              <div style={{ padding: ".75rem 1rem", background: "rgba(245,200,66,.08)", border: "1px solid rgba(245,200,66,.24)", borderRadius: 8, fontSize: ".88rem", color: "#f5c842" }}>
                Evidence can only be uploaded to a <strong>PENDING</strong> milestone.
                This milestone is <strong>{selectedObj.status}</strong>.
              </div>
            )}

            <div className="field">
              <span>Evidence Files</span>
              <div style={{
                border: "2px dashed rgba(255,255,255,.15)", borderRadius: 12,
                padding: "2rem", textAlign: "center", background: "rgba(255,255,255,.02)",
                cursor: uploading || !canUpload ? "not-allowed" : "pointer",
                opacity: !canUpload ? 0.55 : 1,
              }}>
                <label style={{ display: "block", cursor: uploading || !canUpload ? "not-allowed" : "pointer" }}>
                  <span style={{ fontSize: "2rem", marginBottom: "0.5rem", display: "block" }}>📤</span>
                  <span style={{ color: "var(--brand)", fontWeight: 600 }}>Click to browse</span> or drag and drop
                  <span style={{ display: "block", fontSize: ".8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                    JPG, PNG, PDF formats, Max 5MB per file
                  </span>
                  <input
                    type="file" multiple accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange} style={{ display: "none" }}
                    disabled={uploading || !canUpload}
                  />
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <div style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Selected files ({files.length})</span>
                {files.map((f) => (
                  <div key={f.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.75rem", background: "rgba(255,255,255,.05)", borderRadius: 8,
                    border: f.error ? "1px solid rgba(255,92,122,.3)" : "1px solid transparent",
                  }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", minWidth: 0 }}>
                      <span style={{ fontSize: "1.2rem" }}>{getFileIcon(f.file)}</span>
                      <div style={{ minWidth: 0, overflow: "hidden" }}>
                        <div style={{ color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.file.name}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{formatFileSize(f.file.size)}</div>
                        {f.error && <div style={{ fontSize: "0.8rem", color: "#ff5c7a", marginTop: "0.2rem" }}>{f.error}</div>}
                      </div>
                    </div>
                    <button
                      type="button" onClick={() => removeFile(f.id)} disabled={uploading}
                      style={{ background: "none", border: "none", color: "var(--muted)", cursor: uploading ? "not-allowed" : "pointer", fontSize: "1.2rem", padding: "0.5rem" }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {submitError && (
              <div style={{ color: "#ff5c7a", fontSize: "0.9rem", padding: "0.5rem", background: "rgba(255,92,122,.1)", borderRadius: 6, marginTop: "1rem" }}>
                {submitError}
              </div>
            )}
            {successMsg && (
              <div style={{ color: "#59c173", fontSize: "0.9rem", padding: "0.5rem", background: "rgba(89,193,115,.1)", borderRadius: 6, marginTop: "1rem" }}>
                {successMsg}
              </div>
            )}

            <button
              type="submit" className="btn btnBlock"
              disabled={uploading || files.length === 0 || !canUpload}
              style={{ marginTop: "1rem" }}
            >
              {uploading ? "Uploading..." : "Upload Evidence"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
