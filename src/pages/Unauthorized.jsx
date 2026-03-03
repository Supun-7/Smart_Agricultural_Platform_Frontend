import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../routes/routePaths.js";

export default function Unauthorized() {
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const role = (localStorage.getItem("role") || "").toLowerCase();

  return (
    <div style={{ maxWidth: 720, margin: "72px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Access denied</h1>
      <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
        This page is restricted.
      </p>
      <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
        Current role: <strong>{role || "(not set)"}</strong>
        {from ? (
          <>
            <br />
            Attempted route: <span style={{ opacity: 0.85 }}>{from}</span>
          </>
        ) : null}
      </p>

      <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          to={ROUTES.dashboard}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            textDecoration: "none"
          }}
        >
          Go to Investor
        </Link>

        <button
          onClick={() => {
            localStorage.setItem("role", "investor");
            window.location.href = ROUTES.dashboard;
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

        <Link
          to={ROUTES.farmerDashboard}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            textDecoration: "none"
          }}
        >
          Go to Farmer
        </Link>

        <button
          onClick={() => {
            localStorage.setItem("role", "farmer");
            window.location.href = ROUTES.farmerDashboard;
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            cursor: "pointer"
          }}
        >
          Set role to farmer
        </button>
      </div>
    </div>
  );
}
