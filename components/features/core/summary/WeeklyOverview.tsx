"use client";

import { useEffect, useState } from "react";
import { 
    getWeeklyOverview, 
    WeeklyOverviewData, 
    StatsTask, 
    OverviewParams
} from "@/services/apiStatistics";
import { 
    getProjectMembers, 
    ProjectMember 
} from "@/services/apiProject"; 
import { 
    Loader2, PlusCircle, CheckCircle2, RefreshCw, AlertTriangle, CalendarDays 
} from "lucide-react";

// Components
import WeeklyStatCard from "./WeeklyStatCard";
import StatsTaskItem from "./StatsTaskItem";
import OverviewFilterToolbar from "./OverviewFilterToolbar"; 

// =============================================================================
// 1. CONSTANTS & INTERFACES
// =============================================================================

type ActiveTab = "created" | "completed" | "updated" | "due";

// Default filter state (Last 7 days)
const getDefaultFilters = (): OverviewParams => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return {
        from: start.toISOString().split('T')[0],
        to: end.toISOString().split('T')[0],
    };
};

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function WeeklyOverview({ projectId }: { projectId: number }) {
    // --- STATE ---
    const [data, setData] = useState<WeeklyOverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    
    // State cho Tab hiển thị bên dưới
    const [activeTab, setActiveTab] = useState<ActiveTab>("updated");

    // State Filters (Mặc định: 7 ngày qua)
    const [filters, setFilters] = useState<OverviewParams>(getDefaultFilters);

    // 1. Load Members (Chỉ 1 lần)
    useEffect(() => {
        if (projectId) {
            // LƯU Ý: API getProjectMembers thường yêu cầu companyId/workspaceId. 
            // Nếu bạn đã sửa API, code này sẽ hoạt động. Nếu chưa, cần truyền thêm IDs từ page cha.
            // Tạm thời gọi API với giả định logic bên trong đã được handle.
            getProjectMembers(0, 0, projectId, { size: 100 })
                .then(res => setMembers(res.content))
                .catch(err => console.warn("Members load failed", err)); 
        }
    }, [projectId]);

    // 2. Load Overview Data (Khi filters đổi)
    useEffect(() => {
        if (!projectId) return;

        const fetch = async () => {
            setLoading(true);
            try {
                const res = await getWeeklyOverview(projectId, filters);
                setData(res);
                
                // Logic auto-switch tab (Giữ nguyên logic gốc)
                if (activeTab === "due" && res.dueSoonCount === 0 && res.updatedCount > 0) {
                    setActiveTab("updated");
                }
            } catch (error) {
                console.error("Failed to fetch weekly overview:", error);
                setData(null); // Reset data on error
            } finally {
                setLoading(false);
            }
        };

        // Debounce: Giảm tần suất gọi API khi filter thay đổi liên tục
        const t = setTimeout(() => fetch(), 300);
        return () => clearTimeout(t);
    }, [projectId, filters, activeTab]);

    // --- Logic Render ---
    
    // Format Date Range cho UI
    const displayDateRange = filters.from && filters.to 
        ? `${new Date(filters.from).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})} - ${new Date(filters.to).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}`
        : "Custom Range";

    // Xác định danh sách task và tiêu đề hiện tại
    let currentTasks: StatsTask[] = [];
    let currentTitle = "";
    
    if (data) {
        switch (activeTab) {
            case "created": 
                currentTasks = data.createdTasks; 
                currentTitle = "Created Tasks";
                break;
            case "completed": 
                currentTasks = data.completedTasks; 
                currentTitle = "Completed Tasks";
                break;
            case "updated": 
                currentTasks = data.updatedTasks; 
                currentTitle = "Updated Tasks";
                break;
            case "due": 
                currentTasks = data.dueSoonTasks; 
                currentTitle = "Tasks Due Soon";
                break;
        }
    }

    // --- RENDER UI ---
    return (
        <div className="space-y-6">
            
            {/* 1. Filter Toolbar */}
            <OverviewFilterToolbar 
                filters={filters}
                setFilters={setFilters}
                members={members}
            />

            {/* Header nhỏ */}
            <div className="flex items-center gap-2 text-slate-500 text-sm">
                <CalendarDays className="w-4 h-4" />
                <span className="font-medium">Data period: <span className="text-slate-800">{displayDateRange}</span></span>
            </div>

            {loading && !data ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-50"/></div>
            ) : data ? (
                <>
                    {/* 2. Cards Row */}
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

                    {/* 3. Detail List */}
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
                                    <p className="text-sm">No tasks found for this filter.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                // Trường hợp không có dữ liệu sau khi loading xong
                <div className="py-20 flex justify-center">
                    <p className="text-slate-500">No data available for this period and filter.</p>
                </div>
            )}
        </div>
    );
}