"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Hooks -> Services -> Components)
// =============================================================================

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { 
    LayoutDashboard, 
    PieChart, 
    ArrowUpRight,
    BarChart3,
    Users,
    Loader2,
    FileSpreadsheet
} from "lucide-react";

// Context & Hooks
import { useToast } from "@/components/ui/ToastProvider"; 
import { useProjectRole } from "@/hooks/useProjectRole"; 

// API & Types
import { 
    getStatusDistribution, 
    getPriorityDistribution,
    getTypeDistribution,
    getEpicProgress, 
    exportEpicProgress, 
    DistributionStat,
    EpicProgressStat, 
    EpicProgressParams,
} from "@/services/apiStatistics";

// Internal Components
import WeeklyOverview from "@/components/features/core/summary/WeeklyOverview";
import StatusChart from "@/components/features/core/summary/StatusChart";
import PriorityChart from "@/components/features/core/summary/PriorityChart";
import TypeChart from "@/components/features/core/summary/TypeChart";
import EpicProgressCard from "@/components/features/core/summary/EpicProgressCard"; 
import EpicFilterToolbar from "@/components/features/core/summary/EpicFilterToolbar"; 
import WorkloadOverview from "@/components/features/core/summary/WorkloadOverview"; 
import { Chatbot } from "@/components/chatbot/chatbot";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

/**
 * Trang tong quan du an (Project Summary).
 * Cung cap cac chi so hieu suat, phan phoi cong viec va lo trinh Epic theo thoi gian thuc.
 */
export default function ProjectSummaryPage() {
    
    // ---------------------------------------------------------------------------
    // 3. HOOKS & CONTEXT
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    const params = useParams();
    const projectId = Number(params.projectId);

    // Kiem tra phan quyen nguoi dung trong du an
    const { isGuest } = useProjectRole(projectId);

    // ---------------------------------------------------------------------------
    // 4. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    // Trang thai cac bieu do phan phoi
    const [isLoadingCharts, setIsLoadingCharts] = useState(true);
    const [statusData, setStatusData] = useState<DistributionStat[]>([]);
    const [priorityData, setPriorityData] = useState<DistributionStat[]>([]);
    const [typeData, setTypeData] = useState<DistributionStat[]>([]);

    // Trang thai tien do Epic
    const [epicData, setEpicData] = useState<EpicProgressStat[]>([]);
    const [isLoadingEpics, setIsLoadingEpics] = useState(true);
    const [epicFilters, setEpicFilters] = useState<EpicProgressParams>({});
    const [isExportingEpic, setIsExportingEpic] = useState(false); 

    // ---------------------------------------------------------------------------
    // 5. DATA FETCHING (Handlers)
    // ---------------------------------------------------------------------------

    /**
     * Tai du lieu cho cac bieu do phan phoi (Status, Priority, Type)
     */
    const fetchDistributionData = useCallback(async () => {
        if (!projectId) return;
        setIsLoadingCharts(true);
        try {
            const [resStatus, resPriority, resType] = await Promise.all([
                getStatusDistribution(projectId),
                getPriorityDistribution(projectId),
                getTypeDistribution(projectId)
            ]);
            setStatusData(resStatus);
            setPriorityData(resPriority);
            setTypeData(resType);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Failed to sync analytics data";
            showToast(message, "error");
        } finally {
            setIsLoadingCharts(false);
        }
    }, [projectId, showToast]);

    /**
     * Tai du lieu tien do Epic dua tren bo loc
     */
    const fetchEpicData = useCallback(async () => {
        if (!projectId) return;
        setIsLoadingEpics(true);
        try {
            const data = await getEpicProgress(projectId, epicFilters);
            setEpicData(data);
        } catch (error: any) {
            console.error("[Summary] Epic load failed:", error.message);
        } finally {
            setIsLoadingEpics(false);
        }
    }, [projectId, epicFilters]);

    // ---------------------------------------------------------------------------
    // 6. SIDE EFFECTS
    // ---------------------------------------------------------------------------

    useEffect(() => {
        fetchDistributionData();
    }, [fetchDistributionData]);

    useEffect(() => {
        const timer = setTimeout(() => fetchEpicData(), 300);
        return () => clearTimeout(timer);
    }, [fetchEpicData]);

    // ---------------------------------------------------------------------------
    // 7. EVENT HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xuat bao cao Epic sang file Excel (Bi chan neu la Guest)
     */
    const handleExportEpicReport = async () => {
        if (!projectId || isGuest) return; 
        
        setIsExportingEpic(true);
        try {
            const blobData = await exportEpicProgress(projectId, epicFilters);
            const url = window.URL.createObjectURL(new Blob([blobData]));
            const link = document.createElement('a');
            
            link.href = url;
            const timestamp = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `Epic_Roadmap_P${projectId}_${timestamp}.xlsx`);
            
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast("Roadmap report exported successfully", "success");
        } catch (error: any) {
            showToast(error.message || "Export failed", "error");
        } finally {
            setIsExportingEpic(false);
        }
    };

    // ---------------------------------------------------------------------------
    // 8. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (!projectId) return null;

    return (
        <div className="min-h-screen bg-[#F4F5F7] p-6 sm:p-10 font-sans text-[#172B4D]">
            <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl border border-[#DFE1E6] shadow-sm">
                                <LayoutDashboard className="w-6 h-6 text-[#0052CC] stroke-[2.5]" />
                            </div>
                            Project Insights
                        </h1>
                        <p className="text-[14px] text-[#42526E] font-medium mt-2">
                            Real-time intelligence on project health, velocity, and resource distribution.
                        </p>
                    </div>
                    
                    {!isGuest && (
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#DFE1E6] rounded-xl text-[12px] font-black uppercase tracking-widest text-[#42526E] hover:bg-[#F4F5F7] hover:text-[#0052CC] transition-all shadow-sm active:scale-95">
                            <ArrowUpRight className="w-4 h-4 stroke-[3]" /> Global Report
                        </button>
                    )}
                </div>

                {/* SECTION 1: PERFORMANCE OVERVIEW */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <BarChart3 className="w-4 h-4 text-[#6B778C]" />
                        <h3 className="text-[11px] font-black text-[#6B778C] uppercase tracking-[0.2em]">Activity Streams</h3>
                    </div>
                    <div className="bg-white p-2 rounded-2xl border border-[#DFE1E6] shadow-sm">
                        <WeeklyOverview projectId={projectId} />
                    </div>
                </section>

                <div className="h-px bg-[#DFE1E6] w-full" />

                {/* SECTION 2: DISTRIBUTION ANALYTICS */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-[#6B778C]" />
                            <h3 className="text-[11px] font-black text-[#6B778C] uppercase tracking-[0.2em]">Resource Distribution</h3>
                        </div>
                        {isLoadingCharts && <Loader2 className="w-4 h-4 text-[#0052CC] animate-spin" />}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ChartWrapper title="Ticket Status">
                            <StatusChart data={statusData} loading={isLoadingCharts} />
                        </ChartWrapper>
                        <ChartWrapper title="Priority Levels">
                            <PriorityChart data={priorityData} loading={isLoadingCharts} />
                        </ChartWrapper>
                        <ChartWrapper title="Issue Types">
                            <TypeChart data={typeData} loading={isLoadingCharts} />
                        </ChartWrapper>
                    </div>
                </section>

                <div className="h-px bg-[#DFE1E6] w-full" />

                {/* SECTION 3: EPIC ROADMAP & PROGRESS */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <FileSpreadsheet className="w-4 h-4 text-[#6B778C]" />
                        <h3 className="text-[11px] font-black text-[#6B778C] uppercase tracking-[0.2em]">Epic Velocity & Roadmap</h3>
                    </div>

                    <div className="space-y-4">
                        <EpicFilterToolbar 
                            projectId={projectId}
                            filters={epicFilters}
                            setFilters={setEpicFilters}
                            onExport={handleExportEpicReport}
                            isExporting={isExportingEpic}
                            hideExport={isGuest} 
                        />

                        <div className="bg-white rounded-2xl border border-[#DFE1E6] shadow-sm overflow-hidden min-h-[300px] relative">
                            {isLoadingEpics && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin opacity-50" />
                                </div>
                            )}
                            <EpicProgressCard data={epicData} loading={isLoadingEpics} />
                        </div>
                    </div>
                </section>

                <div className="h-px bg-[#DFE1E6] w-full" />

                {/* SECTION 4: HUMAN CAPITAL & WORKLOAD */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <Users className="w-4 h-4 text-[#6B778C]" />
                        <h3 className="text-[11px] font-black text-[#6B778C] uppercase tracking-[0.2em]">Personnel Workload</h3>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#DFE1E6] shadow-sm overflow-hidden">
                        <WorkloadOverview projectId={projectId} hideExport={isGuest} />
                    </div>
                </section>

                <Chatbot />
            </div>
        </div>
    );
}

// =============================================================================
// SUB-COMPONENTS (Refactored for Layout Consistency)
// =============================================================================

const ChartWrapper = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-2xl border border-[#DFE1E6] shadow-sm flex flex-col space-y-4 transition-all hover:shadow-md">
        <h4 className="text-[13px] font-black text-[#172B4D] uppercase tracking-wider border-b border-[#F4F5F7] pb-3">
            {title}
        </h4>
        <div className="flex-1 flex items-center justify-center min-h-[240px]">
            {children}
        </div>
    </div>
);