"use client";

import { useState } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { RoadmapItemResponse } from "@/services/apiStatistics";
import { 
  Loader2, Layers, Rocket, LayoutList, 
  Calendar, Clock, CheckCircle2, Activity 
} from "lucide-react";

// ✅ Import Component tạo nhanh Epic
import QuickEpicCreate from "./QuickEpicCreate";

interface TimelineGanttProps {
  data: RoadmapItemResponse[];
  loading: boolean;
  projectId: number;
  onRefresh: () => void;
  // Prop này vẫn tên là onSelect để thống nhất với component cha, 
  // nhưng bên trong sẽ được trigger bởi sự kiện onClick
  onSelect?: (item: RoadmapItemResponse) => void;
}

export default function TimelineGantt({ 
  data, 
  loading, 
  projectId, 
  onRefresh,
  onSelect 
}: TimelineGanttProps) {
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
      // Đảm bảo id là string để tương thích tốt nhất với thư viện
      id: String(item.id), 
      type: "task",
      progress: item.progress,
      // isDisabled: true -> Ngăn kéo thả, nhưng VẪN CHO PHÉP sự kiện onClick
      isDisabled: true, 
      styles: {
        progressColor: isEpic ? "#8b5cf6" : "#3b82f6", 
        progressSelectedColor: isEpic ? "#7c3aed" : "#2563eb",
        backgroundColor: isEpic ? "#f3e8ff" : "#dbeafe",
        backgroundSelectedColor: isEpic ? "#f3e8ff" : "#dbeafe",
      },
      project: item.type, // Custom field để render icon
    };
  });

  // ✅ HÀM XỬ LÝ CLICK (Đã xóa log)
  const handleTaskClick = (task: Task) => {
    if (onSelect) {
        // Tìm lại item gốc từ data dựa trên ID
        const originalItem = data.find((d) => String(d.id) === task.id);
        
        if (originalItem) {
            onSelect(originalItem);
        }
    }
  };

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

  // --- CUSTOM RENDER: TASK LIST TABLE ---
  const TaskListTable = ({ rowHeight, tasks, fontFamily, fontSize }: any) => {
      return (
          <div className="border-r border-slate-200 bg-white font-sans flex flex-col h-full">
              {tasks.map((t: any) => (
                  <div 
                    key={t.id} 
                    className="flex items-center pl-4 border-b border-slate-100 hover:bg-slate-50 transition-colors truncate shrink-0 cursor-pointer"
                    style={{ height: rowHeight, fontFamily, fontSize }}
                    title={t.name}
                    // ✅ Click vào dòng bên trái cũng gọi hàm xử lý click
                    onClick={() => handleTaskClick(t)}
                  >
                      <span className="mr-2 opacity-70">
                          {t.project === 'EPIC' ? <Layers className="w-3.5 h-3.5 text-purple-600"/> : <Rocket className="w-3.5 h-3.5 text-blue-600"/>}
                      </span>
                      <span className="text-sm text-slate-700 font-medium truncate">{t.name}</span>
                  </div>
              ))}

              {/* 🔥 PHẦN TẠO NHANH EPIC */}
              <div 
                className="border-b border-slate-100 shrink-0 bg-slate-50/30"
                style={{ height: rowHeight }}
              >
                 <QuickEpicCreate 
                    projectId={projectId}
                    onSuccess={onRefresh}
                 />
              </div>
              <div className="flex-1 bg-slate-50/10"></div>
          </div>
      )
  }

  // --- ✨ CUSTOM TOOLTIP (ĐÃ NÂNG CẤP GIAO DIỆN) ---
  const CustomTooltip = ({ task }: { task: Task }) => {
      const item = data.find(d => String(d.id) === task.id);
      if(!item) return null;
      
      const isEpic = item.type === 'EPIC';
      const themeColor = isEpic ? 'text-purple-600' : 'text-blue-600';
      const bgColor = isEpic ? 'bg-purple-50' : 'bg-blue-50';
      const borderColor = isEpic ? 'border-purple-100' : 'border-blue-100';

      return (
         <div className="bg-white shadow-xl rounded-xl border border-slate-100 w-[280px] overflow-hidden z-50">
             
             {/* Header: Title & Type */}
             <div className={`px-4 py-3 border-b ${borderColor} ${bgColor} flex items-start gap-3`}>
                 <div className={`mt-0.5 p-1.5 bg-white rounded-md shadow-sm border ${borderColor}`}>
                    {isEpic ? <Layers className="w-4 h-4 text-purple-600"/> : <Rocket className="w-4 h-4 text-blue-600"/>}
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-0.5">{item.type}</p>
                    <p className="text-sm font-bold text-slate-800 truncate leading-tight">{item.title}</p>
                 </div>
             </div>

             {/* Body: Details */}
             <div className="p-4 space-y-4">
                 
                 {/* 1. Date Range */}
                 <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar className="w-3.5 h-3.5"/> <span>Start</span>
                        </div>
                        <p className="font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {new Date(item.startDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3.5 h-3.5"/> <span>End</span>
                        </div>
                        <p className="font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {new Date(item.endDate).toLocaleDateString()}
                        </p>
                    </div>
                 </div>

                 {/* 2. Progress Bar */}
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

                 {/* 3. Footer Stats */}
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
      );
  };

  if (loading) return (
      <div className="h-[500px] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
  );

  const displayTasks: Task[] = tasks.length > 0 ? tasks : [
      {
          start: new Date(),
          end: new Date(),
          name: "Hidden",
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
       {/* CONTROLS */}
       <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 shrink-0">
           <div className="flex items-center gap-4">
               <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Gantt Chart</h3>
               <button 
                  onClick={() => setIsChecked(!isChecked)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all 
                    ${isChecked ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200'}`}
               >
                  <LayoutList className="w-3.5 h-3.5" />
                  {isChecked ? "Hide List" : "Show List"}
               </button>
           </div>

           <div className="bg-white border border-slate-200 p-0.5 rounded-lg inline-flex shadow-sm">
              <button onClick={() => setViewMode(ViewMode.Day)} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === ViewMode.Day ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>Day</button>
              <div className="w-px bg-slate-100 my-1"></div>
              <button onClick={() => setViewMode(ViewMode.Week)} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === ViewMode.Week ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>Week</button>
              <div className="w-px bg-slate-100 my-1"></div>
              <button onClick={() => setViewMode(ViewMode.Month)} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === ViewMode.Month ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>Month</button>
           </div>
       </div>

       {/* BODY */}
       <div className="flex-1 overflow-auto custom-scrollbar relative">
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
                  TaskListHeader={TaskListHeader}
                  TaskListTable={TaskListTable}
                  TooltipContent={CustomTooltip}

                  // 🔴 SỬ DỤNG onClick (đây là mấu chốt)
                  onClick={handleTaskClick}
               />
           </div>
       </div>
    </div>
  );
}