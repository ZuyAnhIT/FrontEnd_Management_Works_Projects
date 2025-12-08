"use client";

import React from 'react';
import { Search, Filter, Users, AlertCircle, Layers, X, ChevronDown } from "lucide-react";
import { ProjectMember } from "@/services/apiProject";
import { ArchivedTaskParams } from "@/services/apiProject";

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

  const handleChange = (key: keyof ArchivedTaskParams, val: any) => {
      onFilterChange(key, val === "ALL" ? undefined : val);
  };

  const hasFilters = !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType;

  // Helper Component cho Select để code gọn và đẹp
  const SelectWrapper = ({ icon: Icon, value, onChange, options, placeholder, minWidth = "min-w-[130px]" }: any) => (
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

  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-6 bg-slate-50/80 p-1.5 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
      
      {/* 1. Search Input */}
      <div className="relative flex-1 min-w-[200px] group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search archived tasks by title or code..."
          className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 
                     placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          value={filters.keyword || ""}
          onChange={(e) => handleChange('keyword', e.target.value)}
        />
      </div>

      <div className="h-9 w-px bg-slate-200 hidden xl:block mx-1"></div>

      {/* 2. Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 mr-2 font-semibold uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5" /> Filters
        </div>
        
        {/* Assignee */}
        <SelectWrapper 
            icon={Users}
            placeholder="All Assignees"
            value={filters.assigneeId}
            onChange={(val: string) => handleChange('assigneeId', val === "ALL" ? undefined : Number(val))}
            minWidth="min-w-[160px]"
            options={members.map(m => (
                <option key={m.userId} value={m.userId}>{m.fullName}</option>
            ))}
        />

        {/* Priority */}
        <SelectWrapper 
            icon={AlertCircle}
            placeholder="All Priorities"
            value={filters.priority}
            onChange={(val: string) => handleChange('priority', val)}
            options={
                <>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </>
            }
        />

        {/* Type */}
        <SelectWrapper 
            icon={Layers}
            placeholder="All Types"
            value={filters.taskType}
            onChange={(val: string) => handleChange('taskType', val)}
            options={
                <>
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="STORY">Story</option>
                </>
            }
        />

        {/* Clear Button */}
        {hasFilters && (
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