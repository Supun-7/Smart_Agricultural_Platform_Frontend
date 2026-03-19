// ── Base config ─────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

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
    register: (fullName, email, password, role) =>
        fetch(`${BASE_URL}/users/register`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ fullName, email, password, role }),
        }).then(handle),

    login: (email, password) =>
        fetch(`${BASE_URL}/users/login`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ email, password }),
        }).then(handle),
};

// ── Gate endpoint ────────────────────────────────────────────
export const gateApi = {
    check: (token) =>
        fetch(`${BASE_URL}/gate/check`, {
            method: "GET",
            headers: headers(token),
        }).then(handle),
};

// ── Farmer endpoints ─────────────────────────────────────────
export const farmerApi = {
    getDashboard: (token) =>
        fetch(`${BASE_URL}/farmer/dashboard`, {
            headers: headers(token),
        }).then(handle),

    getProfile: (token) =>
        fetch(`${BASE_URL}/farmer/profile`, {
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
            method: "POST",
            headers: headers(token),
            body: JSON.stringify(data),
        }).then(handle),

    requestUpdate: (token, details) =>
        fetch(`${BASE_URL}/farmer/update-request`, {
            method: "POST",
            headers: headers(token),
            body: JSON.stringify({ details }),
        }).then(handle),
};

// ── Investor endpoints ───────────────────────────────────────
export const investorApi = {
    getProfile: (token) =>
        fetch(`${BASE_URL}/investor/profile`, {
            headers: headers(token),
        }).then(handle),

    submitKyc: (token, data) =>
        fetch(`${BASE_URL}/investor/kyc`, {
            method: "POST",
            headers: headers(token),
            body: JSON.stringify({ data }),
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
};

// ── Auditor endpoints ────────────────────────────────────────
export const auditorApi = {
    getFarms: (token) =>
        fetch(`${BASE_URL}/auditor/farms`, {
            headers: headers(token),
        }).then(handle),

    getUsers: (token) =>
        fetch(`${BASE_URL}/auditor/users`, {
            headers: headers(token),
        }).then(handle),

    getTransactions: (token) =>
        fetch(`${BASE_URL}/auditor/transactions`, {
            headers: headers(token),
        }).then(handle),

    getLogs: (token) =>
        fetch(`${BASE_URL}/auditor/logs`, {
            headers: headers(token),
        }).then(handle),

    getReports: (token) =>
        fetch(`${BASE_URL}/auditor/reports`, {
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
            method: "PUT",
            headers: headers(token),
        }).then(handle),

    rejectKyc: (token, id, reason) =>
        fetch(`${BASE_URL}/admin/kyc/${id}/reject`, {
            method: "PUT",
            headers: headers(token),
            body: JSON.stringify({ reason }),
        }).then(handle),

    approveFarmer: (token, id) =>
        fetch(`${BASE_URL}/admin/farmer/${id}/approve`, {
            method: "PUT",
            headers: headers(token),
        }).then(handle),

    rejectFarmer: (token, id, reason) =>
        fetch(`${BASE_URL}/admin/farmer/${id}/reject`, {
            method: "PUT",
            headers: headers(token),
            body: JSON.stringify({ reason }),
        }).then(handle),

    approveUpdateRequest: (token, userId) =>
        fetch(`${BASE_URL}/admin/update-request/${userId}/approve`, {
            method: "PUT",
            headers: headers(token),
        }).then(handle),

    rejectUpdateRequest: (token, userId, reason) =>
        fetch(`${BASE_URL}/admin/update-request/${userId}/reject`, {
            method: "PUT",
            headers: headers(token),
            body: JSON.stringify({ reason }),
        }).then(handle),
};
