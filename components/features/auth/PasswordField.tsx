"use client";
import React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  show?: boolean;
  toggle?: () => void;
}

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  show = false,
  toggle,
}: PasswordFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>

      <div className="relative">
        {/* Icon ổ khóa bên trái */}
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        {/* Input chính */}
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-300 
                     focus:ring-2 focus:ring-blue-500 text-sm"
        />

        {/* Nút ẩn/hiện mật khẩu (chỉ hiện khi có toggle) */}
        {toggle && (
          <button
            type="button"
            onClick={toggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                       text-gray-400 hover:text-gray-600 transition"
          >
            {show ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
