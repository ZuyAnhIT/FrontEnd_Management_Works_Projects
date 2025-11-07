"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginUser, logoutUser, registerUser } from "@/app/api/apiAuth";
import { useRouter } from "next/navigation";

interface User {
  fullName: string;
  email: string;
  role: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    if (res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/");
  };

  const register = async (data: { fullName: string; email: string; password: string }) => {
    const res = await registerUser(data);
    if (res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
  };


const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const rolePermissions: Record<string, string[]> = {
      COMPANY_ADMIN: ["*"],
      WORKSPACE_ADMIN: ["workspace.*", "project.*", "task.*"],
      MEMBER: ["task.view", "task.create", "task.edit", "task.delete", "comment.create"],
      GUEST: ["task.view", "comment.view"],
    };

    const userPermissions = user.permissions || rolePermissions[user.role] || [];
    return userPermissions.includes("*") || userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}