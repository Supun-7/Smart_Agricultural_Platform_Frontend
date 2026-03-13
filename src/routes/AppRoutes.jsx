import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routePaths.js";
import RequireRole from "./RequireRole.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.home}     element={<Home />} />
        <Route path={ROUTES.login}    element={<Login />} />
        <Route path={ROUTES.register} element={<Register />} />
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
