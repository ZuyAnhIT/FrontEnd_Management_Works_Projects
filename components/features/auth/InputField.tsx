"use client";
import React from "react";

// 1. CẬP NHẬT PROPS
interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // <-- 2. Đặt là optional (?)
  placeholder?: string;
  required?: boolean;
  disabled?: boolean; // <-- 3. Thêm 'disabled'
}

export default function InputField({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  disabled, // <-- 4. Nhận prop
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled} // <-- 5. Truyền 'disabled' vào input thật
          readOnly={!onChange && !disabled} // 6. Thêm readOnly nếu không có onChange VÀ không disabled
          className={`w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm
                     ${
                       disabled
                         ? "bg-gray-100 cursor-not-allowed text-gray-500"
                         : ""
                     }`} // Thêm style
        />
      </div>
    </div>
  );
}
