"use client";

import { Search, X, ChevronDown, Filter, LayoutList } from "lucide-react";
import { BacklogQueryParams, ProjectMember } from "@/services/apiProject";

// ✅ Cập nhật Interface để nhận đủ props từ cha
interface BacklogHeaderProps {
  totalTasks: number;
  projectId: number;
  filters: BacklogQueryParams;
  setFilters: (f: BacklogQueryParams) => void;
  members: ProjectMember[];
  
  // Các props này có thể được truyền từ cha nhưng Header mới không dùng tới (nút tạo đã chuyển xuống dưới)
  // Khai báo optional (?) để tránh lỗi nếu cha không truyền, hoặc cứ khai báo để tránh lỗi thừa props
  onCreateClick?: () => void; 
  onRefresh?: () => void;
}

export default function BacklogHeader({
  totalTasks,
  projectId,
  filters,
  setFilters,
  members = [],
}: BacklogHeaderProps) {

  // --- HANDLERS XỬ LÝ FILTER (Chuyển từ Toolbar sang) ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, keyword: e.target.value, page: 0 });
  };

  const toggleAssignee = (memberId: number) => {
    if (filters.assigneeId === memberId) {
        const newFilters = { ...filters };
        delete newFilters.assigneeId;
        setFilters({ ...newFilters, page: 0 });
    } else {
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
    <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0  shadow-sm ">
       
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

        {/* --- RIGHT: FILTERS & SEARCH (Thay thế nút tạo) --- */}
        <div className="flex items-center gap-3">
           
            {/* 1. SEARCH */}
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
                        onClick={() => setFilters({...filters, keyword: "", page: 0})}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* 2. MEMBERS */}
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

            {/* 3. DROPDOWNS */}
            <div className="flex items-center gap-2">
                {/* Priority */}
                <div className="relative">
                    <select
                        className={`h-9 pl-3 pr-7 text-sm border rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium
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
                    <ChevronDown className={`w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${filters.priority ? 'text-blue-500' : 'text-slate-400'}`} />
                </div>

                {/* Type */}
                <div className="relative">
                    <select
                        className={`h-9 pl-3 pr-7 text-sm border rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium
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
                    <Filter className={`w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${filters.taskType ? 'text-blue-500' : 'text-slate-400'}`} />
                </div>
            </div>

            {/* 4. CLEAR */}
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