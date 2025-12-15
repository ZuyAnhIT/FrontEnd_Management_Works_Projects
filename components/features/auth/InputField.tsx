"use client";

import React from "react";

// =============================================================================
// 1. INTERFACES (Định nghĩa kiểu dữ liệu)
// =============================================================================

interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function InputField({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}: InputFieldProps) {

  // Tự động bật chế độ chỉ đọc (readOnly) nếu không truyền hàm onChange và không bị disabled
  // Giúp tránh lỗi React warning về controlled input không có onChange
  const isReadOnly = !onChange && !disabled;

  return (
    <div>
      {/* Label */}
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>

      {/* Input Container */}
      <div className="relative">
        
        {/* Icon (Căn giữa theo chiều dọc) */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </span>

        {/* Actual Input */}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={isReadOnly}
          className={`
            w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm transition-all
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
            ${
              disabled
                ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-500"
                : "bg-white border-gray-300 text-gray-900"
            }
          `}
        />
      </div>
    </div>
  );
}