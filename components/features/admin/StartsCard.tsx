"use client";

import React, { useMemo } from "react";
import { LucideIcon } from "lucide-react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// CONSTANTS & CONFIGURATIONS
// =============================================================================

/**
 * Cấu hình bảng màu cho biểu tượng dựa trên biến thể (Variant).
 * Kết hợp nền nhạt (50) và màu chữ đậm (600) để đảm bảo độ tương phản.
 */
const VARIANT_STYLES = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

// =============================================================================
// INTERFACES
// =============================================================================

export type StatsCardVariant = keyof typeof VARIANT_STYLES;

interface StatsCardProps {
  icon: LucideIcon;           // Biểu tượng đại diện từ Lucide
  value: string | number;     // Giá trị số liệu chính
  label: string;              // Nhãn mô tả số liệu
  variant?: StatsCardVariant; // Biến thể màu sắc (Mặc định: slate)
  trend?: string;             // Chuỗi hiển thị xu hướng (VD: +12% hoặc -5%)
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần thẻ thống kê (Statistics Card).
 * Dùng để hiển thị nhanh các con số chủ chốt kèm theo biểu tượng và xu hướng tăng/giảm.
 */
export default function StatsCard({
  icon: Icon,
  value,
  label,
  variant = "slate",
  trend
}: StatsCardProps) {
  
  // ---------------------------------------------------------------------------
  // 1. LOGIC HANDLERS
  // ---------------------------------------------------------------------------

  // Xác định kiểu hiển thị cho xu hướng (Xanh nếu tăng, Đỏ nếu giảm)
  const trendStyle = useMemo(() => {
    if (!trend) return null;
    const isNegative = trend.startsWith("-");
    return isNegative 
      ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400" 
      : "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
  }, [trend]);

  const currentIconStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.slate;

  // ---------------------------------------------------------------------------
  // 2. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className={cn(
      "bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-all duration-200",
      "hover:shadow-md hover:border-slate-300",
      "dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
    )}>
      <div className="flex items-center gap-4">
        
        {/* Vùng hiển thị Icon */}
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
          currentIconStyle
        )}>
          <Icon className="w-6 h-6 stroke-[2.5px]" />
        </div>

        {/* Vùng hiển thị Thông tin */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mb-0.5">
            {label}
          </p>
          
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {value}
            </h3>
            
            {trend && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded leading-none",
                trendStyle
              )}>
                {trend}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}