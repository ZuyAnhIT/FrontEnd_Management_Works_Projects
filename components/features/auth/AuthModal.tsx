"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

// Thư viện bên ngoài
import React, { useState, useMemo, useCallback } from "react";

// Internal Services & Contexts
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { registerUser, verifyEmail } from "@/services/apiAuth";

// Internal Components
import AuthHeader from "./AuthHeader";
import AuthTabs from "./AuthTabs";
import AuthFormLogin from "./AuthFormLogin";
import AuthFormRegister from "./AuthFormRegister";
import AuthFormVerify from "./AuthFormVerify";
import AuthFormForgot from "./AuthFormForgot";
import AuthSocialButtons from "./AuthSocialButtons";

// =============================================================================
// 2. CONSTANTS & TYPES
// =============================================================================

export type AuthTab = "login" | "register" | "verify" | "forgot";

interface AuthFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

const INITIAL_FORM_STATE: AuthFormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  otp: "",
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // ---------------------------------------------------------------------------
  // 4. STATE & HOOKS
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const { login, loginWithTokens, isLoading: isAuthLoading } = useAuth();

  const [tab, setTab] = useState<AuthTab>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<AuthFormData>(INITIAL_FORM_STATE);

  // Xác định trạng thái xử lý tổng hợp
  const isProcessing = useMemo(() => isLoading || isAuthLoading, [isLoading, isAuthLoading]);

  // ---------------------------------------------------------------------------
  // 5. HANDLERS
  // ---------------------------------------------------------------------------

  // Cập nhật giá trị các trường trong biểu mẫu
  const handleChange = useCallback(
    (field: keyof AuthFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  // Xử lý logic đăng nhập
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      throw new Error("Please enter email and password");
    }
    await login(form.email.trim(), form.password.trim());
    onClose();
  };

  // Xử lý logic đăng ký tài khoản mới
  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      throw new Error("Please fill in all fields");
    }
    if (form.password !== form.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const res = await registerUser({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
    });

    showToast(res.message || "Registration successful. Please check your email for OTP", "success");
    setTab("verify");
  };

  // Xử lý xác thực mã OTP
  const handleVerify = async () => {
    if (!form.otp) {
      throw new Error("Please enter the OTP code");
    }

    const res = await verifyEmail({
      email: form.email.trim(),
      otp: form.otp.trim(),
    });

    showToast(res.message || "Verification successful. You can now login", "success");
    setTab("login");
  };

  // Điều phối hành động submit dựa trên tab hiện tại
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      switch (tab) {
        case "login":
          await handleLogin();
          break;
        case "register":
          await handleRegister();
          break;
        case "verify":
          await handleVerify();
          break;
        default:
          break;
      }
    } catch (error: any) {
      // Ưu tiên hiển thị message từ phía backend
      const message = error.response?.data?.message || error.message || "An unexpected error occurred";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đăng nhập thông qua mạng xã hội
  const handleSocialLoginSuccess = async (data: { accessToken: string; refreshToken: string }) => {
    try {
      await loginWithTokens(data.accessToken, data.refreshToken);
      showToast("Login successful", "success");
      onClose();
    } catch (error: any) {
      showToast(error.message || "Social login failed", "error");
    }
  };

  // ---------------------------------------------------------------------------
  // 6. RENDER
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-2 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Phần đầu của Modal */}
        <AuthHeader tab={tab} setTab={setTab} onClose={onClose} />

        <div className="p-6">
          {/* Thanh chuyển đổi tab giữa Đăng nhập và Đăng ký */}
          {(tab === "login" || tab === "register") && (
            <AuthTabs tab={tab} setTab={setTab} />
          )}

          {/* Các biểu mẫu nhập liệu tương ứng */}
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

          {/* Các nút đăng nhập bằng mạng xã hội */}
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