import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export const AuthContext = createContext(null);

const SESSION_KEY = "chc_user";

// Everything EXCEPT the token
// Token lives only in memory (React state)
function buildStorableUser(userData) {
  const { token, ...rest } = userData;
  return rest;
}

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
    // strip token before saving to localStorage
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(buildStorableUser(userData))
    );
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function AuthProvider({ children }) {

  // state holds full user object INCLUDING token
  // On first load from localStorage, token will be null
  const [user,    setUser]    = useState(() => loadSession());
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 400);
    return () => clearTimeout(t);
  }, []);

  const signIn = useCallback((userData) => {
    // userData = { token, userId, fullName, email, role, verificationStatus }
    saveSession(userData);   // saves to localStorage WITHOUT token
    setUser(userData);       // saves to state WITH token ← AC-3
  }, []);

  const signOut = useCallback(() => {
    saveSession(null);       // clears localStorage
    setUser(null);           // clears state including token ← AC-4
  }, []);

  // ── Helper: check if user has a valid token in memory ─────
  // After page refresh, user info exists but token is null
  // isAuthenticated = true only when token is present in memory
  const isAuthenticated = Boolean(user?.token);

  const value = useMemo(() => ({
    user,
    role:            user?.role            ?? null,
    token:           user?.token           ?? null,  // direct token access
    isAuthenticated,                                  // true only with token
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