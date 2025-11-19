"use client";
import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function LoadingButton({
  text,
  loadingText = "Đang xử lý...",
  icon,
  isLoading = false,
  type = "submit",
  className = "",
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: LoadingButtonProps) {
  
  // 1. Hệ màu phẳng (Flat Colors) chuẩn Jira/Modern UI
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-transparent",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-transparent",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent",
    success: "bg-green-600 hover:bg-green-700 text-white shadow-sm border border-transparent",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 border-transparent",
  };

  // 2. Kích thước chuẩn
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm", // Chuẩn thường dùng
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        relative flex items-center justify-center gap-2 
        font-medium rounded-md transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/50
        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{text}</span>
        </>
      )}
    </button>
  );
}