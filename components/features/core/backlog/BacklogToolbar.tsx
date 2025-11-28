"use client";

import { Search, X, ChevronDown, Filter } from "lucide-react";
import { BacklogQueryParams, ProjectMember } from "@/services/apiProject";

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

  // --- HANDLERS ---

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Khi search thì reset về trang 0
    setFilters({ ...filters, keyword: e.target.value, page: 0 });
  };

  const toggleAssignee = (memberId: number) => {
    if (filters.assigneeId === memberId) {
        // Bỏ chọn
        const newFilters = { ...filters };
        delete newFilters.assigneeId;
        setFilters({ ...newFilters, page: 0 });
    } else {
        // Chọn
        setFilters({ ...filters, assigneeId: memberId, page: 0 });
    }
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
        const newFilters = { ...filters };
        delete newFilters.priority;
        setFilters({ ...newFilters, page: 0 });
    } else {
        setFilters({ ...filters, priority: val as any, page: 0 });
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
        const newFilters = { ...filters };
        delete newFilters.taskType;
        setFilters({ ...newFilters, page: 0 });
    } else {
        setFilters({ ...filters, taskType: val as any, page: 0 });
    }
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

  const hasActiveFilters = !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType;

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
                        onClick={() => setFilters({...filters, keyword: "", page: 0})}
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
                {members.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-500 shadow-sm">
                        +{members.length - 5}
                    </div>
                )}
            </div>

            {/* 3. PRIORITY FILTER */}
            <div className="relative">
                <select
                    className={`h-9 pl-3 pr-8 text-sm border rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium shadow-sm
                        ${filters.priority ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                    `}
                    value={filters.priority || ""}
                    onChange={handlePriorityChange}
                >
                    <option value="">Priority</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
                <ChevronDown className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${filters.priority ? 'text-blue-500' : 'text-slate-400'}`} />
            </div>

            {/* 4. TASK TYPE FILTER */}
            <div className="relative">
                <select
                    className={`h-9 pl-3 pr-8 text-sm border rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium shadow-sm
                        ${filters.taskType ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                    `}
                    value={filters.taskType || ""}
                    onChange={handleTypeChange}
                >
                    <option value="">Type</option>
                    <option value="STORY">Story</option>
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                </select>
                <Filter className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${filters.taskType ? 'text-blue-500' : 'text-slate-400'}`} />
            </div>

            {/* 5. SEPARATOR & CLEAR */}
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