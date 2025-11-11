"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// ⛔️ SỬA LỖI: Đảm bảo bạn import từ /services/
import { getCurrentUser } from "@/services/apiUser";
import { loginUser, logoutUser } from "@/services/apiAuth";
// ✅ NÂNG CẤP: Dùng hook của Next.js
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

// Định nghĩa kiểu User chi tiết (lấy từ JSON của bạn)
interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  systemRoles: string[];
  company: {
    companyId: number;
    roleCode: string; // "COMPANY_ADMIN"
  } | null;
  workspaces: {
    workspaceId: number;
    roleCode: string; // "WORKSPACE_ADMIN"
  }[];
  // (Thêm các trường khác từ API của bạn)
}

// Vai trò tổng hợp của chúng ta
type AppRole =
  | "SYSTEM_ADMIN"
  | "COMPANY_ADMIN"
  | "COMPANY_MEMBER"
  | "WORKSPACE_ADMIN"
  | "WORKSPACE_MEMBER"
  | "USER"
  | "GUEST_PROJECT"
  | null;

interface AuthContextType {
  user: User | null;
  role: AppRole; // Vai trò chính đã được xác định
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>; // Hàm cho Modal
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>; // Hàm cho Google/Invite
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Các trang không cần đăng nhập
const PUBLIC_PAGES = [
  "/", // Trang chủ
  "/(auth)/log-in-out",
  "/accept-invitation",
  "/register-from-invite",
];

// Trang nào ứng với vai trò nào
const ROLE_DASHBOARDS: Record<string, string> = {
  SYSTEM_ADMIN: "/adminss/dashboard", // (Bạn tự định nghĩa)
  COMPANY_ADMIN: "/admin",
  COMPANY_MEMBER: "/admin",
  WORKSPACE_ADMIN: "/core",
  WORKSPACE_MEMBER: "/core",
  USER: "/member", // (Gói thường)
  GUEST_PROJECT: "/projects", // (Bạn tự định nghĩa)
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu với loading
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // ----------------------------------------------------------------
  // HÀM HELPER 1: XÁC ĐỊNH VAI TRÒ
  // ----------------------------------------------------------------
  const determineRole = (user: User): AppRole => {
    let mainRole: AppRole = "USER"; // Mặc định là gói thường

    // Logic xác định vai trò (ưu tiên từ cao xuống thấp)
    if (user.systemRoles?.includes("SYSTEM_ADMIN")) {
      mainRole = "SYSTEM_ADMIN";
    } else if (user.company?.roleCode === "COMPANY_ADMIN") {
      mainRole = "COMPANY_ADMIN";
    } else if (user.workspaces?.some((w) => w.roleCode === "WORKSPACE_ADMIN")) {
      mainRole = "WORKSPACE_ADMIN";
    } else if (user.company?.roleCode === "COMPANY_MEMBER") {
      mainRole = "COMPANY_MEMBER";
    } else if (
      user.workspaces?.some((w) => w.roleCode === "WORKSPACE_MEMBER")
    ) {
      mainRole = "WORKSPACE_MEMBER";
    }
    // ... (Thêm các role khác)

    console.log("🎯 ROLE DETECTED:", mainRole);
    return mainRole;
  };

  // ----------------------------------------------------------------
  // HÀM HELPER 2: TỰ ĐỘNG ĐĂNG NHẬP (Dùng cho cả Login và Google)
  // ----------------------------------------------------------------
  const performLogin = async (accessToken: string, refreshToken: string) => {
    // 1. Lưu token
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // 2. Lấy thông tin user
    const user = await getCurrentUser();
    const mainRole = determineRole(user);

    // 3. Cập nhật State
    setUser(user);
    setRole(mainRole);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userRole", mainRole);

    // 4. Trả về role để hàm login có thể điều hướng
    return mainRole;
  };

  // ----------------------------------------------------------------
  // CHỨC NĂNG 1: TỰ ĐỘNG KIỂM TRA ĐĂNG NHẬP KHI TẢI LẠI TRANG
  // ----------------------------------------------------------------
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const data = await getCurrentUser();
          if (data) {
            setUser(data);
            setRole(localStorage.getItem("userRole") as AppRole);
          } else {
            throw new Error("Invalid session");
          }
        } catch (e) {
          console.error("Auth check failed, logging out:", e);
          localStorage.clear();
          setUser(null);
          setRole(null);
          router.push("/(auth)/log-in-out"); // Token hỏng, đá về login
        }
      }
      setIsLoading(false);
    };
    checkUserLoggedIn();
  }, []); // Chỉ chạy 1 lần duy nhất khi tải app

  // ----------------------------------------------------------------
  // CHỨC NĂNG 2: LOGIC BẢO VỆ (GUARD) - TỰ ĐỘNG CHUYỂN HƯỚNG
  // ----------------------------------------------------------------
  useEffect(() => {
    if (isLoading) return; // Chờ check xong

    const isAuthPage = pathname.startsWith("/(auth)/log-in-out");
    const isPublic = PUBLIC_PAGES.some((p) => pathname.startsWith(p));

    // 1. Đã đăng nhập (user có)
    if (user) {
      if (isAuthPage) {
        // Đã đăng nhập nhưng lại vào trang login? -> Đá về dashboard
        const dashboard = ROLE_DASHBOARDS[role || "USER"] || "/member";
        router.push(dashboard);
      }
      // (Thêm logic bảo vệ chi tiết, ví dụ: Member vào /admin)
      if (
        pathname.startsWith("/admin") &&
        role !== "COMPANY_ADMIN" &&
        role !== "COMPANY_MEMBER"
      ) {
        showToast("Bạn không có quyền truy cập trang Admin", "error");
        router.push("/core"); // Đá về trang core
      }

      // 2. Chưa đăng nhập (user là null)
    } else {
      if (!isPublic) {
        // Cố vào trang cần bảo vệ mà chưa đăng nhập
        showToast("Vui lòng đăng nhập để tiếp tục", "warning");
        router.push("/(auth)/log-in-out");
      }
    }
  }, [isLoading, user, role, pathname, router, showToast]);

  // ----------------------------------------------------------------
  // CHỨC NĂNG 3: HÀM LOGIN (CHO MODAL)
  // ----------------------------------------------------------------
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (!res?.data?.accessToken) {
        throw new Error(res.message || "Đăng nhập thất bại!");
      }
      // Gọi hàm helper
      const newRole = await performLogin(
        res.data.accessToken,
        res.data.refreshToken
      );
      showToast("Đăng nhập thành công!", "success");

      // ĐIỀU HƯỚNG NGAY LẬP TỨC
      const dashboard = ROLE_DASHBOARDS[newRole || "USER"] || "/member";
      router.push(dashboard);
    } catch (error: any) {
      setIsLoading(false); // Phải set false nếu lỗi
      throw error; // Ném lỗi ra để AuthModal bắt
    }
    // setIsLoading(false); // Không cần, vì trang sẽ reload
  };

  // ----------------------------------------------------------------
  // CHỨC NĂNG 4: HÀM LOGIN WITH TOKENS (CHO GOOGLE)
  // ----------------------------------------------------------------
  const loginWithTokens = async (accessToken: string, refreshToken: string) => {
    setIsLoading(true);
    try {
      // Gọi hàm helper
      const newRole = await performLogin(accessToken, refreshToken);
      showToast("Đăng nhập thành công!", "success");

      // ĐIỀU HƯỚNG NGAY LẬP TỨC
      const dashboard = ROLE_DASHBOARDS[newRole || "USER"] || "/member";
      router.push(dashboard);
    } catch (error: any) {
      setIsLoading(false); // Phải set false nếu lỗi
      throw error; // Ném lỗi ra để component con bắt
    }
  };

  // ----------------------------------------------------------------
  // CHỨC NĂNG 5: HÀM LOGOUT
  // ----------------------------------------------------------------
  const logout = async () => {
    try {
      await logoutUser(); // Gọi API logout nếu có
    } catch (e) {
      console.error("Logout API failed:", e);
    } finally {
      setUser(null);
      setRole(null);
      localStorage.clear();
      router.push("/(auth)/log-in-out");
      showToast("Đã đăng xuất", "info");
    }
  };

  // Quyền hạn (Giữ nguyên)
  const hasPermission = (permission: string): boolean => {
    // ... (logic của bạn)
    return true; // Tạm thời
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login,
        logout,
        loginWithTokens, // ✅ Thêm hàm mới
        register: async () => {}, // Bạn cần tự thêm logic register
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
