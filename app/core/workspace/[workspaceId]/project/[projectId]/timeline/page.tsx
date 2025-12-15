"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Map } from "lucide-react";
import { Task } from "gantt-task-react"; 

// API Services
import { 
    getProjectRoadmap, 
    RoadmapItemResponse, 
    RoadmapParams 
} from "@/services/apiStatistics";
import { apiEpic } from "@/services/apiEpic"; 

// Components
import TimelineToolbar from "@/components/features/core/timeline/TimelineToolbar";
import TimelineGantt from "@/components/features/core/timeline/TimelineGantt";
import EpicDetailPanel from "@/components/features/core/epic/EpicDetailPanel";
import { useToast } from "@/components/ui/ToastProvider"; 
import { Chatbot } from "@/components/chatbot/chatbot";

export default function TimelinePage() {
    const params = useParams();
    const projectId = Number(params.projectId);
    const { showToast } = useToast(); 

    // --- STATE ---
    const [data, setData] = useState<RoadmapItemResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null);
    const [filters, setFilters] = useState<RoadmapParams>({ viewType: "ALL" });

    // ===================================================
    // 1. FETCH DATA (Logic nghiệp vụ quan trọng)
    // ===================================================
    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await getProjectRoadmap(projectId, filters);
            setData(res);
        } catch (error: any) {
            console.error("Fetch roadmap error:", error);
            // Show toast chỉ khi lỗi không phải là silent (ví dụ: lỗi mạng, 500)
            const message = error.response?.data?.message || error.message || "Failed to load roadmap data";
            // if (error.response?.status !== 404) showToast(message, "error"); // Giữ nguyên silent error nếu có
        } finally {
            setLoading(false);
        }
    }, [projectId, filters]);

    useEffect(() => {
        const t = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(t);
    }, [fetchData]);

    // ===================================================
    // 2. HANDLERS
    // ===================================================
    const handleRefresh = () => {
        fetchData(); 
    };

    const handleSelect = (item: RoadmapItemResponse) => {
        const itemType = item.type?.toUpperCase();
        // Lấy ID thật từ ID composite (nếu có)
        if (itemType === 'EPIC') {
            const realId = (item as any).originalId || Number(String(item.id).replace(/\D/g, ''));
            if (realId && !isNaN(realId)) {
                setSelectedEpicId(realId);
            }
        }
    };

    // Xử lý kéo thả / resize thanh Bar (Logic nghiệp vụ quan trọng)
    const handleDateChange = async (task: Task) => {
        const epicId = Number(String(task.id).replace(/\D/g, ''));
        if (!epicId || isNaN(epicId)) {
            showToast("Invalid Epic ID for update", "error");
            return;
        }

        // Format ngày cho API
        const newStartDate = task.start.toISOString();
        const newEndDate = task.end.toISOString();

        // Optimistic Update
        setData(prev => prev.map(item => {
            const itemIdString = String(item.id);
            if (itemIdString === task.id || itemIdString.includes(String(epicId))) {
                return {
                    ...item,
                    startDate: newStartDate,
                    endDate: newEndDate
                };
            }
            return item;
        }));

        try {
            await apiEpic.updateEpic(projectId, epicId, {
                startDate: newStartDate,
                dueDate: newEndDate // API dùng dueDate
            } as any);
            
            showToast("Updated timeline successfully", "success");

        } catch (error: any) {
            console.error("Failed to update date", error);
            const message = error.response?.data?.message || error.message || "Failed to update date";
            showToast(message, "error");
            fetchData(); // Rollback bằng cách fetch lại
        }
    };

    if (!projectId) return null;

    // ===================================================
    // 3. RENDER UI
    // ===================================================

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
            
            {/* 1. MAIN CONTENT WRAPPER */}
            <div 
                className={`
                    p-6 sm:p-8 font-sans text-slate-900 min-h-screen
                    transition-all duration-300 ease-in-out
                    ${selectedEpicId ? 'pr-[460px]' : ''} 
                    /* 👆 Đẩy nội dung sang trái khi Panel mở để không bị che khuất */
                `}
            >
                <div className="max-w-[1800px] mx-auto space-y-6 pb-20"> 
                    
                    {/* HEADER */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                            <Map className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Timeline & Roadmap</h1>
                            <p className="text-sm text-slate-500">Visualize project schedule across Epics and Sprints.</p>
                        </div>
                    </div>

                    {/* TOOLBAR */}
                    <TimelineToolbar 
                        projectId={projectId} 
                        filters={filters}
                        setFilters={setFilters}
                    />

                    {/* GANTT CHART */}
                    <TimelineGantt 
                        data={data} 
                        loading={loading} 
                        projectId={projectId}
                        onRefresh={handleRefresh}
                        onSelect={handleSelect}
                        selectedEpicId={selectedEpicId}
                        onDateChange={handleDateChange}
                    />
                </div>
            </div>

            {/* 2. EPIC DETAIL PANEL */}
            {selectedEpicId && (
                <div 
                    className="fixed inset-y-0 right-0 z-[9999] pointer-events-auto shadow-2xl"
                    // Thêm bóng đổ để tách biệt với nội dung chính
                >
                    <EpicDetailPanel 
                        projectId={projectId}
                        epicId={selectedEpicId}
                        onClose={() => setSelectedEpicId(null)}
                        onUpdate={handleRefresh}
                    />
                    <Chatbot />
                </div>
            )}
        </div>
    );
}