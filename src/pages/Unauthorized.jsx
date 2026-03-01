import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  // Investor-only build: self-heal if this page is ever reached.
  useEffect(() => {
    try {
      localStorage.setItem("role", "investor");
      navigate("/dashboard", { replace: true });
    } catch {
      // If storage is blocked, keep the fallback UI below.
    }
  }, [navigate]);

  return (
    <div style={{ maxWidth: 720, margin: "72px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Access denied</h1>
      <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
        This dashboard is available to <strong>investor</strong> accounts only.
      </p>
      <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
        If you reached this page, the app will try to restore investor access automatically.
      </p>

      <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          to="/dashboard"
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            textDecoration: "none"
          }}
        >
          Back to dashboard
        </Link>

        <button
          onClick={() => {
            localStorage.setItem("role", "investor");
            window.location.href = "/dashboard";
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            cursor: "pointer"
          }}
        >
          Set role to investor
        </button>
      </div>
    </div>
  );
}
