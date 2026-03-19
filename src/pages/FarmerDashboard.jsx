import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { farmerApi } from "../services/api.js";
import "../styles/pages/farmerDashboard.css";

function formatCurrency(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount);
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

export default function FarmerDashboard() {
  const { token, user, signOut } = useAuth();

  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [profileData, dashboardData] = await Promise.all([
        farmerApi.getProfile(token),
        farmerApi.getDashboard(token),
      ]);

      setProfile(profileData);
      setDashboard(dashboardData);
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

  const summary = dashboard?.summary || {
    totalFundedLands: 0,
    totalInvestmentAmount: 0,
  };

  const fundedLands = dashboard?.fundedLands || [];

  return (
    <section className="farmerDashboard">
      <div className="container farmerDashboardInner">
        <div className="farmerDashboardHeader card">
          <div className="farmerDashboardTitleBlock">
            <span className="farmerDashboardEyebrow">Farmer Dashboard</span>
            <h1 className="farmerDashboardTitle">
              Welcome back{profile?.fullName ? `, ${profile.fullName}` : user?.fullName ? `, ${user.fullName}` : ""}
            </h1>
            <p className="farmerDashboardSub">
              View your funded lands, total investment amount, and current project progress.
            </p>
          </div>

          <div className="farmerDashboardHeaderActions">
            <button className="btn btnGhost" type="button" onClick={loadDashboard}>
              Refresh
            </button>
            <button className="btn" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>

        {loading && (
          <div className="card farmerDashboardState">
            <div className="farmerDashboardSpinner" />
            <p>Loading your dashboard…</p>
          </div>
        )}

        {!loading && error && (
          <div className="card farmerDashboardState">
            <h2 className="farmerDashboardStateTitle">Could not load dashboard</h2>
            <p className="farmerDashboardStateText">{error}</p>
            <div className="farmerDashboardStateActions">
              <button className="btn" type="button" onClick={loadDashboard}>
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="farmerProfileGrid">
              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">Full name</span>
                <strong className="farmerCardValue">
                  {profile?.fullName || user?.fullName || "Not available"}
                </strong>
              </div>

              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">Email</span>
                <strong className="farmerCardValue">
                  {profile?.email || user?.email || "Not available"}
                </strong>
              </div>

              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">Role</span>
                <strong className="farmerCardValue">
                  {formatStatus(profile?.role || user?.role)}
                </strong>
              </div>

              <div className="card farmerProfileCard">
                <span className="farmerCardLabel">Verification status</span>
                <strong className="farmerCardValue">
                  {formatStatus(profile?.status || user?.verificationStatus)}
                </strong>
              </div>
            </div>

            <div className="farmerSummaryGrid">
              <div className="card farmerSummaryCard">
                <span className="farmerCardLabel">Total funded lands</span>
                <strong className="farmerSummaryValue">
                  {Number(summary.totalFundedLands ?? 0)}
                </strong>
              </div>

              <div className="card farmerSummaryCard">
                <span className="farmerCardLabel">Total investment amount</span>
                <strong className="farmerSummaryValue">
                  {formatCurrency(summary.totalInvestmentAmount)}
                </strong>
              </div>
            </div>

            <div className="card farmerLandsSection">
              <div className="farmerSectionHead">
                <div>
                  <h2 className="farmerSectionTitle">Funded Lands</h2>
                  <p className="farmerSectionSub">
                    These are the projects currently connected to your farmer dashboard.
                  </p>
                </div>
              </div>

              {fundedLands.length === 0 ? (
                <div className="farmerEmptyState">
                  <h3>No funded lands yet</h3>
                  <p>
                    Your dashboard is connected successfully, but there are no funded land records to show right now.
                  </p>
                </div>
              ) : (
                <div className="farmerLandGrid">
                  {fundedLands.map((land) => {
                    const progress = clampProgress(land.projectProgress);

                    return (
                      <article className="farmerLandCard" key={land.projectId}>
                        <div className="farmerLandTop">
                          <span className="farmerLandBadge">Project #{land.projectId}</span>
                          <strong className="farmerLandAmount">
                            {formatCurrency(land.investmentAmount)}
                          </strong>
                        </div>

                        <h3 className="farmerLandTitle">
                          {land.projectName || "Untitled project"}
                        </h3>

                        <div className="farmerLandMeta">
                          <div>
                            <span className="farmerMetaLabel">Land name</span>
                            <span className="farmerMetaValue">
                              {land.landName || "Not available"}
                            </span>
                          </div>

                          <div>
                            <span className="farmerMetaLabel">Farm location</span>
                            <span className="farmerMetaValue">
                              {land.farmLocation || "Not available"}
                            </span>
                          </div>
                        </div>

                        <div className="farmerProgressBlock">
                          <div className="farmerProgressHead">
                            <span className="farmerMetaLabel">Project progress</span>
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
          </>
        )}
      </div>
    </section>
  );
}
