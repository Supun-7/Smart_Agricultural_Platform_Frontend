import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { farmerApi } from "../services/api.js";
import "../styles/pages/farmerDashboard.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatStatus(value) {
  if (!value) return "Not available";
  return String(value).replaceAll("_", " ");
}

function clampProgress(value) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function StatusBadge({ status }) {
  const colors = {
    VERIFIED:      { background: "rgba(89,193,115,.15)",  color: "#59c173" },
    PENDING:       { background: "rgba(255,193,7,.12)",   color: "#ffc107" },
    REJECTED:      { background: "rgba(255,92,122,.12)",  color: "#ff5c7a" },
    NOT_SUBMITTED: { background: "rgba(255,255,255,.06)", color: "#9ab0a0" },
  };
  const style = colors[status] || colors.NOT_SUBMITTED;
  return (
    <span style={{
      ...style,
      display: "inline-block",
      padding: ".25rem .75rem",
      borderRadius: 999,
      fontSize: ".75rem",
      fontWeight: 700,
      letterSpacing: ".05em",
      textTransform: "uppercase",
    }}>
      {formatStatus(status)}
    </span>
  );
}

export default function FarmerDashboard() {
  const { token, user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await farmerApi.getDashboard(token);
      setDashboard(data);
    } catch (err) {
      setError(err.message || "Failed to load farmer dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadDashboard();
  }, [token, loadDashboard]);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="farmerDashboard">
        <div className="farmerDashboardState">
          <div className="farmerDashboardSpinner" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <div className="farmerDashboard">
        <div className="farmerDashboardState">
          <h2 className="farmerDashboardStateTitle">Could not load dashboard</h2>
          <p className="farmerDashboardStateText">{error}</p>
          <button className="btn" onClick={loadDashboard}>Try again</button>
        </div>
      </div>
    );
  }

  const app      = dashboard?.application || {};
  const projects = dashboard?.projects    || [];

  return (
    <section className="farmerDashboard">
      <div className="container farmerDashboardInner">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="farmerDashboardHeader card">
          <div className="farmerDashboardTitleBlock">
            <span className="farmerDashboardEyebrow">Farmer Dashboard</span>
            <h1 className="farmerDashboardTitle">
              Welcome back, {dashboard?.farmerName || user?.fullName || "Farmer"}
            </h1>
            <p className="farmerDashboardSub">
              View your application status, funded projects, and farm details.
            </p>
          </div>
        </div>

        {/* ── Profile cards ────────────────────────────────── */}
        <div className="farmerProfileGrid">
          <div className="card farmerProfileCard">
            <span className="farmerCardLabel">Full Name</span>
            <strong className="farmerCardValue">
              {dashboard?.farmerName || user?.fullName || "—"}
            </strong>
          </div>
          <div className="card farmerProfileCard">
            <span className="farmerCardLabel">Email</span>
            <strong className="farmerCardValue">
              {dashboard?.email || user?.email || "—"}
            </strong>
          </div>
          <div className="card farmerProfileCard">
            <span className="farmerCardLabel">Account Status</span>
            <StatusBadge status={dashboard?.status || user?.verificationStatus} />
          </div>
          <div className="card farmerProfileCard">
            <span className="farmerCardLabel">Application Status</span>
            <StatusBadge status={app?.status} />
          </div>
        </div>

        {/* ── Summary cards ────────────────────────────────── */}
        <div className="farmerSummaryGrid">
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">Total Projects</span>
            <strong className="farmerSummaryValue">
              {dashboard?.totalProjects ?? 0}
            </strong>
          </div>
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">Total Funded</span>
            <strong className="farmerSummaryValue">
              {formatCurrency(dashboard?.totalFunded)}
            </strong>
          </div>
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">Farm Location</span>
            <strong className="farmerSummaryValue" style={{ fontSize: "1rem" }}>
              {app?.farmLocation || "—"}
            </strong>
          </div>
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">Crop Types</span>
            <strong className="farmerSummaryValue" style={{ fontSize: "1rem" }}>
              {app?.cropTypes || "—"}
            </strong>
          </div>
        </div>

        {/* ── Farm application details ─────────────────────── */}
        {app?.status && app.status !== "NOT_SUBMITTED" && (
          <div className="card farmerLandsSection">
            <div className="farmerSectionHead">
              <div>
                <h2 className="farmerSectionTitle">Farm Application Details</h2>
                <p className="farmerSectionSub">
                  Your submitted farm registration information.
                </p>
              </div>
            </div>
            <div className="farmerProfileGrid">
              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">Farmer Name</span>
                <strong className="farmerCardValue">
                  {app.farmerName} {app.surname}
                </strong>
              </div>
              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">NIC Number</span>
                <strong className="farmerCardValue">{app.nicNumber || "—"}</strong>
              </div>
              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">Farm Address</span>
                <strong className="farmerCardValue">{app.farmAddress || "—"}</strong>
              </div>
              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">Land Size</span>
                <strong className="farmerCardValue">
                  {app.landSizeAcres ? `${app.landSizeAcres} acres` : "—"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* ── Projects ─────────────────────────────────────── */}
        <div className="card farmerLandsSection">
          <div className="farmerSectionHead">
            <div>
              <h2 className="farmerSectionTitle">Funded Projects</h2>
              <p className="farmerSectionSub">
                Projects currently connected to your farmer account.
              </p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="farmerEmptyState">
              <h3>No projects yet</h3>
              <p>
                Your dashboard is connected. Projects will appear here once
                investors fund your farm.
              </p>
            </div>
          ) : (
            <div className="farmerLandGrid">
              {projects.map(p => {
                const progress = clampProgress(p.progress);
                return (
                  <article className="farmerLandCard" key={p.id}>
                    <div className="farmerLandTop">
                      <span className="farmerLandBadge">Project #{p.id}</span>
                      <strong className="farmerLandAmount">
                        {formatCurrency(p.currentAmount)}
                      </strong>
                    </div>

                    <h3 className="farmerLandTitle">
                      {p.projectName || "Untitled project"}
                    </h3>

                    <div className="farmerLandMeta">
                      <div>
                        <span className="farmerMetaLabel">Target amount</span>
                        <span className="farmerMetaValue">
                          {formatCurrency(p.targetAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="farmerMetaLabel">Progress</span>
                        <span className="farmerMetaValue">{progress}%</span>
                      </div>
                    </div>

                    <div className="farmerProgressBlock">
                      <div className="farmerProgressHead">
                        <span className="farmerMetaLabel">Funding progress</span>
                        <span className="farmerProgressValue">{progress}%</span>
                      </div>
                      <div className="farmerProgressBar">
                        <div
                          className="farmerProgressFill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}