import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "./routePaths";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { InvestorLayout } from "../layouts/InvestorLayout.jsx";
import { AuditorLayout } from "../layouts/AuditorLayout.jsx";
import { FarmerLayout } from "../layouts/FarmerLayout.jsx";
import { AdminLayout } from "../layouts/AdminLayout.jsx";

const Home = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));
const VerifyOtp = lazy(() => import("../pages/VerifyOtp.jsx"));
const GatePage = lazy(() => import("../pages/GatePage.jsx"));

const InvestorDashboard = lazy(() => import("../pages/investor/InvestorDashboard.jsx"));
const InvestorPortfolio = lazy(() => import("../pages/investor/InvestorPortfolio.jsx"));
const InvestorOpportunities = lazy(() => import("../pages/investor/InvestorOpportunities.jsx"));
const InvestorReports = lazy(() => import("../pages/investor/InvestorReports.jsx"));
const InvestorWallet = lazy(() => import("../pages/investor/InvestorWallet.jsx"));
const LandDetailPage = lazy(() => import("../pages/investor/LandDetailPage.jsx"));
const ContractPage = lazy(() => import("../pages/investor/ContractPage.jsx"));
const InvestorContractsPage = lazy(() => import("../pages/investor/InvestorContractsPage.jsx"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard.jsx"));
const GoogleAuthCallback = lazy(() => import("../pages/GoogleAuthCallback.jsx"));
const CreateUserPage = lazy(() => import("../pages/admin/CreateUserPage.jsx"));

const AuditorDashboard = lazy(() => import("../pages/auditor/AuditorDashboard.jsx"));
const AuditHistory = lazy(() => import("../pages/auditor/AuditHistory.jsx"));

const FarmerDashboard = lazy(() => import("../pages/FarmerDashboard.jsx"));
const FarmerLandRegistration = lazy(() => import("../pages/farmer/FarmerLandRegistration.jsx"));
const FarmerMilestones = lazy(() => import("../pages/farmer/FarmerMilestones.jsx"));
const FarmerSupport = lazy(() => import("../pages/farmer/FarmerSupport.jsx"));
const FarmerContractsPage = lazy(() => import("../pages/farmer/FarmerContractsPage.jsx"));

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
  if (user) return <Navigate to={ROUTES.gate} replace />;
  return children;
}

// ── Main routes ──────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>

      {/* Public routes */}
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
        {/* OTP verification — public, no redirect guard (user has no token yet) */}
        <Route path={ROUTES.verifyOtp} element={<VerifyOtp />} />
      </Route>

      {/* Gate */}
      <Route
        path={ROUTES.gate}
        element={<RequireAuth><GatePage /></RequireAuth>}
      />

      {/* ── Investor ────────────────────────────────────── */}
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
        <Route path={ROUTES.investorWallet} element={<InvestorWallet />} />
        <Route path={ROUTES.investorLandDetail} element={<LandDetailPage />} />
        <Route path={ROUTES.investorContract} element={<ContractPage />} />
        <Route path={ROUTES.investorContracts} element={<InvestorContractsPage />} />
      </Route>

      {/* ── Auditor ─────────────────────────────────────── */}
      <Route
        element={
          <RequireRole role="AUDITOR">
            <AuditorLayout />
          </RequireRole>
        }
      >
        <Route path={ROUTES.auditorDashboard} element={<AuditorDashboard />} />
        <Route path={ROUTES.auditorKyc} element={<AuditorDashboard />} />
        <Route path={ROUTES.auditorFarmers} element={<AuditorDashboard />} />
        <Route path={ROUTES.auditorReports} element={
          <div style={{ color: "var(--text)", padding: "2rem" }}>
            Reports — coming soon
          </div>
        } />
        <Route path={ROUTES.auditorHistory} element={<AuditHistory />} />
      </Route>

      {/* ── Farmer ──────────────────────────────────────── */}
      <Route
        element={
          <RequireRole role="FARMER">
            <FarmerLayout />
          </RequireRole>
        }
      >
        <Route path={ROUTES.farmerDashboard} element={<FarmerDashboard />} />
        <Route path={ROUTES.farmerApplication} element={<FarmerLandRegistration />} />
        <Route path={ROUTES.farmerMilestones} element={<FarmerMilestones />} />
        <Route path={ROUTES.farmerSupport} element={<FarmerSupport />} />
        <Route path={ROUTES.farmerContracts} element={<FarmerContractsPage />} />
        <Route path={ROUTES.farmerCrops} element={
          <div style={{ color: "var(--text)", padding: "2rem" }}>
            My Crops — coming soon
          </div>
        } />
      </Route>

      {/* ── Admin ───────────────────────────────────────── */}
      <Route
        element={
          <RequireRole roles={["ADMIN", "SYSTEM_ADMIN"]}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route path={ROUTES.admin} element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-user" element={<CreateUserPage />} />
      </Route>

      {/* Google OAuth callback */}
      <Route path="/auth/callback" element={<GoogleAuthCallback />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />

      </Routes>
    </Suspense>
  );
}
