"use client";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps {
  text: string;
  isLoading: boolean;
  type?: "button" | "submit";
  className?: string;
  onClick?: () => void;
  
}

export default function LoadingButton({
  text,
  isLoading,
  type = "submit",
  className = "",
  onClick,
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`w-full py-2.5 rounded-lg font-semibold text-white 
      bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 
      transition disabled:opacity-60 flex items-center justify-center gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        text
      )}
    </button>
  );
}
