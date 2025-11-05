"use client";

import { useState } from "react";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { Mail, Lock } from "lucide-react";
import LoadingButton from "@/components/ui/LoadingButton";

export default function AuthFormForgot({
  form,
  handleChange,
  isLoading,
}: any) {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      {/* 🧩 Bước 1: Nhập email để xác minh */}
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
          <button
            type="button"
            disabled={isLoading || !form.email}
            onClick={() => setStep(2)}
            className="w-full mt-4 py-2.5 rounded-lg font-semibold text-white 
                       bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 
                       transition disabled:opacity-60"
          >
            {isLoading ? "Đang gửi..." : "Xác minh Email"}
          </button>
        </>
      )}

      {/* 🧩 Bước 2: Đặt lại mật khẩu */}
      {step === 2 && (
        <>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-2.5 rounded-lg font-semibold text-white 
                       bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 
                       transition disabled:opacity-60"
          >
            {isLoading ? "Đang xử lý..." : "Đặt lại Mật khẩu"}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-sm text-blue-600 mt-2 hover:underline"
          >
            ← Quay lại bước xác minh
          </button>
        </>
      )}
    </>
  );
}
