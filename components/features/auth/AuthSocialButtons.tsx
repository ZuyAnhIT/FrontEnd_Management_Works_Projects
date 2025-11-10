"use client";

import AuthGoogle from "./AuthGoogle";

export default function AuthSocialButtons() {
  return (
    <div className="mt-4">
      {/* Dòng ngăn cách "hoặc" */}
      <div className="relative my-3 text-center text-gray-400 text-xs">
        <span className="bg-white px-2 z-10 relative">hoặc</span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></div>
      </div>

     
        {/* 🟢 Đăng nhập Google */}
        <AuthGoogle />

      </div>
  );
}
