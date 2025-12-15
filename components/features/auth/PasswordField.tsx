"use client";

import React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

// =============================================================================
// 1. INTERFACES (Định nghĩa kiểu dữ liệu)
// =============================================================================

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  show?: boolean;      // Trạng thái: True = hiện text, False = hiện dấu chấm
  toggle?: () => void; // Hàm xử lý click nút con mắt
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

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
      {/* Label */}
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>

      {/* Input Container */}
      <div className="relative">
        
        {/* Icon Ổ khóa (Bên trái) */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Lock className="w-4 h-4" />
        </span>

        {/* Input Chính */}
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-300 text-sm 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />

        {/* Nút Toggle Ẩn/Hiện (Bên phải) - Chỉ render nếu có hàm toggle */}
        {toggle && (
          <button
            type="button"
            onClick={toggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                       text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            title={show ? "Hide password" : "Show password"}
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