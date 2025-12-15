"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";

// =============================================================================
// 1. INTERFACES & TYPES
// =============================================================================

type AuthTab = "login" | "register" | "verify" | "forgot";

interface AuthFormLoginProps {
  form: {
    email: string;
    password: string;
  };
  handleChange: (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  setTab: (tab: AuthTab) => void;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function AuthFormLogin({
  form,
  handleChange,
  isLoading,
  setTab,
}: AuthFormLoginProps) {
  // --- STATE ---
  const [showPassword, setShowPassword] = useState(false);

  // --- RENDER ---
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* --- Field: Email --- */}
      <InputField
        label="Email Address"
        icon={<Mail className="w-4 h-4 text-gray-400" />}
        type="email"
        value={form.email}
        onChange={handleChange("email")}
        placeholder="name@company.com"
        required
      />

      {/* --- Field: Password --- */}
      <PasswordField
        label="Password"
        value={form.password}
        show={showPassword}
        toggle={() => setShowPassword((prev) => !prev)}
        onChange={handleChange("password")}
        placeholder="Enter your password"
      />

      {/* --- Options: Remember & Forgot --- */}
      <div className="flex justify-between items-center text-sm">
        
        {/* Checkbox Remember Me (Uncontrolled để giữ nguyên logic cũ) */}
        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label 
            htmlFor="remember-me" 
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 cursor-pointer select-none"
          >
            Remember me
          </label>
        </div>

        {/* Link Forgot Password */}
        <button
          type="button"
          onClick={() => setTab("forgot")}
          className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
        >
          Forgot password?
        </button>
      </div>

      {/* --- Submit Action --- */}
      <LoadingButton
        text="Sign In"
        isLoading={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
      />
    </div>
  );
}