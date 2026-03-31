"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Styles)
// =============================================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
    Search, Filter, X, Calendar as CalendarIcon, ChevronDown, Check 
} from "lucide-react";

// Internal Services & Types
import { RoadmapParams } from "@/services/apiStatistics";
import { getSprints } from "@/services/apiSprint";
import { getEpicProgress } from "@/services/apiStatistics";

// Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & INTERFACES
// =============================================================================

const EPIC_STATUS_OPTIONS = [
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Open', value: 'OPEN' },
    { label: 'Closed', value: 'CLOSED' }
];

const SPRINT_STATUS_OPTIONS = [
    { label: 'Not Started', value: 'NOT_STARTED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
];

interface MultiSelectProps {
    label: string;
    options: { label: string; value: string | number }[];
    selectedValues?: (string | number)[];
    onChange: (values: (string | number)[]) => void;
}

interface TimelineToolbarProps {
    projectId: number;
    filters: RoadmapParams;
    setFilters: (f: RoadmapParams) => void;
}

// =============================================================================
// 3. SUB-COMPONENT: MULTI-SELECT DROPDOWN
// =============================================================================

/**
 * Dropdown chọn nhiều giá trị (Multi-select) dùng cho bộ lọc.
 */
function MultiSelectDropdown({ label, options, selectedValues = [], onChange }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Xử lý click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Xử lý chọn/bỏ chọn giá trị
    const toggleValue = (val: string | number) => {
        if (selectedValues.includes(val)) {
            onChange(selectedValues.filter(v => v !== val));
        } else {
            onChange([...selectedValues, val]);
        }
    };

    const count = selectedValues.length;

    return (
        <div className="relative" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-9 px-3 flex items-center gap-2 border rounded-lg text-[11px] font-bold uppercase tracking-tight transition-all shrink-0 active:scale-95 shadow-sm",
                    count > 0 
                        ? "bg-blue-50 border-blue-200 text-[#0052CC]" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                )}
                title={`Filter by ${label}`}
            >
                <span>{label}</span>
                {count > 0 && (
                    <span className="bg-[#0052CC] text-white px-1.5 py-0.5 rounded-full text-[9px] font-black">
                        {count}
                    </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                        {options.map(opt => {
                            const isSelected = selectedValues.includes(opt.value);
                            return (
                                <div 
                                    key={opt.value} 
                                    onClick={() => toggleValue(opt.value)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-[12px] font-semibold transition-colors",
                                        isSelected ? "bg-blue-50/50 text-[#0052CC]" : "hover:bg-slate-50 text-slate-700"
                                    )}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0052CC]" />}
                                </div>
                            );
                        })}
                        {options.length === 0 && (
                            <div className="p-3 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                No options
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Thanh công cụ điều khiển biểu đồ Gantt/Roadmap.
 * Cung cấp chức năng tìm kiếm, chuyển đổi góc nhìn (View Type) và lọc chi tiết.
 */
export default function TimelineToolbar({ projectId, filters, setFilters }: TimelineToolbarProps) {
    
    // ---------------------------------------------------------------------------
    // 5. STATE
    // ---------------------------------------------------------------------------
    
    const [sprintOptions, setSprintOptions] = useState<{label: string, value: number}[]>([]);
    const [epicOptions, setEpicOptions] = useState<{label: string, value: number}[]>([]);

    // ---------------------------------------------------------------------------
    // 6. EFFECTS (Data Fetching)
    // ---------------------------------------------------------------------------
    
    // Tải danh sách cấu hình cho bộ lọc (Sprints và Epics)
    useEffect(() => {
        if (!projectId) return;

        const loadFilterOptions = async () => {
            try {
                const [sprints, epics] = await Promise.all([
                    getSprints(projectId),
                    getEpicProgress(projectId)
                ]);
                
                setSprintOptions(sprints.map(s => ({ label: s.name, value: s.id })));
                setEpicOptions(epics.map(e => ({ label: e.epicName, value: e.epicId }))); 
                
            } catch (error) { 
                console.error("Failed to load timeline filter options", error); 
            }
        };

        loadFilterOptions();
    }, [projectId]);

    // ---------------------------------------------------------------------------
    // 7. HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Cập nhật giá trị bộ lọc vào state
     */
    const handleFilterChange = useCallback((key: keyof RoadmapParams, val: any) => {
        // Reset về undefined nếu giá trị là "ALL" hoặc mảng rỗng để dọn dẹp URL/Payload
        const newValue = (val === "ALL" || (Array.isArray(val) && val.length === 0)) ? undefined : val;
        setFilters({ ...filters, [key]: newValue });
    }, [filters, setFilters]);

    /**
     * Xóa toàn bộ bộ lọc, trả về trạng thái mặc định
     */
    const clearAllFilters = useCallback(() => {
        setFilters({ viewType: "ALL" }); 
    }, [setFilters]);

    // Kiểm tra xem có đang áp dụng bộ lọc phụ nào không
    const hasActiveFilters = 
        (!!filters.keyword && filters.keyword.trim() !== "") || 
        (!!filters.from) || 
        (!!filters.to) || 
        (filters.epicIds && filters.epicIds.length > 0) ||
        (filters.epicStatuses && filters.epicStatuses.length > 0) ||
        (filters.sprintIds && filters.sprintIds.length > 0) ||
        (filters.sprintStatuses && filters.sprintStatuses.length > 0) ||
        (filters.viewType && filters.viewType !== 'ALL');

    // ---------------------------------------------------------------------------
    // 8. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <div className="flex flex-col gap-4 mb-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm transition-all">
            
            {/* ROW 1: TÌM KIẾM CHÍNH & CHẾ ĐỘ XEM */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                
                {/* Thanh tìm kiếm */}
                <div className="relative group w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search timeline..." 
                        className="w-full h-10 pl-9 pr-4 text-[13px] font-medium border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all bg-slate-50/50 focus:bg-white placeholder:text-slate-400 shadow-sm"
                        value={filters.keyword || ""}
                        onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    />
                </div>

                {/* Chuyển đổi chế độ xem (View Type Segment) */}
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 shadow-inner">
                    {["ALL", "EPIC", "SPRINT"].map((type) => {
                        const isActive = (!filters.viewType && type === "ALL") || filters.viewType === type;
                        return (
                            <button
                                key={type}
                                onClick={() => handleFilterChange("viewType", type)}
                                className={cn(
                                    "px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all",
                                    isActive ? "bg-white text-[#172B4D] shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                )}
                            >
                                {type === "ALL" ? "All Items" : type === "EPIC" ? "Epics" : "Sprints"}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* ROW 2: BỘ LỌC CHI TIẾT */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">
                    <Filter className="w-3.5 h-3.5" /> <span>Filters</span>
                </div>

                {/* Bộ lọc Epic (Chỉ hiện khi ViewType là ALL hoặc EPIC) */}
                {(filters.viewType === 'ALL' || filters.viewType === 'EPIC' || !filters.viewType) && (
                    <>
                        <MultiSelectDropdown 
                            label="Epics" 
                            options={epicOptions}
                            selectedValues={filters.epicIds}
                            onChange={(vals) => handleFilterChange('epicIds', vals)}
                        />
                        <MultiSelectDropdown 
                            label="Epic Status" 
                            options={EPIC_STATUS_OPTIONS}
                            selectedValues={filters.epicStatuses}
                            onChange={(vals) => handleFilterChange('epicStatuses', vals)}
                        />
                    </>
                )}

                {/* Bộ lọc Sprint (Chỉ hiện khi ViewType là ALL hoặc SPRINT) */}
                {(filters.viewType === 'ALL' || filters.viewType === 'SPRINT' || !filters.viewType) && (
                    <>
                         <MultiSelectDropdown 
                            label="Sprints" 
                            options={sprintOptions}
                            selectedValues={filters.sprintIds}
                            onChange={(vals) => handleFilterChange('sprintIds', vals)}
                        />
                         <MultiSelectDropdown 
                            label="Sprint Status" 
                            options={SPRINT_STATUS_OPTIONS}
                            selectedValues={filters.sprintStatuses}
                            onChange={(vals) => handleFilterChange('sprintStatuses', vals)}
                        />
                    </>
                )}

                {/* Lọc theo khoảng thời gian */}
                <div className="flex items-center gap-2 bg-white px-2 py-1.5 border border-slate-200 rounded-lg ml-auto sm:ml-0 h-9 shrink-0 shadow-sm hover:border-slate-300 transition-colors focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-[#2684FF]">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400 ml-1" />
                    <input 
                        type="date" 
                        title="From Date"
                        className="text-[11px] font-bold uppercase tracking-tight bg-transparent border-none outline-none text-slate-600 w-28 cursor-pointer" 
                        value={filters.from || ""}
                        onChange={(e) => handleFilterChange('from', e.target.value)} 
                    />
                    <span className="text-slate-300 font-bold">—</span>
                    <input 
                        type="date" 
                        title="To Date"
                        className="text-[11px] font-bold uppercase tracking-tight bg-transparent border-none outline-none text-slate-600 w-28 cursor-pointer" 
                        value={filters.to || ""}
                        onChange={(e) => handleFilterChange('to', e.target.value)} 
                    />
                </div>

                {/* Nút xóa bộ lọc */}
                {hasActiveFilters && (
                    <button 
                        onClick={clearAllFilters}
                        className="ml-auto sm:ml-auto flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 px-3 py-1.5 h-9 rounded-lg transition-colors shrink-0 active:scale-95 border border-transparent hover:border-red-100"
                        title="Clear all optional filters"
                    >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" /> Reset
                    </button>
                )}
            </div>

        </div>
    );
}