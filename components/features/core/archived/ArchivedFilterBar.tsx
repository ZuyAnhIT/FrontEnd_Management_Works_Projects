"use client";

import React, { useMemo } from 'react';
import { Search, Filter, Users, AlertCircle, Layers, X, ChevronDown, LucideIcon } from "lucide-react";
import { ProjectMember, ArchivedTaskParams } from "@/services/apiProject";

// =============================================================================
// 1. CONSTANTS & CONFIG
// =============================================================================

const PRIORITY_OPTIONS = [
  { label: "Urgent", value: "URGENT" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

const TASK_TYPE_OPTIONS = [
  { label: "Task", value: "TASK" },
  { label: "Bug", value: "BUG" },
  { label: "Story", value: "STORY" },
];

// =============================================================================
// 2. SUB-COMPONENT: SELECT WRAPPER
// =============================================================================

interface SelectWrapperProps {
  icon: LucideIcon;
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: React.ReactNode;
  placeholder: string;
  minWidth?: string;
}

/**
 * Component bọc Select box để tái sử dụng giao diện
 */
const SelectWrapper = ({ 
  icon: Icon, 
  value, 
  onChange, 
  options, 
  placeholder, 
  minWidth = "min-w-[130px]" 
}: SelectWrapperProps) => (
  <div className="relative group">
    <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors z-10" />
    <select 
      className={`h-9 pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 
                  appearance-none cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 
                  transition-all shadow-sm ${minWidth}`}
      value={value || "ALL"}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="ALL">{placeholder}</option>
      {options}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none opacity-60" />
  </div>
);

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

interface ArchivedFilterBarProps {
  filters: ArchivedTaskParams;
  onFilterChange: (key: keyof ArchivedTaskParams, value: any) => void;
  onClear: () => void;
  members: ProjectMember[];
}

export default function ArchivedFilterBar({ 
  filters, 
  onFilterChange, 
  onClear,
  members = [] 
}: ArchivedFilterBarProps) {

  // --- HANDLERS ---
  
  // Xử lý thay đổi filter chung
  const handleFilterChange = (key: keyof ArchivedTaskParams, val: string) => {
    // Nếu chọn "ALL" thì gửi undefined để xóa filter đó
    onFilterChange(key, val === "ALL" ? undefined : val);
  };

  // Kiểm tra xem có filter nào đang active không
  const hasActiveFilters = useMemo(() => {
    return !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType;
  }, [filters]);

  // --- RENDER ---
  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-6 bg-slate-50/80 p-1.5 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
      
      {/* 1. Search Input Section */}
      <div className="relative flex-1 min-w-[200px] group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search archived tasks by title or code..."
          className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 
                     placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          value={filters.keyword || ""}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
        />
      </div>

      {/* Divider (Desktop only) */}
      <div className="h-9 w-px bg-slate-200 hidden xl:block mx-1"></div>

      {/* 2. Filters Row Section */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 mr-2 font-semibold uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5" /> Filters
        </div>
        
        {/* Filter: Assignee */}
        <SelectWrapper 
            icon={Users}
            placeholder="All Assignees"
            value={filters.assigneeId}
            onChange={(val) => handleFilterChange('assigneeId', val)} // API sẽ tự parse số bên ngoài hoặc trong hàm onFilterChange
            minWidth="min-w-[160px]"
            options={members.map(m => (
                <option key={m.userId} value={m.userId}>{m.fullName}</option>
            ))}
        />

        {/* Filter: Priority */}
        <SelectWrapper 
            icon={AlertCircle}
            placeholder="All Priorities"
            value={filters.priority}
            onChange={(val) => handleFilterChange('priority', val)}
            options={PRIORITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        />

        {/* Filter: Type */}
        <SelectWrapper 
            icon={Layers}
            placeholder="All Types"
            value={filters.taskType}
            onChange={(val) => handleFilterChange('taskType', val)}
            options={TASK_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        />

        {/* Action: Clear Filters */}
        {hasActiveFilters && (
            <button 
                onClick={onClear}
                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all border border-red-100 h-9"
            >
                <X className="w-3.5 h-3.5" /> Clear
            </button>
        )}
      </div>
    </div>
  );
}