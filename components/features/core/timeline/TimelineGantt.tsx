"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { 
    Loader2, Layers, Rocket, LayoutList, 
    Calendar, Clock, CheckCircle2, Activity 
} from "lucide-react";

// Internal Components & Types
import QuickEpicCreate from "./QuickEpicCreate";
import { RoadmapItemResponse } from "@/services/apiStatistics";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface TimelineGanttProps {
    data: RoadmapItemResponse[];
    loading: boolean;
    projectId: number;
    onRefresh: () => void;
    onSelect?: (item: RoadmapItemResponse) => void;
    selectedEpicId: number | null;
    onDateChange: (task: Task) => void;
}

// =============================================================================
// 3. CUSTOM RENDER COMPONENTS (Cho thư viện Gantt)
// =============================================================================

/**
 * Custom Tooltip hiển thị khi hover vào thanh bar trên Gantt Chart.
 * Cung cấp thông tin chi tiết về Task/Epic bao gồm tiến độ và ngày tháng.
 */
const CustomTooltip = ({ task, data }: { task: Task, data: RoadmapItemResponse[] }) => {
    // Truy xuất thông tin metadata gốc từ mảng data
    const item = data.find(d => String(d.id) === task.id);
    if (!item) return null;
    
    const isEpic = item.type === 'EPIC';
    
    // Format ngày tháng an toàn (en-GB: DD/MM/YYYY)
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        // Đẩy tooltip xuống (pt-12) và sang trái để tránh che khuất con trỏ chuột
        <div className="pt-12 pointer-events-none transform -translate-x-1/4"> 
            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl border border-slate-200 w-[300px] overflow-hidden z-50">
                
                {/* Header Tooltip */}
                <div className={cn(
                    "px-4 py-3 border-b flex items-start gap-3",
                    isEpic ? "bg-[#EAE6FF] border-[#DFD8FD]" : "bg-[#E3F2FD] border-[#DEEBFF]"
                )}>
                    <div className={cn(
                        "mt-0.5 p-1.5 bg-white rounded-md shadow-sm border shrink-0",
                        isEpic ? "border-[#DFD8FD]" : "border-[#DEEBFF]"
                    )}>
                        {isEpic ? <Layers className="w-4 h-4 text-[#403294]" /> : <Rocket className="w-4 h-4 text-[#0052CC]" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest mb-0.5 opacity-80",
                            isEpic ? "text-[#403294]" : "text-[#0052CC]"
                        )}>
                            {item.type}
                        </p>
                        <p className="text-[13px] font-bold text-[#172B4D] truncate leading-tight">
                            {item.title}
                        </p>
                    </div>
                </div>

                {/* Body Tooltip */}
                <div className="p-4 space-y-5">
                    {/* Live Date Range (Cập nhật real-time khi user kéo thả) */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                <Calendar className="w-3.5 h-3.5" /> <span>Start</span>
                            </div>
                            <p className="font-bold text-[#172B4D] bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100 text-center transition-all shadow-sm">
                                {formatDate(task.start)}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                <Clock className="w-3.5 h-3.5" /> <span>End</span>
                            </div>
                            <p className="font-bold text-[#172B4D] bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100 text-center transition-all shadow-sm">
                                {formatDate(task.end)}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                            <span className="text-slate-500 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 stroke-[2.5]" /> Progress
                            </span>
                            <span className={isEpic ? "text-[#403294]" : "text-[#0052CC]"}>
                                {item.progress}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className={cn("h-full rounded-full transition-all duration-300", isEpic ? "bg-[#6554C0]" : "bg-[#2684FF]")} 
                                style={{ width: `${item.progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Footer Metrics */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className={cn("w-2.5 h-2.5 rounded-full shadow-sm", item.progress === 100 ? "bg-[#36B37E]" : "bg-[#FF991F]")} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                                {item.progress === 100 ? 'Completed' : 'In Progress'}
                            </span>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5 bg-[#091E420A] px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                            {item.completedTasks} / {item.totalTasks}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Header tùy chỉnh cho danh sách bên trái (Task List)
 */
const TaskListHeader = ({ headerHeight }: { headerHeight: number }) => {
    return (
        <div 
            className="flex items-center pl-5 font-black text-[11px] text-slate-500 uppercase tracking-widest bg-slate-50 border-r border-b border-slate-200 h-full shadow-sm"
            style={{ height: headerHeight }}
        >
            Work Item
        </div>
    );
};

/**
 * Bảng danh sách công việc tùy chỉnh (hiển thị bên trái biểu đồ Gantt)
 */
const TaskListTable = ({ 
    rowHeight, tasks, fontFamily, fontSize, selectedEpicId, handleTaskClick, projectId, onRefresh 
}: any) => {
    return (
        <div className="border-r border-slate-200 bg-white font-sans flex flex-col h-full">
            {tasks.map((t: any) => {
                const isSelected = String(selectedEpicId) === t.id;
                
                // Bỏ qua item placeholder (dùng để giữ chỗ khi trống)
                if (t.project === 'HIDDEN') return null; 

                return (
                    <div 
                        key={t.id} 
                        className={cn(
                            "flex items-center pl-5 border-b border-slate-100 transition-colors truncate shrink-0 cursor-pointer border-l-4",
                            isSelected 
                                ? "bg-[#EAE6FF] border-l-[#6554C0]" 
                                : "hover:bg-slate-50 border-l-transparent"
                        )}
                        style={{ height: rowHeight, fontFamily, fontSize }}
                        title={t.name}
                        onClick={() => handleTaskClick(t)}
                    >
                        <span className="mr-3 opacity-80 shrink-0">
                            {t.project === 'EPIC' ? <Layers className="w-4 h-4 text-[#403294]" /> : <Rocket className="w-4 h-4 text-[#0052CC]" />}
                        </span>
                        <span className={cn(
                            "text-[13px] truncate", 
                            isSelected ? "text-[#403294] font-black" : "text-[#172B4D] font-semibold"
                        )}>
                            {t.name}
                        </span>
                    </div>
                );
            })}
            
            {/* Vùng tạo Epic nhanh (Quick Create) nằm dưới cùng danh sách */}
            <div 
                className="border-b border-slate-100 shrink-0 bg-slate-50/50"
                style={{ height: rowHeight }}
            >
                <QuickEpicCreate 
                    projectId={projectId}
                    onSuccess={onRefresh}
                />
            </div>
            
            {/* Khoảng trống để biểu đồ mở rộng */}
            <div className="flex-1 bg-[#F4F5F7]"></div> 
        </div>
    );
};

// =============================================================================
// 4. MAIN COMPONENT EXPORT
// =============================================================================

/**
 * Thành phần Biểu đồ Gantt (Roadmap Timeline).
 * Trực quan hóa tiến độ dự án, cho phép kéo thả để thay đổi thời gian.
 */
export default function TimelineGantt({ 
    data, 
    loading, 
    projectId, 
    onRefresh,
    onSelect,
    selectedEpicId,
    onDateChange
}: TimelineGanttProps) {
    
    // ---------------------------------------------------------------------------
    // 5. STATE
    // ---------------------------------------------------------------------------
    
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
    const [isListVisible, setIsListVisible] = useState(true); 

    // ---------------------------------------------------------------------------
    // 6. DATA PREPARATION
    // ---------------------------------------------------------------------------
    
    // Chuyển đổi dữ liệu API sang chuẩn format của thư viện Gantt
    const tasks: Task[] = data.map((item) => {
        const isEpic = item.type === "EPIC";
        const isSelected = String(item.id) === String(selectedEpicId);

        return {
            start: new Date(item.startDate),
            end: new Date(item.endDate),
            name: item.title,
            id: String(item.id), 
            type: "task",
            progress: item.progress,
            // Logic: Chỉ cho phép kéo thả thay đổi thời gian đối với Epic
            isDisabled: !isEpic, 
            styles: {
                progressColor: isEpic ? "#6554C0" : "#2684FF",
                progressSelectedColor: isEpic ? "#403294" : "#0052CC",
                backgroundColor: isEpic ? "#EAE6FF" : "#E3F2FD",
                backgroundSelectedColor: isEpic ? "#EAE6FF" : "#E3F2FD",
                barProgressColor: isSelected ? "#403294" : undefined,
            },
            project: item.type, // Custom field để UI phân biệt Epic/Task
        };
    });

    // ---------------------------------------------------------------------------
    // 7. HANDLERS
    // ---------------------------------------------------------------------------

    const handleTaskClick = (task: Task) => {
        if (onSelect) {
            const originalItem = data.find((d) => String(d.id) === task.id);
            if (originalItem) {
                onSelect(originalItem);
            }
        }
    };

    // ---------------------------------------------------------------------------
    // 8. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (loading) {
        return (
            <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#0052CC] opacity-80" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Rendering Timeline...</span>
            </div>
        );
    }

    // Xử lý Empty State (Gantt library requires at least 1 task to render properly)
    const displayTasks: Task[] = tasks.length > 0 ? tasks : [
        {
            start: new Date(),
            end: new Date(new Date().setDate(new Date().getDate() + 1)),
            name: "No items to display. Create an Epic below.",
            id: "hidden-placeholder",
            type: "task",
            progress: 0,
            isDisabled: true,
            hideChildren: true,
            project: "HIDDEN",
            styles: { backgroundColor: "transparent", progressColor: "transparent", backgroundSelectedColor: "transparent" },
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden transition-all">
            
            {/* --- GANTT TOOLBAR --- */}
            <div className="px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 shrink-0 gap-3">
                <div className="flex items-center gap-4">
                    <h3 className="text-[12px] font-black text-[#172B4D] uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" /> Timeline
                    </h3>
                    <button 
                        onClick={() => setIsListVisible(!isListVisible)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm",
                            isListVisible ? "bg-blue-50 text-[#0052CC]" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        )}
                        title={isListVisible ? "Hide sidebar" : "Show sidebar"}
                    >
                        <LayoutList className="w-3.5 h-3.5" />
                        {isListVisible ? "Hide List" : "Show List"}
                    </button>
                </div>
                
                {/* View Mode Switcher */}
                <div className="bg-white border border-slate-200 p-1 rounded-lg inline-flex shadow-sm">
                    <button 
                        onClick={() => setViewMode(ViewMode.Day)} 
                        className={cn("px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-colors", viewMode === ViewMode.Day ? "bg-blue-50 text-[#0052CC]" : "text-slate-500 hover:bg-slate-50")}
                    >
                        Day
                    </button>
                    <div className="w-px bg-slate-100 my-1 mx-1" />
                    <button 
                        onClick={() => setViewMode(ViewMode.Week)} 
                        className={cn("px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-colors", viewMode === ViewMode.Week ? "bg-blue-50 text-[#0052CC]" : "text-slate-500 hover:bg-slate-50")}
                    >
                        Week
                    </button>
                    <div className="w-px bg-slate-100 my-1 mx-1" />
                    <button 
                        onClick={() => setViewMode(ViewMode.Month)} 
                        className={cn("px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-colors", viewMode === ViewMode.Month ? "bg-blue-50 text-[#0052CC]" : "text-slate-500 hover:bg-slate-50")}
                    >
                        Month
                    </button>
                </div>
            </div>

            {/* --- GANTT CHART BODY --- */}
            <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#F4F5F7]/30">
                {/* minWidth để tránh vỡ UI thư viện khi container hẹp */}
                <div style={{ minWidth: '1000px', minHeight: '450px' }}> 
                    <Gantt
                        tasks={displayTasks}
                        viewMode={viewMode}
                        listCellWidth={isListVisible ? "300px" : ""} 
                        columnWidth={viewMode === ViewMode.Month ? 200 : 65}
                        rowHeight={52}
                        headerHeight={52}
                        barFill={70} 
                        barCornerRadius={6}

                        /* Inject Custom Components */
                        TaskListHeader={TaskListHeader}
                        TaskListTable={(props) => <TaskListTable 
                            {...props} 
                            selectedEpicId={selectedEpicId} 
                            handleTaskClick={handleTaskClick} 
                            projectId={projectId} 
                            onRefresh={onRefresh}
                        />}
                        TooltipContent={(props) => <CustomTooltip {...props} data={data} />}

                        /* Bind Events */
                        onClick={handleTaskClick}
                        onDateChange={onDateChange}
                    />
                </div>
            </div>
            
            <style jsx global>{`
                /* Tùy chỉnh màu sắc nền cho thư viện Gantt */
                .gantt ._3w_50 { fill: #f8fafc !important; }
                .gantt ._2eZzS { fill: #ffffff !important; }
                .gantt text { font-family: inherit !important; }
            `}</style>
        </div>
    );
}