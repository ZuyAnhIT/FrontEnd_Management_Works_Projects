"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo } from "react";
import { Users, Trophy, BarChart2, TrendingUp, Zap, Target } from "lucide-react";
import { WorkloadStat } from "@/services/apiStatistics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & HELPERS
// =============================================================================

interface WorkloadKPIProps {
  data: WorkloadStat[];
  unit: string; // "POINTS" or "HOURS"
}

/**
 * Lấy chữ cái đầu đại diện cho thành viên.
 */
const getInitials = (name?: string) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần hiển thị các chỉ số hiệu suất chính (KPIs) về phân bổ nguồn lực.
 * Cung cấp cái nhìn nhanh về tổng nỗ lực, nỗ lực trung bình và thành viên tiêu biểu.
 */
export default function WorkloadKPI({ data, unit }: WorkloadKPIProps) {
  
  // ---------------------------------------------------------------------------
  // 4. CALCULATIONS (Memoized)
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalLoad = data.reduce((sum, u) => sum + u.totalLoad, 0);
    const activeMembers = data.filter((u) => u.totalLoad > 0);
    const averageLoad = activeMembers.length > 0 
      ? Math.round(totalLoad / activeMembers.length) 
      : 0;

    const topUser = [...data].sort((a, b) => b.totalLoad - a.totalLoad)[0];

    return { totalLoad, averageLoad, topUser, activeCount: activeMembers.length };
  }, [data]);

  if (!stats) return null;

  const { totalLoad, averageLoad, topUser } = stats;
  const unitLabel = unit === "HOURS" ? "hrs" : "pts";

  // ---------------------------------------------------------------------------
  // 5. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      
      {/* --- CARD 1: TOTAL TEAM EFFORT --- */}
      <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-[#2684FF] active:scale-[0.98]">
        <div className="p-3.5 bg-blue-50 text-[#0052CC] rounded-xl shrink-0 group-hover:scale-110 transition-transform">
          <BarChart2 className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
            Total Project Load
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <h3 className="text-2xl font-black text-[#172B4D] tracking-tighter">
              {totalLoad.toLocaleString()}
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {unitLabel}
            </span>
          </div>
        </div>
      </div>

      {/* --- CARD 2: TEAM VELOCITY / AVG --- */}
      <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-purple-300 active:scale-[0.98]">
        <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
          <TrendingUp className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
            Average Intensity
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <h3 className="text-2xl font-black text-[#172B4D] tracking-tighter">
              {averageLoad.toLocaleString()}
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
               {unitLabel} / mem
            </span>
          </div>
        </div>
      </div>

      {/* --- CARD 3: TOP CONTRIBUTOR (Leader) --- */}
      <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-amber-300 active:scale-[0.98]">
        <div className="relative shrink-0 group-hover:scale-105 transition-transform">
          <Avatar className="w-12 h-12 border-2 border-white shadow-md ring-2 ring-amber-100">
            <AvatarImage src={topUser.avatarUrl} alt={topUser.userName} />
            <AvatarFallback className="bg-amber-50 text-amber-600 font-black text-xs">
              {getInitials(topUser.userName)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-1 rounded-full border-2 border-white shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Lead Resource
          </p>
          <h3
            className="text-[15px] font-bold text-[#172B4D] truncate mt-0.5"
            title={topUser.userName}
          >
            {topUser.userName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 uppercase tracking-wider">
              {topUser.totalLoad} {unitLabel}
            </span>
          </div>
        </div>
      </div>
      
    </div>
  );
}