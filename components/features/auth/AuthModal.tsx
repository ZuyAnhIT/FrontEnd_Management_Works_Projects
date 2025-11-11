"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
// ⛔️ ĐÂY LÀ LỖI CŨ, ĐẢM BẢO SỬA ĐƯỜNG DẪN NẾU BẠN DI CHUYỂN
import { loginUser, registerUser, verifyEmail } from "@/services/apiAuth";
import { getCurrentUser } from "@/services/apiUser";

import AuthHeader from "./AuthHeader";
import AuthTabs from "./AuthTabs";
import AuthFormLogin from "./AuthFormLogin";
import AuthFormRegister from "./AuthFormRegister";
import AuthFormVerify from "./AuthFormVerify";
import AuthFormForgot from "./AuthFormForgot";
import AuthSocialButtons from "./AuthSocialButtons"; // <-- Component này đã được nâng cấp

type AuthFormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
};

type AuthTab = "login" | "register" | "verify" | "forgot";

export default function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState<AuthTab>("login");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<AuthFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    token: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange =
    (field: keyof AuthFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // ----------------------------------------------------------------
  // ✅ HÀM XỬ LÝ THÀNH CÔNG TÁI SỬ DỤNG
  // (Được gọi bởi cả Đăng nhập Email VÀ Đăng nhập Google)
  // ----------------------------------------------------------------
  const handleAuthSuccess = async (data: {
    accessToken: string;
    refreshToken: string;
  }) => {
    setIsLoading(true); // Kích hoạt loading toàn modal
    try {
      // 1. Lưu token
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // 2. Lấy thông tin user
      const user = await getCurrentUser();
      localStorage.setItem("user", JSON.stringify(user));

      // 3. Xác định vai trò chính (Logic của bạn đã đúng)
      let mainRole = "USER";
      if (user.systemRoles?.length) mainRole = user.systemRoles[0];
      else if (user.company?.roleCode === "COMPANY_ADMIN")
        mainRole = "COMPANY_ADMIN";
      else if (
        user.workspaces?.some((w: any) => w.roleCode === "WORKSPACE_ADMIN")
      )
        mainRole = "WORKSPACE_ADMIN";
      else if (user.company?.roleCode === "COMPANY_MEMBER")
        mainRole = "COMPANY_MEMBER";
      else if (
        user.workspaces?.some((w: any) => w.roleCode === "WORKSPACE_MEMBER")
      )
        mainRole = "WORKSPACE_MEMBER";
      else if (user.projects?.some((p: any) => p.roleCode === "GUEST_PROJECT"))
        mainRole = "GUEST_PROJECT";

      localStorage.setItem("userRole", mainRole);
      console.log("🎯 ROLE DETECTED:", mainRole);

      // 4. Phân hướng dashboard (Logic của bạn đã đúng)
      switch (mainRole) {
        case "SYSTEM_ADMIN":
          router.push("/adminss/dashboard");
          break;
        case "COMPANY_ADMIN":
        case "COMPANY_MEMBER":
          router.push("/admin");
          break;
        case "WORKSPACE_ADMIN":
        case "WORKSPACE_MEMBER":
          router.push("/core");
          break;
        case "GUEST_PROJECT":
          router.push("/projects");
          break;
        default:
          router.push("/member");
          break;
      }

      showToast("Đăng nhập thành công!", "success");
    } catch (error: any) {
      showToast(error.message || "Lỗi lấy thông tin người dùng!", "error");
      localStorage.clear(); // Xóa token nếu lấy user thất bại
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // ✅ HÀM SUBMIT FORM CHÍNH
  // ----------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🔹 Đăng nhập
      if (tab === "login") {
        if (!form.email || !form.password) {
          throw new Error("Vui lòng nhập email và mật khẩu!");
        }

        const res = await loginUser({
          email: form.email.trim(),
          password: form.password.trim(),
        });

        if (!res?.data?.accessToken) {
          throw new Error(res.message || "Đăng nhập thất bại!");
        }

        // 🟢 CHỈ CẦN GỌI HÀM TÁI SỬ DỤNG
        await handleAuthSuccess(res.data);
      }

      // 🔹 Đăng ký
      else if (tab === "register") {
        if (!form.fullName || !form.email || !form.password) {
          throw new Error("Vui lòng nhập đầy đủ thông tin!");
        }
        if (form.password !== form.confirmPassword) {
          throw new Error("Mật khẩu xác nhận không khớp!");
        }

        const res = await registerUser({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
        });

        showToast(
          res.message || "Vui lòng kiểm tra email để lấy mã OTP!",
          "info"
        );
        setTab("verify");
      }

      // 🔹 Xác thực email
      else if (tab === "verify") {
        if (!form.otp) throw new Error("Vui lòng nhập mã OTP!");
        const res = await verifyEmail({
          email: form.email.trim(),
          otp: form.otp.trim(),
        });
        showToast(res.message || "Xác thực thành công!", "success");
        setTab("login");
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || error.message || "Có lỗi xảy ra!",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 
                   animate-in slide-in-from-bottom-5 duration-300 ease-out" // <-- Hiệu ứng động
      >
        <AuthHeader tab={tab} setTab={setTab} onClose={onClose} />

        {/* 🎨 SỬA LỖI UI: Bỏ lớp div thừa, áp dụng padding trực tiếp */}
        <div className="p-5">
          {(tab === "login" || tab === "register") && (
            <AuthTabs tab={tab} setTab={setTab} />
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "login" && (
              <AuthFormLogin
                form={form}
                handleChange={handleChange as any}
                isLoading={isLoading}
                setTab={setTab as any}
              />
            )}
            {tab === "register" && (
              <AuthFormRegister
                form={form}
                handleChange={handleChange as any}
                isLoading={isLoading}
                setTab={setTab as any}
              />
            )}
            {tab === "verify" && (
              <AuthFormVerify
                form={form}
                handleChange={handleChange as any}
                isLoading={isLoading}
                setTab={setTab as any}
              />
            )}
            {tab === "forgot" && (
              <AuthFormForgot
                form={form}
                handleChange={handleChange as any}
                isLoading={isLoading} // 'isLoading' của cha
                setTab={setTab as any}
              />
            )}
          </form>

          {/* 🟢 Truyền các hàm xử lý cho SocialButtons */}
          {(tab === "login" || tab === "register") && (
            <AuthSocialButtons
              onAuthSuccess={handleAuthSuccess} // Truyền hàm success
              onError={(msg) => showToast(msg, "error")} // Truyền hàm error
              setLoading={setIsLoading} // Truyền hàm set loading
            />
          )}
        </div>
      </div>
    </div>
  );
}
