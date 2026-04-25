import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth.js";
import { investorApi } from "../services/api.js";
 
export function useInvestorDashboard() {
  const { token } = useAuth();
 
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [dashboardData, roiHistory, landMarket] = await Promise.all([
        investorApi.getDashboard(token),
        investorApi.getRoiHistory(token).catch(() => null),
        investorApi.getLandMarket(token).catch(() => null),
      ]);

      setDashboard({
        ...dashboardData,
        roiHistory: roiHistory || { portfolioTrend: [], projectHistories: [], comparison: [] },
        landMarket: landMarket || { summary: {}, marketRows: [], investorComparisons: [], methodology: [] },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);
 
  useEffect(() => {
    load();
  }, [load]);
 
  return { dashboard, loading, error, reload: load };
}
