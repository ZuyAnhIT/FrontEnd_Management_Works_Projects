"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & CONSTANTS
// =============================================================================

interface WeeklyStatCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  color: "blue" | "green" | "orange" | "red";
  onClick?: () => void;
  isActive?: boolean;
}

/**
 * Định nghĩa bảng màu theo chuẩn Jira Design System
 */
const COLOR_MAPPING = {
  blue: {
    icon: "bg-blue-50 text-[#0052CC] border-blue-100",
    active: "ring-[#2684FF] border-[#2684FF] bg-blue-50/30",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600 border-emerald-100",
    active: "ring-emerald-500 border-emerald-500 bg-emerald-50/30",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600 border-orange-100",
    active: "ring-orange-500 border-orange-500 bg-orange-50/30",
  },
  red: {
    icon: "bg-red-50 text-red-600 border-red-100",
    active: "ring-red-500 border-red-500 bg-red-50/30",
  },
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thẻ hiển thị chỉ số thống kê (Stat Card).
 * Hỗ trợ trạng thái Active để lọc dữ liệu và hiệu ứng tương tác cao cấp.
 */
export default function WeeklyStatCard({ 
  title, 
  count, 
  icon: Icon, 
  color, 
  onClick, 
  isActive 
}: WeeklyStatCardProps) {

  const styles = COLOR_MAPPING[color];

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative bg-white p-5 rounded-2xl border border-slate-200 cursor-pointer transition-all duration-200 select-none",
        "hover:shadow-md hover:border-slate-300 active:scale-[0.98]",
        isActive ? cn("ring-2 ring-offset-1 shadow-lg", styles.active) : "shadow-sm"
      )}
    >
      <div className="flex items-start justify-between">
        
        {/* NỘI DUNG VĂN BẢN (Text Content) */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-[#172B4D] tracking-tighter">
              {count.toLocaleString()}
            </h3>
          </div>
        </div>
        
        {/* BIỂU TƯỢNG (Icon Badge) */}
        <div className={cn(
          "p-2.5 rounded-xl border shadow-sm transition-transform duration-300",
          isActive ? "scale-110 shadow-inner" : "group-hover:scale-105",
          styles.icon
        )}>
          <Icon className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* CHỈ BÁO TRẠNG THÁI ACTIVE (Dấu gạch nhỏ bên dưới) */}
      {isActive && (
        <div className={cn(
          "absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full animate-in fade-in zoom-in duration-300",
          color === 'blue' && "bg-[#0052CC]",
          color === 'green' && "bg-emerald-500",
          color === 'orange' && "bg-orange-500",
          color === 'red' && "bg-red-500",
        )} />
      )}
    </div>
  );
}