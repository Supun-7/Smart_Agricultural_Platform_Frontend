import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./components/Preloader";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ensureMockSeed } from "./mock/storage.js";

export default function App() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    // Front-end only build: seed mock data into localStorage on first load.
    ensureMockSeed();

    // keeps the splash visible for a short time for a premium feel
    const t = setTimeout(() => setSplash(false), 900);
    return () => clearTimeout(t);
  }, []);

  const showLoader = splash;

  return (
    <AuthProvider>
      <Preloader show={showLoader} />
      <AppRoutes />
    </AuthProvider>
  );
}