import React, { createContext, useEffect, useMemo, useState } from "react";
import api from "../api/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setAdmin(data.admin);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAdmin(data.admin);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAdmin(null);
  };

  const value = useMemo(
    () => ({ admin, loading, login, logout }),
    [admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
