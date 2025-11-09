"use client";
import { Loader2, Sparkles } from "lucide-react";

interface LoadingButtonProps {
  text: string;
  isLoading: boolean;
  type?: "button" | "submit";
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "danger";
  size?: "sm" | "md" | "lg";
}

export default function LoadingButton({
  text,
  isLoading,
  type = "submit",
  className = "",
  onClick,
  variant = "primary",
  size = "md",
}: LoadingButtonProps) {
  // Gradient variants
  const variants = {
    primary: "from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700",
    secondary: "from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800",
    success: "from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700",
    danger: "from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700",
  };

  // Size variants
  const sizes = {
    sm: "py-2 text-sm",
    md: "py-2.5 text-base",
    lg: "py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`
        relative w-full rounded-xl font-semibold text-white 
        bg-gradient-to-r ${variants[variant]}
        transition-all duration-300 
        flex items-center justify-center gap-2 
        shadow-lg hover:shadow-xl
        disabled:opacity-60 disabled:cursor-not-allowed
        disabled:hover:shadow-lg
        group overflow-hidden
        ${sizes[size]}
        ${className}
      `}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="animate-pulse">Đang xử lý...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span>{text}</span>
          </>
        )}
      </div>

      {/* Glow effect on hover */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-50 
        transition-opacity duration-300 blur-xl -z-10
        bg-gradient-to-r ${variants[variant]}
      `}></div>
    </button>
  );
}