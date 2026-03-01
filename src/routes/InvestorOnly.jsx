import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "./routePaths.js";

/**
 * ProtectedRoute
 * - If not authenticated  → redirect to /login
 * - If wrong role         → redirect to / (unauthorized)
 * - Otherwise             → render children via <Outlet />
 */
export function ProtectedRoute({ allowedRole }) {
    const { user, role, booting } = useAuth();

    // Wait until auth state has been resolved from localStorage
    if (booting) return null;

    if (!user) {
        return <Navigate to={ROUTES.login} replace />;
    }

    if (allowedRole && role !== allowedRole) {
        return <Navigate to={ROUTES.unauthorized} replace />;
    }

    return <Outlet />;
}

export function InvestorOnly() {
    return <ProtectedRoute allowedRole="investor" />;
}
