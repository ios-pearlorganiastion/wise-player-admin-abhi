import React, { createContext, useContext, useState, useEffect } from "react";
import { LoginResponse } from "../types/api.types";

interface User {
  username: string;
  fullName: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("admin_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  const login = (data: LoginResponse) => {
    const { token, ...userData } = data;
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    // We don't clear the state immediately to avoid UI flicker during redirect. 
    // The browser will reload the page and clear state anyway.
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
