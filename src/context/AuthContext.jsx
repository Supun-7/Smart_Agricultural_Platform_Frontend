import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export const AuthContext = createContext(null);

const SESSION_KEY = "chc_user";

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(userData) {
  if (userData) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 400);
    return () => clearTimeout(t);
  }, []);

  const signIn = useCallback((userData) => {
    saveSession(userData);
    setUser(userData);
  }, []);

  const signOut = useCallback(() => {
    saveSession(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(user?.token);

  const value = useMemo(() => ({
    user,
    role: user?.role ?? null,
    token: user?.token ?? null,
    isAuthenticated,
    booting,
    signIn,
    signOut,
  }), [user, booting, isAuthenticated, signIn, signOut]);

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
}
