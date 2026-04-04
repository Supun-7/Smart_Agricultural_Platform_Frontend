import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "./routePaths";
import { PublicLayout } from "../layouts/PublicLayout";
import { InvestorLayout } from "../layouts/InvestorLayout";
import { AuditorLayout } from "../layouts/AuditorLayout";
import { FarmerLayout } from "../layouts/FarmerLayout";
import { AdminLayout } from "../layouts/AdminLayout.jsx";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import GatePage from "../pages/GatePage";

import InvestorDashboard from "../pages/investor/InvestorDashboard";
import InvestorPortfolio from "../pages/investor/InvestorPortfolio";
import InvestorOpportunities from "../pages/investor/InvestorOpportunities";
import InvestorReports from "../pages/investor/InvestorReports";

import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import GoogleAuthCallback from "../pages/GoogleAuthCallback.jsx";
import CreateUserPage from "../pages/admin/CreateUserPage.jsx";

import AuditorDashboard from "../pages/auditor/AuditorDashboard";
import AuditHistory from "../pages/auditor/AuditHistory";


import FarmerDashboard from "../pages/FarmerDashboard";
import FarmerLandRegistration from "../pages/farmer/FarmerLandRegistration.jsx";

// ── Guard 1 — must be logged in ─────────────────────────────
function RequireAuth({ children }) {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) return null;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return children;
}

// ── Guard 2 — must have correct role ────────────────────────
function RequireRole({ role, roles, children }) {
  const { user, isAuthenticated, booting } = useAuth();

  if (booting) return null;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  const allowedRoles = roles ?? (role ? [role] : []);
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.gate} replace />;
  }

  return children;
}

// ── Guard 3 — already logged in ─────────────────────────────
function RedirectIfLoggedIn({ children }) {
  const { user, booting } = useAuth();

  if (booting) return null;

  if (user) {
    return <Navigate to={ROUTES.gate} replace />;
  }

  return children;
}

// ── Main routes ──────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Routes>

      {/* Public routes — navbar + footer */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.home} element={<Home />} />
        <Route
          path={ROUTES.login}
          element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>}
        />
        <Route
          path={ROUTES.register}
          element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>}
        />
      </Route>

      {/* Gate — 2nd door, checked right after login */}
      <Route
        path={ROUTES.gate}
        element={<RequireAuth><GatePage /></RequireAuth>}
      />

      {/* ── Investor — sidebar layout ────────────────────── */}
      <Route
        element={
          <RequireRole role="INVESTOR">
            <InvestorLayout />
          </RequireRole>
        }
      >
        <Route path={ROUTES.investorDashboard}     element={<InvestorDashboard />}     />
        <Route path={ROUTES.investorPortfolio}     element={<InvestorPortfolio />}     />
        <Route path={ROUTES.investorOpportunities} element={<InvestorOpportunities />} />
        <Route path={ROUTES.investorReports}       element={<InvestorReports />}       />
      </Route>

      {/* ── Auditor — sidebar layout ─────────────────────── */}
      <Route
        element={
          <RequireRole role="AUDITOR">
            <AuditorLayout />
          </RequireRole>
        }
      >
        <Route path={ROUTES.auditorDashboard} element={<AuditorDashboard />} />
        <Route path={ROUTES.auditorKyc}       element={<AuditorDashboard />} />
        <Route path={ROUTES.auditorFarmers}   element={<AuditorDashboard />} />
        <Route
          path={ROUTES.auditorReports}
          element={
            <div style={{ color: "var(--text)", padding: "2rem" }}>
              Reports — coming soon
            </div>
          }
        />
       <Route path={ROUTES.auditorHistory} element={<AuditHistory />} />
      </Route>

      {/* ── Farmer — sidebar layout ──────────────────────── */}
      <Route
        element={
          <RequireRole role="FARMER">
            <FarmerLayout />
          </RequireRole>
        }
      >
        <Route path={ROUTES.farmerDashboard} element={<FarmerDashboard />} />
        <Route path={ROUTES.farmerApplication} element={<FarmerLandRegistration />} />
        <Route
          path={ROUTES.farmerCrops}
          element={
            <div style={{ color: "var(--text)", padding: "2rem" }}>
              My Crops — coming soon
            </div>
          }
        />
      </Route>

      {/* ── Admin — sidebar layout ────────────────────────── */}
      <Route
        element={
          <RequireRole roles={["ADMIN", "SYSTEM_ADMIN"]}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route path={ROUTES.admin}           element={<AdminDashboard />} />
        <Route path="/admin/dashboard"       element={<AdminDashboard />} />
        <Route path="/admin/create-user"     element={<CreateUserPage />} />
      </Route>

      {/* Google OAuth callback */}
      <Route path="/auth/callback" element={<GoogleAuthCallback />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />

    </Routes>
  );
}