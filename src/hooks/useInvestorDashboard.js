import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth.js";
import { investorApi } from "../services/api.js";
 
export function useInvestorDashboard() {
  const { token } = useAuth();
 
  const [dashboard, setDashboard] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
 
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await investorApi.getDashboard(token);
      setDashboard(data);
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