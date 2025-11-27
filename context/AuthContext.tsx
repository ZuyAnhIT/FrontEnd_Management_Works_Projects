"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { getCurrentUser, UserProfile, CompanyMembership } from "@/services/apiUser";
import { loginUser, logoutUser } from "@/services/apiAuth";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

// ============================================================
// 1️⃣ ĐỊNH NGHĨA TYPE & INTERFACE
// ============================================================

// Các vai trò trong hệ thống Frontend
type AppRole =
  | "SYSTEM_ADMIN"
  | "COMPANY_ADMIN"
  | "COMPANY_MEMBER"
  | "WORKSPACE_ADMIN"
  | "WORKSPACE_MEMBER"
  | "PROJECT_ADMIN"
  | "PROJECT_MEMBER"
  | "USER" // User mới, chưa thuộc công ty nào
  | null;

interface AuthContextType {
  user: UserProfile | null;
  activeCompany: CompanyMembership | null; // Công ty đang được chọn
  role: AppRole;                           // Vai trò trong công ty đang chọn
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  selectCompany: (companyId: number) => void; // Hàm chuyển đổi công ty
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Danh sách các trang Public (Không cần Login)
const PUBLIC_PAGES = [
  "/",
  "/accept-invitation",
  "/register-from-invite",
  "/reset-password",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  // ============================================================
  // 2️⃣ STATE MANAGEMENT
  // ============================================================
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeCompany, setActiveCompany] = useState<CompanyMembership | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // ============================================================
  // 3️⃣ LOGIC: CHỌN CÔNG TY (SWITCH CONTEXT)
  // ============================================================
  const handleSelectCompany = useCallback((companyId: number, userData: UserProfile) => {
    // Tìm xem user có thuộc công ty này không
    const selected = userData.companyMemberships?.find(c => c.companyId === companyId);

    if (selected) {
      console.log(`🏢 [AuthContext] Switched context to: ${selected.companyName}`);

      // Cập nhật State Active
      setActiveCompany(selected);
      setRole(selected.roleCode as AppRole);

      // Lưu ID công ty vào LocalStorage (để F5 không bị mất)
      localStorage.setItem("lastActiveCompanyId", companyId.toString());

      // Điều hướng thông minh dựa trên Role
      if (selected.roleCode === "COMPANY_ADMIN") {
        // Admin thì vào Dashboard quản trị
        router.push("/admin/company/dashboard");
      } else {
        // Member thì vào khu vực làm việc Core
        router.push("/core/dashboard");
      }
    } else {
      console.error("❌ [AuthContext] Invalid Company ID");
      showToast("You are not a member of this company", "error");
    }
  }, [router, showToast]);

  // ============================================================
  // 4️⃣ LOGIC: LẤY USER & KHÔI PHỤC PHIÊN (RESTORE SESSION)
  // ============================================================
  const fetchAndSetUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();

      if (userData) {
        // Đảm bảo là mảng
        if (!Array.isArray(userData.companyMemberships)) {
          userData.companyMemberships = [];
        }

        setUser(userData);

        // Restore company context
        const lastCompanyId = localStorage.getItem("lastActiveCompanyId");
        const memberships = userData.companyMemberships;

        if (lastCompanyId && memberships.length > 0) {
          const targetId = parseInt(lastCompanyId);
          const targetCompany = memberships.find(c => c.companyId === targetId);

          if (targetCompany) {
            setActiveCompany(targetCompany);
            setRole(targetCompany.roleCode as AppRole);
          } else {
            localStorage.removeItem("lastActiveCompanyId");
          }
        }
      }
    } catch (e) {
      console.error("❌ [AuthContext] Fetch user failed:", e);
      localStorage.clear();
      setUser(null);
    }
  }, []);


  // ============================================================
  // 5️⃣ EFFECT: CHẠY KHI LOAD TRANG (CHECK TOKEN)
  // ============================================================
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await fetchAndSetUser();
      }
      setIsLoading(false); // Loading xong
    };
    initAuth();
  }, [fetchAndSetUser]);

  // ============================================================
  // 6️⃣ LOGIC: XỬ LÝ ĐIỀU HƯỚNG SAU KHI LOGIN (QUAN TRỌNG)
  // ============================================================
  const processLoginSuccess = async () => {
    await fetchAndSetUser();

    const userData = user;
    if (!userData) {
      showToast("Cannot load user data.", "error");
      return;
    }

    const memberships = userData.companyMemberships || [];

    showToast(`Memberships found: ${memberships.length}`, "info");

    // CASE 1: User chưa thuộc công ty nào
    if (memberships.length === 0) {
      showToast("Welcome! Please set up your company to continue.", "info");
      setRole("USER");
      router.push("/admin");
      return;
    }

    // CASE 2: User thuộc đúng 1 công ty
    if (memberships.length === 1) {
      showToast(`Switched to company: ${memberships[0].companyName}`, "success");
      handleSelectCompany(memberships[0].companyId, userData);
      return;
    }

    // CASE 3: User thuộc nhiều công ty
    if (memberships.length > 1) {
      showToast("Select a company to continue.", "info");
      router.push("/admin");
      return;
    }
  };


  // ============================================================
  // 7️⃣ CÁC HÀM ACTIONS (LOGIN, LOGOUT...)
  // ============================================================

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginUser({ email, password });
      showToast("Login successful!", "success");
      await processLoginSuccess();
    } catch (error: any) {
      showToast(error.message || "Login failed", "error");
    } finally {
      // ✅ FIX: Luôn tắt loading dù thành công hay thất bại để tránh treo UI
      setIsLoading(false);
    }
  };

  const loginWithTokens = async (accessToken: string, refreshToken: string) => {
    setIsLoading(true);
    try {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      showToast("Login successful!", "success");
      await processLoginSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      // ✅ FIX: Luôn tắt loading
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
    } catch (err) {
      // Ignore logout api error
    } finally {
      setUser(null);
      setActiveCompany(null);
      setRole(null);
      localStorage.clear();
      showToast("Logged out", "success");
      router.push("/");
      setIsLoading(false);
    }
  };

  const selectCompany = (companyId: number) => {
    if (user) handleSelectCompany(companyId, user);
  };

  const hasPermission = (permission: string) => {
    if (!role) return false;
    if (role === "SYSTEM_ADMIN" || role === "COMPANY_ADMIN") return true;
    return false;
  };

  // ============================================================
  // 8️⃣ GUARD LOGIC (BẢO VỆ ROUTE)
  // ============================================================
  useEffect(() => {
    if (isLoading) return; // Đợi loading xong mới check

    const isPublicPage = PUBLIC_PAGES.some((p) => pathname.startsWith(p));
    const isAuthPage = pathname.startsWith("/(auth)") || pathname === "/";

    // --- A. CHƯA LOGIN ---
    if (!user) {
      if (!isPublicPage && !isAuthPage) {
        // Cố truy cập trang kín -> Đá về Home
        router.push("/");
      }
      return;
    }

    // --- B. ĐÃ LOGIN ---
    const memberships = user.companyMemberships || [];

    // 1. Nếu đang ở trang Login/Register/Home (Auth Pages)
    // -> Phải điều hướng vào trong ứng dụng
    if (isAuthPage) {
      if (memberships.length === 0) {
        // Chưa có công ty -> Vào Admin Hub để tạo
        router.push("/admin");
      }
      else if (memberships.length === 1) {
        // 1 công ty -> Auto vào Dashboard
        handleSelectCompany(memberships[0].companyId, user);
      }
      else {
        // >1 công ty -> Vào Admin Hub để chọn
        router.push("/admin");
      }
      return;
    }

    // 2. Bảo vệ các trang Admin sâu (Ví dụ: /admin/company/billing...)
    // Trang "/admin" (Hub) thì ai login rồi cũng được vào.
    // Chỉ chặn các trang con "/admin/..."
    if (pathname.startsWith("/admin/") && pathname !== "/admin") {
      if (role !== "COMPANY_ADMIN") {
        showToast("Access denied. Company Admin only.", "error");
        router.push("/core/dashboard");
      }
    }

  }, [user, role, pathname, isLoading, router, showToast, handleSelectCompany]);

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}