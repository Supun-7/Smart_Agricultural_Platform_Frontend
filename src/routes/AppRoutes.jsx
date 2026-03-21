import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "./routePaths";
import { PublicLayout } from "../layouts/PublicLayout";
import { InvestorLayout } from "../layouts/InvestorLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import GatePage from "../pages/GatePage";

import InvestorDashboard from "../pages/investor/InvestorDashboard";
import InvestorPortfolio from "../pages/investor/InvestorPortfolio";
import InvestorOpportunities from "../pages/investor/InvestorOpportunities";
import InvestorReports from "../pages/investor/InvestorReports";

import FarmerDashboard from "../pages/FarmerDashboard";

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

function RequireRole({ role, children }) {
  const { user, isAuthenticated, booting } = useAuth();

  if (booting) return null;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (user.role !== role) {
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

        <Route
          path={ROUTES.home}
          element={<Home />}
        />

        <Route
          path={ROUTES.login}
          element={
            <RedirectIfLoggedIn>
              <Login />
            </RedirectIfLoggedIn>
          }
        />

        <Route
          path={ROUTES.register}
          element={
            <RedirectIfLoggedIn>
              <Register />
            </RedirectIfLoggedIn>
          }
        />

      </Route>

      {/* Gate — 2nd door, checked right after login */}
      <Route
        path={ROUTES.gate}
        element={
          <RequireAuth>
            <GatePage />
          </RequireAuth>
        }
      />

      {/* ── Investor — sidebar layout with 4 sub-pages ──────── */}
      <Route
        element={
          <RequireRole role="INVESTOR">
            <InvestorLayout />
          </RequireRole>
        }
      >
        <Route path={ROUTES.investorDashboard} element={<InvestorDashboard />} />
        <Route path={ROUTES.investorPortfolio} element={<InvestorPortfolio />} />
        <Route path={ROUTES.investorOpportunities} element={<InvestorOpportunities />} />
        <Route path={ROUTES.investorReports} element={<InvestorReports />} />
      </Route>

      {/* Other role dashboards */}
      <Route
        path={ROUTES.farmer}
        element={
          <RequireRole role="FARMER">
            <FarmerDashboard />
          </RequireRole>
        }
      />

      <Route
        path={ROUTES.auditor}
        element={
          <RequireRole role="AUDITOR">
            <div style={{ padding: "2rem", color: "white" }}>
              Auditor dashboard — coming soon
            </div>
          </RequireRole>
        }
      />

      <Route
        path={ROUTES.admin}
        element={
          <RequireRole role="ADMIN">
            <div style={{ padding: "2rem", color: "white" }}>
              Admin dashboard — coming soon
            </div>
          </RequireRole>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />

    </Routes>
  );
}
