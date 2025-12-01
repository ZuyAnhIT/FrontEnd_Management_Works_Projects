"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  LayoutDashboard, 
  PieChart, 
  ArrowUpRight,
  BarChart3 
} from "lucide-react";

// API & Types
import { 
  getStatusDistribution, 
  getPriorityDistribution,
  getTypeDistribution,
  getEpicProgress, // ✅ Import API Epic
  DistributionStat,
  EpicProgressStat, // ✅ Import Types Epic
  EpicProgressParams
} from "@/services/apiStatistics";

// Components
import WeeklyOverview from "@/components/features/core/summary/WeeklyOverview";
import StatusChart from "@/components/features/core/summary/StatusChart";
import PriorityChart from "@/components/features/core/summary/PriorityChart";
import TypeChart from "@/components/features/core/summary/TypeChart";
import EpicProgressCard from "@/components/features/core/summary/EpicProgressCard"; // ✅ Component Epic List
import EpicFilterToolbar from "@/components/features/core/summary/EpicFilterToolbar"; // ✅ Component Filter

export default function ProjectSummaryPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  // --- STATE CHARTS ---
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<DistributionStat[]>([]);
  const [priorityData, setPriorityData] = useState<DistributionStat[]>([]);
  const [typeData, setTypeData] = useState<DistributionStat[]>([]);

  // --- STATE EPIC ---
  const [epicData, setEpicData] = useState<EpicProgressStat[]>([]);
  const [epicLoading, setEpicLoading] = useState(true);
  const [epicFilters, setEpicFilters] = useState<EpicProgressParams>({});

  // --- 1. FETCH CHARTS DATA (Initial Load) ---
  useEffect(() => {
    if (!projectId) return;

    const fetchCharts = async () => {
      setLoading(true);
      try {
         // Gọi song song 3 API biểu đồ
         const [resStatus, resPriority, resType] = await Promise.all([
             getStatusDistribution(projectId),
             getPriorityDistribution(projectId),
             getTypeDistribution(projectId)
         ]);

         setStatusData(resStatus);
         setPriorityData(resPriority);
         setTypeData(resType);
         
      } catch (error) {
         console.error("Failed to load charts", error);
      } finally {
         setLoading(false);
      }
    };

    fetchCharts();
  }, [projectId]);

  // --- 2. FETCH EPIC DATA (Triggered by Filters) ---
  useEffect(() => {
     if (!projectId) return;
     
     const fetchEpics = async () => {
        setEpicLoading(true);
        try {
           const data = await getEpicProgress(projectId, epicFilters);
           setEpicData(data);
        } catch (error) {
           console.error("Failed to load epics", error);
        } finally {
           setEpicLoading(false);
        }
     };

     // Debounce nhẹ để tránh spam API khi user đổi filter nhanh
     const t = setTimeout(() => fetchEpics(), 300);
     return () => clearTimeout(t);
  }, [projectId, epicFilters]);

  if (!projectId) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 font-sans text-slate-900">
       <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* HEADER */}
          <div className="flex items-center justify-between">
             <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                   <LayoutDashboard className="w-6 h-6 text-blue-600" />
                   Project Summary
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                   Real-time overview of project performance and health.
                </p>
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm">
                <ArrowUpRight className="w-4 h-4" /> Export Report
             </button>
          </div>

          {/* SECTION 1: WEEKLY OVERVIEW */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <WeeklyOverview projectId={projectId} />
          </section>

          <hr className="border-slate-200" />

          {/* SECTION 2: CHARTS */}
          <section>
             <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800">Analytics & Distribution</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatusChart data={statusData} loading={loading} />
                <PriorityChart data={priorityData} loading={loading} />
                <TypeChart data={typeData} loading={loading} />
             </div>
          </section>

          <hr className="border-slate-200" />

          {/* SECTION 3: EPIC PROGRESS & ROADMAP */}
          <section>
             <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800">Epic Progress & Roadmap</h2>
             </div>

             {/* Filter Toolbar */}
             <EpicFilterToolbar 
                projectId={projectId}
                filters={epicFilters}
                setFilters={setEpicFilters}
             />

            <div className="w-full">
                 <EpicProgressCard data={epicData} loading={epicLoading} />
             </div>
             
          </section>

       </div>
    </div>
  );
}