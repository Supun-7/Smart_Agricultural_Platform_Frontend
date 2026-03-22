import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import "../styles/layouts.css";

export function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/home";

  return (
    <div className="appShell">
      <Navbar />
      {isHome ? (
        <div style={{ paddingTop: "70px" }}>
          <Outlet />
        </div>
      ) : (
        <main className="container mainContent" style={{ paddingTop: "70px" }}>
          <Outlet />
        </main>
      )}
    </div>
  );
}