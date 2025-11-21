"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { getCurrentUser } from "@/services/apiUser";
import { loginUser, logoutUser } from "@/services/apiAuth";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

// Define detailed User type
interface User {
  id: number;
  fullName: string;
  email: string;

  avatarUrl: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  status: string | null;

  systemRoles: string[];

  company: {
    companyId: number | null;
    companyName: string | null;
    roleCode: string | null;
  } | null;

  workspaces: {
    workspaceId: number;
    workspaceName: string;
    companyId: number;
    roleCode: string;
  }[];

  projects: {
    projectId: number;
    projectName: string;
    workspaceId: number;
    roleCode: string;
  }[];
}

// Role definition
type AppRole =
  | "SYSTEM_ADMIN"
  | "COMPANY_ADMIN"
  | "COMPANY_MEMBER"
  | "WORKSPACE_ADMIN"
  | "WORKSPACE_MEMBER"
  | "PROJECT_ADMIN"
  | "PROJECT_MEMBER"
  | "USER"
  | "GUEST_PROJECT"
  | null;

interface AuthContextType {
  user: User | null;
  role: AppRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PAGES = [
  "/",
  "/accept-invitation",
  "/register-from-invite",
  "/reset-password",
  "/create-company",
];

const ROLE_DASHBOARDS: Record<string, string> = {
  SYSTEM_ADMIN: "/adminss/dashboard",
  COMPANY_ADMIN: "/admin",
  COMPANY_MEMBER: "/admin",
  WORKSPACE_ADMIN: "/core",
  WORKSPACE_MEMBER: "/core",
  PROJECT_ADMIN: "/core/workspace/${workspaceId}/project/${projectId}",
  PROJECT_MEMBER: "/core/workspace/${workspaceId}/project/${projectId}",
  USER: "/create-company",
  GUEST_PROJECT: "/projects",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // ----------------------------------------------------------------
  // HELPER 1: DETERMINE ROLE
  // ----------------------------------------------------------------
  const determineRole = useCallback((user: User): AppRole => {
    let mainRole: AppRole = "USER";

    if (user.systemRoles?.includes("SYSTEM_ADMIN")) {
      mainRole = "SYSTEM_ADMIN";
    } else if (user.company?.roleCode === "COMPANY_ADMIN") {
      mainRole = "COMPANY_ADMIN";
    } else if (user.workspaces?.some((w) => w.roleCode === "WORKSPACE_ADMIN")) {
      mainRole = "WORKSPACE_ADMIN";
    } else if (user.projects?.some((p) => p.roleCode === "PROJECT_ADMIN")) {
      mainRole = "PROJECT_ADMIN";
    } else if (user.company?.roleCode === "COMPANY_MEMBER") {
      mainRole = "COMPANY_MEMBER";
    } else if (user.workspaces?.some((w) => w.roleCode === "WORKSPACE_MEMBER")) {
      mainRole = "WORKSPACE_MEMBER";
    } else if (user.projects?.some((p) => p.roleCode === "PROJECT_MEMBER")) {
      mainRole = "PROJECT_MEMBER";
    }

    console.log("🎯 Role determined:", mainRole);
    return mainRole;
  }, []);

  // ----------------------------------------------------------------
  // HELPER 2: GET TARGET DASHBOARD BY ROLE
  // ----------------------------------------------------------------
  const getTargetDashboard = useCallback(
    (userRole: AppRole, userData: User): string => {
      if (!userRole) return "/core";

      // Check if user needs onboarding
      const needsOnboarding =
        userRole === "USER" &&
        !userData.company &&
        (!userData.workspaces || userData.workspaces.length === 0);

      if (needsOnboarding) {
        return "/create-company";
      }

      return ROLE_DASHBOARDS[userRole] || "/core";
    },
    []
  );

  // ----------------------------------------------------------------
  // HELPER 3: FETCH AND SET USER
  // ----------------------------------------------------------------
  const fetchAndSetUser = useCallback(async () => {
    console.log("🔄 Starting fetchAndSetUser...");
    try {
      const data = await getCurrentUser();
      if (data) {
        const mainRole = determineRole(data);

        setUser(data);
        setRole(mainRole);
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("userRole", mainRole ?? "");

        console.log("✅ User and role set:", {
          user: data.email,
          role: mainRole,
        });
        return { user: data, role: mainRole };
      } else {
        throw new Error("Invalid user data");
      }
    } catch (e) {
      console.error("❌ Error fetchAndSetUser:", e);
      setUser(null);
      setRole(null);
      localStorage.clear();
      throw e;
    }
  }, [determineRole]);

  // ----------------------------------------------------------------
  // FEATURE 1: AUTO CHECK LOGIN ON LOAD
  // ----------------------------------------------------------------
  useEffect(() => {
    const checkLogin = async () => {
      console.log("🔍 Checking auth on page load...");
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          await fetchAndSetUser();
        } catch (e) {
          console.error("❌ Auth check failed, logging out:", e);
          router.push("/");
        }
      } else {
        console.log("⚠️ No token found, skipping auth check");
      }

      setIsLoading(false);
      console.log("✅ Auth check completed, isLoading = false");
    };

    checkLogin();
  }, [fetchAndSetUser, router]);

  // ----------------------------------------------------------------
  // FEATURE 2: GUARD LOGIC - PROTECT ONLY, NO REDIRECT AFTER LOGIN
  // ----------------------------------------------------------------
  useEffect(() => {
    console.log("🛡️ Guard effect triggered:", {
      isLoading,
      user: user?.email,
      role,
      pathname,
    });

    if (isLoading) {
      console.log("⏳ isLoading = true, skipping guard");
      return;
    }

    const isPublic = PUBLIC_PAGES.some((p) => pathname.startsWith(p));
    console.log("📍 Is current page public?", isPublic);

    if (user && role) {
      const isOnboardingPage = pathname.startsWith("/create-company");
      const needsOnboarding =
        role === "USER" &&
        !user.company &&
        (!user.workspaces || user.workspaces.length === 0);

      console.log("👤 User logged in:", {
        role,
        needsOnboarding,
        isOnboardingPage,
        pathname,
      });

      // 1. FORCE ONBOARDING (ONLY IF ON ANOTHER PAGE)
      if (
        needsOnboarding &&
        !isOnboardingPage &&
        !pathname.startsWith("/(auth)")
      ) {
        console.log("🚀 Guard: Redirect → /create-company (onboarding)");
        showToast("Welcome! Please create a company to get started.", "info");
        router.push("/create-company");
        return;
      }

      // 2. PROTECT ADMIN (BLOCK ONLY, NO REDIRECT)
      if (
        pathname.startsWith("/admin") &&
        role !== "COMPANY_ADMIN" &&
        role !== "COMPANY_MEMBER"
      ) {
        console.log("🚫 Guard: No access to /admin");
        showToast("You do not have permission to access the Admin page", "error");
        router.push("/core");
      }
    } else if (!isPublic) {
      // 3. NOT LOGGED IN
      console.log("🚀 Guard: Redirect → / (not auth)");
      showToast("Please login to continue", "warning");
      router.push("/");
    }
  }, [isLoading, user, role, pathname, router, showToast]);

  // ----------------------------------------------------------------
  // FEATURE 3: LOGIN FUNCTION (FOR MODAL) - ACTIVE REDIRECT
  // ----------------------------------------------------------------
  const login = async (email: string, password: string) => {
    console.log("🔑 Starting login...");
    setIsLoading(true);

    try {
      const res = await loginUser({ email, password });

      if (!res?.data?.accessToken) {
        throw new Error(res.message || "Login failed!");
      }

      // Save tokens
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      console.log("💾 Tokens saved to localStorage");

      // Fetch user info
      const { user: userData, role: userRole } = await fetchAndSetUser();
      console.log("✅ User and role retrieved:", {
        user: userData.email,
        role: userRole,
      });

      // Determine target page
      const targetPage = getTargetDashboard(userRole, userData);
      console.log("🎯 Target page:", targetPage);

      showToast("Login successful!", "success");

      // ✅ IMPORTANT: Active Redirect here
      console.log("🚀 Redirecting to:", targetPage);

      // Use window.location.href instead of router.push to ensure redirect
      window.location.href = targetPage;
    } catch (error: any) {
      console.error("❌ Login error:", error);
      setIsLoading(false); // Only set false on error
      showToast(
        error.response?.data?.message || error.message || "Login failed!",
        "error"
      );
      throw error;
    }
    // ⚠️ DO NOT set isLoading = false here because redirecting
  };

  // ----------------------------------------------------------------
  // FEATURE 4: LOGIN WITH TOKENS (FOR GOOGLE/INVITE) - ACTIVE REDIRECT
  // ----------------------------------------------------------------
  const loginWithTokens = async (accessToken: string, refreshToken: string) => {
    console.log("🔑 Starting loginWithTokens...");
    setIsLoading(true);

    try {
      // Save tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      console.log("💾 Tokens saved to localStorage");

      // Fetch user info
      const { user: userData, role: userRole } = await fetchAndSetUser();
      console.log("✅ User and role retrieved:", {
        user: userData.email,
        role: userRole,
      });

      // Determine target page
      const targetPage = getTargetDashboard(userRole, userData);
      console.log("🎯 Target page:", targetPage);

      showToast("Login successful!", "success");

      // ✅ IMPORTANT: Active Redirect here
      console.log("🚀 Redirecting to:", targetPage);

      // Use window.location.href instead of router.push to ensure redirect
      window.location.href = targetPage;
    } catch (error: any) {
      console.error("❌ Error loginWithTokens:", error);
      setIsLoading(false); // Only set false on error
      showToast(
        error.response?.data?.message || error.message || "Login failed!",
        "error"
      );
      throw error;
    }
    // ⚠️ DO NOT set isLoading = false here because redirecting
  };

  // ----------------------------------------------------------------
  // FEATURE 5: LOGOUT
  // ----------------------------------------------------------------
  const logout = async () => {
    console.log("🚪 Logging out...");
    setIsLoading(true);

    try {
      await logoutUser();
      setUser(null);
      setRole(null);
      localStorage.clear();
      showToast("Logged out successfully!", "success");
      router.push("/");
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      showToast("Error logging out!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // FEATURE 6: REFRESH USER
  // ----------------------------------------------------------------
  const refreshUser = useCallback(async () => {
    console.log("🔄 Refreshing user...");
    try {
      await fetchAndSetUser();
      showToast("Information updated successfully!", "success");
    } catch (e) {
      console.error("❌ Error refreshing user:", e);
      showToast("Could not update information!", "error");
    }
  }, [fetchAndSetUser, showToast]);

  // ----------------------------------------------------------------
  // FEATURE 7: CHECK PERMISSION
  // ----------------------------------------------------------------
  const hasPermission = (permission: string): boolean => {
    if (!user || !role) return false;

    const permissions: Record<string, string[]> = {
      SYSTEM_ADMIN: ["*"],
      COMPANY_ADMIN: ["company.*", "workspace.*", "project.*"],
      COMPANY_MEMBER: ["workspace.view", "project.view"],
      WORKSPACE_ADMIN: ["workspace.*", "project.*"],
      WORKSPACE_MEMBER: ["project.view"],
      PROJECT_ADMIN: ["project.*"],
      PROJECT_MEMBER: [""],
      USER: [],
      GUEST_PROJECT: ["project.view"],
    };

    const userPermissions = permissions[role] || [];

    if (userPermissions.includes("*")) return true;
    if (userPermissions.includes(permission)) return true;

    return userPermissions.some((p) => {
      if (p.endsWith(".*")) {
        const prefix = p.slice(0, -2);
        return permission.startsWith(prefix + ".");
      }
      return false;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login,
        logout,
        loginWithTokens,
        refreshUser,
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