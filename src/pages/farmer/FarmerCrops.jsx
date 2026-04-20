import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../routes/routePaths.js";
import { farmerApi } from "../../services/api.js";
import "../../styles/pages/farmerDashboard.css";

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

export default function FarmerCrops() {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyLandId, setBusyLandId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await farmerApi.getDashboard(token);
      setDashboard(data);
    } catch (err) {
      setError(err.message || "Failed to load crops and investments.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token, loadData]);

  async function toggleLandStatus(landId, isActive) {
    setBusyLandId(landId);
    setActionError("");
    try {
      await farmerApi.updateLandStatus(token, landId, isActive);
      await loadData();
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
          <p>Loading your crops data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="farmerDashboard">
        <div className="farmerDashboardState">
          <h2 className="farmerDashboardStateTitle">Could not load data</h2>
          <p className="farmerDashboardStateText">{error}</p>
          <button className="btn" onClick={loadData}>Try again</button>
        </div>
      </div>
    );
  }

  const lands = dashboard?.lands || [];
  const receivedInvestments = dashboard?.receivedInvestments || [];

  return (
    <section className="farmerDashboard">
      <div className="container farmerDashboardInner">
        <div className="farmerDashboardHeader card">
          <div className="farmerDashboardTitleBlock">
            <span className="farmerDashboardEyebrow">{t("sidebar.myCrops", "My Crops")}</span>
            <h1 className="farmerDashboardTitle">My Crops & Listings</h1>
            <p className="farmerDashboardSub" style={{ maxWidth: "85ch", marginTop: "1rem", lineHeight: "1.6" }}>
              Manage your active land listings, track the crops you've registered, and monitor incoming investments mapped on the blockchain. 
            </p>
          </div>
        </div>

        {/* ── My Land Listings ──────────────────── */}
        <div className="card farmerLandsSection">
          <div className="farmerSectionHead">
            <div>
              <h2 className="farmerSectionTitle">{t("farmerDashboard.lands.title")}</h2>
              <p className="farmerSectionSub">
                {t("farmerDashboard.lands.subtitle")}
              </p>
            </div>
            <Link className="btn btnGhost" to={ROUTES.farmerApplication}>{t("farmerDashboard.lands.createAnother")}</Link>
          </div>

          {actionError && <div className="farmerInlineError">{actionError}</div>}

          {lands.length === 0 ? (
            <div className="farmerEmptyState">
              <h3>{t("farmerDashboard.lands.emptyState.title")}</h3>
              <p>{t("farmerDashboard.lands.emptyState.desc")}</p>
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
                        <span className="farmerMetaLabel">{t("farmerDashboard.lands.labels.location")}</span>
                        <span className="farmerMetaValue">{land.location}</span>
                      </div>
                      <div>
                        <span className="farmerMetaLabel">{t("farmerDashboard.lands.labels.cropType")}</span>
                        <span className="farmerMetaValue">{land.cropType}</span>
                      </div>
                      <div>
                        <span className="farmerMetaLabel">{t("farmerDashboard.lands.labels.landSize")}</span>
                        <span className="farmerMetaValue">{land.sizeAcres} acres</span>
                      </div>
                      <div>
                        <span className="farmerMetaLabel">{t("farmerDashboard.lands.labels.minInvestment")}</span>
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
                          ? t("farmerDashboard.lands.actions.saving")
                          : land.isActive
                            ? t("farmerDashboard.lands.actions.hide")
                            : t("farmerDashboard.lands.actions.show")}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Received Investments with Blockchain Links ──────────────────── */}
        <div className="card farmerLandsSection">
          <div className="farmerSectionHead">
            <div>
              <h2 className="farmerSectionTitle">{t("farmerDashboard.investments.title")}</h2>
              <p className="farmerSectionSub">
                {t("farmerDashboard.investments.subtitle")}
              </p>
            </div>
          </div>

          {receivedInvestments.length === 0 ? (
            <div className="farmerEmptyState">
              <h3>{t("farmerDashboard.investments.emptyState.title")}</h3>
              <p>{t("farmerDashboard.investments.emptyState.desc")}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {receivedInvestments.map((inv) => {
                const hasRealLink =
                  inv.polygonScanUrl &&
                  inv.blockchainTxHash &&
                  !inv.blockchainTxHash.startsWith("BLOCKCHAIN_ERROR") &&
                  !inv.blockchainTxHash.startsWith("PENDING") &&
                  inv.blockchainTxHash.length <= 66;

                return (
                  <div
                    key={inv.investmentId}
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
                          {inv.projectName}
                        </strong>
                        <div style={{ color: "var(--muted)", marginTop: ".25rem", fontSize: ".88rem" }}>
                          👤 {inv.investorName} · {inv.investmentDate?.split("T")[0] || "—"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ color: "var(--brand)", fontSize: "1rem" }}>
                          {formatCurrency(inv.amountInvested)}
                        </strong>
                        <div style={{ marginTop: ".25rem" }}>
                          <StatusBadge status={inv.status} />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: ".75rem" }}>
                      {hasRealLink ? (
                        <a
                          href={inv.polygonScanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: ".4rem",
                            color: "var(--brand)",
                            fontSize: ".85rem",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          {t("farmerDashboard.investments.blockchainLink")}
                        </a>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>
                          {t("farmerDashboard.investments.blockchainPending")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
