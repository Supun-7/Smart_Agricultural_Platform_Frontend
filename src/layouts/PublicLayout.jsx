import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import "../styles/layouts.css";

export function PublicLayout() {
  return (
    <div className="appShell">
      <Navbar />
      <main className="container mainContent">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footerInner">
          <span>© {new Date().getFullYear()} Ceylon Harvest Capital</span>
        </div>
      </footer>
    </div>
  );
}
