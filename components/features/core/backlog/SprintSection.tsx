"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Droppable } from "@hello-pangea/dnd";
import {
   ChevronDown, ChevronRight, MoreHorizontal, Rocket,
   Calendar, Play, CheckCircle, Trash2, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";

// API & Services
import {
   Sprint, // Sử dụng Interface Sprint thay vì SprintDetail nếu đã đồng bộ
   startSprint,
   completeSprint,
   deleteSprint
} from "@/services/apiSprint";

// Components
import BacklogTaskItem from "./BacklogTaskItem";
import QuickTaskCreate from "@/components/features/core/task/QuickTaskCreate";
import SprintActionModals from "@/components/features/core/sprint/SprintActionModals"; // ✅ Component Modal

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '...';

interface SprintSectionProps {
   sprints: Sprint[]; // Lưu ý: Dùng type Sprint từ apiSprint
   onTaskClick: (taskId: number) => void;
   onTaskCreated?: () => void;
   onSprintSettingsClick: (sprintId: number) => void;
   onRefresh: () => void; // ✅ Callback reload list
}

export default function SprintSection({
   sprints,
   onTaskClick,
   onTaskCreated,
   onSprintSettingsClick,
   onRefresh
}: SprintSectionProps) {
   const { activeCompany } = useAuth();
   const params = useParams();
   const workspaceId = Number(params.workspaceId);
   const projectId = Number(params.projectId);
   const { showToast } = useToast();

   if (!activeCompany) return null;
   // --- STATE ---
   // 1. Collapse/Expand Sprints
   const [expanded, setExpanded] = useState<Record<number, boolean>>(
      sprints.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
   );

   // 2. Dropdown Menu (Lưu ID của sprint đang mở menu)
   const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

   // 3. Action Modals Control
   const [modalType, setModalType] = useState<'START' | 'COMPLETE' | 'DELETE' | null>(null);
   const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
   const [isProcessing, setIsProcessing] = useState(false);

   // --- HANDLERS ---

   const toggleSprint = (id: number) => {
      setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
   };

   // Mở Modal xác nhận hành động
   const promptAction = (type: 'START' | 'COMPLETE' | 'DELETE', sprint: Sprint) => {
      setSelectedSprint(sprint);
      setModalType(type);
      setMenuOpenId(null); // Đóng menu dropdown nếu đang mở
   };

   // Thực hiện gọi API khi người dùng bấm Confirm trên Modal
   const handleConfirmAction = async () => {
      if (!selectedSprint || !modalType) return;

      try {
         setIsProcessing(true);

         if (modalType === 'START') {
            await startSprint(projectId, selectedSprint.id);
            showToast(`Sprint ${selectedSprint.name} started!`, "success");
         }
         else if (modalType === 'COMPLETE') {
            await completeSprint(projectId, selectedSprint.id);
            showToast(`Sprint completed. Incomplete tasks moved to Backlog.`, "success");
         }
         else if (modalType === 'DELETE') {
            await deleteSprint(projectId, selectedSprint.id);
            const actionName = selectedSprint.status === 'IN_PROGRESS' ? "canceled" : "deleted";
            showToast(`Sprint ${actionName} successfully`, "success");
         }

         // Reload dữ liệu
         onRefresh();

         // Reset state
         setModalType(null);
         setSelectedSprint(null);

      } catch (error: any) {
         showToast(error.message || "Action failed", "error");
      } finally {
         setIsProcessing(false);
      }
   };

   if (!sprints || sprints.length === 0) return null;

   return (
      <>
         {/* Wrapper onClick để đóng menu khi click ra ngoài */}
         <div className="space-y-6 mb-8" onClick={() => setMenuOpenId(null)}>

            {sprints.map((sprint) => {
               const isActive = sprint.status === "IN_PROGRESS";
               const isFuture = sprint.status === "NOT_STARTED";

               return (
                  <div
                     key={sprint.id}
                     className={`rounded-xl border overflow-visible transition-all relative
                ${isActive ? 'bg-blue-50/30 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-200'}
              `}
                  >
                     {/* --- SPRINT HEADER --- */}
                     <div
                        className={`flex items-center justify-between px-4 py-3 border-b cursor-pointer select-none
                  ${isActive ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-200'}
                  `}
                        onClick={(e) => { e.stopPropagation(); toggleSprint(sprint.id); }}
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
                                 {/* Badge */}
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

                              <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                                 {(sprint.startDate || sprint.endDate) && (
                                    <div className="flex items-center gap-1">
                                       <Calendar className="w-3 h-3" />
                                       <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                                    </div>
                                 )}
                                 <div className="flex items-center gap-1">
                                    <span className="font-medium text-slate-700">({sprint.taskCount || 0} issues)</span>
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
                        <div className="flex items-center gap-2 relative">

                           {/* 1. Complete Button (Active Only) */}
                           {isActive && (
                              <Button
                                 size="sm"
                                 onClick={(e) => { e.stopPropagation(); promptAction('COMPLETE', sprint); }}
                                 className="h-8 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 font-semibold shadow-none"
                              >
                                 Complete Sprint
                              </Button>
                           )}

                           {/* 2. Start Button (Future Only) */}
                           {isFuture && (
                              <Button
                                 size="sm"
                                 onClick={(e) => { e.stopPropagation(); promptAction('START', sprint); }}
                                 className="h-8 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-sm"
                              >
                                 Start Sprint
                              </Button>
                           )}

                           {/* 3. More Button + Dropdown */}
                           <div className="relative">
                              <Button
                                 variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenId(menuOpenId === sprint.id ? null : sprint.id);
                                 }}
                              >
                                 <MoreHorizontal className="w-4 h-4" />
                              </Button>

                              {/* DROPDOWN MENU */}
                              {menuOpenId === sprint.id && (
                                 <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 origin-top-right">
                                    <button
                                       className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          onSprintSettingsClick(sprint.id);
                                          setMenuOpenId(null);
                                       }}
                                    >
                                       <Edit className="w-3.5 h-3.5" /> Edit sprint
                                    </button>
                                    <button
                                       className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          promptAction('DELETE', sprint);
                                       }}
                                    >
                                       <Trash2 className="w-3.5 h-3.5" />
                                       {isActive ? "Cancel sprint" : "Delete sprint"}
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* --- SPRINT TASKS (Droppable Area) --- */}
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
                                 <div className="space-y-2 mb-2">
                                    {sprint.tasks && sprint.tasks.length > 0 ? (
                                       sprint.tasks.map((task, index) => (
                                          <BacklogTaskItem
                                             key={task.id}
                                             task={task}
                                             index={index}
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
                                    {provided.placeholder}
                                 </div>

                                 <div className="px-1">
                                    <QuickTaskCreate
                                       companyId={activeCompany.companyId}     // từ Auth
                                       workspaceId={workspaceId}              // từ URL
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

         {/* ✅ GLOBAL ACTION MODAL */}
         <SprintActionModals
            isOpen={!!modalType}
            type={modalType}
            sprint={selectedSprint}
            onClose={() => { setModalType(null); setSelectedSprint(null); }}
            onConfirm={handleConfirmAction}
            loading={isProcessing}
         />
      </>
   );
}