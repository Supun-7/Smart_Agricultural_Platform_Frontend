export const ROUTES = {
  // public routes — no login needed
  home:     "/",
  login:    "/login",
  register: "/register",

  // 2nd door — checked right after login
  gate: "/gate",

  // role dashboards — protected
  farmer:  "/farmer/dashboard",
  auditor: "/auditor/dashboard",
  admin:   "/admin/dashboard",

  // ── investor sub-pages ───────────────────────────────────
  investor:              "/investor/dashboard",
  investorDashboard:     "/investor/dashboard",
  investorPortfolio:     "/investor/portfolio",
  investorOpportunities: "/investor/opportunities",
  investorReports:       "/investor/reports",

  // ── auditor sub-pages ────────────────────────────────────
  auditorDashboard: "/auditor/dashboard",
  auditorKyc:       "/auditor/kyc",
  auditorFarmers:   "/auditor/farmers",
  auditorReports:   "/auditor/reports",
  auditorHistory:   "/auditor/history",

  // ── farmer sub-pages ─────────────────────────────────────
  farmerDashboard:   "/farmer/dashboard",
  farmerApplication: "/farmer/application",
  farmerCrops:       "/farmer/crops",
  farmerMilestones:  "/farmer/milestones/evidence",
  farmerSupport:     "/farmer/support",          // ← NEW: 24/7 AI Support
};