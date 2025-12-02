"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

// API & Types
import { 
  getProjectWorkload, 
  WorkloadStat, 
  WorkloadParams 
} from "@/services/apiStatistics";

// Sub-Components
import WorkloadChart from "./WorkloadChart";
import WorkloadFilterToolbar from "./WorkloadFilterToolbar";
import WorkloadKPI from "./WorkloadKPI";

interface WorkloadOverviewProps {
  projectId: number;
}

export default function WorkloadOverview({ projectId }: WorkloadOverviewProps) {
  // --- STATE ---
  const [data, setData] = useState<WorkloadStat[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State (Mặc định xem theo Points và nhóm theo Status)
  const [filters, setFilters] = useState<WorkloadParams>({
      viewType: "POINTS",
      groupBy: "STATUS",
      sprintId: undefined, // Mặc định lấy tất cả hoặc sprint active tùy logic backend
  });

  // --- FETCH DATA ---
  useEffect(() => {
     if (!projectId) return;

     const fetchWorkload = async () => {
        setLoading(true);
        try {
           const res = await getProjectWorkload(projectId, filters);
           setData(res);
        } catch (error) {
           console.error("Failed to load workload data", error);
        } finally {
           setLoading(false);
        }
     };

     // Debounce 300ms để tránh spam API khi user đổi filter liên tục
     const t = setTimeout(() => fetchWorkload(), 300);
     return () => clearTimeout(t);
  }, [projectId, filters]);

  return (
    <div className="space-y-6">
        
        {/* 1. FILTER TOOLBAR */}
        {/* Đặt lên đầu để người dùng điều chỉnh view trước */}
        <WorkloadFilterToolbar 
            projectId={projectId}
            filters={filters}
            setFilters={setFilters}
        />

        {/* LOADING STATE (Initial load) */}
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
                {/* Hiển thị các chỉ số quan trọng thay vì cảnh báo đỏ */}
                <WorkloadKPI 
                    data={data} 
                    unit={filters.viewType || "POINTS"} 
                />

                {/* 3. MAIN STACKED BAR CHART */}
                <WorkloadChart 
                    data={data} 
                    loading={loading} // Truyền loading để chart hiện overlay mờ nếu đang refetch
                    unit={filters.viewType || "POINTS"}
                />
            </div>
        )}
    </div>
  );
}