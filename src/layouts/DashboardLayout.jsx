import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.jsx";
import { DashboardHeader } from "../components/DashboardHeader.jsx";
import "../styles/layouts.css";

export function DashboardLayout() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="dashWrap">
      <div className="dashShell">
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

        <div className="dashMain">
          <DashboardHeader onOpenNav={() => setNavOpen(true)} />

          <Outlet />
        </div>
      </div>
    </div>
  );
}
