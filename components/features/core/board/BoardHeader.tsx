"use client";

import React, { useMemo } from "react";
import { Search, X, Filter, ChevronDown, LucideIcon } from "lucide-react";
import { BoardFilterParams } from "@/services/apiBoard";
import { ProjectMember } from "@/services/apiProject";

// =============================================================================
// 1. CONSTANTS & CONFIGURATION
// =============================================================================

const PRIORITY_OPTIONS = [
  { label: "Urgent", value: "URGENT" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

const TYPE_OPTIONS = [
  { label: "Story", value: "STORY" },
  { label: "Task", value: "TASK" },
  { label: "Bug", value: "BUG" },
];

// =============================================================================
// 2. SUB-COMPONENTS
// =============================================================================

interface FilterDropdownProps {
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  icon: LucideIcon;
  activeColorClass?: string;
}

/**
 * Component Dropdown tái sử dụng cho Priority và Task Type
 */
const FilterDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon: Icon,
  activeColorClass = "text-blue-500"
}: FilterDropdownProps) => (
  <div className="relative">
    <select 
      className={`h-9 pl-3 pr-8 text-sm border rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium
        ${value ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
      `}
      value={value || ""}
      onChange={onChange}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <Icon className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${value ? activeColorClass : 'text-slate-400'}`} />
  </div>
);

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

interface BoardHeaderProps {
  filters: BoardFilterParams;
  setFilters: (f: BoardFilterParams) => void;
  members: ProjectMember[]; 
  totalTasks: number;
}

export default function BoardHeader({ 
  filters = { keyword: "", sprintId: null, assigneeId: undefined, priority: undefined, taskType: undefined }, 
  setFilters, 
  members = [],
  totalTasks = 0 
}: BoardHeaderProps) {

  // --- HANDLERS (LOGIC) ---

  /**
   * Helper cập nhật filter chung.
   * Nếu giá trị rỗng/null -> xóa key khỏi object filter.
   */
  const updateFilter = (key: keyof BoardFilterParams, value: any) => {
    if (!value) {
        const newFilters = { ...filters };
        // Xóa key tương ứng (giữ nguyên logic gốc của bạn)
        // Lưu ý: BoardFilterParams có thể yêu cầu undefined thay vì delete, 
        // nhưng ở đây tôi giữ logic 'delete' như code cũ để an toàn.
        delete newFilters[key as keyof typeof newFilters]; 
        setFilters(newFilters);
    } else {
        setFilters({ ...filters, [key]: value });
    }
  };

  // 1. Xử lý Search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, keyword: e.target.value });
  };

  // 2. Xử lý chọn Member (Toggle)
  const toggleAssignee = (memberId: number) => {
    const newValue = filters.assigneeId === memberId ? undefined : memberId;
    updateFilter("assigneeId", newValue);
  };

  // 3. Xử lý Priority & Task Type (Sử dụng helper)
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilter("priority", e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilter("taskType", e.target.value);
  };

  // 4. Reset Filters (Giữ lại sprintId)
  const clearFilters = () => {
    setFilters({ 
        keyword: "", 
        sprintId: filters.sprintId,
        assigneeId: undefined,
        priority: undefined,
        taskType: undefined
    });
  };

  // Kiểm tra xem có filter nào đang active không
  const hasActiveFilters = useMemo(() => {
    return !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType;
  }, [filters]);

  // --- RENDER ---
  return (
    <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm relative">
        
        {/* --- LEFT: TITLE & STATS --- */}
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Board</h1>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md text-xs font-bold border border-slate-200">
                {totalTasks} Issues
            </span>
        </div>

        {/* --- RIGHT: FILTERS TOOLBAR --- */}
        <div className="flex items-center gap-3">
            
            {/* 1. SEARCH BOX */}
            <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
                <input 
                    className="h-9 pl-9 pr-8 text-sm border border-slate-200 rounded-lg w-48 focus:w-64 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50 focus:bg-white placeholder:text-slate-400"
                    placeholder="Search..."
                    value={filters?.keyword || ""}
                    onChange={handleSearchChange}
                />
                {filters?.keyword && (
                    <button 
                        onClick={() => setFilters({...filters, keyword: ""})}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* 2. MEMBER FILTER (Avatar Stack) */}
            <div className="flex items-center -space-x-2 mr-1">
                {members.slice(0, 5).map((member) => {
                    const idToUse = member.userId || member.memberId;
                    const isActive = filters.assigneeId !== undefined && filters.assigneeId === idToUse;
                    
                    return (
                        <div 
                            key={idToUse || Math.random()}
                            onClick={() => idToUse && toggleAssignee(idToUse)}
                            className={`
                                relative w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:z-10 hover:scale-105
                                ${isActive ? 'border-blue-500 z-10 ring-2 ring-blue-200' : 'border-white'}
                            `}
                            title={member.fullName}
                        >
                            {member.avatarUrl ? (
                                <img 
                                    src={member.avatarUrl} 
                                    alt={member.fullName} 
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className={`w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {member.fullName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {/* Hiển thị số lượng user còn lại nếu > 5 */}
                {members.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-500">
                        +{members.length - 5}
                    </div>
                )}
            </div>

            {/* 3. PRIORITY FILTER */}
            <FilterDropdown 
                value={filters.priority}
                onChange={handlePriorityChange}
                options={PRIORITY_OPTIONS}
                placeholder="Priority"
                icon={ChevronDown}
            />

            {/* 4. TASK TYPE FILTER */}
            <FilterDropdown 
                value={filters.taskType}
                onChange={handleTypeChange}
                options={TYPE_OPTIONS}
                placeholder="Type"
                icon={Filter}
            />

            {/* 5. SEPARATOR & CLEAR BUTTON */}
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

            <button 
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className={`
                    flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all
                    ${hasActiveFilters 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer' 
                        : 'text-slate-300 bg-transparent cursor-not-allowed'}
                `}
            >
                <X className="w-4 h-4" />
                <span>Clear</span>
            </button>
        </div>
    </div>
  );
}