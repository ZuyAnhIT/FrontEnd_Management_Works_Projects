"use client";

import { Search, X, Users, Layers, ChevronDown } from "lucide-react";
import { ProjectTaskFilterParams } from "@/services/apiTask";
import { ProjectMember } from "@/services/apiProject";

interface ListHeaderProps {
  filters: ProjectTaskFilterParams;
  setFilters: (f: ProjectTaskFilterParams) => void;
  groupBy: string;
  setGroupBy: (g: string) => void;
  members: ProjectMember[]; 
  totalTasks: number;
}

export default function ListHeader({ 
  filters, 
  setFilters, 
  groupBy,
  setGroupBy,
  members = [],
  totalTasks = 0 
}: ListHeaderProps) {

  // --- HANDLERS ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const toggleAssignee = (memberId: number) => {
    if (filters.assigneeId === memberId) {
        const newFilters = { ...filters };
        delete newFilters.assigneeId;
        setFilters(newFilters);
    } else {
        setFilters({ ...filters, assigneeId: memberId });
    }
  };

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupBy(e.target.value);
  };

  const clearFilters = () => {
    setFilters({ 
        search: "", 
        sprintId: filters.sprintId // Giữ lại sprint context
    });
    setGroupBy("none");
  };

  const hasActiveFilters = !!filters.search || !!filters.assigneeId || groupBy !== "none";

  return (
    <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm  relative">
        
        {/* --- LEFT: TITLE & STATS --- */}
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">List</h1>
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
                    placeholder="Search issues..."
                    value={filters?.search || ""}
                    onChange={handleSearchChange}
                />
                {filters?.search && (
                    <button 
                        onClick={() => setFilters({...filters, search: ""})}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* 2. MEMBER FILTER (AVATAR GROUP) */}
            <div className="flex items-center -space-x-2 mr-1">
                {members.slice(0, 5).map((member) => {
                    const isActive = filters.assigneeId === (member.userId || member.memberId);
                    const idToUse = member.userId || member.memberId;
                    return (
                        <div 
                            key={idToUse}
                            onClick={() => toggleAssignee(idToUse)}
                            className={`
                                relative w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:z-10 hover:scale-105 flex items-center justify-center
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
                                <span className={`text-[10px] font-bold ${isActive ? 'text-blue-700' : 'text-slate-600'}`}>
                                    {member.fullName?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    );
                })}
                {members.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-500">
                        +{members.length - 5}
                    </div>
                )}
            </div>

            {/* 3. GROUP BY FILTER (Styled like Board Priority) */}
            <div className="relative">
                <select 
                    className={`h-9 pl-9 pr-8 text-sm border rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium
                        ${groupBy !== "none" ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                    `}
                    value={groupBy}
                    onChange={handleGroupByChange}
                >
                    <option value="none">No Grouping</option>
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                    <option value="assignee">Assignee</option>
                </select>
                {/* Icon Layers bên trái */}
                <Layers className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${groupBy !== "none" ? 'text-blue-600' : 'text-slate-400'}`} />
                {/* Icon Chevron bên phải */}
                <ChevronDown className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${groupBy !== "none" ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>

            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

            {/* 4. CLEAR BUTTON */}
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