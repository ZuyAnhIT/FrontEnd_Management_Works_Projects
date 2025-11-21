"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { registerUser, verifyEmail } from "@/services/apiAuth";
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
  const router = useRouter();
  const { showToast } = useToast();
  const { login, loginWithTokens, isLoading: isAuthLoading } = useAuth();

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
  // HÀM SUBMIT (Đã xóa console.log)
  // ----------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🔹 Đăng nhập
      if (tab === "login") {
        if (!form.email || !form.password) {
          throw new Error("Please enter email and password!");
        }

        // Gọi login từ context
        await login(form.email.trim(), form.password.trim());

        // ✅ QUAN TRỌNG: Đóng modal ngay sau khi login thành công
        // (Guard effect sẽ tự động redirect)
        onClose();
      }

      // 🔹 Đăng ký
      else if (tab === "register") {
        if (
          !form.fullName ||
          !form.email ||
          !form.password ||
          !form.confirmPassword
        ) {
          throw new Error("Please fill in all fields!");
        }
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match!");
        }

        const res = await registerUser({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
        });

        showToast(
          res.message || "Please check your email for OTP!",
          "success" // Dùng success thay vì info cho nổi bật
        );
        setTab("verify");
      }

      // 🔹 Xác thực email
      else if (tab === "verify") {
        if (!form.otp) throw new Error("Please enter OTP!");

        const res = await verifyEmail({
          email: form.email.trim(),
          otp: form.otp.trim(),
        });

        showToast(
          res.message || "Verification successful! Please login.",
          "success"
        );
        setTab("login");
      }
    } catch (error: any) {
      // Thay console.error bằng showToast
      showToast(
        error.response?.data?.message || error.message || "An error occurred!",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // HÀM XỬ LÝ SOCIAL LOGIN
  // ----------------------------------------------------------------
  const handleSocialLoginSuccess = async (data: {
    accessToken: string;
    refreshToken: string;
  }) => {
    try {
      // Gọi loginWithTokens từ context
      await loginWithTokens(data.accessToken, data.refreshToken);

      // ✅ Đóng modal ngay sau khi login thành công
      onClose();
      showToast("Login successful!", "success");
    } catch (error: any) {
      // Thay console.error bằng showToast
      showToast(error.message || "Social login failed!", "error");
    }
  };

  if (!isOpen) return null;

  // Dùng isAuthLoading để biết context đang xử lý
  const isProcessing = isLoading || isAuthLoading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-2 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 transition-all animate-in zoom-in-95 duration-200"
      >
        <AuthHeader tab={tab} setTab={setTab} onClose={onClose} />

        <div className="p-6">
          {(tab === "login" || tab === "register") && (
            <AuthTabs tab={tab} setTab={setTab} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {tab === "login" && (
              <AuthFormLogin
                form={form}
                handleChange={handleChange as any}
                isLoading={isProcessing}
                setTab={setTab as any}
              />
            )}
            {tab === "register" && (
              <AuthFormRegister
                form={form}
                handleChange={handleChange as any}
                isLoading={isProcessing}
              />
            )}
            {tab === "verify" && (
              <AuthFormVerify
                form={form}
                handleChange={handleChange as any}
                isLoading={isProcessing}
              />
            )}
            {tab === "forgot" && (
              <AuthFormForgot
                form={form}
                handleChange={handleChange as any}
                isLoading={isProcessing}
                setTab={setTab as any}
              />
            )}
          </form>

          {(tab === "login" || tab === "register") && (
            <AuthSocialButtons
              onAuthSuccess={handleSocialLoginSuccess}
              onError={(msg) => showToast(msg, "error")}
              setLoading={setIsLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}