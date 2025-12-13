"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider"; // Import Toast nếu chưa có

// API & Types
import { 
  getProjectWorkload, 
  exportWorkloadReport, // ✅ Import hàm export mới
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
  const { showToast } = useToast(); // Sử dụng toast để thông báo
  
  // --- STATE ---
  const [data, setData] = useState<WorkloadStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false); // ✅ State loading cho export
  
  // Filter State
  const [filters, setFilters] = useState<WorkloadParams>({
      viewType: "POINTS",
      groupBy: "STATUS",
      sprintId: undefined,
  });

  // --- FETCH DATA (CHART) ---
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

     const t = setTimeout(() => fetchWorkload(), 300);
     return () => clearTimeout(t);
  }, [projectId, filters]);

  // --- ✅ HANDLE EXPORT LOGIC ---
  const handleExport = async () => {
    if (!projectId) return;
    
    setIsExporting(true);
    try {
        // 1. Gọi API nhận Blob
        const blobData = await exportWorkloadReport(projectId, filters);
        
        // 2. Tạo URL an toàn từ Blob
        const url = window.URL.createObjectURL(new Blob([blobData]));
        
        // 3. Tạo thẻ <a> ảo để kích hoạt tải xuống
        const link = document.createElement('a');
        link.href = url;
        
        // Tạo tên file có ý nghĩa: workload_projectID_timestamp.xlsx
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `Workload_Report_P${projectId}_${timestamp}.xlsx`);
        
        // 4. Append vào body, click, và dọn dẹp
        document.body.appendChild(link);
        link.click();
        
        // Cleanup: Xóa thẻ a và revoke URL để tránh memory leak
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast("Export successfully downloaded!", "success");

    } catch (error) {
        console.error("Export failed", error);
        showToast("Failed to export Excel file", "error");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
        
        {/* 1. FILTER TOOLBAR */}
        <WorkloadFilterToolbar 
            projectId={projectId}
            filters={filters}
            setFilters={setFilters}
            onExport={handleExport} // ✅ Truyền handler
            isExporting={isExporting} // ✅ Truyền trạng thái loading
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
                <WorkloadKPI 
                    data={data} 
                    unit={filters.viewType || "POINTS"} 
                />

                {/* 3. MAIN STACKED BAR CHART */}
                <WorkloadChart 
                    data={data} 
                    loading={loading}
                    unit={filters.viewType || "POINTS"}
                />
            </div>
        )}
    </div>
  );
}