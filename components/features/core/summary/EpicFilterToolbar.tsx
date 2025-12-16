"use client";

import { useEffect, useState } from "react";
import { Filter, Calendar as CalendarIcon, X, FileSpreadsheet, Loader2 } from "lucide-react";
import { EpicProgressParams } from "@/services/apiStatistics";
import { getSprints, Sprint } from "@/services/apiSprint";
import { getProjectStatuses, RawStatusColumn } from "@/services/apiBoard"; 

// =============================================================================
// 1. INTERFACES & SUB-COMPONENTS
// =============================================================================

interface EpicFilterToolbarProps {
    projectId: number;
    filters: EpicProgressParams;
    setFilters: (f: EpicProgressParams) => void;
    onExport: () => void;
    isExporting: boolean;
    hideExport?: boolean; // ✅ Prop mới
}

interface SelectFilterProps {
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { id: number | string; name: string }[];
    placeholder: string;
}

const SelectFilterWrapper = ({ value, onChange, options, placeholder }: SelectFilterProps) => (
    <select 
        className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:border-blue-500 outline-none cursor-pointer hover:border-blue-300 transition-colors"
        value={value || ""}
        onChange={onChange}
    >
        <option value="">{placeholder}</option>
        {options.map(s => (
            <option key={s.id} value={s.id}>
                {s.name}
            </option>
        ))}
    </select>
);

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function EpicFilterToolbar({ 
    projectId, 
    filters, 
    setFilters,
    onExport,
    isExporting,
    hideExport = false // ✅ Default false
}: EpicFilterToolbarProps) {
    
    // --- STATE ---
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [statuses, setStatuses] = useState<RawStatusColumn[]>([]);

    // --- EFFECT: Load Filter Data ---
    useEffect(() => {
        if (!projectId) return;
        Promise.all([
            getSprints(projectId),
            getProjectStatuses(projectId)
        ]).then(([sprintRes, statusRes]) => {
            setSprints(sprintRes);
            setStatuses(statusRes);
        }).catch(err => console.error("Failed to load filter options", err));
    }, [projectId]);

    // --- HANDLERS ---
    const handleSprintChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFilters({ ...filters, sprintId: val ? Number(val) : undefined });
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

    // --- RENDER ---
    return (
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-500 mr-2">
                <Filter className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Filter by:</span>
            </div>

            {/* 1. Sprint Selector */}
            <SelectFilterWrapper
                placeholder="All Sprints"
                value={filters.sprintId || ""}
                onChange={handleSprintChange}
                options={sprints.map(s => ({ id: s.id, name: s.name }))}
            />

            {/* 2. Status Selector */}
            <SelectFilterWrapper
                placeholder="All Statuses"
                value={filters.statusIds?.[0] || ""}
                onChange={handleStatusChange}
                options={statuses.map(s => ({ id: s.id, name: s.name }))}
            />

            <div className="h-6 w-[1px] bg-slate-300 mx-1 hidden sm:block"></div>

            {/* 3. Date Range */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <input 
                    type="date" 
                    className="text-xs border-none outline-none text-slate-600 bg-transparent w-24 font-medium p-0"
                    value={filters.from || ""}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                />
                <span className="text-slate-300">-</span>
                <input 
                    type="date" 
                    className="text-xs border-none outline-none text-slate-600 bg-transparent w-24 font-medium p-0"
                    value={filters.to || ""}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                />
            </div>

            {/* Spacer đẩy nút sang phải & Buttons Container */}
            <div className="ml-auto flex items-center gap-2">
                
                {/* 4. EXPORT BUTTON (Ẩn nếu hideExport = true) */}
                {!hideExport && (
                    <button
                        onClick={onExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-3 py-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all text-xs font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                        title="Export Epic Progress to Excel"
                    >
                        {isExporting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                        )}
                        Export Report
                    </button>
                )}

                {/* Clear Button */}
                {hasFilters && (
                    <button 
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 h-9 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                        <X className="w-3.5 h-3.5" /> Clear
                    </button>
                )}
            </div>
        </div>
    );
}