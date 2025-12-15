"use client";

import React, { useMemo } from 'react';
import { 
  Search, Filter, Users, AlertCircle, Layers, 
  ChevronLeft, ChevronRight, X, LayoutGrid, List, Columns,
  Calendar as CalendarIcon, Check, LucideIcon
} from "lucide-react";
import { ProjectMember } from "@/services/apiProject"; 

// =============================================================================
// 1. CONSTANTS & CONFIG
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
// 2. INTERFACES
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
// 3. SUB-COMPONENTS
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
 * Component Dropdown chung cho bộ lọc
 */
const FilterDropdown = ({ icon: Icon, value, onChange, options, placeholder, minWidth = "min-w-[140px]" }: FilterDropdownProps) => (
  <div className="relative">
    <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
    <select 
      className={`h-[34px] pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm ${minWidth}`}
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
    {/* Custom Arrow Icon */}
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-slate-500">
        <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
    </div>
  </div>
);

/**
 * Component nút chuyển đổi chế độ xem (Month/Week/Day)
 */
const ViewToggleButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: LucideIcon, label: string }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${active ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
  >
    <Icon className="w-3.5 h-3.5" /> {label}
  </button>
);

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

export default function CalendarFilterBar({ 
  filters, 
  onFilterChange, 
  viewMode,
  onViewChange,
  onNavigate,
  titleDate,
  members = [] 
}: CalendarFilterBarProps) {

  // --- HANDLERS ---

  const handleFilterChange = (key: keyof FilterState, val: any) => {
      // Nếu value là "ALL" thì gửi string rỗng để reset filter đó
      onFilterChange(key, val === "ALL" ? "" : val);
  };

  const clearFilters = () => {
      onFilterChange('keyword', '');
      onFilterChange('assigneeId', '');
      onFilterChange('priority', '');
      onFilterChange('taskType', '');
      onFilterChange('showSprints', true);
  };

  const hasFilters = useMemo(() => {
    return !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType || !filters.showSprints;
  }, [filters]);

  // Chuẩn bị options cho Assignee dropdown
  const assigneeOptions = useMemo(() => {
    return members.map(m => ({ label: m.fullName, value: m.userId }));
  }, [members]);

  // --- RENDER ---
  return (
    <div className="flex flex-col gap-4 mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
        
        {/* === ROW 1: Navigation & Search === */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            {/* Left: Calendar Controls */}
            <div className="flex flex-wrap items-center gap-3">
                {/* View Switcher */}
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm items-center">
                    {VIEW_MODES.map((mode, index) => (
                      <React.Fragment key={mode.id}>
                        <ViewToggleButton 
                          active={viewMode === mode.id}
                          onClick={() => onViewChange(mode.id)}
                          icon={mode.icon}
                          label={mode.label}
                        />
                        {/* Divider giữa các nút */}
                        {index < VIEW_MODES.length - 1 && <div className="w-px h-4 bg-slate-100 mx-0.5"></div>}
                      </React.Fragment>
                    ))}
                </div>

                {/* Date Navigator */}
                <div className="flex items-center bg-white px-1 py-1 border border-slate-200 rounded-lg shadow-sm h-[34px]">
                    <button onClick={() => onNavigate('PREV')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-700 min-w-[110px] text-center select-none">
                      {titleDate}
                    </span>
                    <button onClick={() => onNavigate('NEXT')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <button onClick={() => onNavigate('TODAY')} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm h-[34px]">
                  Today
                </button>
            </div>

            {/* Right: Search Input */}
            <div className="relative group w-full xl:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search tasks or sprints..." 
                  className="w-full h-[34px] pl-9 pr-4 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white shadow-sm placeholder:text-slate-400" 
                  value={filters.keyword} 
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                />
            </div>
        </div>

        <div className="h-px bg-slate-200 w-full"></div>

        {/* === ROW 2: Detailed Filters === */}
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 mr-2 font-semibold uppercase tracking-wide">
                <Filter className="w-3.5 h-3.5" /> Filters
            </div>

            {/* Assignee Filter */}
            <FilterDropdown 
              icon={Users}
              placeholder="All Assignees"
              value={filters.assigneeId}
              onChange={(val) => handleFilterChange('assigneeId', val)}
              options={assigneeOptions}
              minWidth="min-w-[160px]"
            />

            {/* Priority Filter */}
            <FilterDropdown 
              icon={AlertCircle}
              placeholder="All Priorities"
              value={filters.priority}
              onChange={(val) => handleFilterChange('priority', val)}
              options={PRIORITY_OPTIONS}
            />

            {/* Type Filter */}
            <FilterDropdown 
              icon={Layers}
              placeholder="All Types"
              value={filters.taskType}
              onChange={(val) => handleFilterChange('taskType', val)}
              options={TYPE_OPTIONS}
              minWidth="min-w-[130px]"
            />

            {/* Show Sprints Toggle */}
            <button 
              onClick={() => onFilterChange('showSprints', !filters.showSprints)} 
              className={`flex items-center gap-2 h-[34px] pl-2 pr-3 rounded-lg border transition-all cursor-pointer select-none ${filters.showSprints ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${filters.showSprints ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {filters.showSprints ? <Check className="w-3 h-3" /> : <CalendarIcon className="w-3 h-3" />}
                </div>
                <span className="text-xs font-bold">Sprints</span>
            </button>

            {/* Reset Button */}
            {hasFilters && (
                <button 
                  onClick={clearFilters} 
                  className="ml-auto flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all border border-red-100"
                >
                    <X className="w-3.5 h-3.5" /> Clear
                </button>
            )}
        </div>
    </div>
  );
}