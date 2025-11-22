"use client";

import { useState } from "react";
import { Mail, Lock } from "lucide-react"; // Import thêm icon Lock
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
    <div className="space-y-4">
      {/* 📨 Email Field */}
      <InputField
        label="Email Address"
        icon={<Mail className="w-4 h-4 text-gray-400" />}
        type="email"
        value={form.email}
        onChange={handleChange("email")}
        placeholder="name@company.com"
        required
      />

      {/* 🔒 Password Field */}
      <PasswordField
        label="Password"
        value={form.password}
        show={showPassword}
        toggle={() => setShowPassword((prev) => !prev)}
        onChange={handleChange("password")}
      />

      {/* ⚙️ Options: Remember & Forgot Password */}
      <div className="flex justify-between items-center text-sm">
        <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs sm:text-sm">Remember me</span>
        </label>

        <button
          type="button"
          onClick={() => setTab("forgot")}
          className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {/* ✅ Submit Button */}
      <LoadingButton
        text="Sign in to your account"
        isLoading={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm hover:shadow"
      />
    </div>
  );
}