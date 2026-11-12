import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export type UserRole = "ROLE_STUDENT" | "ROLE_TUTOR" | "ROLE_ADMIN";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: "STUDENT" | "TUTOR" | "ADMIN" | UserRole) => boolean;
  fetchWithAuth: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

import { API_BASE, BACKEND_URL } from "./api-config";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("tutorsphere_token");
      const storedUser = localStorage.getItem("tutorsphere_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to sign in. Please verify your credentials.");
        return false;
      }

      const authUser: AuthUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
      };

      setToken(data.token);
      setUser(authUser);
      localStorage.setItem("tutorsphere_token", data.token);
      localStorage.setItem("tutorsphere_user", JSON.stringify(authUser));

      toast.success(`Welcome back, ${authUser.name}! (${formatRole(authUser.role)})`);
      return true;
    } catch (err: any) {
      toast.error("Unable to connect to authentication server. Ensure backend is running.");
      console.error(err);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role = "ROLE_STUDENT"): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed. Try again.");
        return false;
      }

      const authUser: AuthUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
      };

      setToken(data.token);
      setUser(authUser);
      localStorage.setItem("tutorsphere_token", data.token);
      localStorage.setItem("tutorsphere_user", JSON.stringify(authUser));

      toast.success(`Account created successfully! Welcome, ${authUser.name}!`);
      return true;
    } catch (err: any) {
      toast.error("Failed to register. Please check your network connection.");
      console.error(err);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("tutorsphere_token");
      localStorage.removeItem("tutorsphere_user");
      toast.info("You have been signed out.");
    }
  };

  const hasRole = (role: "STUDENT" | "TUTOR" | "ADMIN" | UserRole): boolean => {
    if (!user) return false;
    const formatted = role.startsWith("ROLE_") ? role : `ROLE_${role}`;
    return user.role === formatted;
  };

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        hasRole,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function formatRole(role: UserRole | string): string {
  switch (role) {
    case "ROLE_ADMIN":
      return "Administrator";
    case "ROLE_TUTOR":
      return "Tutor";
    case "ROLE_STUDENT":
    default:
      return "Student";
  }
}

