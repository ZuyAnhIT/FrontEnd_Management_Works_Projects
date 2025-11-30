"use client";

import { Search, X, Filter, ChevronDown } from "lucide-react";
import { BoardFilterParams } from "@/services/apiBoard";
import { ProjectMember } from "@/services/apiProject";

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

  // --- HANDLERS ---

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, keyword: e.target.value });
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

  // ✅ ĐÃ SỬA: Ép kiểu val thành BoardFilterParams['priority']
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
        const newFilters = { ...filters };
        delete newFilters.priority;
        setFilters(newFilters);
    } else {
        setFilters({ 
            ...filters, 
            priority: val as BoardFilterParams['priority'] // Fix lỗi Type 'string'
        });
    }
  };

  // ✅ ĐÃ SỬA: Ép kiểu val thành BoardFilterParams['taskType']
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
        const newFilters = { ...filters };
        delete newFilters.taskType;
        setFilters(newFilters);
    } else {
        setFilters({ 
            ...filters, 
            taskType: val as BoardFilterParams['taskType'] // Fix lỗi Type 'string'
        });
    }
  };

  const clearFilters = () => {
    setFilters({ 
        keyword: "", 
        sprintId: filters.sprintId,
        assigneeId: undefined,
        priority: undefined,
        taskType: undefined
    });
  };

  const hasActiveFilters = !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType;

  return (
    <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm  relative ">
        
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

            {/* 2. MEMBER FILTER */}
            <div className="flex items-center -space-x-2 mr-1">
                {members.slice(0, 5).map((member) => {
                    const idToUse = member.userId || member.memberId;
                    // Fix lỗi logic isActive (nếu id undefined thì không active)
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
                {members.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-500">
                        +{members.length - 5}
                    </div>
                )}
            </div>

            {/* 3. PRIORITY FILTER */}
            <div className="relative">
                <select 
                    className={`h-9 pl-3 pr-8 text-sm border rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium
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
                    className={`h-9 pl-3 pr-8 text-sm border rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium
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

            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

            {/* 5. CLEAR BUTTON */}
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