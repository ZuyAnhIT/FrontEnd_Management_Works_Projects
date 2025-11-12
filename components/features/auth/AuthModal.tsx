"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Giữ lại để dùng cho trang "Quên mật khẩu"
import { useToast } from "@/components/ui/ToastProvider";
// ⛔️ SỬA LỖI: Chỉ import API cho register/verify, KHÔNG import login/getCurrentUser
// (Đảm bảo đường dẫn này đúng, ví dụ: @/services/apiAuth)
import { registerUser, verifyEmail } from "@/services/apiAuth";
// ✅ TỐI ƯU: Import useAuth
import { useAuth } from "@/context/AuthContext";

import AuthHeader from "./AuthHeader";
import AuthTabs from "./AuthTabs";
import AuthFormLogin from "./AuthFormLogin";
import AuthFormRegister from "./AuthFormRegister";
import AuthFormVerify from "./AuthFormVerify";
import AuthFormForgot from "./AuthFormForgot";
import AuthSocialButtons from "./AuthSocialButtons";

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
  const router = useRouter(); // Vẫn dùng cho forgot password
  const { showToast } = useToast();
  // ✅ TỐI ƯU: Lấy hàm login từ Context
  const { login, loginWithTokens, isLoading: isAuthLoading } = useAuth();

  const [tab, setTab] = useState<AuthTab>("login");
  const [isLoading, setIsLoading] = useState(false); // State loading riêng của form

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
  // ✅ HÀM SUBMIT ĐÃ ĐƯỢC TỐI ƯU
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

        // 🟢 CHỈ CẦN GỌI HÀM LOGIN CỦA CONTEXT
        // AuthContext sẽ tự xử lý (lấy user, set state, VÀ ĐIỀU HƯỚNG)
        await login(form.email.trim(), form.password.trim());

        // ❌ XÓA TẤT CẢ LOGIC (res, localStorage, getCurrentUser, switch/case, router.push)
        // ... (ĐÃ XÓA)

        // onClose() sẽ được gọi tự động khi trang chuyển hướng
      }

      // 🔹 Đăng ký
      else if (tab === "register") {
        if (
          !form.fullName ||
          !form.email ||
          !form.password ||
          !form.confirmPassword
        ) {
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
        if (!form.otp) throw new Error("Vui lòng nhập OTP!");
        const res = await verifyEmail({
          email: form.email.trim(),
          otp: form.otp.trim(),
        });
        showToast(
          res.message || "Xác thực thành công! Vui lòng đăng nhập.",
          "success"
        );
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

  // ----------------------------------------------------------------
  // ✅ HÀM XỬ LÝ SOCIAL LOGIN (TÁI SỬ DỤNG LOGIC)
  // ----------------------------------------------------------------
  const handleSocialLoginSuccess = async (data: {
    accessToken: string;
    refreshToken: string;
  }) => {
    try {
      // 🟢 GỌI HÀM LOGIN CỦA CONTEXT
      await loginWithTokens(data.accessToken, data.refreshToken);
      // AuthContext sẽ tự động điều hướng
    } catch (error: any) {
      showToast(error.message || "Lỗi xử lý đăng nhập Google!", "error");
    }
  };

  if (!isOpen) return null;

  // Dùng isAuthLoading (của Context) để biết toàn bộ app đang xử lý (ví dụ: đang điều hướng)
  const isProcessing = isLoading || isAuthLoading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-bottom-5 duration-300 ease-out"
      >
        <AuthHeader tab={tab} setTab={setTab} onClose={onClose} />

        {/* Sửa lỗi UI "nền trong nền" */}
        <div className="p-5">
          {(tab === "login" || tab === "register") && (
            <AuthTabs tab={tab} setTab={setTab} />
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "login" && (
              <AuthFormLogin
                form={form}
                handleChange={handleChange as any}
                isLoading={isProcessing} // Dùng state tổng
                setTab={setTab as any}
              />
            )}
            {tab === "register" && (
              <AuthFormRegister
                form={form}
                handleChange={handleChange as any}
                isLoading={isProcessing} // Dùng state tổng
              />
            )}
            {tab === "verify" && (
              <AuthFormVerify
                form={form}
                handleChange={handleChange as any}
                isLoading={isProcessing} // Dùng state tổng
              />
            )}
            {tab === "forgot" && (
              <AuthFormForgot
                form={form}
                handleChange={handleChange as any}
                isLoading={isProcessing} // Dùng state tổng
                setTab={setTab as any}
              />
            )}
          </form>

          {(tab === "login" || tab === "register") && (
            <AuthSocialButtons
              onAuthSuccess={handleSocialLoginSuccess} // Truyền hàm success
              onError={(msg) => showToast(msg, "error")} // Truyền hàm error
              setLoading={setIsLoading} // Truyền hàm set loading
            />
          )}
        </div>
      </div>
    </div>
  );
}
