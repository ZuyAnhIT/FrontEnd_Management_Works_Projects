"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

// API & Types
import { 
    getProjectWorkload, 
    exportWorkloadReport, 
    WorkloadStat, 
    WorkloadParams 
} from "@/services/apiStatistics";

// Sub-Components
import WorkloadChart from "./WorkloadChart";
import WorkloadFilterToolbar from "./WorkloadFilterToolbar";
import WorkloadKPI from "./WorkloadKPI";

// =============================================================================
// 1. INTERFACES & CONFIG
// =============================================================================

interface WorkloadOverviewProps {
    projectId: number;
    hideExport?: boolean; // ✅ Prop mới
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function WorkloadOverview({ projectId, hideExport = false }: WorkloadOverviewProps) {
    // --- HOOKS ---
    const { showToast } = useToast();
    
    // --- STATE ---
    const [data, setData] = useState<WorkloadStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false); 
    
    // Filter State
    const [filters, setFilters] = useState<WorkloadParams>({
        viewType: "POINTS",
        groupBy: "STATUS",
        sprintId: undefined,
    });

    // --- FETCH DATA (CHART) ---
    useEffect(() => {
        if (!projectId) return;

        const fetchWorkload = async () => {
            if (data.length === 0) setLoading(true); 
            
            try {
                const res = await getProjectWorkload(projectId, filters);
                setData(res);
            } catch (error: any) {
                console.error("Failed to load workload data", error);
                const message = error.message || error.response?.data?.message || "Failed to load workload data.";
                showToast(message, "error");
            } finally {
                setLoading(false);
            }
        };

        const t = setTimeout(() => fetchWorkload(), 300);
        return () => clearTimeout(t);
    }, [projectId, filters]);

    // --- HANDLE EXPORT LOGIC ---
    const handleExport = async () => {
        if (!projectId || hideExport) return; // ✅ Chặn export
        
        setIsExporting(true);
        try {
            const blobData = await exportWorkloadReport(projectId, filters);
            const url = window.URL.createObjectURL(new Blob([blobData]));
            const link = document.createElement('a');
            link.href = url;
            
            const timestamp = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `Workload_Report_P${projectId}_${timestamp}.xlsx`);
            
            document.body.appendChild(link);
            link.click();
            
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast("Export successfully downloaded!", "success");

        } catch (error: any) {
            console.error("Export failed", error);
            const message = error.message || error.response?.data?.message || "Failed to export Excel file.";
            showToast(message, "error");
        } finally {
            setIsExporting(false);
        }
    };

    // --- RENDER UI ---
    return (
        <div className="space-y-6">
            
            {/* 1. FILTER TOOLBAR */}
            <WorkloadFilterToolbar 
                projectId={projectId}
                filters={filters}
                setFilters={setFilters}
                onExport={handleExport}
                isExporting={isExporting}
                hideExport={hideExport} // ✅ Truyền xuống con
            />

            {/* LOADING STATE */}
            {loading && data.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center bg-white rounded-xl border border-slate-200">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-50"/>
                        <p className="text-sm text-slate-500 font-medium">Calculating team workload...</p>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    
                    {/* 2. KPI SUMMARY CARDS */}
                    <WorkloadKPI 
                        data={data} 
                        unit={filters.viewType || "POINTS"} 
                    />

                    {/* 3. MAIN STACKED BAR CHART */}
                    <WorkloadChart 
                        data={data} 
                        loading={loading}
                        unit={filters.viewType || "POINTS"}
                    />
                </div>
            )}
        </div>
    );
}