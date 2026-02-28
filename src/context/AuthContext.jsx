import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

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

function saveSession(user) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // Small delay for preloader feel
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

  const value = useMemo(() => ({
    user,
    role: user?.role ?? null,
    booting,
    signIn,
    signOut,
  }), [user, booting, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
