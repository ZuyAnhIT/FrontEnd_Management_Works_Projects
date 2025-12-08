"use client";

import React from 'react';
import { 
  Search, Filter, Users, AlertCircle, Layers, 
  ChevronLeft, ChevronRight, X, LayoutGrid, List, Columns,
  Calendar as CalendarIcon, Check
} from "lucide-react";
import { ProjectMember } from "@/services/apiProject"; 

interface FilterState {
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

export default function CalendarFilterBar({ 
  filters, 
  onFilterChange, 
  viewMode,
  onViewChange,
  onNavigate,
  titleDate,
  members = [] 
}: CalendarFilterBarProps) {

  const handleChange = (key: keyof FilterState, val: any) => {
      onFilterChange(key, val === "ALL" ? "" : val);
  };

  const clearFilters = () => {
      onFilterChange('keyword', '');
      onFilterChange('assigneeId', '');
      onFilterChange('priority', '');
      onFilterChange('taskType', '');
      onFilterChange('showSprints', true);
  };

  const hasFilters = !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType || !filters.showSprints;

  return (
    <div className="flex flex-col gap-4 mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
        
        {/* ROW 1: Navigation & Search */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            {/* Left: Calendar Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button onClick={() => onViewChange('dayGridMonth')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'dayGridMonth' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <LayoutGrid className="w-3.5 h-3.5" /> Month
                    </button>
                    <div className="w-px bg-slate-100 my-1 mx-0.5"></div>
                    <button onClick={() => onViewChange('timeGridWeek')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'timeGridWeek' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <Columns className="w-3.5 h-3.5" /> Week
                    </button>
                    <div className="w-px bg-slate-100 my-1 mx-0.5"></div>
                    <button onClick={() => onViewChange('timeGridDay')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'timeGridDay' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <List className="w-3.5 h-3.5" /> Day
                    </button>
                </div>

                <div className="flex items-center bg-white px-1 py-1 border border-slate-200 rounded-lg shadow-sm h-[34px]">
                    <button onClick={() => onNavigate('PREV')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="px-3 text-xs font-bold text-slate-700 min-w-[110px] text-center select-none">{titleDate}</span>
                    <button onClick={() => onNavigate('NEXT')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>

                <button onClick={() => onNavigate('TODAY')} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm h-[34px]">Today</button>
            </div>

            {/* Right: Search Input */}
            <div className="relative group w-full xl:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input type="text" placeholder="Search tasks or sprints..." className="w-full h-[34px] pl-9 pr-4 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white shadow-sm placeholder:text-slate-400" value={filters.keyword} onChange={(e) => handleChange('keyword', e.target.value)}/>
            </div>
        </div>

        <div className="h-px bg-slate-200 w-full"></div>

        {/* ROW 2: Detailed Filters */}
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 mr-2 font-semibold uppercase tracking-wide">
                <Filter className="w-3.5 h-3.5" /> Filters
            </div>

            {/* Assignee Filter */}
            <div className="relative">
                <Users className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <select className="h-[34px] pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm min-w-[160px]" value={filters.assigneeId || "ALL"} onChange={(e) => handleChange('assigneeId', e.target.value)}>
                    <option value="ALL">All Assignees</option>
                    {/* ✅ Đã sửa: Chỉ hiển thị tên đầy đủ */}
                    {members.map((m) => (
                        <option key={m.userId} value={m.userId}>
                            {m.fullName}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                </div>
            </div>

            {/* Priority Filter */}
            <div className="relative">
                <AlertCircle className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <select className="h-[34px] pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm min-w-[140px]" value={filters.priority || "ALL"} onChange={(e) => handleChange('priority', e.target.value)}>
                    <option value="ALL">All Priorities</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                </div>
            </div>

            {/* Type Filter */}
            <div className="relative">
                <Layers className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <select className="h-[34px] pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm min-w-[130px]" value={filters.taskType || "ALL"} onChange={(e) => handleChange('taskType', e.target.value)}>
                    <option value="ALL">All Types</option>
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="STORY">Story</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                </div>
            </div>

            {/* Show Sprints Toggle */}
            <button onClick={() => onFilterChange('showSprints', !filters.showSprints)} className={`flex items-center gap-2 h-[34px] pl-2 pr-3 rounded-lg border transition-all cursor-pointer select-none ${filters.showSprints ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${filters.showSprints ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {filters.showSprints ? <Check className="w-3 h-3" /> : <CalendarIcon className="w-3 h-3" />}
                </div>
                <span className="text-xs font-bold">Sprints</span>
            </button>

            {/* Reset Button */}
            {hasFilters && (
                <button onClick={clearFilters} className="ml-auto flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all border border-red-100">
                    <X className="w-3.5 h-3.5" /> Clear
                </button>
            )}
        </div>
    </div>
  );
}