"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Services -> Components)
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Map, Loader2 } from "lucide-react";
import { Task } from "gantt-task-react"; 

// API Services & Types
import { 
    getProjectRoadmap, 
    RoadmapItemResponse, 
    RoadmapParams 
} from "@/services/apiStatistics";
import { updateEpic } from "@/services/apiEpic"; // Da sua loi import: dung named function

// Context & UI
import { useToast } from "@/components/ui/ToastProvider"; 
import { Chatbot } from "@/components/chatbot/chatbot";
import { cn } from "@/lib/utils";

// Internal Components
import TimelineToolbar from "@/components/features/core/timeline/TimelineToolbar";
import TimelineGantt from "@/components/features/core/timeline/TimelineGantt";
import EpicDetailPanel from "@/components/features/core/epic/EpicDetailPanel";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

/**
 * Trang lo trinh thoi gian (Timeline & Roadmap).
 * Cung cap cai nhin truc quan ve lich trinh thuc hien Epic va Sprint thong qua bieu do Gantt.
 */
export default function TimelinePage() {
    
    // ---------------------------------------------------------------------------
    // 3. HOOKS & CONTEXT
    // ---------------------------------------------------------------------------
    
    const params = useParams();
    const { showToast } = useToast(); 
    const projectId = Number(params.projectId);

    // ---------------------------------------------------------------------------
    // 4. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    const [roadmapData, setRoadmapData] = useState<RoadmapItemResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null);
    const [filters, setFilters] = useState<RoadmapParams>({ viewType: "ALL" });

    // ---------------------------------------------------------------------------
    // 5. DATA FETCHING (Handlers)
    // ---------------------------------------------------------------------------

    /**
     * Tai du lieu lo trinh du an tu may chu
     */
    const fetchRoadmapData = useCallback(async () => {
        if (!projectId) return;
        setIsLoading(true);
        try {
            const response = await getProjectRoadmap(projectId, filters);
            setRoadmapData(response);
        } catch (error: any) {
            console.error("[Roadmap] Fetch error:", error.message);
            // Hien thi toast neu loi mang hoac loi nghiem trong tu phia server
            if (error.response?.status !== 404) {
                showToast("Unable to synchronize roadmap data", "error");
            }
        } finally {
            setIsLoading(false);
        }
    }, [projectId, filters, showToast]);

    // Side effect tai du lieu co debounce nhe de tranh spam request khi chuyen filter
    useEffect(() => {
        const timer = setTimeout(() => fetchRoadmapData(), 300);
        return () => clearTimeout(timer);
    }, [fetchRoadmapData]);

    // ---------------------------------------------------------------------------
    // 6. EVENT HANDLERS (Business Logic)
    // ---------------------------------------------------------------------------

    const handleDataRefresh = useCallback(() => {
        fetchRoadmapData(); 
    }, [fetchRoadmapData]);

    /**
     * Xu ly khi nguoi dung chon mot thanh bar tren bieu do Gantt
     */
    const handleItemSelection = (item: RoadmapItemResponse) => {
        const itemType = item.type?.toUpperCase();
        if (itemType === 'EPIC') {
            // Trich xuat ID nguyen ban tu ID composite cua Gantt
            const realId = (item as any).originalId || Number(String(item.id).replace(/\D/g, ''));
            if (realId && !isNaN(realId)) {
                setSelectedEpicId(realId);
            }
        }
    };

    /**
     * Cap nhat thoi gian thuc hien Epic thong qua tuong tac keo tha (Drag & Drop)
     */
    const handleBarDateChange = async (task: Task) => {
        const epicId = Number(String(task.id).replace(/\D/g, ''));
        if (!epicId || isNaN(epicId)) {
            showToast("Identifier mismatch during update", "error");
            return;
        }

        const newStartDate = task.start.toISOString();
        const newEndDate = task.end.toISOString();

        // CAP NHAT LAC QUAN (Optimistic Update) de dam bao trai nghiem muot ma
        setRoadmapData(prev => prev.map(item => {
            const itemIdString = String(item.id);
            if (itemIdString === task.id || itemIdString.includes(String(epicId))) {
                return { ...item, startDate: newStartDate, endDate: newEndDate };
            }
            return item;
        }));

        try {
            // Goi API cap nhat thong tin thoi gian
            await updateEpic(projectId, epicId, {
                startDate: newStartDate,
                dueDate: newEndDate 
            } as any);
            
            showToast("Timeline schedule updated", "success");
        } catch (error: any) {
            showToast(error.message || "Failed to persist timeline changes", "error");
            // Khoi phuc du lieu goc neu API that bai
            fetchRoadmapData(); 
        }
    };

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (!projectId) return null;

    return (
        <div className="min-h-screen bg-[#F4F5F7] relative overflow-x-hidden">
            
            {/* VUNG NOI DUNG CHINH (Main Working Area) */}
            <div 
                className={cn(
                    "p-6 sm:p-10 font-sans text-[#172B4D] min-h-screen transition-all duration-500 ease-in-out",
                    selectedEpicId ? 'pr-[480px]' : 'pr-0' 
                )}
            >
                <div className="max-w-[1800px] mx-auto space-y-8 pb-20"> 
                    
                    {/* PAGE HEADER */}
                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="p-2.5 bg-white rounded-xl border border-[#DFE1E6] shadow-sm">
                            <Map className="w-6 h-6 text-[#0052CC] stroke-[2.5]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">Timeline & Roadmap</h1>
                            <p className="text-[14px] text-[#42526E] font-medium mt-1">Visualize velocity and scheduling across organizational Epics.</p>
                        </div>
                    </div>

                    {/* ACTION TOOLBAR */}
                    <div className="animate-in fade-in duration-700">
                        <TimelineToolbar 
                            projectId={projectId} 
                            filters={filters}
                            setFilters={setFilters}
                        />
                    </div>

                    {/* GANTT VISUALIZATION */}
                    <div className="bg-white rounded-2xl border border-[#DFE1E6] shadow-sm overflow-hidden relative min-h-[500px] animate-in zoom-in-95 duration-500">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6B778C]">Syncing Roadmap...</span>
                            </div>
                        )}
                        
                        <TimelineGantt 
                            data={roadmapData} 
                            loading={isLoading} 
                            projectId={projectId}
                            onRefresh={handleDataRefresh}
                            onSelect={handleItemSelection}
                            selectedEpicId={selectedEpicId}
                            onDateChange={handleBarDateChange}
                        />
                    </div>
                </div>
            </div>

            {/* SIDE PANEL: EPIC DETAILS (Fixed positioning) */}
            <aside 
                className={cn(
                    "fixed inset-y-0 right-0 z-[100] w-[460px] bg-white border-l border-[#DFE1E6] shadow-[-20px_0_40px_rgba(0,0,0,0.05)]",
                    "transition-transform duration-500 ease-in-out transform",
                    selectedEpicId ? "translate-x-0" : "translate-x-full"
                )}
            >
                {selectedEpicId && (
                    <div className="h-full flex flex-col relative">
                        <EpicDetailPanel 
                            projectId={projectId}
                            epicId={selectedEpicId}
                            onClose={() => setSelectedEpicId(null)}
                            onUpdate={handleDataRefresh}
                        />
                    </div>
                )}
            </aside>

            {/* FLOATING UTILITIES */}
            <Chatbot />

            {/* GLOBAL SCROLLBAR CUSTOMIZATION */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
            `}</style>
        </div>
    );
}