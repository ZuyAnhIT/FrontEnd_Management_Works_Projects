"use client";

import { useEffect, useState } from "react";
import { 
  getWeeklyOverview, 
  WeeklyOverviewData, 
  StatsTask 
} from "@/services/apiStatistics";
import { 
  Loader2, 
  PlusCircle, 
  CheckCircle2, 
  RefreshCw, 
  AlertTriangle,
  CalendarDays
} from "lucide-react";

// Components
import WeeklyStatCard from "./WeeklyStatCard";
import StatsTaskItem from "./StatsTaskItem";

export default function WeeklyOverview({ projectId }: { projectId: number }) {
  const [data, setData] = useState<WeeklyOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State để biết đang xem danh sách nào (mặc định xem Updated)
  const [activeTab, setActiveTab] = useState<"created" | "completed" | "updated" | "due">("updated");

  useEffect(() => {
    if (!projectId) return;
    const fetch = async () => {
        setLoading(true);
        try {
            const res = await getWeeklyOverview(projectId);
            setData(res);
            
            // Tự động chọn tab có dữ liệu nhiều nhất hoặc mặc định Updated
            if (res.dueSoonCount > 0) setActiveTab("due");
            else if (res.updatedCount > 0) setActiveTab("updated");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetch();
  }, [projectId]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;
  if (!data) return null;

  // Xác định danh sách task cần hiển thị dựa trên Tab
  let currentTasks: StatsTask[] = [];
  let currentTitle = "";
  
  switch (activeTab) {
      case "created": 
        currentTasks = data.createdTasks; 
        currentTitle = "Tasks Created this week";
        break;
      case "completed": 
        currentTasks = data.completedTasks; 
        currentTitle = "Tasks Completed this week";
        break;
      case "updated": 
        currentTasks = data.updatedTasks; 
        currentTitle = "Recently Updated Tasks";
        break;
      case "due": 
        currentTasks = data.dueSoonTasks; 
        currentTitle = "Tasks Due Soon";
        break;
  }

  const dateRange = data.fromDate && data.toDate 
    ? `${new Date(data.fromDate).toLocaleDateString()} - ${new Date(data.toDate).toLocaleDateString()}`
    : "Last 7 Days";

  return (
    <div className="space-y-6">
       
       {/* Header nhỏ của section */}
       <div className="flex items-center gap-2 text-slate-500 text-sm">
          <CalendarDays className="w-4 h-4" />
          <span className="font-medium">Overview Period: {dateRange}</span>
       </div>

       {/* 1. CARDS ROW */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <WeeklyStatCard 
             title="Created" 
             count={data.createdCount} 
             icon={PlusCircle} 
             color="blue" 
             isActive={activeTab === "created"}
             onClick={() => setActiveTab("created")}
          />
          <WeeklyStatCard 
             title="Completed" 
             count={data.completedCount} 
             icon={CheckCircle2} 
             color="green" 
             isActive={activeTab === "completed"}
             onClick={() => setActiveTab("completed")}
          />
          <WeeklyStatCard 
             title="Updated" 
             count={data.updatedCount} 
             icon={RefreshCw} 
             color="orange" 
             isActive={activeTab === "updated"}
             onClick={() => setActiveTab("updated")}
          />
          <WeeklyStatCard 
             title="Due Soon" 
             count={data.dueSoonCount} 
             icon={AlertTriangle} 
             color="red" 
             isActive={activeTab === "due"}
             onClick={() => setActiveTab("due")}
          />
       </div>

       {/* 2. DETAIL LIST (Hiển thị dựa trên Card đang chọn) */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{currentTitle}</h3>
              <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border">{currentTasks.length} tasks</span>
          </div>
          
          <div className="p-4 bg-slate-50/30 min-h-[200px]">
             {currentTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentTasks.map((task) => (
                        <StatsTaskItem key={task.id} task={task} />
                    ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <p className="text-sm">No tasks in this category.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}