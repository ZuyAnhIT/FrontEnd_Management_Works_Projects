"use client";

import { useState, useEffect } from "react";
import { Filter, Calendar as CalendarIcon, X, Layers, Clock, Zap } from "lucide-react";
import { WorkloadParams } from "@/services/apiStatistics";
import { getSprints, Sprint } from "@/services/apiSprint";

interface WorkloadFilterToolbarProps {
  projectId: number;
  filters: WorkloadParams;
  setFilters: (f: WorkloadParams) => void;
}

export default function WorkloadFilterToolbar({ projectId, filters, setFilters }: WorkloadFilterToolbarProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);

  useEffect(() => {
    if (projectId) {
        getSprints(projectId).then(setSprints).catch(console.error);
    }
  }, [projectId]);

  const handleChange = (key: keyof WorkloadParams, val: any) => {
      setFilters({ ...filters, [key]: val === "ALL" ? undefined : val });
  };

  const handleDateChange = (field: 'from' | 'to', val: string) => {
      setFilters({ ...filters, [field]: val || undefined });
  };

  // Reset về mặc định (Giữ lại ViewType mặc định là POINTS)
  const clearFilters = () => {
    setFilters({
        viewType: "POINTS",
        groupBy: "STATUS"
    });
  };

  // Kiểm tra có đang filter gì không (trừ viewType/groupBy mặc định)
  const hasFilters = !!filters.sprintId || !!filters.from || !!filters.to;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-500 mr-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">View:</span>
        </div>

        {/* 1. View Type (Points vs Hours) */}
        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 h-9">
             <button 
                onClick={() => handleChange('viewType', 'POINTS')}
                className={`flex items-center gap-1.5 px-3 h-full rounded-md text-xs font-bold transition-all ${filters.viewType === 'POINTS' || !filters.viewType ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <Zap className="w-3 h-3" /> Points
             </button>
             <div className="w-px h-4 bg-slate-200 mx-1"></div>
             <button 
                onClick={() => handleChange('viewType', 'HOURS')}
                className={`flex items-center gap-1.5 px-3 h-full rounded-md text-xs font-bold transition-all ${filters.viewType === 'HOURS' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <Clock className="w-3 h-3" /> Hours
             </button>
        </div>

        <div className="h-6 w-[1px] bg-slate-300 mx-1"></div>

        {/* 2. Group By Selector */}
        <div className="relative">
            <Layers className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
                className="h-9 pl-9 pr-8 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:border-blue-500 outline-none cursor-pointer font-medium"
                value={filters.groupBy || "STATUS"}
                onChange={(e) => handleChange('groupBy', e.target.value)}
            >
                <option value="STATUS">Group by Status</option>
                <option value="PRIORITY">Group by Priority</option>
            </select>
        </div>

        {/* 3. Sprint Selector */}
        <select 
            className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:border-blue-500 outline-none cursor-pointer"
            value={filters.sprintId || ""}
            onChange={(e) => handleChange('sprintId', e.target.value ? Number(e.target.value) : "ALL")}
        >
            <option value="">All Sprints</option>
            {sprints.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
            ))}
        </select>

        {/* 4. Date Range */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg h-9">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <input 
                type="date" 
                className="text-xs border-none outline-none text-slate-600 bg-transparent w-24 font-medium"
                value={filters.from || ""}
                onChange={(e) => handleDateChange('from', e.target.value)}
            />
            <span className="text-slate-300">-</span>
            <input 
                type="date" 
                className="text-xs border-none outline-none text-slate-600 bg-transparent w-24 font-medium"
                value={filters.to || ""}
                onChange={(e) => handleDateChange('to', e.target.value)}
            />
        </div>

        {/* 5. Clear Button (Chỉ hiện khi có filter) */}
        {hasFilters && (
            <button 
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
                <X className="w-3.5 h-3.5" /> Clear
            </button>
        )}
    </div>
  );
}