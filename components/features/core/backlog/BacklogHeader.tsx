"use client";

import React, { useMemo } from "react";
import { Search, X, ChevronDown, Filter, LayoutList, LucideIcon } from "lucide-react";
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
// 2. INTERFACES
// =============================================================================

interface BacklogHeaderProps {
  totalTasks: number;
  projectId: number;
  filters: BacklogQueryParams;
  setFilters: (f: BacklogQueryParams) => void;
  members: ProjectMember[];
  onCreateClick?: () => void;
  onRefresh?: () => void;
}

// =============================================================================
// 3. SUB-COMPONENT: FILTER DROPDOWN
// =============================================================================

interface FilterDropdownProps {
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  icon: LucideIcon;
  activeColorClass?: string;
}

const FilterDropdown = ({ value, onChange, options, placeholder, icon: Icon, activeColorClass = "text-blue-500" }: FilterDropdownProps) => (
  <div className="relative">
    <select
      className={`h-9 pl-3 pr-7 text-sm border rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium
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
    <Icon className={`w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${value ? activeColorClass : 'text-slate-400'}`} />
  </div>
);

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

export default function BacklogHeader({
  totalTasks,
  projectId,
  filters,
  setFilters,
  members = [],
}: BacklogHeaderProps) {

  // --- HANDLERS ---

  // Helper function để update filter gọn gàng hơn
  const updateFilter = (key: keyof BacklogQueryParams, value: any) => {
    // Nếu value rỗng hoặc null -> xóa key khỏi filter
    if (value === "" || value === null || value === undefined) {
        const newFilters = { ...filters };
        delete newFilters[key];
        setFilters({ ...newFilters, page: 0 });
    } else {
        setFilters({ ...filters, [key]: value, page: 0 });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter("keyword", e.target.value);
  };

  const toggleAssignee = (memberId: number) => {
    const newValue = filters.assigneeId === memberId ? undefined : memberId;
    updateFilter("assigneeId", newValue);
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      page: 0,
      size: filters.size,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType;
  }, [filters]);

  // --- RENDER ---
  return (
    <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 shadow-sm z-20">
       
       {/* --- LEFT: TITLE & STATS --- */}
       <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
             <LayoutList className="w-5 h-5 text-blue-600" />
           </div>
           <div>
             <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Backlog</h1>
             <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                 <span className="font-medium">Project {projectId}</span>
                 <span className="text-slate-300">•</span>
                 <span className="bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 border border-slate-200 font-bold">
                    {totalTasks} issues
                 </span>
             </div>
           </div>
       </div>

       {/* --- RIGHT: FILTERS & TOOLS --- */}
       <div className="flex items-center gap-3">
           
           {/* 1. SEARCH INPUT */}
           <div className="relative group hidden md:block">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
               <input
                   className="h-9 pl-9 pr-8 text-sm border border-slate-200 rounded-lg w-40 focus:w-60 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50 focus:bg-white placeholder:text-slate-400"
                   placeholder="Search..."
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

           {/* 2. MEMBER FILTERS (Avatars) */}
           <div className="flex items-center -space-x-2">
               {members.slice(0, 4).map((member) => {
                   const idToUse = member.userId || member.memberId;
                   const isActive = filters.assigneeId === idToUse;
                   return (
                       <div
                           key={idToUse || Math.random()}
                           onClick={() => idToUse && toggleAssignee(idToUse)}
                           className={`
                               relative w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:z-10 hover:scale-110
                               ${isActive ? 'border-blue-500 z-10 ring-2 ring-blue-200' : 'border-white'}
                           `}
                           title={member.fullName}
                       >
                           {member.avatarUrl ? (
                               <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full rounded-full object-cover" />
                           ) : (
                               <div className={`w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                   {member.fullName?.charAt(0).toUpperCase()}
                               </div>
                           )}
                       </div>
                   );
               })}
           </div>

           {/* 3. DROPDOWN FILTERS */}
           <div className="flex items-center gap-2">
               <FilterDropdown 
                   value={filters.priority}
                   onChange={(e) => updateFilter("priority", e.target.value)}
                   options={PRIORITY_OPTIONS}
                   placeholder="Priority"
                   icon={ChevronDown}
               />
               
               <FilterDropdown 
                   value={filters.taskType}
                   onChange={(e) => updateFilter("taskType", e.target.value)}
                   options={TYPE_OPTIONS}
                   placeholder="Type"
                   icon={Filter}
               />
           </div>

           {/* 4. CLEAR FILTER BUTTON */}
           {hasActiveFilters && (
               <button
                   onClick={clearFilters}
                   className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                   title="Clear filters"
               >
                   <X className="w-4 h-4" />
               </button>
           )}
       </div>
    </div>
  );
}