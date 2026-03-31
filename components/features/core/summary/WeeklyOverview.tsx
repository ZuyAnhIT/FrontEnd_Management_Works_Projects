"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { 
    Loader2, PlusCircle, CheckCircle2, RefreshCw, AlertTriangle, CalendarDays 
} from "lucide-react";

// Internal Services & Types
import { 
    getWeeklyOverview, 
    WeeklyOverviewData, 
    StatsTask, 
    OverviewParams 
} from "@/services/apiStatistics";
import { getProjectMembers, ProjectMember } from "@/services/apiProject"; 

// Internal Components & Utils
import WeeklyStatCard from "./WeeklyStatCard";
import StatsTaskItem from "./StatsTaskItem";
import OverviewFilterToolbar from "./OverviewFilterToolbar"; 
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & INTERFACES
// =============================================================================

type ActiveTab = "created" | "completed" | "updated" | "due";

/**
 * Khởi tạo bộ lọc mặc định: Lấy dữ liệu trong vòng 7 ngày qua.
 */
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
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần Thống kê Tuần (Weekly Overview).
 * Hiển thị các chỉ số biến động công việc và danh sách chi tiết theo từng loại sự kiện.
 */
export default function WeeklyOverview({ projectId }: { projectId: number }) {
    
    // ---------------------------------------------------------------------------
    // 4. STATE & HOOKS
    // ---------------------------------------------------------------------------
    
    const [data, setData] = useState<WeeklyOverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [activeTab, setActiveTab] = useState<ActiveTab>("updated");
    const [filters, setFilters] = useState<OverviewParams>(getDefaultFilters);

    // ---------------------------------------------------------------------------
    // 5. EFFECTS: DATA FETCHING
    // ---------------------------------------------------------------------------

    /**
     * Tải danh sách thành viên dự án để phục vụ bộ lọc.
     */
    useEffect(() => {
        if (!projectId) return;
        
        // Lưu ý: WorkspaceId và CompanyId được giả định là 0 nếu API đã được fix 
        // để chỉ nhận ProjectId. Nếu chưa, hãy truyền từ Page cha vào.
        getProjectMembers(0, 0, projectId, { size: 100 })
            .then(res => setMembers(res.content))
            .catch(err => console.warn("Failed to load project members for filters", err));
    }, [projectId]);

    /**
     * Tải dữ liệu tổng quan khi bộ lọc thay đổi (Có Debounce 300ms).
     */
    useEffect(() => {
        if (!projectId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await getWeeklyOverview(projectId, filters);
                setData(res);
                
                // Tự động chuyển tab nếu tab "Due Soon" hiện tại không có dữ liệu
                if (activeTab === "due" && res.dueSoonCount === 0 && res.updatedCount > 0) {
                    setActiveTab("updated");
                }
            } catch (error) {
                console.error("Critical error fetching weekly overview:", error);
                setData(null);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchData, 300);
        return () => clearTimeout(timer);
    }, [projectId, filters, activeTab]);

    // ---------------------------------------------------------------------------
    // 6. MEMOIZED DATA
    // ---------------------------------------------------------------------------

    /**
     * Xác định danh sách Task cần hiển thị dựa trên Tab đang chọn.
     */
    const { currentTasks, currentTitle } = useMemo(() => {
        if (!data) return { currentTasks: [], currentTitle: "" };

        const mapping: Record<ActiveTab, { list: StatsTask[], title: string }> = {
            created: { list: data.createdTasks, title: "Recently Created" },
            completed: { list: data.completedTasks, title: "Recently Completed" },
            updated: { list: data.updatedTasks, title: "Recently Updated" },
            due: { list: data.dueSoonTasks, title: "Due Soon" }
        };

        return {
            currentTasks: mapping[activeTab].list,
            currentTitle: mapping[activeTab].title
        };
    }, [data, activeTab]);

    const dateRangeLabel = useMemo(() => {
        if (!filters.from || !filters.to) return "Custom Range";
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return `${new Date(filters.from).toLocaleDateString('en-GB', options)} - ${new Date(filters.to).toLocaleDateString('en-GB', options)}`;
    }, [filters]);

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <div className="space-y-6">
            
            {/* THANH CÔNG CỤ LỌC (Toolbar) */}
            <OverviewFilterToolbar 
                filters={filters}
                setFilters={setFilters}
                members={members}
            />

            {/* CHỈ BÁO KHOẢNG THỜI GIAN (Period Indicator) */}
            <div className="flex items-center gap-2.5 px-1 text-slate-500">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                    Reporting Period: <span className="text-[#0052CC]">{dateRangeLabel}</span>
                </span>
            </div>

            {isLoading && !data ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#0052CC] opacity-60" />
                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Aggregating project data...</span>
                </div>
            ) : data ? (
                <>
                    {/* DÃY THẺ CHỈ SỐ (Stat Cards Grid) */}
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

                    {/* DANH SÁCH CHI TIẾT THEO TAB (Detail Section) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400 transition-all">
                        
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    {currentTitle}
                                </h3>
                            </div>
                            <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-600 shadow-sm">
                                {currentTasks.length} Issues Found
                            </span>
                        </div>
                        
                        <div className="p-5 bg-white min-h-[250px]">
                            {currentTasks.length > 0 ? (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {currentTasks.map((task) => (
                                        <StatsTaskItem key={task.id} task={task} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400 opacity-60">
                                    <AlertTriangle className="w-10 h-10 mb-3 stroke-[1.5]" />
                                    <p className="text-[12px] font-bold uppercase tracking-widest">No issues to display for this category</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                    <p className="text-[12px] font-bold uppercase tracking-widest">Unable to retrieve data for the selected criteria</p>
                </div>
            )}
        </div>
    );
}