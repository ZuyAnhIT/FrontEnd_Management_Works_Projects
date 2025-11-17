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

// Định nghĩa kiểu User chi tiết
interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  systemRoles: string[];
  company: {
    companyId: number;
    roleCode: string;
  } | null;
  workspaces: {
    workspaceId: number;
    roleCode: string;
  }[];
  projects?: {
    projectId: number;
    projectName: string;
    workspaceId: number;
    roleCode: string;
  }[];
}

// Vai trò tổng hợp
type AppRole =
  | "SYSTEM_ADMIN"
  | "COMPANY_ADMIN"
  | "COMPANY_MEMBER"
  | "WORKSPACE_ADMIN"
  | "WORKSPACE_MEMBER"
  |  "PROJECT_ADMIN"
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
  // HÀM HELPER 1: XÁC ĐỊNH VAI TRÒ
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
    }else if (user.projects?.some((p) => p.roleCode === "PROJECT_MEMBER")) {
      mainRole = "PROJECT_MEMBER";
    }

    console.log("🎯 Vai trò được xác định:", mainRole);
    return mainRole;
  }, []);

  // ----------------------------------------------------------------
  // HÀM HELPER 2: LẤY TARGET DASHBOARD THEO ROLE
  // ----------------------------------------------------------------
  const getTargetDashboard = useCallback(
    (userRole: AppRole, userData: User): string => {
      if (!userRole) return "/core";

      // Kiểm tra nếu user cần onboarding
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
  // HÀM HELPER 3: LẤY VÀ SET USER
  // ----------------------------------------------------------------
  const fetchAndSetUser = useCallback(async () => {
    console.log("🔄 Bắt đầu fetchAndSetUser...");
    try {
      const data = await getCurrentUser();
      if (data) {
        const mainRole = determineRole(data);

        setUser(data);
        setRole(mainRole);
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("userRole", mainRole);

        console.log("✅ User và role đã được set:", {
          user: data.email,
          role: mainRole,
        });
        return { user: data, role: mainRole };
      } else {
        throw new Error("Invalid user data");
      }
    } catch (e) {
      console.error("❌ Lỗi fetchAndSetUser:", e);
      setUser(null);
      setRole(null);
      localStorage.clear();
      throw e;
    }
  }, [determineRole]);

  // ----------------------------------------------------------------
  // CHỨC NĂNG 1: TỰ ĐỘNG KIỂM TRA ĐĂNG NHẬP KHI TẢI LẠI TRANG
  // ----------------------------------------------------------------
  useEffect(() => {
    const checkLogin = async () => {
      console.log("🔍 Kiểm tra auth khi load trang...");
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          await fetchAndSetUser();
        } catch (e) {
          console.error("❌ Auth check failed, logging out:", e);
          router.push("/");
        }
      } else {
        console.log("⚠️ Không có token, bỏ qua auth check");
      }

      setIsLoading(false);
      console.log("✅ Auth check hoàn tất, isLoading = false");
    };

    checkLogin();
  }, [fetchAndSetUser, router]);

  // ----------------------------------------------------------------
  // CHỨC NĂNG 2: LOGIC BẢO VỆ (GUARD) - CHỈ BẢO VỆ, KHÔNG REDIRECT SAU LOGIN
  // ----------------------------------------------------------------
  useEffect(() => {
    console.log("🛡️ Guard effect triggered:", {
      isLoading,
      user: user?.email,
      role,
      pathname,
    });

    if (isLoading) {
      console.log("⏳ isLoading = true, bỏ qua guard");
      return;
    }

    const isPublic = PUBLIC_PAGES.some((p) => pathname.startsWith(p));
    console.log("📍 Trang hiện tại public?", isPublic);

    if (user && role) {
      const isOnboardingPage = pathname.startsWith("/create-company");
      const needsOnboarding =
        role === "USER" &&
        !user.company &&
        (!user.workspaces || user.workspaces.length === 0);

      console.log("👤 User đã đăng nhập:", {
        role,
        needsOnboarding,
        isOnboardingPage,
        pathname,
      });

      // 1. ÉP BUỘC ONBOARDING (CHỈ KHI ĐANG Ở TRANG KHÁC)
      if (
        needsOnboarding &&
        !isOnboardingPage &&
        !pathname.startsWith("/(auth)")
      ) {
        console.log("🚀 Guard: Redirect → /create-company (onboarding)");
        showToast("Chào mừng! Vui lòng tạo công ty để bắt đầu.", "info");
        router.push("/create-company");
        return;
      }

      // 2. BẢO VỆ ADMIN (CHỈ CHẶN, KHÔNG REDIRECT)
      if (
        pathname.startsWith("/admin") &&
        role !== "COMPANY_ADMIN" &&
        role !== "COMPANY_MEMBER"
      ) {
        console.log("🚫 Guard: Không có quyền truy cập /admin");
        showToast("Bạn không có quyền truy cập trang Admin", "error");
        router.push("/core");
      }
    } else if (!isPublic) {
      // 3. CHƯA ĐĂNG NHẬP
      console.log("🚀 Guard: Redirect → / (chưa auth)");
      showToast("Vui lòng đăng nhập để tiếp tục", "warning");
      router.push("/");
    }
  }, [isLoading, user, role, pathname, router, showToast]);

  // ----------------------------------------------------------------
  // CHỨC NĂNG 3: HÀM LOGIN (CHO MODAL) - REDIRECT CHỦ ĐỘNG
  // ----------------------------------------------------------------
  const login = async (email: string, password: string) => {
    console.log("🔑 Bắt đầu login...");
    setIsLoading(true);

    try {
      const res = await loginUser({ email, password });

      if (!res?.data?.accessToken) {
        throw new Error(res.message || "Đăng nhập thất bại!");
      }

      // Lưu tokens
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      console.log("💾 Đã lưu tokens vào localStorage");

      // Lấy thông tin user
      const { user: userData, role: userRole } = await fetchAndSetUser();
      console.log("✅ Đã lấy user và role:", {
        user: userData.email,
        role: userRole,
      });

      // Xác định trang đích
      const targetPage = getTargetDashboard(userRole, userData);
      console.log("🎯 Target page:", targetPage);

      showToast("Đăng nhập thành công!", "success");

      // ✅ QUAN TRỌNG: Redirect CHỦ ĐỘNG ngay tại đây
      console.log("🚀 Đang redirect đến:", targetPage);

      // Dùng window.location.href thay vì router.push để đảm bảo redirect
      window.location.href = targetPage;
    } catch (error: any) {
      console.error("❌ Lỗi login:", error);
      setIsLoading(false); // Chỉ set false khi có lỗi
      showToast(
        error.response?.data?.message || error.message || "Đăng nhập thất bại!",
        "error"
      );
      throw error;
    }
    // ⚠️ KHÔNG set isLoading = false ở đây vì đang redirect
  };

  // ----------------------------------------------------------------
  // CHỨC NĂNG 4: HÀM LOGIN WITH TOKENS (CHO GOOGLE/INVITE) - REDIRECT CHỦ ĐỘNG
  // ----------------------------------------------------------------
  const loginWithTokens = async (accessToken: string, refreshToken: string) => {
    console.log("🔑 Bắt đầu loginWithTokens...");
    setIsLoading(true);

    try {
      // Lưu tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      console.log("💾 Đã lưu tokens vào localStorage");

      // Lấy thông tin user
      const { user: userData, role: userRole } = await fetchAndSetUser();
      console.log("✅ Đã lấy user và role:", {
        user: userData.email,
        role: userRole,
      });

      // Xác định trang đích
      const targetPage = getTargetDashboard(userRole, userData);
      console.log("🎯 Target page:", targetPage);

      showToast("Đăng nhập thành công!", "success");

      // ✅ QUAN TRỌNG: Redirect CHỦ ĐỘNG ngay tại đây
      console.log("🚀 Đang redirect đến:", targetPage);

      // Dùng window.location.href thay vì router.push để đảm bảo redirect
      window.location.href = targetPage;
    } catch (error: any) {
      console.error("❌ Lỗi loginWithTokens:", error);
      setIsLoading(false); // Chỉ set false khi có lỗi
      showToast(
        error.response?.data?.message || error.message || "Đăng nhập thất bại!",
        "error"
      );
      throw error;
    }
    // ⚠️ KHÔNG set isLoading = false ở đây vì đang redirect
  };

  // ----------------------------------------------------------------
  // CHỨC NĂNG 5: LOGOUT
  // ----------------------------------------------------------------
  const logout = async () => {
    console.log("🚪 Đăng xuất...");
    setIsLoading(true);

    try {
      await logoutUser();
      setUser(null);
      setRole(null);
      localStorage.clear();
      showToast("Đăng xuất thành công!", "success");
      router.push("/");
    } catch (error: any) {
      console.error("❌ Lỗi logout:", error);
      showToast("Lỗi khi đăng xuất!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // CHỨC NĂNG 6: REFRESH USER
  // ----------------------------------------------------------------
  const refreshUser = useCallback(async () => {
    console.log("🔄 Refresh user...");
    try {
      await fetchAndSetUser();
      showToast("Cập nhật thông tin thành công!", "success");
    } catch (e) {
      console.error("❌ Lỗi refresh user:", e);
      showToast("Không thể cập nhật thông tin!", "error");
    }
  }, [fetchAndSetUser, showToast]);

  // ----------------------------------------------------------------
  // CHỨC NĂNG 7: CHECK PERMISSION
  // ----------------------------------------------------------------
  const hasPermission = (permission: string): boolean => {
    if (!user || !role) return false;

    const permissions: Record<string, string[]> = {
      SYSTEM_ADMIN: ["*"],
      COMPANY_ADMIN: ["company.*", "workspace.*", "project.*"],
      COMPANY_MEMBER: ["workspace.view", "project.view"],
      WORKSPACE_ADMIN: ["workspace.*", "project.*"],
      WORKSPACE_MEMBER: ["project.view"],
      PROJECT_ADMIN: [ "project.*"],
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
