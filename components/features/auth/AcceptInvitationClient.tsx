"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
// ⛔️ Sửa đường dẫn nếu cần
import {
  getInvitationDetails,
  acceptInvitation,
} from "@/services/apiInvitation";
import { registerFromInvite } from "@/services/apiAuth";
import { Loader2, User, Mail, LockKeyhole } from "lucide-react";

// Tái sử dụng component
import AuthFormLogin from "./AuthFormLogin";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";

// Kiểu dữ liệu trả về từ API /details
interface InviteDetails {
  email: string;
  companyName: string;
  accountExists: boolean;
}

// ----------------------------------------
// Component cho TRƯỜNG HỢP 1: Người dùng mới
// ----------------------------------------
function NewUserFlow({
  details,
  token,
}: {
  details: InviteDetails;
  token: string;
}) {
  const { showToast } = useToast();
  const { loginWithTokens } = useAuth(); // Lấy hàm login từ Context
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp!", "error");
      return;
    }
    setLoading(true);
    try {
      const data = await registerFromInvite({
        fullName: form.fullName,
        password: form.password,
        invitationToken: token,
      });
      showToast("Đăng ký & tham gia công ty thành công!", "success");
      // Tự động đăng nhập và điều hướng
      await loginWithTokens(data.accessToken, data.refreshToken);
    } catch (err: any) {
      showToast(err.message, "error");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-center py-6 px-4">
        <h2 className="text-lg sm:text-xl font-bold text-white mt-3">
          Tham gia {details.companyName}
        </h2>
        <p className="text-xs text-blue-100 mt-1">
          Tạo tài khoản để chấp nhận lời mời.
        </p>
      </div>
      <form className="p-6 space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Email (Đã mời)"
          icon={<Mail className="w-4 h-4 text-gray-400" />}
          type="email"
          value={details.email}
          disabled // Khóa email
        />
        <InputField
          label="Họ và tên"
          icon={<User className="w-4 h-4 text-gray-400" />}
          value={form.fullName}
          onChange={handleChange("fullName")}
          placeholder="Nhập họ và tên của bạn"
          required
        />
        <PasswordField
          label="Mật khẩu"
          value={form.password}
          onChange={handleChange("password")}
          placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
        />
        <PasswordField
          label="Xác nhận mật khẩu"
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          placeholder="Nhập lại mật khẩu"
        />
        <LoadingButton
          text="Tạo tài khoản & Tham gia"
          isLoading={loading}
          className="mt-4"
        />
      </form>
    </>
  );
}

// ----------------------------------------
// Component cho TRƯỜNG HỢP 2: Người dùng cũ
// ----------------------------------------
function ExistingUserFlow({
  details,
  token,
}: {
  details: InviteDetails;
  token: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, login, isLoading } = useAuth();
  const [isAccepting, setIsAccepting] = useState(false);

  // State cho form login
  const [form, setForm] = useState({ email: "", password: "" });
  const handleChange =
    (field: "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // Hàm xử lý khi user đã đăng nhập
  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptInvitation(token);
      showToast("Chấp nhận lời mời thành công!", "success");
      router.push("/admin"); // Chuyển đến trang admin
    } catch (err: any) {
      // ✅ SỬA LỖI: Đã thêm dấu {
      showToast(err.message, "error");
      setIsAccepting(false);
    }
  };

  // Hàm xử lý submit form login
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Dùng hàm login từ AuthContext
    try {
      await login(form.email, form.password);
      // AuthContext sẽ tự động điều hướng khi thành công
      // và trang này sẽ tự động re-render, rơi vào (isAuthenticated = true)
    } catch (err: any) {
      showToast(err.message || "Đăng nhập thất bại", "error");
    }
  };

  // --- Logic Render ---

  // 1. Đã đăng nhập
  if (isAuthenticated && user) {
    // 1a. Đăng nhập đúng tài khoản
    if (user.email === details.email) {
      return (
        <div className="p-6 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Chấp nhận lời mời?
          </h2>
          <p className="text-sm text-gray-600">
            <b>{details.companyName}</b> đã mời bạn tham gia.
          </p>
          <LoadingButton
            text="Chấp nhận"
            isLoading={isAccepting}
            onClick={handleAccept}
          />
        </div>
      );
    }
    // 1b. Đăng nhập sai tài khoản
    return (
      <div className="p-6 text-center space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Lỗi Tài khoản</h2>
        <p className="text-sm text-gray-600">
          Lời mời này dành cho <b>{details.email}</b>, nhưng bạn đang đăng nhập
          với tài khoản <b>{user.email}</b>.
        </p>
        <p className="text-sm text-gray-600">Vui lòng đăng xuất và thử lại.</p>
      </div>
    );
  }

  // 2. Chưa đăng nhập
  return (
    <>
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-center py-6 px-4">
        <h2 className="text-lg sm:text-xl font-bold text-white mt-3">
          Tham gia {details.companyName}
        </h2>
        <p className="text-xs text-blue-100 mt-1">
          Lời mời này dành cho <b>{details.email}</b>.
        </p>
        <p className="text-xs text-blue-100 mt-1">
          Vui lòng đăng nhập để chấp nhận.
        </p>
      </div>

      {/* Hiển thị form Login */}
      <form className="p-6 space-y-4" onSubmit={handleSubmitLogin}>
        <AuthFormLogin
          form={form}
          handleChange={handleChange as any}
          isLoading={isLoading} // Dùng loading của AuthContext
          setTab={() => {}} // không cần
        />
      </form>
    </>
  );
}

// ----------------------------------------
// Component "CHA" (Hub Logic)
// ----------------------------------------
export default function AcceptInvitationClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Bước 3 & 4: "Hỏi" Backend
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError("Token mời không hợp lệ.");
      setLoading(false);
      return;
    }
    setToken(tokenFromUrl);

    const fetchDetails = async () => {
      try {
        const data = await getInvitationDetails(tokenFromUrl);
        setDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [searchParams]);

  // --- Logic Render (Bước 5) ---
  if (loading) {
    return (
      <div className="p-8 text-center flex items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin" /> Đang xác thực lời mời...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error};</div>;
  }

  if (details && token) {
    // Bước 5: Ra quyết định
    if (details.accountExists) {
      return <ExistingUserFlow details={details} token={token} />;
    } else {
      return <NewUserFlow details={details} token={token} />;
    }
  }

  return null; // Trường hợp không mong muốn
}
