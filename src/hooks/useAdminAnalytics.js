import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth.js";
import { adminApi } from "../services/api.js";

/**
 * Fetches platform-wide analytics from GET /api/admin/analytics.
 *
 * AC-6 – data is always pulled from the live backend; nothing is hardcoded here.
 *
 * Returns:
 *   analytics  – PlatformAnalyticsDTO shape:
 *     {
 *       totalInvestment,                          // AC-2
 *       activeUsersByRole: { farmers, investors, auditors }, // AC-3
 *       projectStats: { active, funded, completed },         // AC-4
 *       investmentDistribution: [{ landId, projectName, totalInvested }] // AC-5
 *     }
 *   loading    – boolean
 *   error      – string | ""
 *   reload     – () => Promise<void>  (call to manually refresh)
 */
export function useAdminAnalytics() {
  const { token, role, booting } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const hasLoadedRef              = useRef(false);

  const load = useCallback(async () => {
    if (!token) {
      setAnalytics(null);
      setLoading(false);
      setError("You are not authenticated. Please log in again.");
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const data = await adminApi.getAnalytics(token);
      setAnalytics(data);
      hasLoadedRef.current = true;
      return data;
    } catch (err) {
      setError(err?.message || "Failed to load analytics");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (booting) return;

    if (!token) {
      setAnalytics(null);
      setLoading(false);
      setError("You are not authenticated. Please log in again.");
      hasLoadedRef.current = false;
      return;
    }

    if (role && role !== "ADMIN" && role !== "SYSTEM_ADMIN") {
      setAnalytics(null);
      setLoading(false);
      setError("You are not authorized to view analytics.");
      hasLoadedRef.current = false;
      return;
    }

    if (hasLoadedRef.current) return;

    load().catch(() => {});
  }, [booting, token, role, load]);

  return { analytics, loading, error, reload: load };
}
