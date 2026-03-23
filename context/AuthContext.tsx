"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/api";

type User = {
  id: string;
  name: string;
  email: string;
  streak: number;
  aiUsageToday: number;
  aiDailyLimit: number;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setTokenAndUser: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // When token exists (or changes), fetch latest user data
  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const data = await getMe();
      // apiFetch returns the parsed JSON body directly
      if (data.success !== false) {
        setUser(data.data || data);
      } else {
        logout();
      }
    } catch (err: any) {
      // Next.js dev server intercepts console.error with raw Error objects and displays a red overlay. 
      // We only log the message to prevent this on expected 401s.
      console.error("Auth verification failed:", err?.response?.data || err?.message || "Unknown error");
      // Don't auto-logout on network error unless it's a 401
      // Our api interceptor handles the 401 by removing localStorage token
      if (localStorage.getItem("token") === null) {
          logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const setTokenAndUser = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, setTokenAndUser, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Ensure the tree uses Context safely
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
