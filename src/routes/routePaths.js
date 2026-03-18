export const ROUTES = {
  // public routes — no login needed
  home: "/",
  login: "/login",
  register: "/register",

  // 2nd door — checked right after login
  gate: "/gate",

  // role dashboards — protected
  farmer: "/farmer/dashboard",
  investor: "/investor/dashboard",
  auditor: "/auditor/dashboard",
  admin: "/admin/dashboard",
};