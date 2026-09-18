import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("pmr_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("pmr_user");
      const savedToken = localStorage.getItem("pmr_token");

      if (savedUser && savedToken) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setRole(parsed.role);
          setToken(savedToken);
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem("pmr_user");
          localStorage.removeItem("pmr_token");
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, loginRole) => {
    const data = await api.login({ email, password, role: loginRole });
    localStorage.setItem("pmr_token", data.token);
    localStorage.setItem("pmr_user", JSON.stringify(data.user));
    setUser(data.user);
    setRole(data.user.role);
    setToken(data.token);
    return data.user;
  };

  const googleLogin = async (credential, requestedRole = "patient") => {
    const data = await api.googleLogin(credential, requestedRole);
    localStorage.setItem("pmr_token", data.token);
    localStorage.setItem("pmr_user", JSON.stringify(data.user));
    setUser(data.user);
    setRole(data.user.role);
    setToken(data.token);
    return data.user;
  };

  const register = async (formData) => {
    const data = await api.register(formData);

    if (!data?.success || !data?.excelSaved) {
      throw new Error(data?.message || "Registration failed.");
    }

    localStorage.setItem("pmr_token", data.token);
    localStorage.setItem("pmr_user", JSON.stringify(data.user));
    setUser(data.user);
    setRole(data.user.role);
    setToken(data.token);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("pmr_token");
    localStorage.removeItem("pmr_user");
    setUser(null);
    setRole(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (user && role === "patient") {
      try {
        const data = await api.getPatientById(user.id);
        const updated = {
          ...user,
          currentRiskLevel: data.patient.currentRiskLevel,
          recoveryStatus: data.patient.recoveryStatus,
        };
        setUser(updated);
        localStorage.setItem("pmr_user", JSON.stringify(updated));
      } catch (e) {
        console.error("Error refreshing patient:", e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        login,
        googleLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
