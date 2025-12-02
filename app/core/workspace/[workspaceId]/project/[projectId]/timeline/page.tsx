"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Map } from "lucide-react";

// API Services
import { 
  getProjectRoadmap, 
  RoadmapItemResponse, 
  RoadmapParams 
} from "@/services/apiStatistics";

// Components
import TimelineToolbar from "@/components/features/core/timeline/TimelineToolbar";
import TimelineGantt from "@/components/features/core/timeline/TimelineGantt";
// Import Panel chi tiết Epic
import EpicDetailPanel from "@/components/features/core/epic/EpicDetailPanel";

export default function TimelinePage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  // --- STATE ---
  const [data, setData] = useState<RoadmapItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Epic đang được chọn
  const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null);

  const [filters, setFilters] = useState<RoadmapParams>({
      viewType: "ALL"
  });

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
      if (!projectId) return;
      setLoading(true);
      try {
         const res = await getProjectRoadmap(projectId, filters);
         setData(res);
      } catch (error) {
         // Silent error or user notification only
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
      // 1. Kiểm tra Type
      const itemType = item.type?.toUpperCase();

      if (itemType === 'EPIC') {
          // 2. Xử lý ID: Ưu tiên originalId từ backend, nếu không có thì parse từ chuỗi id
          // (item as any) dùng để bypass nếu type chưa cập nhật kịp
          const realId = (item as any).originalId || Number(String(item.id).replace(/\D/g, ''));
          
          if (realId && !isNaN(realId)) {
              setSelectedEpicId(realId);
          }
      }
  };

  if (!projectId) return null;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
       
       {/* 1. MAIN CONTENT WRAPPER 
          - Thêm hiệu ứng transition để mượt mà
          - Khi có selectedEpicId -> thêm opacity, blur và chặn click (pointer-events-none)
       */}
       <div 
         className={`
            p-6 sm:p-8 font-sans text-slate-900 min-h-screen
            transition-all duration-300 ease-in-out
            ${selectedEpicId ? 'opacity-30 blur-[2px] pointer-events-none select-none grayscale-[0.5]' : ''}
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
              />
           </div>
       </div>

       {/* 2. EPIC DETAIL PANEL 
          - Nằm ngoài wrapper chính để không bị mờ theo
          - Z-index cao để đè lên trên
       */}
       {selectedEpicId && (
          <div className="fixed inset-0 z-[9999]">
              <EpicDetailPanel 
                  projectId={projectId}
                  epicId={selectedEpicId}
                  onClose={() => setSelectedEpicId(null)}
                  onUpdate={handleRefresh}
              />
          </div>
       )}
    </div>
  );
}