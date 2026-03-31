"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";
import { 
  Filter, 
  Calendar as CalendarIcon, 
  X, 
  FileSpreadsheet, 
  Loader2, 
  ChevronDown 
} from "lucide-react";
import { EpicProgressParams } from "@/services/apiStatistics";
import { getSprints, Sprint } from "@/services/apiSprint";
import { getProjectStatuses, RawStatusColumn } from "@/services/apiBoard"; 
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & SUB-COMPONENTS
// =============================================================================

interface EpicFilterToolbarProps {
  projectId: number;
  filters: EpicProgressParams;
  setFilters: (f: EpicProgressParams) => void;
  onExport: () => void;
  isExporting: boolean;
  hideExport?: boolean;
}

interface SelectFilterProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { id: number | string; name: string }[];
  placeholder: string;
}

/**
 * Thành phần Select Dropdown chuẩn hóa cho bộ lọc.
 */
const SelectFilterWrapper = ({ value, onChange, options, placeholder }: SelectFilterProps) => (
  <div className="relative group">
    <select 
      className={cn(
        "h-9 pl-3 pr-8 border border-slate-200 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-white text-slate-700",
        "focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] outline-none cursor-pointer hover:border-blue-300 transition-all shadow-sm appearance-none"
      )}
      value={value || ""}
      onChange={onChange}
    >
      <option value="">{placeholder}</option>
      {options.map(s => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors" />
  </div>
);

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thanh công cụ lọc và báo cáo tiến độ Epic.
 * Hỗ trợ lọc theo Sprint, Trạng thái công việc và khoảng thời gian.
 */
export default function EpicFilterToolbar({ 
  projectId, 
  filters, 
  setFilters,
  onExport,
  isExporting,
  hideExport = false
}: EpicFilterToolbarProps) {
  
  // ---------------------------------------------------------------------------
  // 4. STATE
  // ---------------------------------------------------------------------------
  
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [statuses, setStatuses] = useState<RawStatusColumn[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // ---------------------------------------------------------------------------
  // 5. EFFECTS: Load Filter Data
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!projectId) return;
    
    setIsLoadingOptions(true);
    Promise.all([
      getSprints(projectId),
      getProjectStatuses(projectId)
    ]).then(([sprintRes, statusRes]) => {
      setSprints(sprintRes);
      setStatuses(statusRes);
    }).catch(err => {
      console.error("Failed to load epic filter options", err);
    }).finally(() => {
      setIsLoadingOptions(false);
    });
  }, [projectId]);

  // ---------------------------------------------------------------------------
  // 6. HANDLERS
  // ---------------------------------------------------------------------------

  const handleSprintChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilters({ ...filters, sprintId: val ? Number(val) : undefined });
  }, [filters, setFilters]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilters({ 
      ...filters, 
      statusIds: val ? [Number(val)] : undefined 
    });
  }, [filters, setFilters]);

  const handleDateChange = useCallback((field: 'from' | 'to', val: string) => {
    setFilters({ ...filters, [field]: val || undefined });
  }, [filters, setFilters]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  const hasActiveFilters = !!(filters.sprintId || filters.statusIds || filters.from || filters.to);

  // ---------------------------------------------------------------------------
  // 7. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
      
      {/* KHỐI 1: NHÃN BỘ LỌC */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
        <Filter className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Quick Filters</span>
      </div>

      {/* KHỐI 2: CHỌN SPRINT */}
      <SelectFilterWrapper
        placeholder="All Sprints"
        value={filters.sprintId || ""}
        onChange={handleSprintChange}
        options={sprints.map(s => ({ id: s.id, name: s.name }))}
      />

      {/* KHỐI 3: CHỌN TRẠNG THÁI */}
      <SelectFilterWrapper
        placeholder="All Statuses"
        value={filters.statusIds?.[0] || ""}
        onChange={handleStatusChange}
        options={statuses.map(s => ({ id: s.id, name: s.name }))}
      />

      <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block" />

      {/* KHỐI 4: KHOẢNG THỜI GIAN (Date Range) */}
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg hover:border-blue-300 transition-all shadow-sm">
        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
        <input 
          type="date" 
          title="From Date"
          className="text-[11px] border-none outline-none text-slate-600 bg-transparent w-28 font-bold uppercase tracking-tight p-0 cursor-pointer"
          value={filters.from || ""}
          onChange={(e) => handleDateChange('from', e.target.value)}
        />
        <span className="text-slate-300 font-bold">—</span>
        <input 
          type="date" 
          title="To Date"
          className="text-[11px] border-none outline-none text-slate-600 bg-transparent w-28 font-bold uppercase tracking-tight p-0 cursor-pointer"
          value={filters.to || ""}
          onChange={(e) => handleDateChange('to', e.target.value)}
        />
      </div>

      {/* KHỐI PHẢI: ACTIONS (Export & Clear) */}
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
            Export Report
          </button>
        )}

        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-red-600 bg-red-50",
              "hover:bg-red-100 px-3 py-1.5 h-9 rounded-lg transition-all border border-red-100 active:scale-95 shadow-sm"
            )}
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}