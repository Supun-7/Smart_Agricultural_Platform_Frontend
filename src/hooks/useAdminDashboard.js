import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth.js";
import { adminApi } from "../services/api.js";

export function useAdminDashboard() {
  const { token, role, booting } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  const load = useCallback(async () => {
    if (!token) {
      setDashboard(null);
      setLoading(false);
      setError("You are not authenticated. Please log in again.");
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const data = await adminApi.getDashboard(token);
      setDashboard(data);
      hasLoadedRef.current = true;
      return data;
    } catch (err) {
      setError(err?.message || "Failed to load dashboard");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (booting) return;

    if (!token) {
      setDashboard(null);
      setLoading(false);
      setError("You are not authenticated. Please log in again.");
      hasLoadedRef.current = false;
      return;
    }

    if (role && role !== "ADMIN" && role !== "SYSTEM_ADMIN") {
      setDashboard(null);
      setLoading(false);
      setError("You are not authorized to view the admin dashboard.");
      hasLoadedRef.current = false;
      return;
    }

    if (hasLoadedRef.current) return;

    load().catch(() => {});
  }, [booting, token, role, load]);

  return { dashboard, loading, error, reload: load };
}
