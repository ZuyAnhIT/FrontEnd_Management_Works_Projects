"use client";

import { useState } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { RoadmapItemResponse } from "@/services/apiStatistics";
import { Loader2, Layers, Rocket, CalendarDays, LayoutList } from "lucide-react";

interface TimelineGanttProps {
  data: RoadmapItemResponse[];
  loading: boolean;
}

export default function TimelineGantt({ data, loading }: TimelineGanttProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  
  // State bật/tắt cột danh sách bên trái
  const [isChecked, setIsChecked] = useState(true); 

  // Chuyển đổi dữ liệu API -> Gantt Task
  const tasks: Task[] = data.map((item) => {
    const isEpic = item.type === "EPIC";
    return {
      start: new Date(item.startDate),
      end: new Date(item.endDate),
      name: item.title,
      id: item.id,
      type: "task", // "task" | "milestone" | "project"
      progress: item.progress,
      isDisabled: true, // Read-only mode
      styles: {
        progressColor: isEpic ? "#8b5cf6" : "#3b82f6", // Epic (Purple) vs Sprint (Blue)
        progressSelectedColor: isEpic ? "#7c3aed" : "#2563eb",
        backgroundColor: isEpic ? "#f3e8ff" : "#dbeafe", // Pastel background
        backgroundSelectedColor: isEpic ? "#f3e8ff" : "#dbeafe",
      },
      project: item.type, // Custom field để render icon trong TaskListTable
    };
  });

  // --- CUSTOM RENDER: CỘT DANH SÁCH BÊN TRÁI ---
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

  const TaskListTable = ({ rowHeight, tasks, fontFamily, fontSize }: any) => {
      return (
          <div className="border-r border-slate-200 bg-white font-sans">
              {tasks.map((t: any) => (
                  <div 
                    key={t.id} 
                    className="flex items-center pl-4 border-b border-slate-100 hover:bg-slate-50 transition-colors truncate"
                    style={{ height: rowHeight, fontFamily, fontSize }}
                    title={t.name}
                  >
                      <span className="mr-2 opacity-70">
                          {t.project === 'EPIC' ? <Layers className="w-3.5 h-3.5 text-purple-600"/> : <Rocket className="w-3.5 h-3.5 text-blue-600"/>}
                      </span>
                      <span className="text-sm text-slate-700 font-medium truncate">{t.name}</span>
                  </div>
              ))}
          </div>
      )
  }

  // --- CUSTOM TOOLTIP ---
  const CustomTooltip = ({ task }: { task: Task }) => {
      const item = data.find(d => d.id === task.id);
      if(!item) return null;
      
      return (
         <div className="bg-white p-3 shadow-xl rounded-lg border border-slate-100 text-xs min-w-[220px] z-50">
             <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                 {item.type === 'EPIC' ? <Layers className="w-3.5 h-3.5 text-purple-500"/> : <Rocket className="w-3.5 h-3.5 text-blue-500"/>}
                 <p className="font-bold text-slate-800 truncate">{item.title}</p>
             </div>
             <div className="space-y-1.5 text-slate-500">
                 <div className="flex justify-between">
                     <span>Start:</span>
                     <span className="text-slate-700 font-medium">{new Date(item.startDate).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between">
                     <span>End:</span>
                     <span className="text-slate-700 font-medium">{new Date(item.endDate).toLocaleDateString()}</span>
                 </div>
                 <div className="mt-2 pt-2 border-t border-slate-50">
                     <div className="flex justify-between items-center mb-1">
                        <span>Progress</span>
                        <span className="font-bold text-blue-600">{item.progress}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progress}%` }}></div>
                     </div>
                 </div>
                 <p className="text-[10px] text-right mt-1 text-slate-400">
                     {item.completedTasks} / {item.totalTasks} tasks done
                 </p>
             </div>
         </div>
      );
  };

  // --- RENDER STATES ---
  if (loading) return (
      <div className="h-[500px] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
  );

  if (tasks.length === 0) return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm text-slate-400">
          <CalendarDays className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">No timeline data found.</p>
          <p className="text-xs mt-1 opacity-70">Try adjusting your filters.</p>
      </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
       
       {/* 1. CHART CONTROLS */}
       <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 shrink-0">
           <div className="flex items-center gap-4">
               <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Gantt Chart</h3>
               
               {/* Toggle List Button */}
               <button 
                  onClick={() => setIsChecked(!isChecked)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all 
                    ${isChecked ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200'}`}
               >
                  <LayoutList className="w-3.5 h-3.5" />
                  {isChecked ? "Hide List" : "Show List"}
               </button>
           </div>

           {/* View Mode Switcher */}
           <div className="bg-white border border-slate-200 p-0.5 rounded-lg inline-flex shadow-sm">
              <button onClick={() => setViewMode(ViewMode.Day)} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === ViewMode.Day ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>Day</button>
              <div className="w-px bg-slate-100 my-1"></div>
              <button onClick={() => setViewMode(ViewMode.Week)} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === ViewMode.Week ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>Week</button>
              <div className="w-px bg-slate-100 my-1"></div>
              <button onClick={() => setViewMode(ViewMode.Month)} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === ViewMode.Month ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>Month</button>
           </div>
       </div>

       {/* 2. GANTT BODY (SCROLLABLE) */}
       {/* Sử dụng overflow-auto và minWidth để cho phép cuộn ngang/dọc */}
       <div className="flex-1 overflow-auto custom-scrollbar relative">
           <div style={{ minWidth: '1000px', minHeight: '400px' }}> {/* Đảm bảo không gian vẽ */}
               <Gantt
                  tasks={tasks}
                  viewMode={viewMode}
                  
                  // Layout Configuration
                  listCellWidth={isChecked ? "280px" : ""} 
                  columnWidth={viewMode === ViewMode.Month ? 200 : 60}
                  rowHeight={48}
                  headerHeight={48}
                  barFill={70} // Độ cao thanh bar (%)
                  barCornerRadius={4}
                  
                  // Custom Renderers
                  TaskListHeader={TaskListHeader}
                  TaskListTable={TaskListTable}
                  TooltipContent={CustomTooltip}
               />
           </div>
       </div>
    </div>
  );
}