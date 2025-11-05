"use client";
import InputField from "./InputField";
import { Lock } from "lucide-react";
import LoadingButton from "@/components/ui/LoadingButton";

export default function AuthFormVerify({ form, handleChange, isLoading }: any) {
  return (
    <>
      <InputField
        label="Mã OTP"
        icon={<Lock className="w-4 h-4 text-gray-400" />}
        type="text"
        value={form.otp}
        onChange={handleChange("otp")}
        placeholder="Nhập mã OTP 6 ký tự"
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition disabled:opacity-60"
      >
        {isLoading ? "Đang xử lý..." : "Xác Thực OTP"}
      </button>
    </>
  );
}
