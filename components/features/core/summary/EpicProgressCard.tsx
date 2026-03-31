"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React from "react";
import { Loader2, Layers, CheckCircle2, Flame, ChevronRight } from "lucide-react";
import { EpicProgressStat } from "@/services/apiStatistics";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface EpicProgressCardProps {
  data: EpicProgressStat[];
  loading: boolean;
}

// =============================================================================
// 3. SUB-COMPONENT: Epic List Item
// =============================================================================

interface EpicListItemProps {
  epic: EpicProgressStat;
}

/**
 * Thành phần hiển thị tiến độ của một Epic cụ thể.
 * Bao gồm: Tên, Mã, Phần trăm hoàn thành và các thanh tiến độ chi tiết.
 */
const EpicListItem = ({ epic }: EpicListItemProps) => (
  <div className="p-6 hover:bg-slate-50/80 transition-all group cursor-default border-b border-slate-100 last:border-0">
    
    {/* Dòng Tiêu đề & Phần trăm hoàn thành tổng thể */}
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-start gap-4 overflow-hidden">
        {/* Chỉ báo màu sắc thương hiệu của Epic */}
        <div 
          className="w-1.5 h-10 rounded-full shrink-0 mt-1 shadow-sm" 
          style={{ backgroundColor: epic.color || '#cbd5e1' }}
        />
        
        <div className="overflow-hidden">
          <h4 className="text-[15px] font-bold text-slate-800 group-hover:text-[#0052CC] transition-colors truncate leading-tight">
            {epic.epicName}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
             <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
                {epic.epicCode}
             </span>
             <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
      
      {/* Chỉ số hoàn thành lớn */}
      <div className="text-right shrink-0 ml-4">
        <div className="flex items-baseline justify-end gap-0.5">
            <span className="text-2xl font-black text-slate-800 tracking-tight">
                {Math.round(epic.taskProgressPercent)}
            </span>
            <span className="text-xs font-bold text-slate-400">%</span>
        </div>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] mt-0.5">Completion</p>
      </div>
    </div>

    {/* Các thanh tiến độ chi tiết (Grid Layout) */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
      
      {/* Tiến độ theo Số lượng Issue */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Issues
          </span>
          <span className="text-[11px] font-bold text-slate-600">
            <span className="text-slate-900">{epic.completedTasks}</span>
            <span className="text-slate-300 mx-1">/</span>
            {epic.totalTasks}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" 
            style={{ width: `${epic.taskProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Tiến độ theo Story Points */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            <Flame className="w-3.5 h-3.5 text-orange-500" /> Story Points
          </span>
          <span className="text-[11px] font-bold text-slate-600">
            <span className="text-slate-900">{epic.completedPoints}</span>
            <span className="text-slate-300 mx-1">/</span>
            {epic.totalPoints}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-[#0052CC] rounded-full transition-all duration-700 ease-out" 
            style={{ width: `${epic.pointProgressPercent}%` }}
          />
        </div>
      </div>

    </div>
  </div>
);

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Thẻ thống kê tiến độ các Epic trong dự án.
 * Tự động xử lý các trạng thái Đang tải (Loading), Trống (Empty) và Hiển thị danh sách.
 */
export default function EpicProgressCard({ data, loading }: EpicProgressCardProps) {
    
  // --- RENDER: LOADING STATE ---
  if (loading) return (
    <div className="h-[400px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-sm">
      <Loader2 className="w-8 h-8 animate-spin text-[#0052CC] opacity-80" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading stats...</span>
    </div>
  );

  // --- RENDER: EMPTY STATE ---
  if (!data || data.length === 0) return (
    <div className="h-[400px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-sm">
      <div className="p-4 bg-slate-50 rounded-full mb-4">
        <Layers className="w-8 h-8 opacity-20" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">No active epics found</p>
    </div>
  );

  // --- RENDER: MAIN CONTENT ---
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header của bảng thống kê */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Epic Progress Summary</h3>
        <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-600 shadow-sm">
          {data.length} Epics
        </span>
      </div>

      {/* Danh sách cuộn (Scrollable List) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[600px]">
        <div className="flex flex-col">
          {data.map((epic) => (
            <EpicListItem key={epic.epicId} epic={epic} />
          ))}
        </div>
      </div>

      {/* Footer mờ nhẹ khi cuộn */}
      <div className="h-4 bg-gradient-to-t from-slate-50/50 to-transparent shrink-0" />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}