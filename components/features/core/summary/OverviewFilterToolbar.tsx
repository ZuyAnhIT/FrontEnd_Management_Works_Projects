"use client";

import { Search, Filter, Calendar as CalendarIcon, X, Clock, Users, AlertCircle, Layers, ChevronDown } from "lucide-react";
import { OverviewParams } from "@/services/apiStatistics";
import { ProjectMember } from "@/services/apiProject";

interface OverviewFilterToolbarProps {
  filters: OverviewParams;
  setFilters: (f: OverviewParams) => void;
  members: ProjectMember[];
}

export default function OverviewFilterToolbar({ filters, setFilters, members }: OverviewFilterToolbarProps) {

  // Helper: Format Date YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Xử lý thay đổi filter
  const handleChange = (key: keyof OverviewParams, val: any) => {
      setFilters({ ...filters, [key]: val === "ALL" ? undefined : val });
  };

  // Xử lý chọn khoảng thời gian nhanh
  const handleQuickTime = (days: number) => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      
      setFilters({
          ...filters,
          from: formatDate(start),
          to: formatDate(end)
      });
  };

  // Xóa hết filter
  const clearFilters = () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);

      setFilters({
          from: formatDate(start),
          to: formatDate(end),
          keyword: undefined,
          assigneeId: undefined,
          priority: undefined,
          taskType: undefined
      });
  };

  // Kiểm tra xem có đang filter không (để hiện nút clear)
  const hasFilters = !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType;

  return (
    <div className="flex flex-col gap-4 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
        
        {/* ROW 1: Time & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Time Controls Group */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-500 mr-1">
                    <Clock className="w-4 h-4" /> <span className="font-medium">Time:</span>
                </div>
                
                {/* Quick Select (Segmented) */}
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => handleQuickTime(7)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!filters.from ? 'text-slate-500 hover:bg-slate-50' : 'bg-blue-50 text-blue-700'}`}
                    >
                        7 Days
                    </button>
                    <div className="w-px bg-slate-100 my-1 mx-1"></div>
                    <button 
                        onClick={() => handleQuickTime(30)}
                        className="px-3 py-1 text-xs font-bold rounded-md transition-all text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    >
                        30 Days
                    </button>
                </div>

                {/* Custom Date Range */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm h-9">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <input 
                        type="date" 
                        className="text-xs bg-transparent border-none outline-none text-slate-700 font-medium w-24 cursor-pointer"
                        value={filters.from || ""}
                        onChange={(e) => handleChange('from', e.target.value)}
                    />
                    <span className="text-slate-300">-</span>
                    <input 
                        type="date" 
                        className="text-xs bg-transparent border-none outline-none text-slate-700 font-medium w-24 cursor-pointer"
                        value={filters.to || ""}
                        onChange={(e) => handleChange('to', e.target.value)}
                    />
                </div>
            </div>

            {/* Search Input */}
            <div className="relative group w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500" />
                <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    className="w-full h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white shadow-sm"
                    value={filters.keyword || ""}
                    onChange={(e) => handleChange('keyword', e.target.value)}
                />
            </div>
        </div>

        <div className="h-px bg-slate-200 w-full"></div>

        {/* ROW 2: Detailed Filters (Dropdowns) */}
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500 mr-2">
                <Filter className="w-4 h-4" /> <span className="font-medium">Filters:</span>
            </div>

            {/* 1. Priority Filter */}
            <div className="relative group">
                <AlertCircle className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" />
                <select 
                    className="h-9 pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer hover:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm min-w-[130px]"
                    value={filters.priority || "ALL"}
                    onChange={(e) => handleChange('priority', e.target.value)}
                >
                    <option value="ALL">All Priorities</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* 2. Type Filter */}
            <div className="relative group">
                <Layers className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" />
                <select 
                    className="h-9 pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer hover:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm min-w-[120px]"
                    value={filters.taskType || "ALL"}
                    onChange={(e) => handleChange('taskType', e.target.value)}
                >
                    <option value="ALL">All Types</option>
                    <option value="STORY">Story</option>
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* 3. Assignee Filter */}
            <div className="relative group">
                <Users className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" />
                <select 
                    className="h-9 pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer hover:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm min-w-[140px] max-w-[200px]"
                    value={filters.assigneeId || "ALL"}
                    onChange={(e) => handleChange('assigneeId', e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                >
                    <option value="ALL">All Assignees</option>
                    {members.map(m => (
                        <option key={m.userId} value={m.userId}>{m.fullName}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Clear Button */}
            {hasFilters && (
                <button 
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                    <X className="w-3.5 h-3.5" /> Reset
                </button>
            )}
        </div>
    </div>
  );
}