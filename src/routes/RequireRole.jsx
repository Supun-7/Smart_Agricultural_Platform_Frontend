import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "./routePaths.js";

export default function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.login} replace />;
  if (user.role !== role) return <Navigate to={ROUTES.home} replace />;
  return children;
}
