import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
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
    VERIFIED: { background: "rgba(89,193,115,.15)", color: "#59c173" },
    APPROVED: { background: "rgba(89,193,115,.15)", color: "#59c173" },
    ACTIVE: { background: "rgba(89,193,115,.15)", color: "#59c173" },
    PENDING: { background: "rgba(255,193,7,.12)", color: "#ffc107" },
    REJECTED: { background: "rgba(255,92,122,.12)", color: "#ff5c7a" },
    INACTIVE: { background: "rgba(255,255,255,.06)", color: "#9ab0a0" },
    NOT_SUBMITTED: { background: "rgba(255,255,255,.06)", color: "#9ab0a0" },
  };
  const style = colors[status] || colors.NOT_SUBMITTED;
  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        padding: ".25rem .75rem",
        borderRadius: 999,
        fontSize: ".75rem",
        fontWeight: 700,
        letterSpacing: ".05em",
        textTransform: "uppercase",
      }}
    >
      {formatStatus(status)}
    </span>
  );
}

export default function FarmerDashboard() {
  const { token, user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyLandId, setBusyLandId] = useState(null);

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

  async function toggleLandStatus(landId, isActive) {
    setBusyLandId(landId);
    setActionError("");
    try {
      await farmerApi.updateLandStatus(token, landId, isActive);
      await loadDashboard();
    } catch (err) {
      setActionError(err.message || "Failed to update listing status.");
    } finally {
      setBusyLandId(null);
    }
  }

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

  const app = dashboard?.application || {};
  const projects = dashboard?.projects || [];
  const lands = dashboard?.lands || [];

  return (
    <section className="farmerDashboard">
      <div className="container farmerDashboardInner">
        <div className="farmerDashboardHeader card">
          <div className="farmerDashboardTitleBlock">
            <span className="farmerDashboardEyebrow">Farmer Dashboard</span>
            <h1 className="farmerDashboardTitle">
              Welcome back, {dashboard?.farmerName || user?.fullName || "Farmer"}
            </h1>
            <p className="farmerDashboardSub">
              Manage your land listings, monitor project funding, and track your farm application progress.
            </p>
          </div>

          <div className="farmerDashboardHeaderActions">
            <Link className="btn" to={ROUTES.farmerApplication}>+ Register land</Link>
          </div>
        </div>

        <div className="farmerProfileGrid">
          <div className="card farmerProfileCard">
            <span className="farmerCardLabel">Full Name</span>
            <strong className="farmerCardValue">{dashboard?.farmerName || user?.fullName || "—"}</strong>
          </div>
          <div className="card farmerProfileCard">
            <span className="farmerCardLabel">Email</span>
            <strong className="farmerCardValue">{dashboard?.email || user?.email || "—"}</strong>
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

        <div className="farmerSummaryGrid">
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">Total Projects</span>
            <strong className="farmerSummaryValue">{dashboard?.totalProjects ?? 0}</strong>
          </div>
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">Total Funded</span>
            <strong className="farmerSummaryValue">{formatCurrency(dashboard?.totalFunded)}</strong>
          </div>
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">Land Listings</span>
            <strong className="farmerSummaryValue">{dashboard?.landCount ?? 0}</strong>
          </div>
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">Active Listings</span>
            <strong className="farmerSummaryValue">{dashboard?.activeLandCount ?? 0}</strong>
          </div>
        </div>

        <div className="card farmerLandsSection">
          <div className="farmerSectionHead">
            <div>
              <h2 className="farmerSectionTitle">My land listings</h2>
              <p className="farmerSectionSub">
                Listings created here are shown to investors on the opportunities page when they are active.
              </p>
            </div>
            <Link className="btn btnGhost" to={ROUTES.farmerApplication}>Create another</Link>
          </div>

          {actionError ? <div className="farmerInlineError">{actionError}</div> : null}

          {lands.length === 0 ? (
            <div className="farmerEmptyState">
              <h3>No land listings yet</h3>
              <p>Create your first listing to make your land visible to investors.</p>
            </div>
          ) : (
            <div className="farmerLandGrid">
              {lands.map((land) => {
                const firstImage = land.imageUrls?.split(",").find(Boolean);
                return (
                  <article className="farmerLandCard" key={land.landId}>
                    {firstImage ? (
                      <img className="farmerListingImage" src={firstImage} alt={land.projectName} />
                    ) : (
                      <div className="farmerListingPlaceholder">No image</div>
                    )}

                    <div className="farmerLandTop">
                      <span className="farmerLandBadge">Land #{land.landId}</span>
                      <StatusBadge status={land.isActive ? "ACTIVE" : "INACTIVE"} />
                    </div>

                    <h3 className="farmerLandTitle">{land.projectName}</h3>
                    <p className="farmerListingDescription">{land.description}</p>

                    <div className="farmerLandMeta farmerLandMetaGrid">
                      <div>
                        <span className="farmerMetaLabel">Location</span>
                        <span className="farmerMetaValue">{land.location}</span>
                      </div>
                      <div>
                        <span className="farmerMetaLabel">Crop type</span>
                        <span className="farmerMetaValue">{land.cropType}</span>
                      </div>
                      <div>
                        <span className="farmerMetaLabel">Land size</span>
                        <span className="farmerMetaValue">{land.sizeAcres} acres</span>
                      </div>
                      <div>
                        <span className="farmerMetaLabel">Min. investment</span>
                        <span className="farmerMetaValue">{formatCurrency(land.minimumInvestment)}</span>
                      </div>
                    </div>

                    <div className="farmerListingActions">
                      <button
                        className="btn btnSmall"
                        disabled={busyLandId === land.landId}
                        onClick={() => toggleLandStatus(land.landId, !land.isActive)}
                      >
                        {busyLandId === land.landId
                          ? "Saving..."
                          : land.isActive
                            ? "Hide from investors"
                            : "Show to investors"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {app?.status && app.status !== "NOT_SUBMITTED" && (
          <div className="card farmerLandsSection">
            <div className="farmerSectionHead">
              <div>
                <h2 className="farmerSectionTitle">Farm application details</h2>
                <p className="farmerSectionSub">Your verified farmer profile and registration details.</p>
              </div>
            </div>
            <div className="farmerProfileGrid">
              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">Farmer Name</span>
                <strong className="farmerCardValue">{app.farmerName} {app.surname}</strong>
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
                <strong className="farmerCardValue">{app.landSizeAcres ? `${app.landSizeAcres} acres` : "—"}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="card farmerLandsSection">
          <div className="farmerSectionHead">
            <div>
              <h2 className="farmerSectionTitle">Milestone updates</h2>
              <p className="farmerSectionSub">Approved and rejected milestone decisions are shown here.</p>
            </div>
          </div>

          {!Array.isArray(dashboard?.milestones) || dashboard.milestones.length === 0 ? (
            <div className="farmerEmptyState">
              <h3>No milestone updates yet</h3>
              <p>Submit milestone progress to see auditor decisions here.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {dashboard.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  style={{
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: "16px",
                    padding: "1rem 1.1rem",
                    background: "rgba(255,255,255,.02)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ color: "var(--text)", fontSize: "1rem" }}>
                        {milestone.projectName || "Untitled project"}
                      </strong>
                      <div style={{ color: "var(--muted)", marginTop: ".25rem" }}>
                        {milestone.milestoneDate || "—"} · {milestone.progressPercentage ?? 0}% complete
                      </div>
                    </div>
                    <StatusBadge status={milestone.status} />
                  </div>

                  <p style={{ color: "var(--text)", margin: ".8rem 0 .35rem", lineHeight: 1.6 }}>
                    {milestone.notes || "No milestone notes provided."}
                  </p>

                  {milestone.rejectionReason ? (
                    <div style={{ color: "#ffb4c0", fontSize: ".92rem" }}>
                      Rejection reason: {milestone.rejectionReason}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card farmerLandsSection">
          <div className="farmerSectionHead">
            <div>
              <h2 className="farmerSectionTitle">Funded projects</h2>
              <p className="farmerSectionSub">Projects currently connected to your farmer account.</p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="farmerEmptyState">
              <h3>No projects yet</h3>
              <p>Your dashboard is connected. Projects will appear here once investors fund your farm.</p>
            </div>
          ) : (
            <div className="farmerLandGrid">
              {projects.map((p) => {
                const progress = clampProgress(p.progress);
                return (
                  <article className="farmerLandCard" key={p.id}>
                    <div className="farmerLandTop">
                      <span className="farmerLandBadge">Project #{p.id}</span>
                      <strong className="farmerLandAmount">{formatCurrency(p.currentAmount)}</strong>
                    </div>

                    <h3 className="farmerLandTitle">{p.projectName || "Untitled project"}</h3>

                    <div className="farmerLandMeta">
                      <div>
                        <span className="farmerMetaLabel">Target amount</span>
                        <span className="farmerMetaValue">{formatCurrency(p.targetAmount)}</span>
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
                        <div className="farmerProgressFill" style={{ width: `${progress}%` }} />
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
