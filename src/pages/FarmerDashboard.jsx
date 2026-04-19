import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  // ================= Contracts =================

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
  const { t } = useTranslation();
  const { token, user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const [evidenceOpen, setEvidenceOpen] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidenceError, setEvidenceError] = useState("");
  const [evidenceSuccess, setEvidenceSuccess] = useState("");
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

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

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
  const MAX_BYTES = 5 * 1024 * 1024;

  function validateEvidenceFiles(files) {
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return `"${file.name}" is not supported. Only JPG, PNG, and PDF files are accepted.`;
      }
      if (file.size > MAX_BYTES) {
        return `"${file.name}" exceeds the 5 MB size limit.`;
      }
    }
    return null;
  }

  async function handleEvidenceUpload(milestoneId) {
    if (!evidenceFiles.length) {
      setEvidenceError("Please select at least one file.");
      return;
    }
    const validationError = validateEvidenceFiles(evidenceFiles);
    if (validationError) {
      setEvidenceError(validationError);
      return;
    }
    setUploadingEvidence(true);
    setEvidenceError("");
    setEvidenceSuccess("");
    try {
      await farmerApi.uploadMilestoneEvidence(token, milestoneId, evidenceFiles);
      setEvidenceSuccess("Evidence uploaded successfully.");
      setEvidenceFiles([]);
      setEvidenceOpen(null);
      await loadDashboard();
    } catch (err) {
      setEvidenceError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploadingEvidence(false);
    }
  }

  return (
    <section className="farmerDashboard">
      <div className="container farmerDashboardInner">
        <div className="farmerDashboardHeader card">
          <div className="farmerDashboardTitleBlock">
            <span className="farmerDashboardEyebrow">Farmer Dashboard</span>
            <h1 className="farmerDashboardTitle">
              {t("farmerDashboard.title", { name: dashboard?.farmerName || user?.fullName || "Farmer" })}
            </h1>
            <p className="farmerDashboardSub">
              {t("farmerDashboard.subtitle")}
            </p>
          </div>

          <div className="farmerDashboardHeaderActions">
            <Link className="btn" to={ROUTES.farmerApplication}>{t("farmerDashboard.registerLandBtn")}</Link>
          </div>
        </div>

        <div className="farmerProfileGrid">
          <div className="card farmerProfileCard">
            <span className="farmerCardLabel">{t("farmerDashboard.profile.fullName")}</span>
            <strong className="farmerCardValue">{dashboard?.farmerName || user?.fullName || "—"}</strong>
          </div>
          <div className="card farmerProfileCard">
            <span className="farmerCardLabel">{t("farmerDashboard.profile.email")}</span>
            <strong className="farmerCardValue">{dashboard?.email || user?.email || "—"}</strong>
          </div>
          <div className="card farmerProfileCard">
            <span className="farmerCardLabel">{t("farmerDashboard.profile.accountStatus")}</span>
            <StatusBadge status={dashboard?.status || user?.verificationStatus} />
          </div>
          <div className="card farmerProfileCard">
            <span className="farmerCardLabel">{t("farmerDashboard.profile.applicationStatus")}</span>
            <StatusBadge status={app?.status} />
          </div>
        </div>

        <div className="farmerSummaryGrid">
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">{t("farmerDashboard.summary.totalProjects")}</span>
            <strong className="farmerSummaryValue">{dashboard?.totalProjects ?? 0}</strong>
          </div>
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">{t("farmerDashboard.summary.totalFunded")}</span>
            <strong className="farmerSummaryValue">{formatCurrency(dashboard?.totalFunded)}</strong>
          </div>
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">{t("farmerDashboard.summary.landListings")}</span>
            <strong className="farmerSummaryValue">{dashboard?.landCount ?? 0}</strong>
          </div>
          <div className="card farmerSummaryCard">
            <span className="farmerCardLabel">{t("farmerDashboard.summary.activeListings")}</span>
            <strong className="farmerSummaryValue">{dashboard?.activeLandCount ?? 0}</strong>
          </div>
        </div>

        {app?.status && app.status !== "NOT_SUBMITTED" && (
          <div className="card farmerLandsSection">
            <div className="farmerSectionHead">
              <div>
                <h2 className="farmerSectionTitle">{t("farmerDashboard.applicationDetails.title")}</h2>
                <p className="farmerSectionSub">{t("farmerDashboard.applicationDetails.subtitle")}</p>
              </div>
            </div>
            <div className="farmerProfileGrid">
              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">{t("farmerDashboard.applicationDetails.farmerName")}</span>
                <strong className="farmerCardValue">{app.farmerName} {app.surname}</strong>
              </div>
              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">{t("farmerDashboard.applicationDetails.nicNumber")}</span>
                <strong className="farmerCardValue">{app.nicNumber || "—"}</strong>
              </div>
              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">{t("farmerDashboard.applicationDetails.farmAddress")}</span>
                <strong className="farmerCardValue">{app.farmAddress || "—"}</strong>
              </div>
              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">{t("farmerDashboard.applicationDetails.landSize")}</span>
                <strong className="farmerCardValue">{app.landSizeAcres ? `${app.landSizeAcres} acres` : "—"}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="card farmerLandsSection">
          <div className="farmerSectionHead">
            <div>
              <h2 className="farmerSectionTitle">{t("farmerDashboard.milestones.title")}</h2>
              <p className="farmerSectionSub">{t("farmerDashboard.milestones.subtitle")}</p>
            </div>
          </div>

          {!Array.isArray(dashboard?.milestones) || dashboard.milestones.length === 0 ? (
            <div className="farmerEmptyState">
              <h3>{t("farmerDashboard.milestones.emptyState.title")}</h3>
              <p>{t("farmerDashboard.milestones.emptyState.desc")}</p>
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

                  {milestone.rejectionReason && (
                    <div style={{ color: "#ffb4c0", fontSize: ".92rem" }}>
                      {t("farmerDashboard.milestones.rejectionReason")} {milestone.rejectionReason}
                    </div>
                  )}

                  {milestone.status === "PENDING" && (
                    <div style={{ marginTop: ".8rem" }}>
                      <button
                        className="btn btnSmall btnGhost"
                        onClick={() => {
                          const isOpen = evidenceOpen === milestone.id;
                          setEvidenceOpen(isOpen ? null : milestone.id);
                          setEvidenceFiles([]);
                          setEvidenceError("");
                          setEvidenceSuccess("");
                        }}
                      >
                        {evidenceOpen === milestone.id ? t("farmerDashboard.milestones.cancelUpload") : t("farmerDashboard.milestones.uploadEvidence")}
                      </button>

                      {evidenceOpen === milestone.id && (
                        <div
                          style={{
                            marginTop: ".8rem",
                            padding: "1rem",
                            background: "rgba(255,255,255,.03)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,.07)",
                          }}
                        >
                          <p style={{ color: "var(--muted)", fontSize: ".85rem", margin: "0 0 .6rem" }}>
                            Accepted: JPG, PNG, PDF · Max 5 MB per file
                          </p>

                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            multiple
                            disabled={uploadingEvidence}
                            onChange={(e) => {
                              setEvidenceFiles(Array.from(e.target.files));
                              setEvidenceError("");
                              setEvidenceSuccess("");
                            }}
                            style={{ color: "var(--text)", fontSize: ".88rem" }}
                          />

                          {evidenceFiles.length > 0 && (
                            <ul style={{ margin: ".5rem 0 0", paddingLeft: "1.2rem", color: "var(--muted)", fontSize: ".82rem" }}>
                              {evidenceFiles.map((f, i) => (
                                <li key={i}>{f.name} ({(f.size / 1024).toFixed(1)} KB)</li>
                              ))}
                            </ul>
                          )}

                          {evidenceError && (
                            <div style={{ color: "var(--danger)", fontSize: ".85rem", marginTop: ".5rem" }}>
                              {evidenceError}
                            </div>
                          )}
                          {evidenceSuccess && (
                            <div style={{ color: "var(--brand)", fontSize: ".85rem", marginTop: ".5rem" }}>
                              {evidenceSuccess}
                            </div>
                          )}

                          <button
                            className="btn btnSmall"
                            style={{ marginTop: ".75rem" }}
                            disabled={uploadingEvidence || evidenceFiles.length === 0}
                            onClick={() => handleEvidenceUpload(milestone.id)}
                          >
                            {uploadingEvidence ? t("farmerDashboard.milestones.uploading") : t("farmerDashboard.milestones.submitEvidence")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card farmerLandsSection">
          <div className="farmerSectionHead">
            <div>
              <h2 className="farmerSectionTitle">{t("farmerDashboard.fundedProjects.title")}</h2>
              <p className="farmerSectionSub">{t("farmerDashboard.fundedProjects.subtitle")}</p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="farmerEmptyState">
              <h3>{t("farmerDashboard.fundedProjects.emptyState.title")}</h3>
              <p>{t("farmerDashboard.fundedProjects.emptyState.desc")}</p>
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
                        <span className="farmerMetaLabel">{t("farmerDashboard.fundedProjects.labels.targetAmount")}</span>
                        <span className="farmerMetaValue">{formatCurrency(p.targetAmount)}</span>
                      </div>
                      <div>
                        <span className="farmerMetaLabel">{t("farmerDashboard.fundedProjects.labels.progress")}</span>
                        <span className="farmerMetaValue">{progress}%</span>
                      </div>
                    </div>

                    <div className="farmerProgressBlock">
                      <div className="farmerProgressHead">
                        <span className="farmerMetaLabel">{t("farmerDashboard.fundedProjects.labels.progress")}</span>
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
