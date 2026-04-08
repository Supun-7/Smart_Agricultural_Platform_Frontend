// ── Base config ─────────────────────────────────────────────
const BASE_URL = "http://localhost:8080/api";

// Helper — builds headers with or without token
function headers(token = null) {
  const h = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

// Helper — handles response, throws error if not ok
async function handle(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      typeof data === "string" ? data :
        data?.error ? data.error :
          data?.message ? data.message :
            `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

// ── Auth endpoints ───────────────────────────────────────────
export const authApi = {

  // Public registration — FARMER and INVESTOR only
  register: (data) =>
    fetch(`${BASE_URL}/users/register`, {
      method:  "POST",
      headers: headers(),
      body:    JSON.stringify(data),
    }).then(handle),

  // Admin-only registration — creates ADMIN or AUDITOR accounts
  // Sends admin JWT token in Authorization header so backend allows it
  registerAsAdmin: (token, data) =>
    fetch(`${BASE_URL}/users/register`, {
      method:  "POST",
      headers: headers(token),
      body:    JSON.stringify(data),
    }).then(handle),

  // Redirect flow — backend exchanges authorization code for user info
  googleCallback: (code, role) =>
    fetch(`${BASE_URL}/auth/google/callback`, {
      method:  "POST",
      headers: headers(),
      body:    JSON.stringify({ code, role }),
    }).then(handle),

  login: (email, password) =>
    fetch(`${BASE_URL}/users/login`, {
      method:  "POST",
      headers: headers(),
      body:    JSON.stringify({ email, password }),
    }).then(handle),
};

// ── Gate endpoint ────────────────────────────────────────────
export const gateApi = {

  check: (token) =>
    fetch(`${BASE_URL}/gate/check`, {
      method:  "GET",
      headers: headers(token),
    }).then(handle),
};

// ── Farmer endpoints ─────────────────────────────────────────
export const farmerApi = {

  getProfile: (token) =>
    fetch(`${BASE_URL}/farmer/profile`, {
      headers: headers(token),
    }).then(handle),

  getDashboard: (token) =>
    fetch(`${BASE_URL}/farmer/dashboard`, {
      headers: headers(token),
    }).then(handle),

  getFields: (token) =>
    fetch(`${BASE_URL}/farmer/fields`, {
      headers: headers(token),
    }).then(handle),

  getCrops: (token) =>
    fetch(`${BASE_URL}/farmer/crops`, {
      headers: headers(token),
    }).then(handle),

  submitApplication: (token, data) =>
    fetch(`${BASE_URL}/farmer/application`, {
      method:  "POST",
      headers: headers(token),
      body:    JSON.stringify(data),
    }).then(handle),

  createLand: (token, data) =>
    fetch(`${BASE_URL}/farmer/lands`, {
      method:  "POST",
      headers: headers(token),
      body:    JSON.stringify(data),
    }).then(handle),

  getLands: (token) =>
    fetch(`${BASE_URL}/farmer/lands`, {
      headers: headers(token),
    }).then(handle),

  updateLandStatus: (token, landId, isActive) =>
    fetch(`${BASE_URL}/farmer/lands/${landId}/active`, {
      method:  "PATCH",
      headers: headers(token),
      body:    JSON.stringify({ isActive }),
    }).then(handle),

  requestUpdate: (token, details) =>
    fetch(`${BASE_URL}/farmer/update-request`, {
      method:  "POST",
      headers: headers(token),
      body:    JSON.stringify({ details }),
    }).then(handle),

  uploadMilestoneEvidence: (token, milestoneId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return fetch(`${BASE_URL}/farmer/milestones/${milestoneId}/evidence`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(handle);
  },

  /** Returns all investment contracts received on the farmer's lands */
  getContracts: (token) =>
    fetch(`${BASE_URL}/farmer/contracts`, {
      headers: headers(token),
    }).then(handle),
};

// ── Investor endpoints ───────────────────────────────────────
export const investorApi = {

  getProfile: (token) =>
    fetch(`${BASE_URL}/investor/profile`, {
      headers: headers(token),
    }).then(handle),

  getDashboard: (token) =>
    fetch(`${BASE_URL}/investor/dashboard`, {
      headers: headers(token),
    }).then(handle),

  submitKyc: (token, data) =>
    fetch(`${BASE_URL}/investor/kyc`, {
      method:  "POST",
      headers: headers(token),
      body:    JSON.stringify(data),
    }).then(handle),

  getOpportunities: (token) =>
    fetch(`${BASE_URL}/investor/opportunities`, {
      headers: headers(token),
    }).then(handle),

  getPortfolio: (token) =>
    fetch(`${BASE_URL}/investor/portfolio`, {
      headers: headers(token),
    }).then(handle),

  getReports: (token) =>
    fetch(`${BASE_URL}/investor/reports`, {
      headers: headers(token),
    }).then(handle),

  /** Fetch single land detail by ID */
  getLandById: (token, landId) =>
    fetch(`${BASE_URL}/investor/lands/${landId}`, {
      headers: headers(token),
    }).then(handle),

  /** Invest from wallet balance into a land project */
  invest: (token, landId, amount) =>
    fetch(`${BASE_URL}/investor/lands/${landId}/invest`, {
      method:  "POST",
      headers: headers(token),
      body:    JSON.stringify({ amount }),
    }).then(handle),

  // ── Wallet endpoints (AC-1 … AC-8) ────────────────────────────────────

  /** AC-8 — balance + full ledger history */
  getWallet: (token) =>
    fetch(`${BASE_URL}/investor/wallet`, {
      headers: headers(token),
    }).then(handle),

  /** AC-1 / AC-2 / AC-3 / AC-7 */
  deposit: (token, amount) =>
    fetch(`${BASE_URL}/investor/wallet/deposit`, {
      method:  "POST",
      headers: headers(token),
      body:    JSON.stringify({ amount }),
    }).then(handle),

  /** AC-4 / AC-5 / AC-6 / AC-7 */
  withdraw: (token, amount) =>
    fetch(`${BASE_URL}/investor/wallet/withdraw`, {
      method:  "POST",
      headers: headers(token),
      body:    JSON.stringify({ amount }),
    }).then(handle),

  /** Returns all investment contracts for the investor — for contracts page */
  getContracts: (token) =>
    fetch(`${BASE_URL}/investor/contracts`, {
      headers: headers(token),
    }).then(handle),
};

// ── Auditor endpoints ────────────────────────────────────────
export const auditorApi = {

  // AC-1 — gets pending KYC + pending farmer applications
  getDashboard: (token) =>
    fetch(`${BASE_URL}/auditor/dashboard`, {
      headers: headers(token),
    }).then(handle),

  // Generate a 60-second signed URL for a document
  getSignedUrl: (token, bucket, path) =>
    fetch(`${BASE_URL}/auditor/signed-url`, {
      method:  "POST",
      headers: headers(token),
      body:    JSON.stringify({ bucket, path }),
    }).then(handle),

  // KYC review
  approveKyc: (token, id) =>
    fetch(`${BASE_URL}/auditor/kyc/${id}/approve`, {
      method:  "PUT",
      headers: headers(token),
    }).then(handle),

  rejectKyc: (token, id, reason) =>
    fetch(`${BASE_URL}/auditor/kyc/${id}/reject`, {
      method:  "PUT",
      headers: headers(token),
      body:    JSON.stringify({ reason }),
    }).then(handle),

  // Farmer application review
  approveFarmer: (token, id) =>
    fetch(`${BASE_URL}/auditor/farmer/${id}/approve`, {
      method:  "PUT",
      headers: headers(token),
    }).then(handle),

  rejectFarmer: (token, id, reason) =>
    fetch(`${BASE_URL}/auditor/farmer/${id}/reject`, {
      method:  "PUT",
      headers: headers(token),
      body:    JSON.stringify({ reason }),
    }).then(handle),

  getPendingMilestones: (token) =>
    fetch(`${BASE_URL}/auditor/milestones/pending`, {
      headers: headers(token),
    }).then(handle),

  getMilestoneDetail: (token, milestoneId) =>
    fetch(`${BASE_URL}/auditor/milestones/${milestoneId}`, {
      headers: headers(token),
    }).then(handle),

  approveMilestone: (token, milestoneId) =>
    fetch(`${BASE_URL}/auditor/milestones/${milestoneId}/approve`, {
      method: "PUT",
      headers: headers(token),
    }).then(handle),

  rejectMilestone: (token, milestoneId, reason) =>
    fetch(`${BASE_URL}/auditor/milestones/${milestoneId}/reject`, {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify({ reason }),
    }).then(handle),

 // CHC-207 — fetches the calling auditor's full audit history, newest first
  getAuditHistory: (token) =>
    fetch(`${BASE_URL}/auditor/history`, {
      headers: headers(token),
    }).then(handle),

};

// ── Admin endpoints ──────────────────────────────────────────
export const adminApi = {

  getUsers: (token) =>
    fetch(`${BASE_URL}/admin/users`, {
      headers: headers(token),
    }).then(handle),

  getQueue: (token) =>
    fetch(`${BASE_URL}/admin/queue`, {
      headers: headers(token),
    }).then(handle),

  approveKyc: (token, id) =>
    fetch(`${BASE_URL}/admin/kyc/${id}/approve`, {
      method:  "PUT",
      headers: headers(token),
    }).then(handle),

  rejectKyc: (token, id, reason) =>
    fetch(`${BASE_URL}/admin/kyc/${id}/reject`, {
      method:  "PUT",
      headers: headers(token),
      body:    JSON.stringify({ reason }),
    }).then(handle),

  approveFarmer: (token, id) =>
    fetch(`${BASE_URL}/admin/farmer/${id}/approve`, {
      method:  "PUT",
      headers: headers(token),
    }).then(handle),

  rejectFarmer: (token, id, reason) =>
    fetch(`${BASE_URL}/admin/farmer/${id}/reject`, {
      method:  "PUT",
      headers: headers(token),
      body:    JSON.stringify({ reason }),
    }).then(handle),

  approveUpdateRequest: (token, userId) =>
    fetch(`${BASE_URL}/admin/update-request/${userId}/approve`, {
      method:  "PUT",
      headers: headers(token),
    }).then(handle),

  rejectUpdateRequest: (token, userId, reason) =>
    fetch(`${BASE_URL}/admin/update-request/${userId}/reject`, {
      method:  "PUT",
      headers: headers(token),
      body:    JSON.stringify({ reason }),
    }).then(handle),

  // AC-2: suspend an active user account
  suspendUser: (token, userId) =>
    fetch(`${BASE_URL}/admin/users/${userId}/suspend`, {
      method:  "PUT",
      headers: headers(token),
    }).then(handle),

  // AC-3: reactivate a suspended user account
  activateUser: (token, userId) =>
    fetch(`${BASE_URL}/admin/users/${userId}/activate`, {
      method:  "PUT",
      headers: headers(token),
    }).then(handle),

  bulkSuspendUsers: (token, userIds) =>
    fetch(`${BASE_URL}/admin/users/bulk-suspend`, {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify({ userIds }),
    }).then(handle),

  bulkActivateUsers: (token, userIds) =>
    fetch(`${BASE_URL}/admin/users/bulk-activate`, {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify({ userIds }),
    }).then(handle),

  getAuditLogs: (token) =>
    fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: headers(token),
    }).then(handle),

  getDashboard: (token) =>
    fetch(`${BASE_URL}/admin/dashboard`, {
      headers: headers(token),
    }).then(handle),
};