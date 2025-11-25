// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useParams } from "next/navigation";
// import {
//   ChevronDown,
//   ChevronRight,
//   MoreHorizontal,
//   Plus,
//   Search,
//   User,
//   Calendar,
//   CheckSquare,
//   RefreshCw,
//   Loader2,
//   Clock,
//   GitBranch, // Icon cho Backlog Header
//   Filter
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { CreateSprintModal } from "./create-sprint-modal";
// import { CreateTaskModal } from "./create-task-modal";
// import { useToast } from "@/components/ui/ToastProvider";
// import {
//   getSprints,
//   startSprint,
//   completeSprint,
//   getSprintDetail,
//   Sprint,
// } from "@/services/apiSprint";

// export function Sprints() {
//   const { showToast } = useToast();
//   const { projectId } = useParams() as { projectId: string };
//   const params = useParams();
//   const workspaceId = Number(params.workspaceId);

//   const [sprints, setSprints] = useState<Sprint[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
  
//   const [expanded, setExpanded] = useState<Set<number>>(new Set());
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [detailLoading, setDetailLoading] = useState<number | null>(null);
//   const [createTaskSprintId, setCreateTaskSprintId] = useState<number | null>(null);

//   // Ref để giữ giá trị expanded mới nhất trong setInterval (tránh closure stale state)
//   const expandedRef = useRef(expanded);
//   useEffect(() => {
//       expandedRef.current = expanded;
//   }, [expanded]);

//   // =====================================================
//   // 🔥 1. SMART LOAD DATA (Auto-refresh logic)
//   // =====================================================
//   const loadData = useCallback(async (isBackground = false) => {
//     try {
//       if (!isBackground) setLoading(true);
//       else setIsRefreshing(true);

//       const sprintsData = await getSprints(Number(projectId));
      
//       let finalSprints = sprintsData;

//       // Nếu đang chạy ngầm, cần fetch lại chi tiết cho các sprint đang mở
//       if (isBackground && expandedRef.current.size > 0) {
//          const updatedSprintsPromises = sprintsData.map(async (s) => {
//              if (expandedRef.current.has(s.id)) {
//                  try {
//                      const detail = await getSprintDetail(Number(projectId), s.id);
//                      return { ...s, tasks: detail.tasks };
//                  } catch (e) {
//                      return s;
//                  }
//              }
//              return s;
//          });
//          finalSprints = await Promise.all(updatedSprintsPromises);
//       } else if (!isBackground) {
//          // Lần đầu load: Tự động mở Active Sprint
//          const activeSprint = sprintsData.find(s => s.status === "IN_PROGRESS");
//          if (activeSprint) {
//             try {
//                 const detail = await getSprintDetail(Number(projectId), activeSprint.id);
//                 const newSet = new Set([activeSprint.id]);
//                 setExpanded(newSet);
//                 expandedRef.current = newSet;
                
//                 finalSprints = sprintsData.map(s => 
//                     s.id === activeSprint.id ? { ...s, tasks: detail.tasks } : s
//                 );
//             } catch (e) {}
//          } else if (sprintsData.length > 0 && expanded.size === 0) {
//             // Nếu không có active, mở cái đầu tiên
//             setExpanded(new Set([sprintsData[0].id]));
//          }
//       }

//       setSprints(finalSprints);

//     } catch (err: any) {
//       if (!isBackground) showToast(err.message || "Lỗi tải dữ liệu", "error");
//     } finally {
//       if (!isBackground) setLoading(false);
//       else setIsRefreshing(false);
//     }
//   }, [projectId, showToast]);

//   // Interval 5s để reload ngầm
//   useEffect(() => {
//     if (projectId) {
//         loadData(false);
//         const intervalId = setInterval(() => {
//             loadData(true);
//         }, 5000); 
//         return () => clearInterval(intervalId);
//     }
//   }, [projectId, loadData]);

//   // =====================================================
//   // 🔥 2. EXPAND & RELOAD HELPERS
//   // =====================================================
//   const toggleExpand = async (id: number) => {
//     const isOpen = expanded.has(id);
//     if (isOpen) {
//       const s = new Set(expanded);
//       s.delete(id);
//       setExpanded(s);
//       return;
//     }
//     const s = new Set(expanded);
//     s.add(id);
//     setExpanded(s);
//     await reloadSprintDetail(id);
//   };

//   const reloadSprintDetail = async (sprintId: number) => {
//     try {
//       setDetailLoading(sprintId);
//       const detail = await getSprintDetail(Number(projectId), sprintId);
//       setSprints((prevSprints) =>
//         prevSprints.map((s) =>
//           s.id === sprintId ? { ...s, tasks: detail.tasks } : s
//         )
//       );
//     } catch (err) {
//       console.error("Reload detail failed:", err);
//     } finally {
//       setDetailLoading(null);
//     }
//   };

//   const manualReloadSprint = async (sprintId: number) => {
//     try {
//         setIsRefreshing(true);
//         const detail = await getSprintDetail(Number(projectId), sprintId);
//         setSprints(prev =>
//             prev.map(s => s.id === sprintId ? { ...s, tasks: detail.tasks } : s)
//         );
//     } catch(e) {
//         console.error(e);
//     } finally {
//         setIsRefreshing(false);
//     }
//   }

//   // =====================================================
//   // 🔥 3. ACTIONS (Start/Complete)
//   // =====================================================
//   const handleStart = async (e: React.MouseEvent, id: number) => {
//     e.stopPropagation();
//     try {
//       await startSprint(Number(projectId), id);
//       showToast("Sprint đã bắt đầu!", "success");
//       loadData(true);
//     } catch (err: any) {
//       showToast(err.message, "error");
//     }
//   };

//   const handleComplete = async (e: React.MouseEvent, id: number) => {
//     e.stopPropagation();
//     try {
//       await completeSprint(Number(projectId), id);
//       showToast("Sprint đã hoàn thành!", "success");
//       loadData(true);
//     } catch (err: any) {
//       showToast(err.message, "error");
//     }
//   };

//   // =====================================================
//   // 🔥 UI COMPONENTS
//   // =====================================================
//   const StatusBadge = ({ status }: { status: string }) => {
//     let styles = "bg-slate-200 text-slate-700"; 
//     const s = status?.toUpperCase();
//     if (['DONE', 'COMPLETED'].includes(s)) styles = "bg-green-100 text-green-800";
//     if (['IN_PROGRESS', 'DOING'].includes(s)) styles = "bg-blue-100 text-blue-800";
//     return (
//       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${styles}`}>
//         {status}
//       </span>
//     );
//   };

//   const SprintStats = ({ tasks }: { tasks?: any[] }) => {
//     const safeTasks = tasks || [];
//     const todo = safeTasks.filter(t => ['TODO', 'TO DO'].includes(t.statusName?.toUpperCase())).length;
//     const doing = safeTasks.filter(t => ['IN_PROGRESS', 'DOING'].includes(t.statusName?.toUpperCase())).length;
//     const done = safeTasks.filter(t => ['DONE', 'COMPLETED'].includes(t.statusName?.toUpperCase())).length;

//     return (
//       <div className="flex items-center gap-1 text-[11px] font-bold ml-4">
//         {todo > 0 && <span className="bg-slate-300 text-slate-700 w-5 h-5 flex items-center justify-center rounded-full" title="To Do">{todo}</span>}
//         {doing > 0 && <span className="bg-blue-500 text-white w-5 h-5 flex items-center justify-center rounded-full" title="In Progress">{doing}</span>}
//         {done > 0 && <span className="bg-green-500 text-white w-5 h-5 flex items-center justify-center rounded-full" title="Done">{done}</span>}
//       </div>
//     );
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-white text-slate-900 font-sans text-sm">
//       <div className="p-6 max-w-[2400px] mx-auto">
        
//        {/* =====================================================
//             🔥 HEADER (Updated to Match Backlog Style)
//         ===================================================== */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6">
          
//           {/* Left: Icon & Title */}
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-slate-100 rounded-md">
//               {/* Dùng GitBranch cho Sprint sẽ hợp hơn List, nhưng style y hệt */}
//               <GitBranch className="w-5 h-5 text-slate-700" />
//             </div>
//             <div>
//               <div className="flex items-center gap-2">
//                   <h1 className="text-xl font-bold text-slate-900">Sprints</h1>
//                   {isRefreshing && (
//                      <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />
//                   )}
//               </div>
//               <p className="text-xs text-slate-500 font-medium">{sprints.length} sprints total</p>
//             </div>
//           </div>

//           {/* Right: Search & Create Button */}
//           <div className="flex items-center gap-3 w-full md:w-auto">
//             <div className="relative hidden md:block group">
//               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//               <input 
//                 type="text" 
//                 placeholder="Search sprints..." 
//                 className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-500 focus:bg-white transition-all w-64"
//               />
//             </div>
                
//                 <button className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 hidden md:block">
//                    <Filter className="w-4 h-4" />
//                 </button>

//                 <div className="flex -space-x-1 shrink-0">
//                     <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500">
//                         <User className="w-4 h-4" />
//                     </div>
//                 </div>
//             </div>
//         </div>

//         {/* =====================================================
//             🔥 LIST SPRINTS (Accordion)
//         ===================================================== */}
//         <div className="space-y-6">
//            {sprints.map((sprint) => {
//              const isExpanded = expanded.has(sprint.id);
//              const isActive = sprint.status === "IN_PROGRESS";
//              const isCompleted = sprint.status === "COMPLETED";
//              const safeTasks = sprint.tasks || [];
//              const taskCount = safeTasks.length;

//              let headerBg = "bg-slate-100 hover:bg-slate-200";
//              let headerBorder = "border-l-4 border-l-slate-400"; 

//              if (isActive) {
//                  headerBg = "bg-white shadow-sm ring-1 ring-slate-200";
//                  headerBorder = "border-l-4 border-l-blue-600"; 
//              } else if (isCompleted) {
//                  headerBg = "bg-green-50/50"; 
//                  headerBorder = "border-l-4 border-l-green-500";
//              }

//              return (
//                <div key={sprint.id} className={`rounded-md overflow-hidden transition-all duration-200 ${isActive ? 'shadow-md' : ''}`}>
                 
//                  {/* SPRINT HEADER */}
//                  <div 
//                     className={`group flex items-center py-3 px-3 cursor-pointer select-none transition-colors ${headerBg} ${headerBorder}`}
//                     onClick={() => toggleExpand(sprint.id)}
//                  >
//                     <div className="flex items-center flex-1 min-w-0">
//                         <div className="p-1 rounded text-slate-500 mr-2 hover:bg-black/5">
//                           {detailLoading === sprint.id ? (
//                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
//                           ) : isExpanded ? (
//                              <ChevronDown className="w-5 h-5" />
//                           ) : (
//                              <ChevronRight className="w-5 h-5" />
//                           )}
//                         </div>

//                         <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
//                             <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
//                               {sprint.name} 
//                               {isActive && <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />}
//                             </h3>
                            
//                             <div className="flex items-center gap-2 text-xs text-slate-500">
//                                 {sprint.startDate && sprint.endDate ? (
//                                     <span className="font-medium bg-white/50 px-1.5 py-0.5 rounded border border-slate-200/50">
//                                        {new Date(sprint.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
//                                        {' - '} 
//                                        {new Date(sprint.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
//                                     </span>
//                                 ) : (
//                                     <span className="italic opacity-70">No dates</span>
//                                 )}
//                                 <span>({taskCount} issues)</span>
//                             </div>
//                         </div>
                        
//                         <SprintStats tasks={sprint.tasks} />
//                     </div>

//                     {/* Sprint Actions */}
//                     <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                        {sprint.status === 'NOT_STARTED' && (
//                           <Button size="sm" className="h-7 text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm" onClick={(e) => handleStart(e, sprint.id)}>
//                             Start sprint
//                           </Button>
//                        )}
//                        {isActive && (
//                           <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={(e) => handleComplete(e, sprint.id)}>
//                              Complete sprint
//                           </Button>
//                        )}
//                        <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500">
//                           <MoreHorizontal className="w-4 h-4" />
//                        </button>
//                     </div>
//                  </div>

//                  {/* TASK LIST CONTAINER */}
//                  {isExpanded && (
//                    <div className="min-h-[10px] animate-in slide-in-from-top-1 duration-200">
//                       <div className="flex flex-col bg-white border-x border-b border-slate-200 rounded-b-md">
                        
//                         {safeTasks.length === 0 && (
//                            <div className="py-8 flex flex-col items-center justify-center border-b border-slate-100 border-dashed bg-slate-50/30">
//                               <div className="text-slate-400 text-xs italic font-medium">Plan your sprint by creating tasks</div>
//                            </div>
//                         )}

//                         {safeTasks.map((task) => (
//                            <div 
//                              key={task.id}
//                              className="group flex items-center gap-3 py-2.5 px-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
//                            >
//                              {/* Left Info */}
//                              <div className="flex items-center gap-3 flex-1 min-w-0">
//                                 <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
//                                    <CheckSquare className="w-4 h-4" />
//                                 </div>
//                                 <span className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer w-14 shrink-0">
//                                    {(task as any).taskCode || `ID-${task.id}`}
//                                 </span>
//                                 <span className="text-sm text-slate-800 truncate font-medium group-hover:text-blue-700 transition-colors">
//                                   {task.title}
//                                 </span>
//                              </div>

//                              {/* Right Meta */}
//                              <div className="flex items-center gap-4 pl-4 shrink-0">
//                                <StatusBadge status={task.statusName || 'TODO'} />
                               
//                                <div className="w-5 flex justify-center" title={`Priority: ${task.priority}`}>
//                                   {task.priority === 'HIGH' || task.priority === 'CRITICAL' ? (
//                                      <div className="w-3 h-3 bg-red-500 rotate-45" /> 
//                                   ) : task.priority === 'MEDIUM' ? (
//                                      <div className="w-3 h-3 bg-orange-400 rotate-45" />
//                                   ) : (
//                                      <div className="w-3 h-3 bg-blue-400 rotate-45" />
//                                   )}
//                                </div>

//                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
//                                   {task.assigneeAvatarUrl ? <img src={task.assigneeAvatarUrl} className="rounded-full w-full h-full object-cover" /> : <User className="w-3 h-3" />}
//                                </div>
                               
//                                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-500 transition-opacity">
//                                   <MoreHorizontal className="w-4 h-4" />
//                                </button>
//                              </div>
//                            </div>
//                         ))}

//                         {/* CREATE TASK ROW */}
//                         <div 
//                            onClick={() => setCreateTaskSprintId(sprint.id)}
//                            className="flex items-center py-2.5 px-4 hover:bg-slate-50 cursor-pointer group transition-colors"
//                         >
//                            <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-800 pl-7">
//                               <Plus className="w-4 h-4" />
//                               <span className="text-sm font-medium">Create issue</span>
//                            </div>
//                         </div>

//                       </div>
//                    </div>
//                  )}
//                </div>
//              );
//            })}

//            <div className="pt-2 pb-10">
//               <button 
//                 onClick={() => setShowCreateModal(true)}
//                 className="text-sm font-semibold text-slate-600 hover:bg-slate-100 px-4 py-2.5 rounded flex items-center gap-2 w-full transition-colors border border-dashed border-slate-300 hover:border-slate-400 justify-center"
//               >
//                  <Plus className="w-4 h-4" /> Create Sprint
//               </button>
//            </div>
//         </div>

//       </div>

//       {/* MODALS */}
//       <CreateSprintModal
//         isOpen={showCreateModal}
//         onClose={() => setShowCreateModal(false)}
//         projectId={Number(projectId)}
//         onCreated={() => {
//           setShowCreateModal(false);
//           loadData(true);
//           showToast("Sprint created successfully!", "success");
//         }}
//       />

//       {/* 🔥 Create Task Modal */}
//       {createTaskSprintId !== null && (
//         <CreateTaskModal
//           isOpen={true}
//           onClose={() => setCreateTaskSprintId(null)}
//           projectId={Number(projectId)}
//           workspaceId={workspaceId}
//           sprintId={createTaskSprintId}
//           onCreated={async () => {
//             const sid = createTaskSprintId;
//             setCreateTaskSprintId(null);
//             await loadData(true);
//             if (sid) await manualReloadSprint(sid);
//             showToast("Task created successfully!", "success");
//           }}
//         />
//       )}
//     </div>
//   );
// }