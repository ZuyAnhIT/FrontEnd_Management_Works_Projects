"use client";

import React, { useMemo } from "react";
import { Search, X, ChevronDown, Filter, LucideIcon } from "lucide-react";
import { BacklogQueryParams, ProjectMember } from "@/services/apiProject";

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
 * Component Dropdown chung cho Priority và Task Type
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
      className={`h-9 pl-3 pr-8 text-sm border rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium shadow-sm
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

interface BacklogToolbarProps {
  filters: BacklogQueryParams;
  setFilters: (f: BacklogQueryParams) => void;
  members: ProjectMember[];
}

export default function BacklogToolbar({
  filters,
  setFilters,
  members = [],
}: BacklogToolbarProps) {

  // --- HANDLERS (LOGIC) ---

  /**
   * Hàm helper cập nhật filter chung.
   * Nếu value rỗng/null/undefined -> xóa key khỏi filter -> reset page về 0.
   */
  const updateFilter = (key: keyof BacklogQueryParams, value: any) => {
    if (!value) {
        const newFilters = { ...filters };
        delete newFilters[key];
        setFilters({ ...newFilters, page: 0 });
    } else {
        setFilters({ ...filters, [key]: value, page: 0 });
    }
  };

  // Xử lý Search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter("keyword", e.target.value);
  };

  // Xử lý chọn thành viên (Toggle)
  const toggleAssignee = (memberId: number) => {
    const newValue = filters.assigneeId === memberId ? undefined : memberId;
    updateFilter("assigneeId", newValue);
  };

  // Xử lý nút Clear All
  const clearFilters = () => {
    setFilters({
      keyword: "",
      page: 0,
      size: filters.size,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir
    });
  };

  // Kiểm tra xem có đang filter gì không để hiện nút Clear
  const hasActiveFilters = useMemo(() => {
    return !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType;
  }, [filters]);

  // --- RENDER ---
  return (
    <div className="h-14 mb-4 flex items-center justify-between shrink-0 z-20 relative px-1">
       
       {/* --- FILTERS GROUP --- */}
       <div className="flex items-center gap-3">
           
           {/* 1. SEARCH BOX */}
           <div className="relative group">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
               <input
                   className="h-9 pl-9 pr-8 text-sm border border-slate-200 rounded-lg w-48 focus:w-64 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white placeholder:text-slate-400 shadow-sm"
                   placeholder="Search backlog..."
                   value={filters.keyword || ""}
                   onChange={handleSearchChange}
               />
               {filters.keyword && (
                   <button
                       onClick={() => updateFilter("keyword", "")}
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
                   const isActive = filters.assigneeId === idToUse;
                   
                   return (
                       <div
                           key={idToUse || Math.random()}
                           onClick={() => idToUse && toggleAssignee(idToUse)}
                           className={`
                               relative w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:z-10 hover:scale-105 shadow-sm
                               ${isActive ? 'border-blue-500 z-10 ring-2 ring-blue-200' : 'border-white'}
                               ${!member.avatarUrl ? 'bg-slate-100' : ''}
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
                               <div className={`w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'text-blue-700' : 'text-slate-600'}`}>
                                   {member.fullName?.charAt(0).toUpperCase()}
                               </div>
                           )}
                       </div>
                   );
               })}
               
               {/* Hiển thị số lượng thành viên còn lại nếu > 5 */}
               {members.length > 5 && (
                   <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-500 shadow-sm cursor-default">
                       +{members.length - 5}
                   </div>
               )}
           </div>

           {/* 3. PRIORITY FILTER */}
           <FilterDropdown 
               value={filters.priority}
               onChange={(e) => updateFilter("priority", e.target.value)}
               options={PRIORITY_OPTIONS}
               placeholder="Priority"
               icon={ChevronDown}
           />

           {/* 4. TASK TYPE FILTER */}
           <FilterDropdown 
               value={filters.taskType}
               onChange={(e) => updateFilter("taskType", e.target.value)}
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