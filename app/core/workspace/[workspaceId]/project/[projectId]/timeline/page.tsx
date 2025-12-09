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

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
      if (!projectId) return;
      setLoading(true);
      try {
         const res = await getProjectRoadmap(projectId, filters);
         setData(res);
      } catch (error) {
         // Silent error
      } finally {
         setLoading(false);
      }
  }, [projectId, filters]);

  useEffect(() => {
    const t = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  // --- HANDLERS ---
  const handleRefresh = () => {
      fetchData(); 
  };

  const handleSelect = (item: RoadmapItemResponse) => {
      const itemType = item.type?.toUpperCase();
      if (itemType === 'EPIC') {
          const realId = (item as any).originalId || Number(String(item.id).replace(/\D/g, ''));
          if (realId && !isNaN(realId)) {
              setSelectedEpicId(realId);
          }
      }
  };

  // Xử lý kéo thả / resize thanh Bar
  const handleDateChange = async (task: Task) => {
      const epicId = Number(String(task.id).replace(/\D/g, ''));
      if (!epicId || isNaN(epicId)) return;

      const newStartDate = task.start.toISOString();
      const newEndDate = task.end.toISOString();

      try {
          await apiEpic.updateEpic(projectId, epicId, {
              startDate: newStartDate,
              dueDate: newEndDate
          } as any);
          
          showToast("Updated timeline successfully", "success");

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

      } catch (error) {
          console.error("Failed to update date", error);
          showToast("Failed to update date", "error");
          fetchData(); 
      }
  };

  if (!projectId) return null;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
       
       {/* 1. MAIN CONTENT WRAPPER */}
       {/* 🔴 ĐÃ XÓA: pointer-events-none, blur. Giờ bạn có thể tương tác thoải mái */}
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
          <div className="fixed inset-y-0 right-0 z-[9999] pointer-events-auto">
              {/* Thêm bóng đổ để tách biệt với nội dung chính */}
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