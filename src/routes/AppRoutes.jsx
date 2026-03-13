import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routePaths.js";
import RequireRole from "./RequireRole.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { DashboardLayout } from "../layouts/DashboardLayout.jsx";
import { FarmerOnly } from "./FarmerOnly.jsx";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";

// Dashboard Pages
import FarmerDashboard from "../pages/FarmerDashboard.jsx";
import FarmerLands from "../pages/FarmerLands.jsx";
import FarmerProjects from "../pages/FarmerProjects.jsx";
import FarmerMilestones from "../pages/FarmerMilestones.jsx";
import FarmerFunds from "../pages/FarmerFunds.jsx";
import FarmerProfile from "../pages/FarmerProfile.jsx";
import FarmerReport from "../pages/FarmerReport.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.home}     element={<Home />} />
        <Route path={ROUTES.login}    element={<Login />} />
        <Route path={ROUTES.register} element={<Register />} />
      </Route>

      <Route element={<FarmerOnly />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.farmerDashboard} element={<FarmerDashboard />} />
          <Route path={ROUTES.farmerLands} element={<FarmerLands />} />
          <Route path={ROUTES.farmerProjects} element={<FarmerProjects />} />
          <Route path={ROUTES.farmerMilestones} element={<FarmerMilestones />} />
          <Route path={ROUTES.farmerFunds} element={<FarmerFunds />} />
          <Route path={ROUTES.farmerProfile} element={<FarmerProfile />} />
          <Route path={ROUTES.farmerReport} element={<FarmerReport />} />
        </Route>
      </Route>


      <Route
        path={ROUTES.admin}
        element={
          <RequireRole role="admin">
            <AdminDashboard />
          </RequireRole>
        }
      />

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
