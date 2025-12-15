"use client";

import { useState } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { RoadmapItemResponse } from "@/services/apiStatistics";
import { 
    Loader2, Layers, Rocket, LayoutList, 
    Calendar, Clock, CheckCircle2, Activity 
} from "lucide-react";
import QuickEpicCreate from "./QuickEpicCreate";

// =============================================================================
// 1. INTERFACES
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
// 2. CUSTOM COMPONENTS (RENDER PROPS)
// =============================================================================

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ task, data }: { task: Task, data: RoadmapItemResponse[] }) => {
    // Vẫn tìm item để lấy thông tin tĩnh (Title, Type, Metadata)
    const item = data.find(d => String(d.id) === task.id);
    if(!item) return null;
    
    const isEpic = item.type === 'EPIC';
    const themeColor = isEpic ? 'text-purple-600' : 'text-blue-600';
    const bgColor = isEpic ? 'bg-purple-50' : 'bg-blue-50';
    const borderColor = isEpic ? 'border-purple-100' : 'border-blue-100';

    // Format ngày tháng để hiển thị đẹp hơn
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        // Dùng pt-12 để tooltips không che mất thanh bar đang kéo
        <div className="pt-12 pointer-events-none transform -translate-x-1/4"> 
            <div className="bg-white shadow-2xl rounded-xl border border-slate-100 w-[280px] overflow-hidden z-50">
                
                {/* Header */}
                <div className={`px-4 py-3 border-b ${borderColor} ${bgColor} flex items-start gap-3`}>
                    <div className={`mt-0.5 p-1.5 bg-white rounded-md shadow-sm border ${borderColor} shrink-0`}>
                        {isEpic ? <Layers className="w-4 h-4 text-purple-600"/> : <Rocket className="w-4 h-4 text-blue-600"/>}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-0.5">{item.type}</p>
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">{item.title}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    
                    {/* 1. LIVE DATE RANGE */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar className="w-3.5 h-3.5"/> <span>Start</span>
                            </div>
                            {/* Hiển thị ngày real-time từ task.start */}
                            <p className="font-bold text-slate-800 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 text-center transition-all">
                                {formatDate(task.start)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-3.5 h-3.5"/> <span>End</span>
                            </div>
                            {/* Hiển thị ngày real-time từ task.end */}
                            <p className="font-bold text-slate-800 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 text-center transition-all">
                                {formatDate(task.end)}
                            </p>
                        </div>
                    </div>

                    {/* 2. Progress */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5"/> Progress
                            </span>
                            <span className={`font-bold ${themeColor}`}>{item.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-300 ${isEpic ? 'bg-purple-500' : 'bg-blue-500'}`} 
                                style={{ width: `${item.progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* 3. Footer */}
                    <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${item.progress === 100 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            <span className="text-xs font-medium text-slate-600">
                                {item.progress === 100 ? 'Completed' : 'In Progress'}
                            </span>
                        </div>
                        <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5"/>
                            {item.completedTasks} / {item.totalTasks} Tasks
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CUSTOM TASK LIST HEADER ---
const TaskListHeader = ({ headerHeight }: { headerHeight: number }) => {
    return (
        <div 
            className="flex items-center pl-4 font-bold text-xs text-slate-500 uppercase bg-slate-50 border-r border-b border-slate-200 h-full"
            style={{ height: headerHeight }}
        >
            Work Item
        </div>
    )
}

// --- CUSTOM TASK LIST TABLE (LEFT SIDE) ---
const TaskListTable = ({ rowHeight, tasks, fontFamily, fontSize, selectedEpicId, handleTaskClick, projectId, onRefresh }: any) => {
    return (
        <div className="border-r border-slate-200 bg-white font-sans flex flex-col h-full">
            {tasks.map((t: any) => {
                const isSelected = String(selectedEpicId) === t.id;
                // Bỏ qua placeholder
                if (t.project === 'HIDDEN') return null; 

                return (
                    <div 
                        key={t.id} 
                        className={`
                            flex items-center pl-4 border-b border-slate-100 transition-colors truncate shrink-0 cursor-pointer
                            ${isSelected ? 'bg-purple-50 border-l-4 border-l-purple-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}
                        `}
                        style={{ height: rowHeight, fontFamily, fontSize }}
                        title={t.name}
                        onClick={() => handleTaskClick(t)}
                    >
                        <span className="mr-2 opacity-70">
                            {t.project === 'EPIC' ? <Layers className="w-3.5 h-3.5 text-purple-600"/> : <Rocket className="w-3.5 h-3.5 text-blue-600"/>}
                        </span>
                        <span className={`text-sm font-medium truncate ${isSelected ? 'text-purple-700 font-bold' : 'text-slate-700'}`}>
                            {t.name}
                        </span>
                    </div>
                );
            })}
            <div 
                className="border-b border-slate-100 shrink-0 bg-slate-50/30"
                style={{ height: rowHeight }}
            >
                <QuickEpicCreate 
                    projectId={projectId}
                    onSuccess={onRefresh}
                />
            </div>
            {/* Vùng trống để Gantt Chart mở rộng */}
            <div className="flex-1 bg-slate-50/10"></div> 
        </div>
    )
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function TimelineGantt({ 
    data, 
    loading, 
    projectId, 
    onRefresh,
    onSelect,
    selectedEpicId,
    onDateChange
}: TimelineGanttProps) {
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
    const [isChecked, setIsChecked] = useState(true); 

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
            isDisabled: !isEpic, // Chỉ cho phép kéo thả Epic
            styles: {
                progressColor: isEpic ? "#8b5cf6" : "#3b82f6",
                progressSelectedColor: isEpic ? "#7c3aed" : "#2563eb",
                backgroundColor: isEpic ? "#f3e8ff" : "#dbeafe",
                backgroundSelectedColor: isEpic ? "#f3e8ff" : "#dbeafe",
                barProgressColor: isSelected ? "#7c3aed" : undefined,
            },
            project: item.type, // Dùng field này để phân biệt Epic/Task
        };
    });

    const handleTaskClick = (task: Task) => {
        if (onSelect) {
            const originalItem = data.find((d) => String(d.id) === task.id);
            if (originalItem) {
                onSelect(originalItem);
            }
        }
    };

    if (loading) return (
        <div className="h-[500px] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    // Xử lý trường hợp không có task nào
    const displayTasks: Task[] = tasks.length > 0 ? tasks : [
        {
            start: new Date(),
            end: new Date(new Date().setDate(new Date().getDate() + 1)),
            name: "No items to display. Create an Epic below.",
            id: "hidden-placeholder",
            type: "task",
            progress: 0,
            isDisabled: true,
            styles: { backgroundColor: "transparent", progressColor: "transparent", backgroundSelectedColor: "transparent" },
            hideChildren: true,
            project: "HIDDEN"
        }
    ];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 shrink-0">
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Gantt Chart</h3>
                    <button 
                        onClick={() => setIsChecked(!isChecked)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all 
                            ${isChecked ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200'}`}
                        title={isChecked ? "Hide list view" : "Show list view"}
                    >
                        <LayoutList className="w-3.5 h-3.5" />
                        {isChecked ? "Hide List" : "Show List"}
                    </button>
                </div>
                {/* View Mode Selector */}
                <div className="bg-white border border-slate-200 p-0.5 rounded-lg inline-flex shadow-sm">
                    <button onClick={() => setViewMode(ViewMode.Day)} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === ViewMode.Day ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>Day</button>
                    <div className="w-px bg-slate-100 my-1"></div>
                    <button onClick={() => setViewMode(ViewMode.Week)} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === ViewMode.Week ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>Week</button>
                    <div className="w-px bg-slate-100 my-1"></div>
                    <button onClick={() => setViewMode(ViewMode.Month)} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === ViewMode.Month ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>Month</button>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar relative">
                {/* minWidth: '1000px' để chart không bị lỗi render trên container quá hẹp */}
                <div style={{ minWidth: '1000px', minHeight: '400px' }}> 
                    <Gantt
                        tasks={displayTasks}
                        viewMode={viewMode}
                        listCellWidth={isChecked ? "280px" : ""} 
                        columnWidth={viewMode === ViewMode.Month ? 200 : 60}
                        rowHeight={48}
                        headerHeight={48}
                        barFill={70} 
                        barCornerRadius={4}

                        // Custom Render Props
                        TaskListHeader={TaskListHeader}
                        // Truyền thêm props cần thiết xuống TaskListTable
                        TaskListTable={(props) => <TaskListTable 
                            {...props} 
                            selectedEpicId={selectedEpicId} 
                            handleTaskClick={handleTaskClick} 
                            projectId={projectId} 
                            onRefresh={onRefresh}
                        />}
                        TooltipContent={(props) => <CustomTooltip {...props} data={data} />}

                        // Handlers
                        onClick={handleTaskClick}
                        onDateChange={onDateChange}
                    />
                </div>
            </div>
        </div>
    );
}