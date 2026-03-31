"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { 
  Filter, Calendar as CalendarIcon, X, Layers, Clock, 
  Zap, Loader2, FileSpreadsheet, ChevronDown 
} from "lucide-react";

// Internal Services & Types
import { WorkloadParams } from "@/services/apiStatistics";
import { getSprints, Sprint } from "@/services/apiSprint";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & INTERFACES
// =============================================================================

const GROUP_BY_OPTIONS = [
  { value: "STATUS", label: "By Status" },
  { value: "PRIORITY", label: "By Priority" },
];

interface WorkloadFilterToolbarProps {
  projectId: number;
  filters: WorkloadParams;
  setFilters: (f: WorkloadParams | ((prev: WorkloadParams) => WorkloadParams)) => void;
  onExport: () => void;
  isExporting: boolean;
  hideExport?: boolean; 
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thanh công cụ lọc dữ liệu phân bổ nguồn lực (Workload Filter Toolbar).
 * Cho phép chuyển đổi đơn vị đo lường (Points/Hours), nhóm dữ liệu và lọc theo Sprint.
 */
export default function WorkloadFilterToolbar({ 
  projectId, 
  filters, 
  setFilters, 
  onExport, 
  isExporting,
  hideExport = false
}: WorkloadFilterToolbarProps) {
    
  // ---------------------------------------------------------------------------
  // 4. STATE & DATA FETCHING
  // ---------------------------------------------------------------------------
  
  const [sprints, setSprints] = useState<Sprint[]>([]);

  useEffect(() => {
    if (!projectId) return;
    getSprints(projectId)
      .then(setSprints)
      .catch(err => console.error("Failed to load sprints for workload filter", err));
  }, [projectId]);

  // ---------------------------------------------------------------------------
  // 5. HANDLERS
  // ---------------------------------------------------------------------------

  const handleFilterChange = useCallback((key: keyof WorkloadParams, val: any) => {
    const newValue = (val === "ALL" || val === "") ? undefined : val;
    
    setFilters(prev => ({
      ...prev,
      [key]: key === 'sprintId' && newValue !== undefined ? Number(newValue) : newValue
    }));
  }, [setFilters]);

  const handleDateChange = useCallback((field: 'from' | 'to', val: string) => {
    setFilters(prev => ({ ...prev, [field]: val || undefined }));
  }, [setFilters]);

  const clearOptionalFilters = useCallback(() => {
    setFilters(prev => ({ 
        viewType: prev.viewType || "POINTS", 
        groupBy: prev.groupBy || "STATUS" 
    }));
  }, [setFilters]);

  const hasActiveOptionalFilters = !!(filters.sprintId || filters.from || filters.to);

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
        
        {/* NHÃN CHỈ BÁO */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Analytics Filter</span>
        </div>

        {/* 1. CHẾ ĐỘ XEM (View Type: POINTS/HOURS) */}
        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 h-9 shadow-sm">
             <button 
                onClick={() => handleFilterChange('viewType', 'POINTS')}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-full rounded-md text-[11px] font-bold uppercase tracking-tight transition-all active:scale-95",
                  (filters.viewType === 'POINTS' || !filters.viewType) 
                    ? "bg-blue-50 text-[#0052CC] shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
             >
                <Zap className="w-3 h-3" /> Points
             </button>
             <div className="w-px h-4 bg-slate-100 mx-1" />
             <button 
                onClick={() => handleFilterChange('viewType', 'HOURS')}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-full rounded-md text-[11px] font-bold uppercase tracking-tight transition-all active:scale-95",
                  filters.viewType === 'HOURS' 
                    ? "bg-purple-50 text-purple-700 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
             >
                <Clock className="w-3 h-3" /> Hours
             </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block" />

        {/* 2. NHÓM DỮ LIỆU (Group By) */}
        <div className="relative group">
            <Layers className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <select 
                className={cn(
                  "h-9 pl-9 pr-8 border border-slate-200 rounded-lg text-[11px] font-bold uppercase tracking-widest text-slate-700 appearance-none outline-none cursor-pointer shadow-sm transition-all",
                  "hover:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF]"
                )}
                value={filters.groupBy || "STATUS"}
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
            >
                {GROUP_BY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
        </div>

        {/* 3. CHỌN SPRINT */}
        <div className="relative group">
            <select 
                className={cn(
                  "h-9 px-3 pr-8 border border-slate-200 rounded-lg text-[11px] font-bold uppercase tracking-widest text-slate-700 appearance-none outline-none cursor-pointer shadow-sm transition-all max-w-[160px]",
                  filters.sprintId ? "bg-blue-50 border-blue-200 text-[#0052CC]" : "bg-white hover:border-blue-300 focus:ring-2 focus:ring-blue-100"
                )}
                value={filters.sprintId || ""}
                onChange={(e) => handleFilterChange('sprintId', e.target.value)}
            >
                <option value="">All Sprints</option>
                {sprints.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
        </div>

        {/* 4. KHOẢNG THỜI GIAN */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm h-9 hover:border-blue-300 transition-colors">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <input 
                type="date" 
                title="From Date"
                className="text-[11px] bg-transparent border-none outline-none text-slate-600 font-bold uppercase tracking-tight w-28 cursor-pointer"
                value={filters.from || ""}
                onChange={(e) => handleDateChange('from', e.target.value)}
            />
            <span className="text-slate-300 font-bold">—</span>
            <input 
                type="date" 
                title="To Date"
                className="text-[11px] bg-transparent border-none outline-none text-slate-600 font-bold uppercase tracking-tight w-28 cursor-pointer"
                value={filters.to || ""}
                onChange={(e) => handleDateChange('to', e.target.value)}
            />
        </div>

        {/* ACTIONS (EXPORT & RESET) */}
        <div className="ml-auto flex items-center gap-2">
            
            {!hideExport && (
                <button
                    onClick={onExport}
                    disabled={isExporting}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 h-9 rounded-lg shadow-sm transition-all text-[11px] font-bold uppercase tracking-widest",
                      "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    {isExporting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                    )}
                    Export
                </button>
            )}

            {hasActiveOptionalFilters && (
                <button 
                    onClick={clearOptionalFilters}
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 h-9 rounded-lg transition-all border border-red-100 active:scale-95 shadow-sm"
                >
                    <X className="w-3.5 h-3.5" /> Reset
                </button>
            )}
        </div>
    </div>
  );
}