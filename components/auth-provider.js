"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readAuthSession, writeAuthSession, clearAuthSession } from "@/lib/api";

const AuthContext = createContext({
  user: null,
  token: null,
  isReady: false,
  login: () => {},
  logout: () => {},
  setSession: () => {},
});

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hydrateSession = () => {
      setSessionState(readAuthSession());
      setIsReady(true);
    };

    const frameId = typeof window !== "undefined" ? window.requestAnimationFrame(hydrateSession) : null;
    return () => {
      if (frameId !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const setSession = useCallback((nextSession) => {
    writeAuthSession(nextSession);
    setSessionState(nextSession);
  }, []);

  const login = useCallback((nextSession) => {
    setSession(nextSession);
  }, [setSession]);

  const logout = useCallback(() => {
    clearAuthSession();
    setSessionState(null);
  }, []);

  const value = useMemo(() => ({
    user: isReady ? session?.user || null : null,
    token: isReady ? session?.token || null : null,
    isReady,
    login,
    logout,
    setSession,
  }), [session, isReady, login, logout, setSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
