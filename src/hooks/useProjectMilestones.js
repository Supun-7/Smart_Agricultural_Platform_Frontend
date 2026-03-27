import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth.js";
import { milestoneApi } from "../services/milestoneService.js";

/**
 * Fetches approved milestones for a single project (land).
 * Follows the same pattern as useInvestorDashboard.js.
 *
 * AC-1: called when investor navigates to a project detail page.
 * AC-2 / AC-6: backend only returns APPROVED milestones.
 */
export function useProjectMilestones(landId) {
  const { token } = useAuth();

  const [project,  setProject]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const load = useCallback(async () => {
    if (!token || !landId) return;
    setLoading(true);
    setError("");
    try {
      const data = await milestoneApi.getApprovedMilestones(token, landId);
      setProject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, landId]);

  useEffect(() => {
    load();
  }, [load]);

  return { project, loading, error, reload: load };
}
