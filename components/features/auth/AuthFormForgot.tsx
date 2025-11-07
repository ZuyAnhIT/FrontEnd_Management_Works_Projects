"use client";

import { useState } from "react";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { Mail, KeyRound } from "lucide-react";
import LoadingButton from "@/components/ui/LoadingButton";
import { forgotPassword, resetPassword } from "@/app/api/apiAuth";

interface AuthFormForgotProps {
  form: {
    email: string;
    token: string;
    newPassword: string;
    confirmNewPassword: string;
  };
  handleChange: (
    field: keyof AuthFormForgotProps["form"]
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  setTab: (tab: string) => void;
}

export default function AuthFormForgot({
  form,
  handleChange,
  isLoading,
  setTab,
}: AuthFormForgotProps) {
  // 🧩 Step: 1 = gửi mail, 2 = nhập token + mật khẩu mới
  const [step, setStep] = useState<1 | 2>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🧩 Bước 1: Gửi mail có token
  const handleSendEmail = async () => {
    if (!form.email.trim()) {
      return setMessage(" Vui lòng nhập email hợp lệ.");
    }

    try {
      setMessage(null);
      setLoading(true);
      const res = await forgotPassword(form.email);
      setMessage(res?.message || " Đã gửi liên kết/mã token vào email của bạn.");
      setStep(2);
    } catch (error: any) {
      setMessage(error.message || " Gửi email thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Bước 2: Gửi token + mật khẩu mới
  const handleResetPassword = async () => {
    if (!form.token?.trim()) {
      return setMessage(" Vui lòng nhập mã token nhận được qua email.");
    }
    if (form.newPassword !== form.confirmNewPassword) {
      return setMessage(" Mật khẩu xác nhận không khớp.");
    }

    try {
      setMessage(null);
      setLoading(true);
      const res = await resetPassword({
        token: form.token.trim(),
        newPassword: form.newPassword,
      });

      setMessage(res?.message || " Đặt lại mật khẩu thành công!");
      setTimeout(() => setTab("login"), 1500);
    } catch (error: any) {
      setMessage(error.message || " Token không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 🧩 Bước 1: Nhập email */}
      {step === 1 && (
        <>
          <InputField
            label="Email"
            icon={<Mail className="w-4 h-4 text-gray-400" />}
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="user@gmail.com"
            required
          />
          <LoadingButton
            type="button"
            isLoading={loading}
            onClick={handleSendEmail}
            className="w-full mt-4"
            text="Gửi liên kết / mã token"
          />
        </>
      )}

      {/* 🧩 Bước 2: Nhập token và mật khẩu mới */}
      {step === 2 && (
        <>
          <InputField
            label="Mã token"
            icon={<KeyRound className="w-4 h-4 text-gray-400" />}
            type="text"
            value={form.token}
            onChange={handleChange("token")}
            placeholder="Dán mã token từ email"
            required
          />

          <PasswordField
            label="Mật khẩu mới"
            value={form.newPassword}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            onChange={handleChange("newPassword")}
          />
          <PasswordField
            label="Xác nhận mật khẩu mới"
            value={form.confirmNewPassword}
            show={showConfirm}
            toggle={() => setShowConfirm(!showConfirm)}
            onChange={handleChange("confirmNewPassword")}
          />

          <LoadingButton
            type="button"
            isLoading={loading}
            onClick={handleResetPassword}
            className="w-full mt-4"
            text="Đặt lại mật khẩu"
          />

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-sm text-blue-600 mt-2 hover:underline"
          >
            ← Quay lại bước nhập email
          </button>
        </>
      )}

      {message && (
        <p className="mt-3 text-sm text-center text-gray-600 whitespace-pre-line">
          {message}
        </p>
      )}
    </div>
  );
}
