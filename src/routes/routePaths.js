export const ROUTES = {
  // public routes — no login needed
  home:     "/",
  login:    "/login",
  register: "/register",

  // 2nd door — checked right after login
  gate: "/gate",

  // role dashboards — protected
  farmer:   "/farmer/dashboard",
  investor: "/investor/dashboard",   // kept — GatePage.jsx uses this
  auditor:  "/auditor/dashboard",
  admin:    "/admin/dashboard",

  // ── investor sub-pages ───────────────────────────────────
  investorDashboard:     "/investor/dashboard",
  investorPortfolio:     "/investor/portfolio",
  investorOpportunities: "/investor/opportunities",
  investorReports:       "/investor/reports",
};
