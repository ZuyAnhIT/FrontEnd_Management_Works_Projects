"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, UserProfile, CompanyMembership } from "@/services/apiUser";
import { loginUser, logoutUser } from "@/services/apiAuth";
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// 1. CONSTANTS & TYPES
// =============================================================================

// Các vai trò trong hệ thống
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

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  selectCompany: (companyId: number) => void;
  hasPermission: (permission: string) => boolean;
}

// Danh sách các trang Public (Không cần Login)
const PUBLIC_ROUTES = [
  "/accept-invitation",
  "/accept-project-invitation",
  "/register-from-invite",
  "/reset-password",
];

// Danh sách các trang Auth (Login/Register) - Nếu đã login thì không được vào lại
const AUTH_ROUTES = ["/", "/login", "/register", "/forgot-password"];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// 2. AUTH PROVIDER COMPONENT
// =============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  // --- STATE ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeCompany, setActiveCompany] = useState<CompanyMembership | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- HOOKS ---
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // =========================================================================
  // 3. CORE LOGIC: SESSION RESTORATION (KHÔI PHỤC PHIÊN)
  // =========================================================================

  /**
   * Tải thông tin user và khôi phục ngữ cảnh công ty (nếu F5 trang)
   */
  const fetchAndSetUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();

      if (userData) {
        // Chuẩn hóa dữ liệu mảng để tránh lỗi undefined
        userData.companyMemberships = Array.isArray(userData.companyMemberships) ? userData.companyMemberships : [];
        userData.workspaceMemberships = Array.isArray(userData.workspaceMemberships) ? userData.workspaceMemberships : [];
        userData.projectMemberships = Array.isArray(userData.projectMemberships) ? userData.projectMemberships : [];

        setUser(userData);

        // Khôi phục công ty đang active từ LocalStorage
        const lastCompanyId = localStorage.getItem("lastActiveCompanyId");

        if (lastCompanyId && userData.companyMemberships.length > 0) {
          const targetId = parseInt(lastCompanyId);
          const targetCompany = userData.companyMemberships.find((c) => c.companyId === targetId);

          if (targetCompany) {
            setActiveCompany(targetCompany);
            setRole(targetCompany.roleCode as AppRole);
          } else {
            // Nếu user không còn trong công ty cũ -> Xóa cache
            localStorage.removeItem("lastActiveCompanyId");
          }
        }
      } else {
        // Token hết hạn hoặc không hợp lệ
        handleSessionExpired();
      }
    } catch (e) {
      console.error("[AuthContext] Failed to fetch user session:", e);
      handleSessionExpired();
    }
  }, []);

  const handleSessionExpired = () => {
    localStorage.clear();
    setUser(null);
    setActiveCompany(null);
    setRole(null);
  };

  // =========================================================================
  // 4. CORE LOGIC: COMPANY SELECTION (CHUYỂN ĐỔI CÔNG TY)
  // =========================================================================

  /**
   * Xử lý khi user chọn một công ty từ Admin Hub
   */
  const handleSelectCompany = useCallback(
    (companyId: number, userData: UserProfile) => {
      const selected = userData.companyMemberships?.find((c) => c.companyId === companyId);

      if (selected) {
        console.info(`[AuthContext] Switching to company: ${selected.companyName}`);

        // 1. Cập nhật State
        setActiveCompany(selected);
        setRole(selected.roleCode as AppRole);

        // 2. Lưu cache
        localStorage.setItem("lastActiveCompanyId", companyId.toString());

        // 3. Điều hướng dựa trên Role (Logic nghiệp vụ cốt lõi)
        switch (selected.roleCode) {
          case "COMPANY_ADMIN":
            router.push("/admin/company/dashboard");
            break;

          case "GUEST":
            router.push("/portal");
            break;

          case "COMPANY_MEMBER":
          default:
            router.push("/core");
            break;
        }
      } else {
        console.warn("[AuthContext] Invalid Company Selection");
        showToast("You are not a member of this company.", "error");
      }
    },
    [router, showToast]
  );

  // =========================================================================
  // 5. EFFECTS: INITIALIZATION & ROUTE GUARD
  // =========================================================================

  // --- INIT AUTH ---
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

  // --- ROUTE PROTECTION (GUARD) ---
  useEffect(() => {
    if (isLoading) return;

    // Kiểm tra loại trang hiện tại
    const isPublicPage = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthPage = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
    // Trang chủ "/" vừa là Auth page (nếu chưa login) vừa là Public
    const isHomePage = pathname === "/"; 

    // CASE A: Chưa đăng nhập
    if (!user) {
      // Nếu cố vào trang Private -> Đá về Login
      if (!isPublicPage && !isAuthPage && !isHomePage) {
        router.push("/");
      }
      return;
    }

    // CASE B: Đã đăng nhập
    // 1. Nếu đang ở trang Auth (Login/Register) -> Vào Admin Hub
    if (isAuthPage || isHomePage) {
      router.push("/admin");
      return;
    }

    // 2. Phân quyền theo Role (Ngăn chặn truy cập trái phép)
    if (role === "GUEST") {
      const isProjectDetail = pathname.includes("/project/");
      const isPortal = pathname.startsWith("/portal");
      const isAdminHub = pathname === "/admin";

      // Guest chỉ được ở Portal hoặc Project Detail
      if (!isProjectDetail && !isPortal && !isAdminHub) {
        router.push("/portal");
      }
    }

    if (role === "COMPANY_MEMBER") {
      // Logic cũ: Chặn Member vào cài đặt công ty (nếu cần)
       if (pathname.startsWith("/admin/company") && !pathname.includes("dashboard")) {
         // router.push("/core");
       }
    }

  }, [user, role, pathname, isLoading, router]);

  // =========================================================================
  // 6. ACTIONS (LOGIN, LOGOUT...)
  // =========================================================================

  const onLoginSuccess = async () => {
    const userData = await getCurrentUser();
    if (!userData) {
      showToast("Failed to retrieve user data.", "error");
      return;
    }
    setUser(userData);
    router.push("/admin");
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginUser({ email, password });
      await onLoginSuccess();
    } catch (error: any) {
      showToast(error.message || "Login failed. Please check your credentials.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithTokens = async (accessToken: string, refreshToken: string) => {
    setIsLoading(true);
    try {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      await onLoginSuccess();
    } catch (error) {
      console.error("[AuthContext] Token login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
    } catch (err) {
      console.warn("[AuthContext] Logout API warning (ignoring).");
    } finally {
      handleSessionExpired();
      showToast("Logged out successfully.", "success");
      router.push("/");
      setIsLoading(false);
    }
  };

  const selectCompany = (companyId: number) => {
    if (user) handleSelectCompany(companyId, user);
  };

  const hasPermission = (permission: string) => {
    if (!role) return false;
    // Logic đơn giản: Admin có full quyền
    return role === "SYSTEM_ADMIN" || role === "COMPANY_ADMIN";
  };

  // =========================================================================
  // 7. RENDER
  // =========================================================================

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}