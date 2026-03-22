import { useState } from "react";

/**
 * Reusable file upload field
 *
 * Props:
 *   label       — field label text
 *   labelSi     — sinhala label (optional)
 *   accept      — file types e.g. "image/*,.pdf"
 *   onUploaded  — callback(url) called when upload succeeds
 *   uploadFn    — async function(file) → returns URL
 *   required    — boolean
 */
export function FileUploadField({
  label,
  labelSi,
  accept = "image/*,.pdf",
  onUploaded,
  uploadFn,
  required = false,
}) {
  const [status,   setStatus]   = useState("idle");
  // idle | uploading | done | error
  const [url,      setUrl]      = useState("");
  const [error,    setError]    = useState("");
  const [fileName, setFileName] = useState("");

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus("uploading");
    setError("");

    try {
      const uploadedUrl = await uploadFn(file);
      setUrl(uploadedUrl);
      setStatus("done");
      onUploaded(uploadedUrl);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <div className="gateField">
      <label className="gateLabel">
        {label}
        {labelSi && (
          <span style={{
            marginLeft: ".5rem",
            fontWeight: 400,
            color: "var(--lt-muted)",
            fontSize: ".82rem",
          }}>
            {labelSi}
          </span>
        )}
        {required && (
          <span style={{ color: "var(--lt-danger)", marginLeft: ".2rem" }}>*</span>
        )}
      </label>

      {/* Upload box */}
      <label style={styles.uploadBox(status)}>
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={status === "uploading"}
        />

        {status === "idle" && (
          <div style={styles.uploadInner}>
            <span style={styles.uploadIcon}>📎</span>
            <span style={styles.uploadText}>
              Click to upload or drag & drop
            </span>
            <span style={styles.uploadHint}>
              {accept.includes("pdf") ? "PDF or image file" : "Image file"}
            </span>
          </div>
        )}

        {status === "uploading" && (
          <div style={styles.uploadInner}>
            <div style={styles.spinner} />
            <span style={styles.uploadText}>Uploading {fileName}…</span>
          </div>
        )}

        {status === "done" && (
          <div style={styles.uploadInner}>
            <span style={{ fontSize: "1.4rem" }}>✅</span>
            <span style={{ ...styles.uploadText, color: "var(--lt-brand)" }}>
              {fileName}
            </span>
            <span style={styles.uploadHint}>
              Uploaded successfully — click to replace
            </span>
          </div>
        )}

        {status === "error" && (
          <div style={styles.uploadInner}>
            <span style={{ fontSize: "1.4rem" }}>❌</span>
            <span style={{ ...styles.uploadText, color: "var(--lt-danger)" }}>
              Upload failed — click to retry
            </span>
          </div>
        )}
      </label>

      {error && (
        <span style={{ fontSize: ".8rem", color: "var(--lt-danger)" }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ── Multi-file upload variant ────────────────────────────────
export function MultiFileUploadField({
  label,
  labelSi,
  accept = "image/*",
  onUploaded,
  uploadFn,
  maxFiles = 5,
}) {
  const [files,    setFiles]    = useState([]);
  // files = [{ name, status, url, error }]
  const [uploading, setUploading] = useState(false);

  async function handleChange(e) {
    const selected = Array.from(e.target.files).slice(0, maxFiles);
    if (!selected.length) return;

    setUploading(true);
    const results = [];

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      try {
        const url = await uploadFn(file, i);
        results.push({ name: file.name, status: "done", url });
      } catch (err) {
        results.push({ name: file.name, status: "error", url: "", error: err.message });
      }
    }

    setFiles(results);
    setUploading(false);

    // Return comma-separated URLs of successful uploads
    const urls = results
      .filter(r => r.status === "done")
      .map(r => r.url)
      .join(",");

    onUploaded(urls);
  }

  return (
    <div className="gateField">
      <label className="gateLabel">
        {label}
        {labelSi && (
          <span style={{
            marginLeft: ".5rem",
            fontWeight: 400,
            color: "var(--lt-muted)",
            fontSize: ".82rem",
          }}>
            {labelSi}
          </span>
        )}
      </label>

      <label style={styles.uploadBox(uploading ? "uploading" : files.length ? "done" : "idle")}>
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={uploading}
        />
        {!uploading && !files.length && (
          <div style={styles.uploadInner}>
            <span style={styles.uploadIcon}>🖼️</span>
            <span style={styles.uploadText}>
              Click to upload up to {maxFiles} photos
            </span>
            <span style={styles.uploadHint}>Image files only</span>
          </div>
        )}
        {uploading && (
          <div style={styles.uploadInner}>
            <div style={styles.spinner} />
            <span style={styles.uploadText}>Uploading photos…</span>
          </div>
        )}
        {!uploading && files.length > 0 && (
          <div style={styles.uploadInner}>
            <span style={{ fontSize: "1.4rem" }}>✅</span>
            <span style={{ ...styles.uploadText, color: "var(--lt-brand)" }}>
              {files.filter(f => f.status === "done").length} photo(s) uploaded
            </span>
            <span style={styles.uploadHint}>Click to upload more</span>
          </div>
        )}
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: ".3rem", marginTop: ".4rem" }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              fontSize: ".82rem",
              color: f.status === "done" ? "var(--lt-brand)" : "var(--lt-danger)",
            }}>
              <span>{f.status === "done" ? "✓" : "✗"}</span>
              <span>{f.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────
const styles = {
  uploadBox: (status) => ({
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    border:         `2px dashed ${
      status === "done"      ? "rgba(45,122,79,.4)"  :
      status === "error"     ? "rgba(192,57,43,.4)"  :
      status === "uploading" ? "rgba(45,122,79,.3)"  :
      "#d0d7de"
    }`,
    borderRadius:   "10px",
    padding:        "1.5rem 1rem",
    cursor:         status === "uploading" ? "not-allowed" : "pointer",
    background:     status === "done"  ? "rgba(45,122,79,.04)"  :
                    status === "error" ? "rgba(192,57,43,.04)"  :
                    "#fafbfc",
    transition:     "border-color .15s ease, background .15s ease",
    minHeight:      "90px",
  }),
  uploadInner: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    gap:            ".4rem",
    pointerEvents:  "none",
  },
  uploadIcon: {
    fontSize: "1.6rem",
  },
  uploadText: {
    fontSize:   ".88rem",
    fontWeight: 600,
    color:      "var(--lt-text)",
  },
  uploadHint: {
    fontSize: ".78rem",
    color:    "var(--lt-muted)",
  },
  spinner: {
    width:        "24px",
    height:       "24px",
    border:       "3px solid #e2e6ea",
    borderTop:    "3px solid var(--lt-brand)",
    borderRadius: "50%",
    animation:    "spin .8s linear infinite",
  },
};