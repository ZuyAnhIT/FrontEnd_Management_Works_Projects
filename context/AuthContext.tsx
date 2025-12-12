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
  | "GUEST"
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
  "/accept-project-invitation",
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
  // 3️⃣ LOGIC: CHỌN CÔNG TY (ROUTING CONTROLLER)
  // ============================================================
  // Hàm này CHỈ chạy khi người dùng chủ động Click vào 1 công ty ở trang /admin
  const handleSelectCompany = useCallback((companyId: number, userData: UserProfile) => {
    // Tìm xem user có thuộc công ty này không
    const selected = userData.companyMemberships?.find(c => c.companyId === companyId);

    if (selected) {
      console.log(`🏢 [AuthContext] Switched context to: ${selected.companyName} (${selected.roleCode})`);

      // Cập nhật State Active
      setActiveCompany(selected);
      setRole(selected.roleCode as AppRole);

      // Lưu ID công ty vào LocalStorage (để F5 không bị mất)
      localStorage.setItem("lastActiveCompanyId", companyId.toString());

      // 🔥 PHÂN LUỒNG DỰA TRÊN ROLE (CORE ROUTING LOGIC)
      switch (selected.roleCode) {
        case "COMPANY_ADMIN":
          // 1. Admin -> Trang quản trị công ty
          router.push("/admin/company/dashboard");
          break;
        
        case "GUEST":
          // 2. Guest -> Trang danh sách dự án (Portal)
          router.push("/portal");
          break;

        case "COMPANY_MEMBER":
        default:
          // 3. Member -> Trang danh sách phòng ban (Core)
          router.push("/core"); 
          break;
      }

    } else {
      console.error("❌ [AuthContext] Invalid Company ID");
      showToast("You are not a member of this company", "error");
    }
  }, [router, showToast]);

  // ============================================================
  // 4️⃣ LOGIC: KHÔI PHỤC PHIÊN (RESTORE SESSION ON RELOAD)
  // ============================================================
  // Hàm này chạy khi F5 để lấy lại user và active company cũ (nếu đang ở trang trong)
  const fetchAndSetUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();

      if (userData) {
        // Đảm bảo là mảng
        if (!Array.isArray(userData.companyMemberships)) {
          userData.companyMemberships = [];
        }

        setUser(userData);

        // Restore company context (Giữ nguyên trang hiện tại nếu F5)
        const lastCompanyId = localStorage.getItem("lastActiveCompanyId");
        
        if (lastCompanyId && userData.companyMemberships.length > 0) {
          const targetId = parseInt(lastCompanyId);
          const targetCompany = userData.companyMemberships.find(c => c.companyId === targetId);

          if (targetCompany) {
            setActiveCompany(targetCompany);
            setRole(targetCompany.roleCode as AppRole);
          } else {
            // Nếu user bị kick khỏi công ty cũ -> Xóa cache
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
  // 5️⃣ INIT AUTH (CHẠY 1 LẦN KHI APP START)
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
  // 6️⃣ LOGIN SUCCESS HANDLER
  // ============================================================
  // Hàm này chạy sau khi login thành công
  const processLoginSuccess = async () => {
    // Gọi lại API lấy user mới nhất
    const userData = await getCurrentUser();

    if (!userData) {
      showToast("Cannot load user data.", "error");
      return;
    }
    
    setUser(userData);

    // ✅ QUAN TRỌNG: Luôn đưa về HUB (/admin) sau khi Login thành công
    // Để người dùng tự chọn nơi họ muốn đến (Admin/Core/Portal)
    router.push("/admin");
  };


  // ============================================================
  // 7️⃣ CÁC HÀM ACTIONS (LOGIN, LOGOUT...)
  // ============================================================

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginUser({ email, password });
      await processLoginSuccess(); // Redirect to /admin
    } catch (error: any) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithTokens = async (accessToken: string, refreshToken: string) => {
    setIsLoading(true);
    try {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      await processLoginSuccess(); // Redirect to /admin
    } catch (error) {
      console.error(error);
    } finally {
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
  // 8️⃣ ROUTE PROTECTION (GUARD)
  // ============================================================
  useEffect(() => {
    if (isLoading) return; // Đợi loading xong mới check

    const isPublicPage = PUBLIC_PAGES.some((p) => pathname.startsWith(p));
    const isAuthPage = pathname === "/" || pathname.startsWith("/(auth)");

    // --- A. CHƯA LOGIN ---
    // Nếu chưa login mà vào trang Private -> Đá về Home
    if (!user) {
      if (!isPublicPage && !isAuthPage) {
        router.push("/");
      }
      return;
    }

    // --- B. ĐÃ LOGIN ---
    
    // 1. Nếu đang ở trang Login/Register/Home -> Đá vào HUB (/admin)
    if (isAuthPage) {
      router.push("/admin");
      return;
    }

    // 2. Bảo vệ Route theo Role (Ngăn chặn truy cập chéo)
    
    // GUEST: Không được vào trang Admin Company, không được vào Core (Workspace list)
    // Guest chỉ được phép ở /portal (Project List) hoặc trang chi tiết Project (/project/...)
    if (role === "GUEST") {
        const isProjectDetail = pathname.includes("/project/");
        const isPortal = pathname.startsWith("/portal");
        
        // Nếu cố tình vào các trang khác (kể cả /admin/company) -> Đá về Portal
        // Ngoại trừ trang /admin (Hub) để chọn công ty khác
        if (!isProjectDetail && !isPortal && pathname !== "/admin") {
            router.push("/portal");
        }
    }

    // MEMBER: Không được vào trang Admin Company (trừ dashboard chung nếu cho phép)
    if (role === "COMPANY_MEMBER") {
        if (pathname.startsWith("/admin/company") && !pathname.includes("dashboard")) { 
             // Logic tùy chỉnh: Có thể cho member xem dashboard, nhưng chặn settings/billing
             // router.push("/core");
        }
    }

  }, [user, role, pathname, isLoading, router, showToast]);

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