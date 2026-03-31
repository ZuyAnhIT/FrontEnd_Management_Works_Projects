"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Database } from "lucide-react";
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
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface WorkloadOverviewProps {
    projectId: number;
    hideExport?: boolean;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần Tổng quan Khối lượng công việc (Workload Overview).
 * Trung tâm điều khiển dữ liệu Analytics: Quản lý Filters, Fetching và Export báo cáo.
 */
export default function WorkloadOverview({ 
    projectId, 
    hideExport = false 
}: WorkloadOverviewProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    
    const [data, setData] = useState<WorkloadStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false); 
    
    // Khởi tạo bộ lọc mặc định
    const [filters, setFilters] = useState<WorkloadParams>({
        viewType: "POINTS",
        groupBy: "STATUS",
        sprintId: undefined,
    });

    // ---------------------------------------------------------------------------
    // 5. DATA FETCHING (CHART & KPI)
    // ---------------------------------------------------------------------------

    useEffect(() => {
        if (!projectId) return;

        const fetchWorkload = async () => {
            // Chỉ hiện loader lớn khi chưa có dữ liệu ban đầu
            if (data.length === 0) setIsLoading(true); 
            
            try {
                const res = await getProjectWorkload(projectId, filters);
                setData(res);
            } catch (error: any) {
                console.error("Failed to load workload data:", error);
                const message = error.response?.data?.message || "Failed to sync workload analytics.";
                showToast(message, "error");
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce: Tránh gọi API quá nhiều khi người dùng đổi filter liên tục
        const timer = setTimeout(fetchWorkload, 300);
        return () => clearTimeout(timer);
    }, [projectId, filters, showToast]);

    // ---------------------------------------------------------------------------
    // 6. EXPORT HANDLER
    // ---------------------------------------------------------------------------

    /**
     * Xử lý xuất báo cáo Excel dựa trên bộ lọc hiện tại.
     */
    const handleExportReport = useCallback(async () => {
        if (!projectId || hideExport) return;
        
        setIsExporting(true);
        try {
            const blobData = await exportWorkloadReport(projectId, filters);
            
            // Tạo liên kết tải xuống ảo
            const url = window.URL.createObjectURL(new Blob([blobData]));
            const link = document.createElement('a');
            link.href = url;
            
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `Worknet_Workload_P${projectId}_${timestamp}.xlsx`;
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            // Dọn dẹp bộ nhớ
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast(`Report "${fileName}" exported successfully`, "success");
        } catch (error: any) {
            console.error("Excel Export Error:", error);
            showToast("Failed to generate Excel report. Please try again.", "error");
        } finally {
            setIsExporting(false);
        }
    }, [projectId, filters, hideExport, showToast]);

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <div className="space-y-8 min-h-[600px]">
            
            {/* PHẦN 1: THANH CÔNG CỤ LỌC (Toolbar) */}
            <WorkloadFilterToolbar 
                projectId={projectId}
                filters={filters}
                setFilters={setFilters}
                onExport={handleExportReport}
                isExporting={isExporting}
                hideExport={hideExport}
            />

            {/* TRẠNG THÁI ĐANG TẢI (Loading State) */}
            {isLoading && data.length === 0 ? (
                <div className="h-[500px] flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm transition-all animate-pulse">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-blue-50 rounded-2xl">
                             <Loader2 className="w-10 h-10 animate-spin text-[#0052CC]"/>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em]">Analyzing Data</p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase">Synthesizing team workload metrics...</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
                    
                    {/* PHẦN 2: THẺ KPI (Key Performance Indicators) */}
                    <div className="relative">
                        <WorkloadKPI 
                            data={data} 
                            unit={filters.viewType || "POINTS"} 
                        />
                        {/* Overlay mờ nhẹ khi đang load ngầm */}
                        {isLoading && (
                            <div className="absolute top-2 right-2 flex items-center gap-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-md border border-slate-100 shadow-sm animate-in fade-in">
                                <Loader2 className="w-3 h-3 animate-spin text-[#0052CC]" />
                                <span className="text-[9px] font-black text-slate-400 uppercase">Updating</span>
                            </div>
                        )}
                    </div>

                    {/* PHẦN 3: BIỂU ĐỒ BAR CHỒNG CHÍNH (Resource Allocation) */}
                    <div className="group transition-all">
                        <WorkloadChart 
                            data={data} 
                            loading={isLoading && data.length === 0}
                            unit={filters.viewType || "POINTS"}
                        />
                    </div>
                    
                    {/* FOOTER INFO */}
                    <div className="flex items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                        <Database className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Worknet Analytics Engine v1.2</span>
                    </div>
                </div>
            )}
        </div>
    );
}