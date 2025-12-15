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

// =============================================================================
// 1. CONSTANTS & TYPES
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
// 2. MAIN COMPONENT
// =============================================================================

export default function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // --- HOOKS ---
  const { showToast } = useToast();
  const { login, loginWithTokens, isLoading: isAuthLoading } = useAuth();

  // --- STATE ---
  const [tab, setTab] = useState<AuthTab>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<AuthFormData>(INITIAL_FORM_STATE);

  // --- HANDLERS ---

  const handleChange = (field: keyof AuthFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // 1. Handle Login
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      throw new Error("Please enter email and password.");
    }
    await login(form.email.trim(), form.password.trim());
    onClose(); // Close modal on success
  };

  // 2. Handle Register
  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      throw new Error("Please fill in all fields.");
    }
    if (form.password !== form.confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const res = await registerUser({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
    });

    showToast(res.message || "Registration successful! Please check your email for OTP.", "success");
    setTab("verify");
  };

  // 3. Handle Verify OTP
  const handleVerify = async () => {
    if (!form.otp) throw new Error("Please enter the OTP code.");

    const res = await verifyEmail({
      email: form.email.trim(),
      otp: form.otp.trim(),
    });

    showToast(res.message || "Verification successful! You can now login.", "success");
    setTab("login");
  };

  // Main Submit Handler
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
      const message = error.response?.data?.message || error.message || "An unexpected error occurred.";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Social Login Handler
  const handleSocialLoginSuccess = async (data: { accessToken: string; refreshToken: string }) => {
    try {
      await loginWithTokens(data.accessToken, data.refreshToken);
      showToast("Login successful!", "success");
      onClose();
    } catch (error: any) {
      showToast(error.message || "Social login failed.", "error");
    }
  };

  // --- RENDER ---

  if (!isOpen) return null;

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
        {/* Header */}
        <AuthHeader tab={tab} setTab={setTab} onClose={onClose} />

        <div className="p-6">
          {/* Tabs (Login/Register) */}
          {(tab === "login" || tab === "register") && (
            <AuthTabs tab={tab} setTab={setTab} />
          )}

          {/* Forms */}
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

          {/* Social Buttons */}
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