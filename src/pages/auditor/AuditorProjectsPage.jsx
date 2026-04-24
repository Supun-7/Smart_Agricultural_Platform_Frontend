import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { auditorApi } from "../../services/api";
import { ROUTES } from "../../routes/routePaths";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatCurrency(v) {
  return Number(v ?? 0).toLocaleString("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });
}

function StatusBadge({ status }) {
  const palette = {
    PENDING:  { bg: "rgba(245,200,66,.12)",  color: "#f5c842", border: "rgba(245,200,66,.28)" },
    VERIFIED: { bg: "rgba(89,193,115,.12)",  color: "#59c173", border: "rgba(89,193,115,.28)" },
    REJECTED: { bg: "rgba(255,92,122,.12)",  color: "#ff5c7a", border: "rgba(255,92,122,.28)" },
  };
  const s = palette[status] || palette.PENDING;
  return (
    <span style={{ display: "inline-flex", padding: ".3rem .75rem", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {String(status || "PENDING").replaceAll("_", " ")}
    </span>
  );
}

function ProjectRow({ project, onClick }) {
  return (
    <article
      onClick={onClick}
      style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "1.2rem 1.4rem", cursor: "pointer", transition: "border-color .15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(162,206,58,.35)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1f2b22"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, color: "var(--text)", fontSize: "1.05rem" }}>{project.projectName || "Unnamed Project"}</h3>
          <div style={{ color: "var(--muted)", fontSize: ".88rem", marginTop: 4 }}>Farmer: {project.farmerFullName || "—"}</div>
        </div>
        <StatusBadge status={project.reviewStatus} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: "1rem" }}>
        <div>
          <div style={{ color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase" }}>Location</div>
          <div style={{ color: "var(--text)", fontWeight: 600, marginTop: 3 }}>{project.location || "—"}</div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase" }}>Crop Type</div>
          <div style={{ color: "var(--text)", fontWeight: 600, marginTop: 3 }}>{project.cropType || "—"}</div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase" }}>Size (Acres)</div>
          <div style={{ color: "var(--text)", fontWeight: 600, marginTop: 3 }}>{project.sizeAcres ?? "—"}</div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase" }}>Total Value</div>
          <div style={{ color: "#59c173", fontWeight: 700, marginTop: 3 }}>{formatCurrency(project.totalValue)}</div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase" }}>Submitted</div>
          <div style={{ color: "var(--text)", fontWeight: 600, marginTop: 3 }}>{formatDate(project.createdAt)}</div>
        </div>
      </div>
      <div style={{ marginTop: ".85rem", color: "var(--brand)", fontSize: ".85rem", fontWeight: 600 }}>View details →</div>
    </article>
  );
}

export default function AuditorProjectsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const data = await auditorApi.getPendingProjects(token);
      // Backend may return array directly or {items: [...]}
      const list = Array.isArray(data) ? data : (data?.items ?? data?.projects ?? []);
      setProjects(list);
    } catch (err) {
      setError(err.message || "Failed to load pending projects.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function goToDetail(landId) {
    navigate(ROUTES.auditorProjectDetail.replace(":landId", landId));
  }

  return (
    <section style={{ minHeight: "100vh", color: "var(--text)", padding: "2rem" }}>
      <header style={{ marginBottom: "1.6rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <button type="button" onClick={() => navigate(ROUTES.auditorDashboard)} style={{ background: "transparent", border: "1px solid #1f2b22", color: "var(--muted)", borderRadius: 8, padding: ".45rem .9rem", cursor: "pointer", fontSize: ".85rem", marginBottom: ".7rem" }}>← Back to dashboard</button>
          <span style={{ display: "block", color: "var(--brand)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", fontSize: ".8rem" }}>Auditor Portal</span>
          <h1 style={{ margin: ".3rem 0 0", fontSize: "1.9rem" }}>Pending Projects</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, marginTop: ".4rem" }}>
            Review newly submitted land/project proposals awaiting approval.
          </p>
        </div>
        <div style={{ background: "rgba(245,200,66,.1)", border: "1px solid rgba(245,200,66,.25)", borderRadius: 12, padding: ".7rem 1.1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#f5c842", fontSize: "1.6rem", fontWeight: 800 }}>{projects.length}</span>
          <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>pending</span>
        </div>
      </header>

      {loading ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "2rem", color: "var(--muted)" }}>Loading pending projects...</div>
      ) : error ? (
        <div style={{ background: "rgba(255,92,122,.08)", border: "1px solid rgba(255,92,122,.28)", borderRadius: 18, padding: "1.3rem" }}>
          <div style={{ color: "#ff9caf", fontWeight: 700 }}>Could not load projects</div>
          <p style={{ color: "#f5d2d9", margin: ".5rem 0 1rem" }}>{error}</p>
          <button type="button" onClick={load} style={{ border: "1px solid rgba(255,92,122,.4)", color: "#ff5c7a", background: "transparent", borderRadius: 10, padding: ".6rem 1rem", cursor: "pointer", fontWeight: 700 }}>Retry</button>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ background: "#111611", border: "1px solid #1f2b22", borderRadius: 18, padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌱</div>
          <h3 style={{ marginTop: 0 }}>No pending projects</h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>All project submissions have been reviewed.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {projects.map((p) => (
            <ProjectRow key={p.landId} project={p} onClick={() => goToDetail(p.landId)} />
          ))}
        </div>
      )}
    </section>
  );
}
