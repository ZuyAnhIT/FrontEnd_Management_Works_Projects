"use client";

import { Search, Filter, Calendar as CalendarIcon, X, Clock, Users, AlertCircle, Layers, ChevronDown, LucideIcon } from "lucide-react";
import { OverviewParams } from "@/services/apiStatistics";
import { ProjectMember } from "@/services/apiProject";
import React, { useMemo } from "react";

// =============================================================================
// 1. CONFIGURATION & HELPERS
// =============================================================================

// Helper: Format Date YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const PRIORITY_OPTIONS = [
    { value: "URGENT", label: "Urgent" },
    { value: "HIGH", label: "High" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LOW", label: "Low" },
];

const TYPE_OPTIONS = [
    { value: "STORY", label: "Story" },
    { value: "TASK", label: "Task" },
    { value: "BUG", label: "Bug" },
];

// =============================================================================
// 2. INTERFACES & SUB-COMPONENTS
// =============================================================================

interface OverviewFilterToolbarProps {
    filters: OverviewParams;
    setFilters: (f: OverviewParams) => void;
    members: ProjectMember[];
}

interface FilterDropdownProps {
    icon: LucideIcon;
    value: string | number | undefined;
    onChange: (val: string | number) => void;
    options: { value: string | number; label: string }[];
    placeholder: string;
    minWidth?: string;
}

/**
 * Component Dropdown tái sử dụng
 */
const FilterDropdown = ({ icon: Icon, value, onChange, options, placeholder, minWidth = "min-w-[120px]" }: FilterDropdownProps) => {
    // Ép kiểu value về string cho select
    const selectedValue = (value !== undefined && value !== null) ? String(value) : "ALL";

    return (
        <div className="relative group">
            <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" />
            <select 
                className={`h-9 pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer hover:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm ${minWidth}`}
                value={selectedValue}
                onChange={(e) => onChange(e.target.value === "ALL" ? "ALL" : e.target.value)}
            >
                <option value="ALL">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
    );
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function OverviewFilterToolbar({ filters, setFilters, members }: OverviewFilterToolbarProps) {

    // --- DATA PREPARATION ---
    const assigneeOptions = useMemo(() => 
        members.map(m => ({ value: m.userId || m.memberId, label: m.fullName }))
               .filter(m => m.value !== undefined) as { value: number, label: string }[],
    [members]);

    // --- HANDLERS (LOGIC) ---

    // Xử lý thay đổi filter chung
    const handleChange = (key: keyof OverviewParams, val: any) => {
        // Nếu giá trị là "ALL" hoặc rỗng, set về undefined (để xóa khỏi query)
        const newValue = (val === "ALL" || val === "") ? undefined : val;
        
        // Xử lý riêng cho assigneeId (cần ép kiểu number nếu không phải ALL/undefined)
        if (key === 'assigneeId' && newValue !== undefined) {
            setFilters({ ...filters, [key]: Number(newValue) });
        } else {
            setFilters({ ...filters, [key]: newValue });
        }
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

    // Xóa hết filter (reset về 7 ngày mặc định)
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

    // Kiểm tra xem có đang filter không (bỏ qua from/to vì đó là mặc định)
    const hasFilters = !!filters.keyword || !!filters.assigneeId || !!filters.priority || !!filters.taskType;

    // --- RENDER ---
    return (
        <div className="flex flex-col gap-4 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-200 shadow-sm">
            
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
                            // Nếu form đang có from/to (tức là đã set), đánh dấu nút này
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filters.from && filters.to && filters.to === formatDate(new Date()) && filters.from === formatDate(new Date(new Date().setDate(new Date().getDate() - 7))) ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
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
                        className="w-full h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white shadow-sm placeholder:text-slate-400"
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
                <FilterDropdown
                    icon={AlertCircle}
                    placeholder="All Priorities"
                    value={filters.priority}
                    onChange={(val) => handleChange('priority', val)}
                    options={PRIORITY_OPTIONS}
                    minWidth="min-w-[130px]"
                />

                {/* 2. Type Filter */}
                <FilterDropdown
                    icon={Layers}
                    placeholder="All Types"
                    value={filters.taskType}
                    onChange={(val) => handleChange('taskType', val)}
                    options={TYPE_OPTIONS}
                    minWidth="min-w-[120px]"
                />

                {/* 3. Assignee Filter */}
                <FilterDropdown
                    icon={Users}
                    placeholder="All Assignees"
                    value={filters.assigneeId}
                    onChange={(val) => handleChange('assigneeId', val)}
                    options={assigneeOptions}
                    minWidth="min-w-[140px]"
                />

                {/* Clear Button (ml-auto để đẩy nút sang phải) */}
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