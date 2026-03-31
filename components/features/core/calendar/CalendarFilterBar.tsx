"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  AlertCircle, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  LayoutGrid, 
  List, 
  Columns,
  Calendar as CalendarIcon, 
  Check, 
  LucideIcon
} from "lucide-react";
import { ProjectMember } from "@/services/apiProject"; 
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & CONFIG
// =============================================================================

const PRIORITY_OPTIONS = [
  { label: "Urgent", value: "URGENT" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

const TYPE_OPTIONS = [
  { label: "Task", value: "TASK" },
  { label: "Bug", value: "BUG" },
  { label: "Story", value: "STORY" },
];

const VIEW_MODES = [
  { id: 'dayGridMonth', label: 'Month', icon: LayoutGrid },
  { id: 'timeGridWeek', label: 'Week', icon: Columns },
  { id: 'timeGridDay', label: 'Day', icon: List },
];

// =============================================================================
// 3. INTERFACES
// =============================================================================

export interface FilterState {
  keyword: string;
  assigneeId: string;
  priority: string;
  taskType: string;
  showSprints: boolean;
  from: string;
  to: string;
}

interface CalendarFilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  viewMode: string;
  onViewChange: (view: string) => void;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  titleDate: string;
  members: ProjectMember[]; 
}

// =============================================================================
// 4. SUB-COMPONENTS
// =============================================================================

interface FilterDropdownProps {
  icon: LucideIcon;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string | number }[];
  placeholder: string;
  minWidth?: string;
}

/**
 * Dropdown box tiêu chuẩn cho các bộ lọc
 */
const FilterDropdown = ({ 
  icon: Icon, 
  value, 
  onChange, 
  options, 
  placeholder, 
  minWidth = "min-w-[140px]" 
}: FilterDropdownProps) => (
  <div className="relative group">
    <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 group-hover:text-blue-500 transition-colors" />
    <select 
      className={cn(
        "h-[34px] pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 uppercase tracking-tight",
        "appearance-none cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm",
        minWidth
      )}
      value={value || "ALL"} 
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="ALL">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {/* Biểu tượng mũi tên tùy chỉnh */}
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-slate-400 group-hover:text-slate-600 transition-colors">
        <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
    </div>
  </div>
);

/**
 * Nút chuyển đổi View Mode của lịch (Month / Week / Day)
 */
const ViewToggleButton = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active: boolean, 
  onClick: () => void, 
  icon: LucideIcon, 
  label: string 
}) => (
  <button 
    onClick={onClick} 
    className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all active:scale-95",
      active 
        ? 'bg-blue-50 text-blue-700 shadow-sm' 
        : 'text-slate-500 hover:bg-slate-100'
    )}
    title={`Switch to ${label} view`}
  >
    <Icon className="w-3.5 h-3.5" /> 
    <span className="hidden sm:inline-block">{label}</span>
  </button>
);

// =============================================================================
// 5. MAIN COMPONENT
// =============================================================================

/**
 * Thanh công cụ Lịch (Calendar Filter Bar).
 * Quản lý cả bộ lọc công việc/sprint lẫn điều hướng thời gian hiển thị.
 */
export default function CalendarFilterBar({ 
  filters, 
  onFilterChange, 
  viewMode,
  onViewChange,
  onNavigate,
  titleDate,
  members = [] 
}: CalendarFilterBarProps) {

  // ---------------------------------------------------------------------------
  // 6. LOGIC & HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Cập nhật từng trạng thái của filter
   */
  const handleFilterChange = useCallback((key: keyof FilterState, val: any) => {
      onFilterChange(key, val === "ALL" ? "" : val);
  }, [onFilterChange]);

  /**
   * Đặt lại tất cả các tham số tìm kiếm và filter về trạng thái ban đầu
   */
  const clearFilters = useCallback(() => {
      onFilterChange('keyword', '');
      onFilterChange('assigneeId', '');
      onFilterChange('priority', '');
      onFilterChange('taskType', '');
      onFilterChange('showSprints', true);
  }, [onFilterChange]);

  /**
   * Đánh giá xem có đang áp dụng bất kì filter tuỳ biến nào không
   */
  const hasFilters = useMemo(() => {
    return !!(filters.keyword || filters.assigneeId || filters.priority || filters.taskType || !filters.showSprints);
  }, [filters]);

  /**
   * Chuyển đổi format thành viên thành option dropdown
   */
  const assigneeOptions = useMemo(() => {
    return members.map(m => ({ label: m.fullName, value: m.userId }));
  }, [members]);

  // ---------------------------------------------------------------------------
  // 7. RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-4 mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
        
        {/* === HÀNG 1: ĐIỀU HƯỚNG THỜI GIAN & TÌM KIẾM (NAVIGATION & SEARCH) === */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            {/* Khối bên trái: Các công cụ thao tác trên Calendar */}
            <div className="flex flex-wrap items-center gap-3">
                
                {/* 1. Nút chuyển đổi View Mode */}
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm items-center">
                    {VIEW_MODES.map((mode, index) => (
                      <React.Fragment key={mode.id}>
                        <ViewToggleButton 
                          active={viewMode === mode.id}
                          onClick={() => onViewChange(mode.id)}
                          icon={mode.icon}
                          label={mode.label}
                        />
                        {index < VIEW_MODES.length - 1 && <div className="w-px h-4 bg-slate-100 mx-0.5" />}
                      </React.Fragment>
                    ))}
                </div>

                {/* 2. Cụm điều hướng Ngày/Tháng (Date Navigator) */}
                <div className="flex items-center bg-white px-1 py-1 border border-slate-200 rounded-lg shadow-sm h-[34px]">
                    <button 
                      onClick={() => onNavigate('PREV')} 
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className="px-3 text-[13px] font-bold text-slate-700 min-w-[110px] text-center select-none uppercase tracking-wide">
                      {titleDate}
                    </span>
                    
                    <button 
                      onClick={() => onNavigate('NEXT')} 
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* 3. Nút trỏ về Hôm nay */}
                <button 
                  onClick={() => onNavigate('TODAY')} 
                  className={cn(
                    "text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-white border border-slate-200",
                    "px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm h-[34px] active:scale-95"
                  )}
                >
                  Today
                </button>
            </div>

            {/* Khối bên phải: Ô tìm kiếm (Search Input) */}
            <div className="relative group w-full xl:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search tasks or sprints..." 
                  className={cn(
                    "w-full h-[34px] pl-9 pr-4 text-[12px] font-medium border border-slate-200 rounded-lg bg-white shadow-sm transition-all outline-none",
                    "focus:ring-2 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400"
                  )}
                  value={filters.keyword} 
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                />
                
                {/* Nút xoá tìm kiếm nhanh */}
                {filters.keyword && (
                  <button 
                    onClick={() => handleFilterChange('keyword', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
            </div>
        </div>

        <div className="h-px bg-slate-200 w-full" />

        {/* === HÀNG 2: BỘ LỌC CHI TIẾT (DETAILED FILTERS) === */}
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mr-2 font-bold uppercase tracking-widest">
                <Filter className="w-3.5 h-3.5" /> Quick Filters
            </div>

            <FilterDropdown 
              icon={Users}
              placeholder="All Assignees"
              value={filters.assigneeId}
              onChange={(val) => handleFilterChange('assigneeId', val)}
              options={assigneeOptions}
              minWidth="min-w-[160px]"
            />

            <FilterDropdown 
              icon={AlertCircle}
              placeholder="All Priorities"
              value={filters.priority}
              onChange={(val) => handleFilterChange('priority', val)}
              options={PRIORITY_OPTIONS}
            />

            <FilterDropdown 
              icon={Layers}
              placeholder="All Types"
              value={filters.taskType}
              onChange={(val) => handleFilterChange('taskType', val)}
              options={TYPE_OPTIONS}
              minWidth="min-w-[130px]"
            />

            {/* Nút bật/tắt hiển thị Sprints (Toggle) */}
            <button 
              onClick={() => handleFilterChange('showSprints', !filters.showSprints)} 
              className={cn(
                "flex items-center gap-2 h-[34px] pl-2 pr-3 rounded-lg border transition-all cursor-pointer select-none active:scale-95 shadow-sm",
                filters.showSprints 
                  ? "bg-blue-50 border-blue-200 text-blue-700" 
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              )}
            >
                <div className={cn(
                  "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                  filters.showSprints ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-400"
                )}>
                    {filters.showSprints ? <Check className="w-3 h-3" /> : <CalendarIcon className="w-3 h-3" />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Sprints</span>
            </button>

            {/* Nút xóa bỏ toàn bộ filter */}
            {hasFilters && (
                <button 
                  onClick={clearFilters} 
                  className={cn(
                    "ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-red-600 bg-red-50 hover:bg-red-100",
                    "px-4 py-1.5 rounded-lg transition-all border border-red-100 shadow-sm active:scale-95 h-[34px]"
                  )}
                >
                    <X className="w-3.5 h-3.5" /> Clear Filters
                </button>
            )}
        </div>
    </div>
  );
}