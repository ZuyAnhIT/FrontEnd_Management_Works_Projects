"use client";

import { useState } from "react";
import { Mail, User } from "lucide-react";

import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";

// =============================================================================
// 1. INTERFACES & TYPES
// =============================================================================

interface RegisterFormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthFormRegisterProps {
  form: RegisterFormState;
  // Typing cho hàm currying: handleChange("field")(event)
  handleChange: (field: keyof RegisterFormState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function AuthFormRegister({ 
  form, 
  handleChange, 
  isLoading 
}: AuthFormRegisterProps) {
  
  // ✅ State quản lý hiển thị mật khẩu riêng biệt cho 2 ô
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- RENDER ---
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* --- Field: Full Name --- */}
      <InputField
        label="Full Name"
        icon={<User className="w-4 h-4 text-gray-400" />}
        value={form.fullName}
        onChange={handleChange("fullName")}
        placeholder="e.g. John Doe"
        required
      />

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
        label="Create Password"
        value={form.password}
        show={showPassword}
        toggle={() => setShowPassword((prev) => !prev)}
        onChange={handleChange("password")}
        placeholder="At least 6 characters"
      />

      {/* --- Field: Confirm Password --- */}
      <PasswordField
        label="Confirm Password"
        value={form.confirmPassword}
        show={showConfirm}
        toggle={() => setShowConfirm((prev) => !prev)}
        onChange={handleChange("confirmPassword")}
        placeholder="Re-enter your password"
      />

      {/* --- Submit Action --- */}
      <LoadingButton
        text="Sign Up"
        isLoading={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md mt-2"
      />
    </div>
  );
}