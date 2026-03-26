import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin } from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiLogin(email, password);
      const t = res.data.access_token;
      localStorage.setItem("token", t);
      setToken(t);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuth: !!token, login: handleLogin, logout: handleLogout, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);