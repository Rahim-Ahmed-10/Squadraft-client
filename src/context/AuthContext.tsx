"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthUser } from "../lib/types";
import api from "../lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role: "Admin" | "Player") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "squadcraft_token";
const USER_KEY = "squadcraft_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      const parsed: AuthUser = JSON.parse(storedUser);
      setUser(parsed);
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    const res = await api.post<AuthUser>("/auth/login", { username, password });
    const userData = res.data;
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, userData.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
  };

  const register = async (username: string, password: string, role: "Admin" | "Player"): Promise<void> => {
    const res = await api.post<AuthUser>("/auth/register", { username, password, role });
    const userData = res.data;
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, userData.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
