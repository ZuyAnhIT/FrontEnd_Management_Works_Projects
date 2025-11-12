"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback, // ✅ Import
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

// ✅ Import đúng từ services
// ⛔️ SỬA LỖI: Đảm bảo bạn import từ /services/
import { getCurrentUser } from "@/services/apiUser";
import { loginUser, logoutUser } from "@/services/apiAuth";

// ============================================================
// 1️⃣ Định nghĩa kiểu User đồng bộ với API thật
// ============================================================
export interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  status?: string | null;
  systemRoles: string[] | null;
  company: {
    companyId: number | null;
    roleCode: string | null;
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

// ============================================================
// 2️⃣ Định nghĩa vai trò ứng dụng
// ============================================================
type AppRole =
  | "SYSTEM_ADMIN"
  | "COMPANY_ADMIN"
  | "COMPANY_MEMBER"
  | "WORKSPACE_ADMIN"
  | "WORKSPACE_MEMBER"
  | "USER" // (Gói thường, chưa có công ty)
  | "GUEST_PROJECT"
  | null;

// ============================================================
// 3️⃣ Interface Context
// ============================================================
interface AuthContextType {
  user: User | null;
  role: AppRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // ✅ HÀM MỚI
  hasPermission: (permission: string) => boolean;
}

// ============================================================
// 4️⃣ Tạo Context
// ============================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PAGES = [
  "/",
  "/(auth)/log-in-out",
  "/accept-invitation",
  "/register-from-invite",
  "/create-company", // ✅ Thêm trang onboarding
];

const ROLE_DASHBOARDS: Record<string, string> = {
  SYSTEM_ADMIN: "/adminss/dashboard",
  COMPANY_ADMIN: "/admin",
  COMPANY_MEMBER: "/admin",
  WORKSPACE_ADMIN: "/core",
  WORKSPACE_MEMBER: "/core",
  USER: "/create-company", // ✅ SỬA LỖI: USER mới phải vào trang TẠO CÔNG TY
  GUEST_PROJECT: "/projects",
};

// ============================================================
// 5️⃣ Provider Component
// ============================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // ============================================================
  // 🧩 Helper: Xác định vai trò chính
  // ============================================================
  const determineRole = (user: User): AppRole => {
    if (user.systemRoles?.includes("SYSTEM_ADMIN")) return "SYSTEM_ADMIN";
    if (user.company?.roleCode === "COMPANY_ADMIN") return "COMPANY_ADMIN";
    if (user.workspaces?.some((w) => w.roleCode === "WORKSPACE_ADMIN"))
      return "WORKSPACE_ADMIN";
    if (user.company?.roleCode === "COMPANY_MEMBER") return "COMPANY_MEMBER";
    if (user.workspaces?.some((w) => w.roleCode === "WORKSPACE_MEMBER"))
      return "WORKSPACE_MEMBER";
    return "USER"; // Mặc định là user mới
  };

  // ============================================================
  // 🧩 Helper: Chuẩn hóa dữ liệu user (Giữ nguyên)
  // ============================================================
  const normalizeUser = (rawUser: any): User => ({
    // ... (logic chuẩn hóa của bạn)
    ...rawUser,
    avatarUrl: rawUser.avatarUrl ?? "",
    systemRoles: Array.isArray(rawUser.systemRoles)
      ? rawUser.systemRoles
      : rawUser.systemRoles
      ? [rawUser.systemRoles]
      : [],
    company: rawUser.company ?? null,
    workspaces: rawUser.workspaces ?? [],
    projects: rawUser.projects ?? [],
  });

  // ============================================================
  // 🧩 Helper: Tải và Set User (Tách ra để tái sử dụng)
  // ============================================================
  const fetchAndSetUser = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      const userNormalized = normalizeUser(data);
      const mainRole = determineRole(userNormalized);

      setUser(userNormalized);
      setRole(mainRole);
      localStorage.setItem("user", JSON.stringify(userNormalized));
      localStorage.setItem("userRole", mainRole ?? "");

      return { user: userNormalized, role: mainRole }; // Trả về
    } catch (e) {
      // Token hỏng
      setUser(null);
      setRole(null);
      localStorage.clear();
      throw e; // Ném lỗi để các hàm khác bắt
    }
  }, []); // Thêm mảng dependency trống

  // ============================================================
  // 🧩 Tự động kiểm tra trạng thái đăng nhập
  // ============================================================
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        await fetchAndSetUser();
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/(auth)/log-in-out");
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, [fetchAndSetUser, router]); // Chỉ chạy 1 lần

  // ============================================================
  // 🧩 Guard: Bảo vệ route VÀ Xử lý Onboarding
  // ============================================================
  useEffect(() => {
    if (isLoading) return; // Chờ checkLogin xong

    const isPublic = PUBLIC_PAGES.some((p) => pathname.startsWith(p));

    // 1. ĐÃ ĐĂNG NHẬP
    if (user && role) {
      const isOnboardingPage = pathname.startsWith("/create-company");

      // ✅ LOGIC ONBOARDING (ƯU TIÊN HÀNG ĐẦU)
      const needsOnboarding =
        role === "USER" &&
        !user.company &&
        (!user.workspaces || user.workspaces.length === 0);

      if (needsOnboarding && !isOnboardingPage) {
        // Ép buộc user phải tạo công ty
        showToast("Chào mừng! Vui lòng tạo công ty để bắt đầu.", "info");
        router.push("/create-company");
        return; // Dừng logic
      }

      if (!needsOnboarding && isOnboardingPage) {
        // Đã có công ty/role, cấm vào lại trang tạo
        router.push(ROLE_DASHBOARDS[role] || "/core");
        return; // Dừng logic
      }

      // Đã đăng nhập nhưng vào trang auth
      if (pathname.startsWith("/(auth)/log-in-out")) {
        router.push(ROLE_DASHBOARDS[role] || "/core");
        return; // Dừng logic
      }

      // Logic bảo vệ /admin
      if (
        pathname.startsWith("/admin") &&
        role !== "COMPANY_ADMIN" &&
        role !== "COMPANY_MEMBER"
      ) {
        showToast("Bạn không có quyền truy cập trang Admin", "error");
        router.push("/core");
      }

      // 2. CHƯA ĐĂNG NHẬP
    } else if (!isPublic) {
      // Cố vào trang cần bảo vệ
      showToast("Vui lòng đăng nhập để tiếp tục", "warning");
      router.push("/(auth)/log-in-out");
    }
  }, [isLoading, user, role, pathname, router, showToast]); // Chạy mỗi khi state thay đổi

  // ============================================================
  // 🧩 Helper: Xử lý đăng nhập (dùng cho email/password + token)
  // ============================================================
  const performLogin = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    // Tải, chuẩn hóa, set state, lưu localStorage
    await fetchAndSetUser();
  };

  // ============================================================
  // 🧩 Chức năng Login (ĐÃ SỬA LỖI)
  // ============================================================
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (!res?.data?.accessToken)
        throw new Error(res.message || "Đăng nhập thất bại!");

      // ✅ SỬA LỖI: Chỉ gọi performLogin.
      // KHÔNG TỰ ĐIỀU HƯỚNG.
      await performLogin(res.data.accessToken, res.data.refreshToken);
      showToast("Đăng nhập thành công!", "success");

      // `useEffect` (Guard) sẽ tự động bắt state thay đổi và điều hướng
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    // Không set isLoading(false) ở đây, để Guard xử lý
  };

  // ============================================================
  // 🧩 Login with Tokens (ĐÃ SỬA LỖI)
  // ============================================================
  const loginWithTokens = async (accessToken: string, refreshToken: string) => {
    setIsLoading(true);
    try {
      // ✅ SỬA LỖI: Chỉ gọi performLogin.
      // KHÔNG TỰ ĐIỀU HƯỚNG.
      await performLogin(accessToken, refreshToken);
      showToast("Đăng nhập thành công!", "success");

      // `useEffect` (Guard) sẽ tự động bắt state thay đổi và điều hướng
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  // ============================================================
  // 🧩 HÀM MỚI: Dành cho trang CreateCompany
  // ============================================================
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      // Tải lại user (lúc này đã có công ty)
      await fetchAndSetUser();
      // `useEffect` (Guard) sẽ tự động thấy role mới
      // và chuyển hướng đến /admin
    } catch (e) {
      showToast("Lỗi: Không thể làm mới thông tin user", "error");
    } finally {
      setIsLoading(false);
    }
  }, [fetchAndSetUser, showToast]); // Cập nhật dependencies

  // ============================================================
  // 🧩 Logout (Giữ nguyên)
  // ============================================================
  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout API failed:", e);
    } finally {
      localStorage.clear();
      setUser(null);
      setRole(null);
      router.push("/");
      showToast("Đã đăng xuất", "info");
    }
  };

  // ============================================================
  // 🧩 Quyền hạn (tạm thời true)
  // ============================================================
  const hasPermission = (_permission: string) => true;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithTokens,
        logout,
        refreshUser, // ✅ Thêm hàm mới
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// 6️⃣ Hook tiện ích (Giữ nguyên)
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
