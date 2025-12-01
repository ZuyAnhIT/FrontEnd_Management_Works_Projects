"use client";

import { useState, useEffect } from "react";
import { Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { EpicProgressParams } from "@/services/apiStatistics";
import { getSprints, Sprint } from "@/services/apiSprint";
// ✅ SỬA: Import RawStatusColumn thay vì BoardColumnResponse
import { getProjectStatuses, RawStatusColumn } from "@/services/apiBoard"; 

interface EpicFilterToolbarProps {
  projectId: number;
  filters: EpicProgressParams;
  setFilters: (f: EpicProgressParams) => void;
}

export default function EpicFilterToolbar({ projectId, filters, setFilters }: EpicFilterToolbarProps) {
  // Data cho Dropdown
  const [sprints, setSprints] = useState<Sprint[]>([]);
  // ✅ SỬA: State sử dụng RawStatusColumn
  const [statuses, setStatuses] = useState<RawStatusColumn[]>([]);

  // Load dữ liệu cho Dropdown
  useEffect(() => {
    if (!projectId) return;
    
    // Gọi song song 2 API để lấy options
    Promise.all([
        getSprints(projectId),
        getProjectStatuses(projectId)
    ]).then(([sprintRes, statusRes]) => {
        setSprints(sprintRes);
        // statusRes bây giờ khớp kiểu với state
        setStatuses(statusRes);
    }).catch(err => console.error("Failed to load filter options", err));

  }, [projectId]);

  // Handlers
  const handleSprintChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setFilters({ ...filters, sprintId: val ? Number(val) : null });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setFilters({ 
          ...filters, 
          statusIds: val ? [Number(val)] : undefined 
      });
  };

  const handleDateChange = (field: 'from' | 'to', val: string) => {
      setFilters({ ...filters, [field]: val || undefined });
  };

  const clearFilters = () => setFilters({});

  const hasFilters = !!filters.sprintId || !!filters.statusIds || !!filters.from || !!filters.to;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-500 mr-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter by:</span>
        </div>

        {/* 1. Sprint Selector */}
        <select 
            className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:border-blue-500 outline-none cursor-pointer"
            value={filters.sprintId || ""}
            onChange={handleSprintChange}
        >
            <option value="">All Sprints</option>
            {sprints.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
            ))}
        </select>

        {/* 2. Status Selector */}
        <select 
            className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:border-blue-500 outline-none cursor-pointer"
            value={filters.statusIds?.[0] || ""}
            onChange={handleStatusChange}
        >
            <option value="">All Statuses</option>
            {statuses.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
            ))}
        </select>

        <div className="h-6 w-[1px] bg-slate-300 mx-1"></div>

        {/* 3. Date Range */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <input 
                type="date" 
                className="text-xs border-none outline-none text-slate-600 bg-transparent w-24"
                value={filters.from || ""}
                onChange={(e) => handleDateChange('from', e.target.value)}
            />
            <span className="text-slate-300">-</span>
            <input 
                type="date" 
                className="text-xs border-none outline-none text-slate-600 bg-transparent w-24"
                value={filters.to || ""}
                onChange={(e) => handleDateChange('to', e.target.value)}
            />
        </div>

        {/* Clear Button */}
        {hasFilters && (
            <button 
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
                <X className="w-3 h-3" /> Clear
            </button>
        )}
    </div>
  );
}