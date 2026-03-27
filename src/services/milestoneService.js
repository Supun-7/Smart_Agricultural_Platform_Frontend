// ── Milestone API service ────────────────────────────────────
// New file — does NOT modify the existing api.js.
// Follows identical conventions: BASE_URL, headers(), handle().

const BASE_URL = "http://localhost:8080/api";

function headers(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handle(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      typeof data === "string"     ? data          :
      data?.error                  ? data.error    :
      data?.message                ? data.message  :
                                     `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export const milestoneApi = {
  /**
   * GET /api/investor/projects/{landId}/milestones
   * Returns ProjectMilestoneResponseDto:
   *   { landId, projectName, location, totalValue, amountInvested,
   *     overallProgress, approvedMilestones: MilestoneDto[] }
   *
   * Each MilestoneDto: { milestoneId, progressPercentage, notes, date, approvalStatus }
   * AC-2: only APPROVED milestones are returned (backend enforces this).
   * AC-4: milestones are sorted latest date first (backend enforces this).
   */
  getApprovedMilestones: (token, landId) =>
    fetch(`${BASE_URL}/investor/projects/${landId}/milestones`, {
      headers: headers(token),
    }).then(handle),
};
