"use client";

import { Lock } from "lucide-react";
import InputField from "./InputField";
import LoadingButton from "@/components/ui/LoadingButton";

// =============================================================================
// 1. INTERFACES & TYPES
// =============================================================================

interface VerifyFormState {
  otp: string;
}

interface AuthFormVerifyProps {
  form: VerifyFormState;
  // Typing cho hàm xử lý thay đổi input
  handleChange: (field: keyof VerifyFormState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function AuthFormVerify({ 
  form, 
  handleChange, 
  isLoading 
}: AuthFormVerifyProps) {
  
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* --- Field: OTP Code --- */}
      <InputField
        label="OTP Code"
        icon={<Lock className="w-4 h-4 text-gray-400" />}
        type="text"
        value={form.otp}
        onChange={handleChange("otp")}
        placeholder="Enter 6-digit code"
        required
      />
      
      {/* --- Submit Action --- */}
      <LoadingButton
        text="Verify Email"
        isLoading={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md mt-2"
      />
    </div>
  );
}