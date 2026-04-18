export const ROUTES = {
  // public routes — no login needed
  home: "/",
  login: "/login",
  register: "/register",
  // ADD this line after `register: "/register",`
  verifyOtp: "/verify-otp",

  // 2nd door — checked right after login
  gate: "/gate",

  // role dashboards — protected
  farmer: "/farmer/dashboard",
  auditor: "/auditor/dashboard",
  admin: "/admin/dashboard",

  // ── investor sub-pages ───────────────────────────────────
  investor: "/investor/dashboard",
  investorDashboard: "/investor/dashboard",
  investorPortfolio: "/investor/portfolio",
  investorOpportunities: "/investor/opportunities",
  investorReports: "/investor/reports",
  investorWallet: "/investor/wallet",
  investorLandDetail: "/investor/lands/:landId",
  investorContract: "/investor/contract",
  investorContracts: "/investor/contracts",

  // ── auditor sub-pages ────────────────────────────────────
  auditorDashboard: "/auditor/dashboard",
  auditorKyc: "/auditor/kyc",
  auditorFarmers: "/auditor/farmers",
  auditorReports: "/auditor/reports",
  auditorHistory: "/auditor/history",
  auditorKycDetail: "/auditor/kyc/:id",
  auditorFarmerDetail: "/auditor/farmer/:id",
  auditorProjects: "/auditor/projects",
  auditorProjectDetail: "/auditor/projects/:landId",
  auditorFullHistory: "/auditor/full-history",

  // ── farmer sub-pages ─────────────────────────────────────
  farmerDashboard: "/farmer/dashboard",
  farmerApplication: "/farmer/application",
  farmerCrops: "/farmer/crops",
  farmerMilestones: "/farmer/milestones/evidence",
  farmerSupport: "/farmer/support",
  farmerContracts: "/farmer/contracts",
  farmerFinancialReport: "/farmer/financial-report",
};
// ── NEW auditor detail + project routes ─────────────────────
// These lines are appended — the ROUTES object above must be updated to include:
