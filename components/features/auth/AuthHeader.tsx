"use client";
import { X, ArrowLeft } from "lucide-react";

export default function AuthHeader({
  tab,
  setTab,
  onClose,
}: {
  tab: string;
  setTab: (t: any) => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-center py-6 px-4 relative">
      {(tab === "verify" || tab === "forgot") && (
        <button
          onClick={() => setTab("login")}
          className="absolute left-3 top-5 p-2 rounded-full hover:bg-white/20 transition"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      )}
      <button
        onClick={onClose}
        className="absolute right-3 top-5 p-2 rounded-full hover:bg-white/20 text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-blue-600 font-bold text-lg shadow">
        WN
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-white mt-3">
        {tab === "login"
          ? "Chào mừng trở lại"
          : tab === "register"
          ? "Tạo tài khoản mới"
          : tab === "verify"
          ? "Xác thực Email"
          : "Quên mật khẩu"}
      </h2>
      <p className="text-xs text-blue-100 mt-1">
        {tab === "login"
          ? "Đăng nhập để tiếp tục làm việc"
          : tab === "register"
          ? "Đăng ký nhanh chóng & miễn phí"
          : tab === "verify"
          ? "Nhập mã OTP được gửi về email"
          : "Nhập email để đặt lại mật khẩu"}
      </p>
    </div>
  );
}
