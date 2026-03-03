import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routePaths.js";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
<<<<<<< HEAD
=======
import { DashboardLayout } from "../layouts/DashboardLayout.jsx";
import { FarmerOnly } from "./FarmerOnly.jsx";

>>>>>>> 308dde4 (CHC-29: Farmer Dashboard Layout UI)
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";

<<<<<<< HEAD
=======
// Dashboard Pages
import FarmerDashboard from "../pages/FarmerDashboard.jsx";
import FarmerLands from "../pages/FarmerLands.jsx";
import FarmerProjects from "../pages/FarmerProjects.jsx";
import FarmerMilestones from "../pages/FarmerMilestones.jsx";
import FarmerFunds from "../pages/FarmerFunds.jsx";
import FarmerProfile from "../pages/FarmerProfile.jsx";
import FarmerReport from "../pages/FarmerReport.jsx";

>>>>>>> 308dde4 (CHC-29: Farmer Dashboard Layout UI)
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.home} element={<Home />} />
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.register} element={<Register />} />
      </Route>
<<<<<<< HEAD
=======

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

>>>>>>> 308dde4 (CHC-29: Farmer Dashboard Layout UI)
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
