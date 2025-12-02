"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProjectRoadmap, RoadmapItemResponse, RoadmapParams } from "@/services/apiStatistics";
import { Map } from "lucide-react";

import TimelineToolbar from "@/components/features/core/timeline/TimelineToolbar";
import TimelineGantt from "@/components/features/core/timeline/TimelineGantt";

export default function TimelinePage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  const [data, setData] = useState<RoadmapItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RoadmapParams>({
      viewType: "ALL"
  });

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
         const res = await getProjectRoadmap(projectId, filters);
         setData(res);
      } catch (error) {
         console.error("Failed to load roadmap", error);
      } finally {
         setLoading(false);
      }
    };

    const t = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(t);
  }, [projectId, filters]);

  if (!projectId) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 font-sans text-slate-900">
       <div className="max-w-[1800px] mx-auto space-y-6 pb-20"> {/* Tăng độ rộng max-w */}
          
          {/* Header */}
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Map className="w-6 h-6 text-blue-600" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Timeline & Roadmap</h1>
                <p className="text-sm text-slate-500">Visualize project schedule across Epics and Sprints.</p>
             </div>
          </div>

          <TimelineToolbar 
              projectId={projectId} // ✅ Truyền ID vào để load options
              filters={filters}
              setFilters={setFilters}
          />

          <TimelineGantt data={data} loading={loading} />

       </div>
    </div>
  );
}