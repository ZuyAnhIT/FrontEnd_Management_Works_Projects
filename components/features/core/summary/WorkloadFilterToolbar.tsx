"use client";

import { useState, useEffect } from "react";
import { Filter, Calendar as CalendarIcon, X, Layers, Clock, Zap, Loader2, FileSpreadsheet, ChevronDown } from "lucide-react";
import { WorkloadParams } from "@/services/apiStatistics";
import { getSprints, Sprint } from "@/services/apiSprint";

// =============================================================================
// 1. CONSTANTS & INTERFACES
// =============================================================================

const GROUP_BY_OPTIONS = [
    { value: "STATUS", label: "By Status" },
    { value: "PRIORITY", label: "By Priority" },
];

interface WorkloadFilterToolbarProps {
    projectId: number;
    filters: WorkloadParams;
    setFilters: (f: WorkloadParams) => void;
    onExport: () => void;
    isExporting: boolean;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function WorkloadFilterToolbar({ 
    projectId, 
    filters, 
    setFilters, 
    onExport, 
    isExporting 
}: WorkloadFilterToolbarProps) {
    
    // --- STATE ---
    const [sprints, setSprints] = useState<Sprint[]>([]);

    // --- EFFECT: Load Sprints ---
    useEffect(() => {
        if (projectId) {
            getSprints(projectId).then(setSprints).catch(console.error);
        }
    }, [projectId]);

    // --- HANDLERS ---
    
    // Xử lý thay đổi filter chung
    const handleChange = (key: keyof WorkloadParams, val: any) => {
        // Nếu val là "ALL" hoặc rỗng, set về undefined để xóa khỏi query (trừ các field luôn phải có giá trị như viewType, groupBy)
        const newValue = (val === "ALL" || val === "") ? undefined : val;
        
        // Kiểm tra riêng cho sprintId (cần ép kiểu Number)
        if (key === 'sprintId' && newValue !== undefined) {
             setFilters({ ...filters, [key]: Number(val) });
        } else {
             setFilters({ ...filters, [key]: newValue });
        }
    };

    // Xử lý thay đổi ngày tháng
    const handleDateChange = (field: 'from' | 'to', val: string) => {
        setFilters({ ...filters, [field]: val || undefined });
    };

    // Xóa hết filter (chỉ giữ lại viewType và groupBy mặc định)
    const clearFilters = () => {
        setFilters({ 
            viewType: filters.viewType || "POINTS", 
            groupBy: filters.groupBy || "STATUS" 
            // Các filter khác (sprintId, from, to) sẽ là undefined
        });
    };

    // Kiểm tra xem có đang filter không (chỉ kiểm tra filter optional)
    const hasFilters = !!filters.sprintId || !!filters.from || !!filters.to;

    // --- RENDER ---
    return (
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-200 shadow-sm">
            
            {/* Filter Label */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mr-2">
                <Filter className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Filter:</span>
            </div>

            {/* 1. View Type (POINTS/HOURS) */}
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

            <div className="h-6 w-[1px] bg-slate-300 mx-1 hidden sm:block"></div>

            {/* 2. Group By (STATUS/PRIORITY) */}
            <div className="relative">
                <Layers className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                    className="h-9 pl-9 pr-8 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:border-blue-500 outline-none cursor-pointer font-medium hover:border-blue-300 transition-colors appearance-none"
                    value={filters.groupBy || "STATUS"}
                    onChange={(e) => handleChange('groupBy', e.target.value)}
                >
                    {GROUP_BY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* 3. Sprint Selector */}
            <select 
                className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:border-blue-500 outline-none cursor-pointer hover:border-blue-300 transition-colors max-w-[150px]"
                value={filters.sprintId || ""}
                onChange={(e) => handleChange('sprintId', e.target.value)}
            >
                <option value="">All Sprints</option>
                {sprints.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>

            {/* 4. Date Range */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg h-9 hover:border-blue-300 transition-colors">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <input 
                    type="date" 
                    className="text-xs border-none outline-none text-slate-600 bg-transparent w-24 font-medium p-0 cursor-pointer"
                    value={filters.from || ""}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                />
                <span className="text-slate-300">-</span>
                <input 
                    type="date" 
                    className="text-xs border-none outline-none text-slate-600 bg-transparent w-24 font-medium p-0 cursor-pointer"
                    value={filters.to || ""}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                />
            </div>

            {/* Spacer đẩy các nút action sang phải */}
            <div className="ml-auto flex items-center gap-2">
                
                {/* 5. EXPORT BUTTON */}
                <button
                    onClick={onExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-3 py-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all text-xs font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                    title="Export current view to Excel"
                >
                    {isExporting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                    )}
                    Export Report
                </button>

                {/* 6. Clear Button */}
                {hasFilters && (
                    <button 
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 h-9 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Clear all optional filters"
                    >
                        <X className="w-3.5 h-3.5" /> Clear
                    </button>
                )}
            </div>
        </div>
    );
}