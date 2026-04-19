import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import Preloader from "./components/Preloader";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { booting } = useAuth();
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Preloader show={booting || splash} />
      <AppRoutes />
    </>
  );
}
