"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";

interface AuthFormLoginProps {
  form: {
    email: string;
    password: string;
  };
  handleChange: (
    field: keyof AuthFormLoginProps["form"]
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  setTab: (tab: "login" | "register" | "verify" | "forgot") => void;
}

export default function AuthFormLogin({
  form,
  handleChange,
  isLoading,
  setTab,
}: AuthFormLoginProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* 📨 Email */}
      <InputField
        label="Email"
        icon={<Mail className="w-4 h-4 text-gray-400" />}
        type="email"
        value={form.email}
        onChange={handleChange("email")}
        placeholder="user@gmail.com"
        required
      />

      {/* 🔒 Password */}
      <PasswordField
        label="Mật khẩu"
        value={form.password}
        show={showPassword}
        toggle={() => setShowPassword((prev) => !prev)}
        onChange={handleChange("password")}
      />

      {/* ⚙️ Options */}
      <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-400"
          />
          Ghi nhớ
        </label>

        <button
          type="button"
          onClick={() => setTab("forgot")}
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition"
        >
          Quên mật khẩu?
        </button>
      </div>

      {/* ✅ Submit */}
      <LoadingButton
        text="Đăng nhập"
        isLoading={isLoading}
        className="mt-3"
      />
    </>
  );
}
