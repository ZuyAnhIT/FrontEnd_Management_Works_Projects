"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Map, Loader2 } from "lucide-react";

// API Services
import { 
  getProjectRoadmap, 
  RoadmapItemResponse, 
  RoadmapParams 
} from "@/services/apiStatistics";

// Components
import TimelineToolbar from "@/components/features/core/timeline/TimelineToolbar";
import TimelineGantt from "@/components/features/core/timeline/TimelineGantt";

export default function TimelinePage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  // --- STATE ---
  const [data, setData] = useState<RoadmapItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
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
         console.error("Failed to load roadmap", error);
      } finally {
         setLoading(false);
      }
  }, [projectId, filters]);

  // Auto reload khi Filter thay đổi (Debounce 300ms)
  useEffect(() => {
    const t = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  // --- HANDLERS ---
  
  // Hàm refresh để truyền xuống component con (khi tạo Epic mới xong thì gọi)
  const handleRefresh = () => {
      fetchData(); 
  };

  // --- RENDER ---

  if (!projectId) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 font-sans text-slate-900">
       {/* Container rộng hơn để hiển thị Gantt Chart thoải mái */}
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

          {/* TOOLBAR (FILTER & SEARCH) */}
          <TimelineToolbar 
              projectId={projectId} 
              filters={filters}
              setFilters={setFilters}
          />

          {/* GANTT CHART MAIN CONTENT */}
          {/* ✅ Truyền đủ props để hỗ trợ tạo Epic nhanh */}
          <TimelineGantt 
              data={data} 
              loading={loading} 
              projectId={projectId}     // Để gọi API tạo Epic
              onRefresh={handleRefresh} // Để reload lại sau khi tạo
          />

       </div>
    </div>
  );
}