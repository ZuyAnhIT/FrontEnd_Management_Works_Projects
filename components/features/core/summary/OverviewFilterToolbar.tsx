"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo, useCallback, Dispatch, SetStateAction } from "react";
import { 
  Search, Filter, Calendar as CalendarIcon, X, 
  Clock, Users, AlertCircle, Layers, ChevronDown, LucideIcon 
} from "lucide-react";
import { OverviewParams } from "@/services/apiStatistics";
import { ProjectMember } from "@/services/apiProject";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

/**
 * Định nghĩa Props cho component chính
 */
interface OverviewFilterToolbarProps {
  filters: OverviewParams;
  // Sử dụng kiểu Dispatch chuẩn của React để fix lỗi 'prev' any
  setFilters: Dispatch<SetStateAction<OverviewParams>>;
  members: ProjectMember[];
}

interface FilterDropdownProps {
  icon: LucideIcon;
  value: string | number | undefined;
  onChange: (val: string | number) => void;
  options: { value: string | number; label: string }[];
  placeholder: string;
  minWidth?: string;
}

// =============================================================================
// 3. CONFIGURATION & HELPERS
// =============================================================================

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const PRIORITY_OPTIONS = [
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const TYPE_OPTIONS = [
  { value: "STORY", label: "Story" },
  { value: "TASK", label: "Task" },
  { value: "BUG", label: "Bug" },
];

// =============================================================================
// 4. SUB-COMPONENTS
// =============================================================================

const FilterDropdown = ({ 
  icon: Icon, 
  value, 
  onChange, 
  options, 
  placeholder, 
  minWidth = "min-w-[130px]" 
}: FilterDropdownProps) => {
  const selectedValue = (value !== undefined && value !== null) ? String(value) : "ALL";

  return (
    <div className="relative group">
      <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" />
      <select 
        className={cn(
          "h-9 pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-[11px] font-bold uppercase tracking-widest text-slate-700 appearance-none outline-none cursor-pointer shadow-sm transition-all",
          "hover:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF]",
          minWidth
        )}
        value={selectedValue}
        onChange={(e) => onChange(e.target.value === "ALL" ? "ALL" : e.target.value)}
      >
        <option value="ALL">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
    </div>
  );
};

// =============================================================================
// 5. MAIN COMPONENT
// =============================================================================

export default function OverviewFilterToolbar({ 
  filters, 
  setFilters, 
  members 
}: OverviewFilterToolbarProps) {

  // ---------------------------------------------------------------------------
  // 6. DATA PREPARATION
  // ---------------------------------------------------------------------------
  
  const assigneeOptions = useMemo(() => 
    members.map((m: ProjectMember) => ({ // Định nghĩa kiểu 'm' rõ ràng
      value: m.userId || m.memberId || 0, 
      label: m.fullName 
    }))
    .filter(m => m.value !== 0) as { value: number, label: string }[],
  [members]);

  // ---------------------------------------------------------------------------
  // 7. HANDLERS
  // ---------------------------------------------------------------------------

  const handleChange = useCallback((key: keyof OverviewParams, val: any) => {
    const newValue = (val === "ALL" || val === "") ? undefined : val;
    
    setFilters((prev: OverviewParams) => { // Định nghĩa kiểu 'prev' rõ ràng
      const nextFilters = { ...prev, [key]: newValue };
      
      if (key === 'assigneeId' && newValue !== undefined) {
        nextFilters[key] = Number(newValue);
      }
      
      return nextFilters;
    });
  }, [setFilters]);

  const handleQuickTime = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setFilters((prev: OverviewParams) => ({
      ...prev,
      from: formatDate(start),
      to: formatDate(end)
    }));
  }, [setFilters]);

  const clearFilters = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    setFilters({
      from: formatDate(start),
      to: formatDate(end),
    });
  }, [setFilters]);

  const hasActiveFilters = !!(filters.keyword || filters.assigneeId || filters.priority || filters.taskType);

  const isTimeActive = (days: number) => {
    const today = formatDate(new Date());
    const start = new Date();
    start.setDate(new Date().getDate() - days);
    return filters.to === today && filters.from === formatDate(start);
  };

  // ---------------------------------------------------------------------------
  // 8. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-4 mb-6 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" /> Time Range
                </div>
                
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => handleQuickTime(7)}
                        className={cn(
                          "px-3 py-1 text-[11px] font-bold uppercase tracking-tight rounded-md transition-all active:scale-95",
                          isTimeActive(7) ? "bg-blue-50 text-[#0052CC]" : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        7 Days
                    </button>
                    <div className="w-px bg-slate-100 my-1 mx-1" />
                    <button 
                        onClick={() => handleQuickTime(30)}
                        className={cn(
                          "px-3 py-1 text-[11px] font-bold uppercase tracking-tight rounded-md transition-all active:scale-95",
                          isTimeActive(30) ? "bg-blue-50 text-[#0052CC]" : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        30 Days
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm h-9 hover:border-blue-300 transition-colors">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <input 
                        type="date" 
                        title="From Date"
                        className="text-[11px] bg-transparent border-none outline-none text-slate-700 font-bold uppercase tracking-tight w-28 cursor-pointer"
                        value={filters.from || ""}
                        onChange={(e) => handleChange('from', e.target.value)}
                    />
                    <span className="text-slate-300 font-bold">—</span>
                    <input 
                        type="date" 
                        title="To Date"
                        className="text-[11px] bg-transparent border-none outline-none text-slate-700 font-bold uppercase tracking-tight w-28 cursor-pointer"
                        value={filters.to || ""}
                        onChange={(e) => handleChange('to', e.target.value)}
                    />
                </div>
            </div>

            <div className="relative group w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search issues..." 
                    className={cn(
                      "w-full h-9 pl-9 pr-4 text-[13px] font-medium border border-slate-200 rounded-lg bg-white shadow-sm outline-none transition-all",
                      "focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] placeholder:text-slate-400"
                    )}
                    value={filters.keyword || ""}
                    onChange={(e) => handleChange('keyword', e.target.value)}
                />
            </div>
        </div>

        <div className="h-px bg-slate-200/60 w-full" />

        <div className="flex flex-wrap items-center gap-3 px-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">
                <Filter className="w-3.5 h-3.5" /> Properties
            </div>

            <FilterDropdown
                icon={AlertCircle}
                placeholder="All Priorities"
                value={filters.priority}
                onChange={(val) => handleChange('priority', val)}
                options={PRIORITY_OPTIONS}
            />

            <FilterDropdown
                icon={Layers}
                placeholder="All Types"
                value={filters.taskType}
                onChange={(val) => handleChange('taskType', val)}
                options={TYPE_OPTIONS}
            />

            <FilterDropdown
                icon={Users}
                placeholder="All Assignees"
                value={filters.assigneeId}
                onChange={(val) => handleChange('assigneeId', val)}
                options={assigneeOptions}
                minWidth="min-w-[150px]"
            />

            {hasActiveFilters && (
                <button 
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 h-9 rounded-lg transition-all border border-red-100 active:scale-95 shadow-sm"
                >
                    <X className="w-3.5 h-3.5" /> Reset
                </button>
            )}
        </div>
    </div>
  );
}