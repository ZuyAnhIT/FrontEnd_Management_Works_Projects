"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

// ✅ Import đúng từ services
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
  | "USER"
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
  hasPermission: (permission: string) => boolean;
}

// ============================================================
// 4️⃣ Tạo Context
// ============================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PAGES = ["/", "/log-in-out", "/accept-invitation", "/register-from-invite"];

const ROLE_DASHBOARDS: Record<string, string> = {
  SYSTEM_ADMIN: "/adminss/dashboard",
  COMPANY_ADMIN: "/admin",
  COMPANY_MEMBER: "/admin",
  WORKSPACE_ADMIN: "/core",
  WORKSPACE_MEMBER: "/core",
  USER: "/member",
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
    return "USER";
  };

  // ============================================================
  // 🧩 Helper: Chuẩn hóa dữ liệu user
  // ============================================================
  const normalizeUser = (rawUser: any): User => ({
    ...rawUser,
    avatarUrl: rawUser.avatarUrl ?? "",
    systemRoles:
      Array.isArray(rawUser.systemRoles) && rawUser.systemRoles.length > 0
        ? rawUser.systemRoles
        : rawUser.systemRoles
        ? [rawUser.systemRoles]
        : [],
    company: rawUser.company ?? null,
    workspaces: rawUser.workspaces ?? [],
    projects: rawUser.projects ?? [],
  });

  // ============================================================
  // 🧩 Helper: Xử lý đăng nhập (dùng cho email/password + token)
  // ============================================================
  const performLogin = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    const data = await getCurrentUser();
    const userNormalized = normalizeUser(data);
    const mainRole = determineRole(userNormalized);

    setUser(userNormalized);
    setRole(mainRole);
    localStorage.setItem("user", JSON.stringify(userNormalized));
    localStorage.setItem("userRole", mainRole ?? "");


    return mainRole;
  };

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
        const data = await getCurrentUser();
        const userNormalized = normalizeUser(data);
        setUser(userNormalized);
        setRole(localStorage.getItem("userRole") as AppRole);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.clear();
        setUser(null);
        setRole(null);
        router.push("/(auth)/log-in-out");
      } finally {
        setIsLoading(false);
      }
    };

    checkLogin();
  }, []);

  // ============================================================
  // 🧩 Guard: Bảo vệ route
  // ============================================================
  useEffect(() => {
    if (isLoading) return;
    const isPublic = PUBLIC_PAGES.some((p) => pathname.startsWith(p));
    const isAuthPage = pathname.startsWith("/(auth)/log-in-out");

    if (user) {
      if (isAuthPage) {
        const dashboard = ROLE_DASHBOARDS[role || "USER"] || "/member";
        router.push(dashboard);
      }
      if (
        pathname.startsWith("/admin") &&
        role !== "COMPANY_ADMIN" &&
        role !== "COMPANY_MEMBER"
      ) {
        showToast("Bạn không có quyền truy cập trang Admin", "error");
        router.push("/core");
      }
    } else if (!isPublic) {
      showToast("Vui lòng đăng nhập để tiếp tục", "warning");
      router.push("/(auth)/log-in-out");
    }
  }, [isLoading, user, role, pathname]);

  // ============================================================
  // 🧩 Chức năng Login
  // ============================================================
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (!res?.data?.accessToken)
        throw new Error(res.message || "Đăng nhập thất bại!");
      const newRole = await performLogin(
        res.data.accessToken,
        res.data.refreshToken
      );
      showToast("Đăng nhập thành công!", "success");
      router.push(ROLE_DASHBOARDS[newRole || "USER"] || "/member");
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  // ============================================================
  // 🧩 Login with Tokens (Google / Invite)
  // ============================================================
  const loginWithTokens = async (accessToken: string, refreshToken: string) => {
    setIsLoading(true);
    try {
      const newRole = await performLogin(accessToken, refreshToken);
      showToast("Đăng nhập thành công!", "success");
      router.push(ROLE_DASHBOARDS[newRole || "USER"] || "/member");
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  // ============================================================
  // 🧩 Logout
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
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// 6️⃣ Hook tiện ích
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
