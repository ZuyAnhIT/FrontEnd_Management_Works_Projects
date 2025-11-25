"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Droppable } from "@hello-pangea/dnd"; // ✅ Import Droppable
import { ChevronDown, ChevronRight, MoreHorizontal, Rocket, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SprintDetail } from "@/services/apiProject";

import BacklogTaskItem from "./BacklogTaskItem";
import QuickTaskCreate from "@/components/features/core/task/QuickTaskCreate";

// Helper format date
const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '...';

interface SprintSectionProps {
  sprints: SprintDetail[];
  onTaskClick: (taskId: number) => void; 
  onTaskCreated?: () => void; 
  onSprintSettingsClick: (sprintId: number) => void; 
}

export default function SprintSection({ 
  sprints, 
  onTaskClick, 
  onTaskCreated, 
  onSprintSettingsClick 
}: SprintSectionProps) {
  
  const params = useParams();
  const projectId = Number(params.projectId);
  
  // Mặc định mở tất cả sprint
  const [expanded, setExpanded] = useState<Record<number, boolean>>(
    sprints.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  const toggleSprint = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!sprints || sprints.length === 0) return null;

  return (
    <div className="space-y-6 mb-8">
      {sprints.map((sprint) => {
        // Xác định trạng thái để style
        const isActive = sprint.status === "IN_PROGRESS";
        const isFuture = sprint.status === "NOT_STARTED";

        return (
          <div 
            key={sprint.id} 
            className={`rounded-xl border overflow-hidden transition-all
              ${isActive ? 'bg-blue-50/30 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-200'}
            `}
          >
            {/* --- SPRINT HEADER --- */}
            <div 
                className={`flex items-center justify-between px-4 py-3 border-b cursor-pointer select-none
                ${isActive ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-200'}
                `}
                onClick={() => toggleSprint(sprint.id)}
            >
                {/* LEFT: Info */}
                <div className="flex items-center gap-3">
                   <button className="text-slate-400 hover:text-slate-600 transition-transform">
                      {expanded[sprint.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                   </button>
                   
                   <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                           {sprint.name}
                        </h3>
                        {/* Badge Trạng Thái */}
                        {isActive && (
                           <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-extrabold uppercase tracking-wide border border-green-200">
                              Active
                           </span>
                        )}
                        {isFuture && (
                           <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full font-bold uppercase tracking-wide border border-slate-200">
                              Planned
                           </span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        {sprint.startDate && sprint.endDate && (
                           <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                           </div>
                        )}
                        <div className="flex items-center gap-1">
                           <span className="font-medium text-slate-700">({sprint.taskCount} issues)</span>
                        </div>
                        {sprint.goal && (
                           <span className="text-slate-400 italic max-w-[300px] truncate hidden sm:block">
                              Goal: {sprint.goal}
                           </span>
                        )}
                      </div>
                  </div>
                </div>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-2">
                   {isActive && (
                     <Button 
                        size="sm" 
                        onClick={(e) => e.stopPropagation()} 
                        className="h-8 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 font-semibold shadow-none"
                     >
                        Complete Sprint
                     </Button>
                   )}
                   {isFuture && (
                     <Button 
                        size="sm" 
                        onClick={(e) => e.stopPropagation()} 
                        className="h-8 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-sm"
                     >
                        Start Sprint
                     </Button>
                   )}
                   
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={(e) => {
                          e.stopPropagation(); 
                          onSprintSettingsClick(sprint.id); 
                      }}
                   >
                      <MoreHorizontal className="w-4 h-4" />
                   </Button>
                </div>
            </div>

            {/* --- SPRINT TASKS (DROPPABLE AREA) --- */}
            {expanded[sprint.id] && (
               <Droppable droppableId={`sprint-${sprint.id}`} type="TASK">
                 {(provided, snapshot) => (
                    <div 
                       ref={provided.innerRef} 
                       {...provided.droppableProps}
                       className={`p-2 min-h-[50px] transition-colors duration-200
                          ${snapshot.isDraggingOver ? 'bg-blue-50/80' : ''} 
                       `}
                    >
                        
                        {/* List Tasks */}
                        <div className="space-y-2 mb-2">
                            {sprint.tasks && sprint.tasks.length > 0 ? (
                               sprint.tasks.map((task, index) => (
                                  <BacklogTaskItem 
                                     key={task.id} 
                                     task={task} 
                                     index={index} // ✅ Quan trọng: Index cho DragDrop
                                     onClick={() => onTaskClick(task.id)} 
                                  />
                               ))
                            ) : (
                               !snapshot.isDraggingOver && (
                                 <div className="flex flex-col items-center justify-center py-6 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg m-1 bg-white/50">
                                    <Rocket className="w-8 h-8 mb-2 opacity-40" />
                                    <p className="text-xs font-medium">Plan your sprint</p>
                                    <p className="text-[10px]">Drag issues here</p>
                                 </div>
                               )
                            )}
                            {provided.placeholder} {/* ✅ Placeholder giữ chỗ khi kéo */}
                        </div>

                        {/* Quick Create */}
                        <div className="px-1">
                            <QuickTaskCreate 
                                projectId={projectId}
                                sprintId={sprint.id} 
                                onSuccess={() => onTaskCreated && onTaskCreated()} 
                            />
                        </div>
                    </div>
                 )}
               </Droppable>
            )}
          </div>
        );
      })}
    </div>
  );
}