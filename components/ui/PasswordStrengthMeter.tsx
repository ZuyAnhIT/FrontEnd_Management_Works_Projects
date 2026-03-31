"use client";

import React, { useMemo } from "react";
import { Check, ShieldCheck, ShieldAlert } from "lucide-react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// CONFIGURATIONS & CONSTANTS
// =============================================================================

/**
 * Danh sách các tiêu chí đánh giá mật khẩu (Requirements)
 */
const STRENGTH_REQUIREMENTS = [
  { id: "length", regex: /.{6,}/, label: "At least 6 characters" },
  { id: "upper", regex: /[A-Z]/, label: "Uppercase letters (A-Z)" },
  { id: "lower", regex: /[a-z]/, label: "Lowercase letters (a-z)" },
  { id: "number", regex: /[0-9]/, label: "Numbers (0-9)" },
  { id: "special", regex: /[^A-Za-z0-9]/, label: "Special characters (!@#...)" },
];

/**
 * Cấu hình hiển thị dựa trên điểm số độ mạnh (0 - 5)
 */
const getStrengthConfig = (score: number) => {
  if (score === 0) {
    return { color: "bg-slate-200", label: "Empty", text: "text-slate-400", icon: <ShieldAlert className="w-3.5 h-3.5" /> };
  }
  if (score <= 2) {
    return { color: "bg-red-500", label: "Weak", text: "text-red-600", icon: <ShieldAlert className="w-3.5 h-3.5" /> };
  }
  if (score <= 3) {
    return { color: "bg-orange-500", label: "Fair", text: "text-orange-600", icon: <ShieldAlert className="w-3.5 h-3.5" /> };
  }
  if (score <= 4) {
    return { color: "bg-blue-500", label: "Good", text: "text-blue-600", icon: <ShieldCheck className="w-3.5 h-3.5" /> };
  }
  return { color: "bg-green-500", label: "Very Strong", text: "text-green-600", icon: <ShieldCheck className="w-3.5 h-3.5" /> };
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface PasswordStrengthMeterProps {
  password: string;
}

/**
 * Thành phần đo lường và hiển thị độ mạnh của mật khẩu theo thời gian thực.
 * Cung cấp phản hồi trực quan qua thanh tiến trình và danh sách tiêu chí.
 */
export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  // ---------------------------------------------------------------------------
  // 1. LOGIC CALCULATION
  // ---------------------------------------------------------------------------

  // Tính toán điểm số dựa trên số lượng tiêu chí thỏa mãn
  const score = useMemo(() => {
    if (!password) return 0;
    return STRENGTH_REQUIREMENTS.reduce((acc, req) => (req.regex.test(password) ? acc + 1 : acc), 0);
  }, [password]);

  const config = getStrengthConfig(score);

  // Xác định số lượng vạch tiến trình cần được tô màu (thanh 4 đoạn)
  const strengthLevel = useMemo(() => {
    if (score >= 5) return 4;
    if (score >= 4) return 3;
    if (score >= 3) return 2;
    if (score >= 1) return 1;
    return 0;
  }, [score]);

  // ---------------------------------------------------------------------------
  // 2. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
      
      {/* Thanh tiến trình phân đoạn (Visual Meter) */}
      <div className="flex gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "flex-1 rounded-full transition-all duration-500",
              step <= strengthLevel ? config.color : "bg-slate-200 dark:bg-slate-800"
            )}
          />
        ))}
      </div>

      {/* Nhãn trạng thái và mô tả */}
      <div className="flex justify-between items-center px-0.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Security Strength
        </span>
        <div className={cn("flex items-center gap-1.5 text-xs font-bold transition-colors", config.text)}>
          {config.icon}
          <span>{config.label}</span>
        </div>
      </div>

      {/* Danh sách kiểm tra tiêu chí (Requirements Checklist) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1">
        {STRENGTH_REQUIREMENTS.map((req) => {
          const isMet = req.regex.test(password);
          
          return (
            <div
              key={req.id}
              className={cn(
                "flex items-center gap-2 text-xs transition-all duration-300",
                isMet ? "text-green-600 font-medium" : "text-slate-400"
              )}
            >
              {isMet ? (
                <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-50 border border-green-200 shadow-sm">
                  <Check className="w-2.5 h-2.5 stroke-[3px]" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-200 dark:border-slate-800 shrink-0" />
              )}
              <span className="truncate">{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}