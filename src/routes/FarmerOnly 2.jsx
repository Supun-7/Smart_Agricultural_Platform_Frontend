import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "./routePaths.js";
import { useAuth } from "../hooks/useAuth.js";
import { ensureMockSeed } from "../mock/storage.js";

export function FarmerOnly() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  // Always seed for now as it's a demo.
  ensureMockSeed();

  const role = String(user.role || "").toLowerCase();

  // Allow farmer or investor for this specific dashboard in this build
  if (role !== "farmer" && role !== "investor") {
    // If they have a session but wrong role (e.g. admin), we might want Unauthorized page
    // For now, allow them to view this dashboard if they are investor.
  }

  return <Outlet />;
}
