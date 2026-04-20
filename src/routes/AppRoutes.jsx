import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "./routePaths";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { InvestorLayout } from "../layouts/InvestorLayout.jsx";
import { AuditorLayout } from "../layouts/AuditorLayout.jsx";
import { FarmerLayout } from "../layouts/FarmerLayout.jsx";
import { AdminLayout } from "../layouts/AdminLayout.jsx";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
// ADD this import alongside the other page imports near the top:
import VerifyOtp from "../pages/VerifyOtp.jsx";
import GatePage from "../pages/GatePage.jsx";

import InvestorDashboard from "../pages/investor/InvestorDashboard.jsx";
import InvestorPortfolio from "../pages/investor/InvestorPortfolio.jsx";
import InvestorOpportunities from "../pages/investor/InvestorOpportunities.jsx";
import InvestorReports from "../pages/investor/InvestorReports.jsx";
import InvestorReturnRisk from "../pages/investor/InvestorReturnRisk.jsx";
import InvestorWallet from "../pages/investor/InvestorWallet.jsx";
import LandDetailPage from "../pages/investor/LandDetailPage.jsx";
import ContractPage from "../pages/investor/ContractPage.jsx";
import InvestorContractsPage from "../pages/investor/InvestorContractsPage.jsx";

import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import GoogleAuthCallback from "../pages/GoogleAuthCallback.jsx";
import CreateUserPage from "../pages/admin/CreateUserPage.jsx";

import AuditorDashboard from "../pages/auditor/AuditorDashboard.jsx";
import AuditHistory from "../pages/auditor/AuditHistory.jsx";
import AuditorProjectsPage from "../pages/auditor/AuditorProjectsPage.jsx";
import FarmerCompliancePage from "../pages/auditor/FarmerCompliancePage.jsx";
import FullHistoryPage from "../pages/auditor/FullHistoryPage.jsx";
import KycDetailPage from "../pages/auditor/KycDetailPage.jsx";
import FarmerDetailPage from "../pages/auditor/FarmerDetailPage.jsx";
import ProjectDetailPage from "../pages/auditor/ProjectDetailPage.jsx";

import FarmerDashboard from "../pages/FarmerDashboard.jsx";
import FarmerLandRegistration from "../pages/farmer/FarmerLandRegistration.jsx";
import FarmerMilestones from "../pages/farmer/FarmerMilestones.jsx";
import FarmerSupport from "../pages/farmer/FarmerSupport.jsx";
import FarmerContractsPage from "../pages/farmer/FarmerContractsPage.jsx";
import FarmerFinancialReport from "../pages/farmer/FarmerFinancialReport.jsx";
import FarmerCrops from "../pages/farmer/FarmerCrops.jsx";

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
        <Route path={ROUTES.investorReturnRisk} element={<InvestorReturnRisk />} />
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
        <Route path={ROUTES.auditorProjects} element={<AuditorProjectsPage />} />
        <Route path={ROUTES.auditorProjectDetail} element={<ProjectDetailPage />} />
        <Route path={ROUTES.auditorCompliance} element={<FarmerCompliancePage />} />
        <Route path={ROUTES.auditorReports} element={<AuditHistory />} />
        <Route path={ROUTES.auditorHistory} element={<AuditHistory />} />
        <Route path={ROUTES.auditorFullHistory} element={<FullHistoryPage />} />
        <Route path={ROUTES.auditorKycDetail} element={<KycDetailPage />} />
        <Route path={ROUTES.auditorFarmerDetail} element={<FarmerDetailPage />} />
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
        <Route path={ROUTES.farmerFinancialReport} element={<FarmerFinancialReport />} />
        <Route path={ROUTES.farmerCrops} element={<FarmerCrops />} />
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
  );
}
