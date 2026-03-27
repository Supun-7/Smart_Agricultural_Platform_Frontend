import { useNavigate } from "react-router-dom";
import { LandCard } from "./LandCard.jsx";

/**
 * LandCardLinked
 *
 * Thin wrapper around the existing LandCard that appends a
 * "View Progress →" button navigating to the project milestones page.
 *
 * ✅ Does NOT modify LandCard.jsx.
 * ✅ Follows the same import / usage pattern as LandCard.
 *
 * AC-1: Investor can navigate to the Project Detail page from their dashboard.
 */
export function LandCardLinked({ investment }) {
  const navigate = useNavigate();

  function handleViewProgress() {
    navigate(`/investor/projects/${investment.landId}/milestones`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <LandCard investment={investment} />
      <button
        onClick={handleViewProgress}
        style={{
          marginTop: "-.45rem",          /* overlap card's bottom border slightly */
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: "var(--radius)",
          borderBottomRightRadius: "var(--radius)",
          width: "100%",
          padding: ".55rem 1rem",
          background: "rgba(89,193,115,.08)",
          border: "1px solid rgba(89,193,115,.2)",
          borderTop: "none",
          color: "var(--brand)",
          fontSize: ".82rem",
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: ".3px",
          transition: "background .14s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: ".4rem",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(89,193,115,.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(89,193,115,.08)";
        }}
      >
        🌿 View Milestones →
      </button>
    </div>
  );
}
