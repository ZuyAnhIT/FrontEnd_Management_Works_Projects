"use client";
import InputField from "./InputField";
import { Lock } from "lucide-react";
import LoadingButton from "@/components/ui/LoadingButton";

export default function AuthFormVerify({ form, handleChange, isLoading }: any) {
  return (
    <>
      <InputField
        label="OTP Code"
        icon={<Lock className="w-4 h-4 text-gray-400" />}
        type="text"
        value={form.otp}
        onChange={handleChange("otp")}
        placeholder="Enter 6-digit OTP"
        required
      />
      
      {/* Sử dụng LoadingButton để đồng bộ UI */}
      <LoadingButton
        text="Verify OTP"
        isLoading={isLoading}
        className="w-full mt-4"
      />
    </>
  );
}