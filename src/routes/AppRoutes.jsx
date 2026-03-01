import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routePaths.js";
import { InvestorOnly } from "./InvestorOnly.jsx";

import { DashboardLayout } from "../layouts/DashboardLayout.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";

import NotFound from "../pages/NotFound.jsx";
import InvestorDashboard from "../pages/InvestorDashboard.jsx";
import InvestorInvestments from "../pages/InvestorInvestments.jsx";
import InvestorProjects from "../pages/InvestorProjects.jsx";
import InvestorWallet from "../pages/InvestorWallet.jsx";
import InvestorTransactions from "../pages/InvestorTransactions.jsx";
import InvestorProfile from "../pages/InvestorProfile.jsx";
import Unauthorized from "../pages/Unauthorized.jsx";
//import { ProtectedRoute } from "./ProtectedRoute.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.home} element={<Home />} />
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.register} element={<Register />} />
      </Route>

      <Route element={<InvestorOnly />}>
        <Route path={ROUTES.dashboard} element={<DashboardLayout />}>
          <Route index element={<InvestorDashboard />} />
          <Route path="investments" element={<InvestorInvestments />} />
          <Route path="projects" element={<InvestorProjects />} />
          <Route path="wallet" element={<InvestorWallet />} />
          <Route path="transactions" element={<InvestorTransactions />} />
          <Route path="profile" element={<InvestorProfile />} />
        </Route>
      </Route>

      <Route path={ROUTES.unauthorized} element={<Unauthorized />} />

      {/* 404 */}
      <Route path={ROUTES.notFound} element={<NotFound />} />
    </Routes>
  );
}
