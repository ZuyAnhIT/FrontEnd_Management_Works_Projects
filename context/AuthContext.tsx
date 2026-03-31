"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";

// Internal Services & Types
import { getCurrentUser, UserProfile, CompanyMembership } from "@/services/apiUser";
import { loginUser, logoutUser } from "@/services/apiAuth";
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// INTERFACES & CONSTANTS
// =============================================================================

export type AppRole =
  | "SYSTEM_ADMIN"
  | "COMPANY_ADMIN"
  | "COMPANY_MEMBER"
  | "WORKSPACE_ADMIN"
  | "WORKSPACE_MEMBER"
  | "PROJECT_ADMIN"
  | "PROJECT_MEMBER"
  | "GUEST"
  | "USER"
  | null;

interface AuthContextType {
  user: UserProfile | null;
  activeCompany: CompanyMembership | null;
  role: AppRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  selectCompany: (companyId: number) => void;
  hasPermission: (permission: string) => boolean;
}

// Danh sách các đường dẫn công khai (không yêu cầu đăng nhập)
const PUBLIC_ROUTES = [
  "/accept-invitation",
  "/accept-project-invitation",
  "/register-from-invite",
  "/reset-password",
];

// Danh sách các đường dẫn xác thực (đã đăng nhập thì không truy cập lại)
const AUTH_ROUTES = ["/", "/login", "/register", "/forgot-password"];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// AUTH PROVIDER COMPONENT
// =============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  // ---------------------------------------------------------------------------
  // 1. STATE & VARIABLES
  // ---------------------------------------------------------------------------
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeCompany, setActiveCompany] = useState<CompanyMembership | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // 2. HOOKS
  // ---------------------------------------------------------------------------
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // ---------------------------------------------------------------------------
  // 3. INTERNAL HANDLERS (PRIVATE)
  // ---------------------------------------------------------------------------

  /**
   * Làm sạch dữ liệu phiên làm việc khi hết hạn hoặc đăng xuất
   */
  const handleSessionExpired = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setActiveCompany(null);
    setRole(null);
  }, []);

  /**
   * Tải và thiết lập thông tin người dùng từ server
   */
  const fetchAndSetUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();

      if (userData) {
        // Đảm bảo các mảng dữ liệu luôn tồn tại để tránh lỗi truy cập
        userData.companyMemberships = Array.isArray(userData.companyMemberships) ? userData.companyMemberships : [];
        userData.workspaceMemberships = Array.isArray(userData.workspaceMemberships) ? userData.workspaceMemberships : [];
        userData.projectMemberships = Array.isArray(userData.projectMemberships) ? userData.projectMemberships : [];

        setUser(userData);

        // Khôi phục trạng thái công ty đang hoạt động từ bộ nhớ cục bộ
        const lastCompanyId = localStorage.getItem("lastActiveCompanyId");

        if (lastCompanyId && userData.companyMemberships.length > 0) {
          const targetId = parseInt(lastCompanyId);
          const targetCompany = userData.companyMemberships.find((c) => c.companyId === targetId);

          if (targetCompany) {
            setActiveCompany(targetCompany);
            setRole(targetCompany.roleCode as AppRole);
            localStorage.setItem("current_company_id", targetId.toString());
          } else {
            localStorage.removeItem("lastActiveCompanyId");
          }
        }
      } else {
        handleSessionExpired();
      }
    } catch (e) {
      console.error("[Auth Service] Failed to restore session:", e);
      handleSessionExpired();
    }
  }, [handleSessionExpired]);

  /**
   * Xử lý sau khi đăng nhập thành công
   */
  const handleLoginSuccess = async () => {
    const userData = await getCurrentUser();
    if (!userData) {
      showToast("Failed to retrieve user data", "error");
      return;
    }
    
    setUser(userData);
    
    // Điều hướng dựa trên vai trò hệ thống cao nhất
    if (userData.systemRoles?.includes("SYSTEM_ADMIN")) {
      router.push("/super-admin");
    } else {
      router.push("/admin");
    }
  };

  /**
   * Xử lý logic chuyển đổi ngữ cảnh công ty
   */
  const handleSelectCompany = useCallback(
    (companyId: number, userData: UserProfile) => {
      const selected = userData.companyMemberships?.find((c) => c.companyId === companyId);

      if (selected) {
        setActiveCompany(selected);
        setRole(selected.roleCode as AppRole);

        localStorage.setItem("lastActiveCompanyId", companyId.toString());
        localStorage.setItem("current_company_id", companyId.toString());
        
        // Điều hướng dựa trên vai trò trong công ty
        switch (selected.roleCode) {
          case "COMPANY_ADMIN":
            router.push("/admin/company/dashboard");
            break;
          case "GUEST":
            router.push("/portal");
            break;
          default:
            router.push("/core");
            break;
        }
      } else {
        showToast("You are not a member of this company", "error");
      }
    },
    [router, showToast]
  );

  // ---------------------------------------------------------------------------
  // 4. PUBLIC ACTIONS
  // ---------------------------------------------------------------------------

  /**
   * Đăng nhập bằng Email và Mật khẩu
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginUser({ email, password });
      await handleLoginSuccess();
    } catch (error: any) {
      // Ưu tiên hiển thị lỗi từ Backend
      const errorMessage = error.message || "Login failed. Please check your credentials";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Đăng nhập thông qua token (OAuth hoặc khôi phục phiên)
   */
  const loginWithTokens = async (accessToken: string, refreshToken: string) => {
    setIsLoading(true);
    try {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      await handleLoginSuccess();
    } catch (error: any) {
      console.error("[Auth Service] Token login failed:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Đăng xuất khỏi hệ thống
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
    } catch (err: any) {
      console.warn("[Auth Service] Logout request failed, proceeding with client cleanup");
    } finally {
      handleSessionExpired();
      showToast("Logged out successfully", "success");
      router.push("/");
      setIsLoading(false);
    }
  };

  /**
   * Chọn công ty để làm việc
   */
  const selectCompany = (companyId: number) => {
    if (user) handleSelectCompany(companyId, user);
  };

  /**
   * Kiểm tra quyền hạn của người dùng
   */
  const hasPermission = (permission: string) => {
    if (!role) return false;
    // Hiện tại Admin có toàn quyền truy cập
    return role === "SYSTEM_ADMIN" || role === "COMPANY_ADMIN";
  };

  // ---------------------------------------------------------------------------
  // 5. EFFECTS & ROUTE GUARDS
  // ---------------------------------------------------------------------------

  // Khởi tạo trạng thái xác thực khi tải trang
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await fetchAndSetUser();
      }
      setIsLoading(false);
    };
    initAuth();
  }, [fetchAndSetUser]);

  // Kiểm soát quyền truy cập các tuyến đường (Route Guard)
  useEffect(() => {
    if (isLoading) return;

    const isPublicPage = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthPage = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
    const isHomePage = pathname === "/"; 
    const isSuperAdminPage = pathname.startsWith("/super-admin");

    // Xử lý khi người dùng chưa đăng nhập
    if (!user) {
      if (!isPublicPage && !isAuthPage && !isHomePage) {
        router.push("/");
      }
      return;
    }

    // Xử lý khi người dùng đã đăng nhập
    const isSystemAdmin = user.systemRoles?.includes("SYSTEM_ADMIN");

    // Chặn quay lại trang đăng nhập/trang chủ
    if (isAuthPage || isHomePage) {
      if (isSystemAdmin) {
        router.push("/super-admin");
      } else {
        router.push("/admin");
      }
      return;
    }

    // Bảo vệ vùng Super Admin
    if (isSuperAdminPage && !isSystemAdmin) {
      showToast("Access Denied. Insufficient permissions", "error");
      router.push("/admin");
      return;
    }

    // Kiểm soát quyền truy cập theo vai trò trong công ty
    if (role === "GUEST") {
      const isProjectDetail = pathname.includes("/project/");
      const isPortal = pathname.startsWith("/portal");
      const isAdminHub = pathname === "/admin";

      if (!isProjectDetail && !isPortal && !isAdminHub) {
        router.push("/portal");
      }
    }

  }, [user, role, pathname, isLoading, router, showToast]);

  // ---------------------------------------------------------------------------
  // 6. RENDER
  // ---------------------------------------------------------------------------
  const contextValue = useMemo(() => ({
    user,
    role,
    activeCompany,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithTokens,
    logout,
    refreshUser: fetchAndSetUser,
    selectCompany,
    hasPermission,
  }), [user, role, activeCompany, isLoading, fetchAndSetUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook sử dụng thông tin xác thực trên toàn hệ thống
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}