"use client";

import { WorkloadStat } from "@/services/apiStatistics";
import { Users, Trophy, BarChart2, TrendingUp, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface WorkloadKPIProps {
  data: WorkloadStat[];
  unit: string; // "POINTS" or "HOURS"
}

export default function WorkloadKPI({ data, unit }: WorkloadKPIProps) {
  
  // 1. Safety Check
  if (!data || data.length === 0) return null;

  // 2. Calculations
  const totalLoad = data.reduce((sum, u) => sum + u.totalLoad, 0);
  
  // Chỉ tính trung bình dựa trên những người có task (để số liệu chính xác hơn)
  const activeMembersCount = data.filter(u => u.totalLoad > 0).length || 1;
  const averageLoad = Math.round(totalLoad / activeMembersCount);
  
  // Tìm người làm nhiều nhất
  const topUser = data.reduce((prev, current) => 
    (prev.totalLoad > current.totalLoad) ? prev : current
  , data[0]);

  const unitLabel = unit === 'HOURS' ? 'hrs' : 'pts';

  // Helper lấy chữ cái đầu tên
  const getInitials = (name: string) => 
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* --- CARD 1: TOTAL EFFORT --- */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:border-blue-300 hover:shadow-md">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full shrink-0">
                <BarChart2 className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Team Effort</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                    <h3 className="text-2xl font-bold text-slate-900">{totalLoad}</h3>
                    <span className="text-sm font-semibold text-slate-500">{unitLabel}</span>
                </div>
            </div>
        </div>

        {/* --- CARD 2: AVERAGE LOAD --- */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:border-purple-300 hover:shadow-md">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full shrink-0">
                <TrendingUp className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average / Active Member</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                    <h3 className="text-2xl font-bold text-slate-900">{averageLoad}</h3>
                    <span className="text-sm font-semibold text-slate-500">{unitLabel}</span>
                </div>
            </div>
        </div>

        {/* --- CARD 3: TOP CONTRIBUTOR --- */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:border-yellow-300 hover:shadow-md">
            <div className="relative shrink-0">
                <Avatar className="w-12 h-12 border-2 border-yellow-100 shadow-sm">
                    <AvatarImage src={topUser.avatarUrl} />
                    <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                        {getInitials(topUser.userName)}
                    </AvatarFallback>
                </Avatar>
                {/* Icon Huy Chương */}
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-1 rounded-full border-2 border-white shadow-sm">
                    <Trophy className="w-3 h-3" />
                </div>
            </div>
            
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    Top Contributor
                </p>
                <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5" title={topUser.userName}>
                    {topUser.userName}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                        {topUser.totalLoad} {unitLabel}
                    </span>
                    <span className="text-[10px] text-slate-400">load</span>
                </div>
            </div>
        </div>

    </div>
  );
}