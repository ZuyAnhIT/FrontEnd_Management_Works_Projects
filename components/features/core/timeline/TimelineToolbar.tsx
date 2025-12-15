"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Filter, X, Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import { RoadmapParams } from "@/services/apiStatistics";
import { getSprints, Sprint } from "@/services/apiSprint";
import { getEpicProgress } from "@/services/apiStatistics";

// =============================================================================
// 1. SUB-COMPONENT: MULTI-SELECT DROPDOWN
// =============================================================================

interface MultiSelectProps {
    label: string;
    options: { label: string; value: string | number }[];
    selectedValues?: (string | number)[];
    onChange: (values: (string | number)[]) => void;
}

function MultiSelectDropdown({ label, options, selectedValues = [], onChange }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                className={`h-9 px-3 flex items-center gap-2 border rounded-lg text-xs font-bold transition-all shrink-0
                ${count > 0 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title={`Filter by ${label}`}
            >
                <span>{label}</span>
                {count > 0 && <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-[9px]">{count}</span>}
                <ChevronDown className="w-3 h-3 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {options.map(opt => {
                            const isSelected = selectedValues.includes(opt.value);
                            return (
                                <div 
                                    key={opt.value} 
                                    onClick={() => toggleValue(opt.value)}
                                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-slate-700"
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                                </div>
                            )
                        })}
                        {options.length === 0 && <div className="p-2 text-center text-xs text-slate-400">No options available</div>}
                    </div>
                </div>
            )}
        </div>
    )
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

interface TimelineToolbarProps {
    projectId: number;
    filters: RoadmapParams;
    setFilters: (f: RoadmapParams) => void;
}

export default function TimelineToolbar({ projectId, filters, setFilters }: TimelineToolbarProps) {
    
    // Data Options
    const [sprintOptions, setSprintOptions] = useState<{label: string, value: number}[]>([]);
    const [epicOptions, setEpicOptions] = useState<{label: string, value: number}[]>([]);

    // Load Options
    useEffect(() => {
        if (!projectId) return;
        const loadData = async () => {
            try {
                const [sprints, epics] = await Promise.all([
                    getSprints(projectId),
                    getEpicProgress(projectId)
                ]);
                setSprintOptions(sprints.map(s => ({ label: s.name, value: s.id })));
                
                // FIX LỖI: Dùng e.epicId
                setEpicOptions(epics.map(e => ({ label: e.epicName, value: e.epicId }))); 
                
            } catch (e) { console.error("Failed to load timeline options", e); }
        };
        loadData();
    }, [projectId]);


    // Handlers
    const handleChange = (key: keyof RoadmapParams, val: any) => {
        // Nếu giá trị là "ALL" hoặc mảng rỗng/null, set undefined
        const newValue = (val === "ALL" || (Array.isArray(val) && val.length === 0)) ? undefined : val;
        setFilters({ ...filters, [key]: newValue });
    };

    const clearFilters = () => {
        // Reset về giá trị mặc định của ViewType
        setFilters({ viewType: "ALL" }); 
    };

    // Logic kiểm tra filter (trừ viewType và keyword rỗng)
    const hasFilters = 
        (!!filters.keyword && filters.keyword.trim() !== "") || 
        (!!filters.from) || 
        (!!filters.to) || 
        (filters.epicIds && filters.epicIds.length > 0) ||
        (filters.epicStatuses && filters.epicStatuses.length > 0) ||
        (filters.sprintIds && filters.sprintIds.length > 0) ||
        (filters.sprintStatuses && filters.sprintStatuses.length > 0) ||
        (filters.viewType && filters.viewType !== 'ALL'); // Coi việc chọn viewType là 1 filter nếu nó khác ALL


    // Custom Epic/Sprint Status Options
    const EPIC_STATUS_OPTIONS = [
        {label:'In Progress', value:'IN_PROGRESS'}, 
        {label:'Completed', value:'COMPLETED'}, 
        {label:'Open', value:'OPEN'}, 
        {label:'Closed', value:'CLOSED'}
    ];
    
    const SPRINT_STATUS_OPTIONS = [
        {label:'Not Started', value:'NOT_STARTED'}, 
        {label:'In Progress', value:'IN_PROGRESS'}, 
        {label:'Completed', value:'COMPLETED'}, 
        {label:'Cancelled', value:'CANCELLED'}
    ];


    return (
        <div className="flex flex-col gap-4 mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            
            {/* ROW 1: Main Search & View Type */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                
                {/* Search */}
                <div className="relative group w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
                    <input 
                        type="text" 
                        placeholder="Search timeline..." 
                        className="w-full h-10 pl-10 pr-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                        value={filters.keyword || ""}
                        onChange={(e) => handleChange('keyword', e.target.value)}
                    />
                </div>

                {/* View Type Segment */}
                <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
                    {["ALL", "EPIC", "SPRINT"].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleChange("viewType", type)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${(!filters.viewType && type === "ALL") || filters.viewType === type ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            {type === "ALL" ? "All Items" : type === "EPIC" ? "Epics" : "Sprints"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            {/* ROW 2: Detailed Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-400 mr-2">
                    <Filter className="w-4 h-4" /> <span className="font-medium">Filters:</span>
                </div>

                {/* Epic Filters */}
                {(filters.viewType === 'ALL' || filters.viewType === 'EPIC' || !filters.viewType) && (
                    <>
                        <MultiSelectDropdown 
                            label="Epics" 
                            options={epicOptions}
                            selectedValues={filters.epicIds}
                            onChange={(vals) => handleChange('epicIds', vals)}
                        />
                        <MultiSelectDropdown 
                            label="Epic Status" 
                            options={EPIC_STATUS_OPTIONS}
                            selectedValues={filters.epicStatuses}
                            onChange={(vals) => handleChange('epicStatuses', vals)}
                        />
                    </>
                )}

                {/* Sprint Filters */}
                {(filters.viewType === 'ALL' || filters.viewType === 'SPRINT' || !filters.viewType) && (
                    <>
                         <MultiSelectDropdown 
                            label="Sprints" 
                            options={sprintOptions}
                            selectedValues={filters.sprintIds}
                            onChange={(vals) => handleChange('sprintIds', vals)}
                        />
                         <MultiSelectDropdown 
                            label="Sprint Status" 
                            options={SPRINT_STATUS_OPTIONS}
                            selectedValues={filters.sprintStatuses}
                            onChange={(vals) => handleChange('sprintStatuses', vals)}
                        />
                    </>
                )}

                {/* Date Range */}
                <div className="flex items-center gap-2 bg-white px-2 py-1.5 border border-slate-200 rounded-lg ml-auto sm:ml-0 h-9 shrink-0">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <input type="date" className="text-xs bg-transparent border-none outline-none text-slate-600 w-24 cursor-pointer" 
                        value={filters.from || ""}
                        onChange={(e) => handleChange('from', e.target.value)} />
                    <span className="text-slate-300">-</span>
                    <input type="date" className="text-xs bg-transparent border-none outline-none text-slate-600 w-24 cursor-pointer" 
                        value={filters.to || ""}
                        onChange={(e) => handleChange('to', e.target.value)} />
                </div>

                {/* Nút Clear */}
                {hasFilters && (
                    <button 
                        onClick={clearFilters}
                        className="ml-auto sm:ml-0 flex items-center gap-1 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors shrink-0"
                        title="Clear all optional filters"
                    >
                        <X className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>

        </div>
    );
}