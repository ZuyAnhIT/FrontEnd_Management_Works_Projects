"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Loader2, LayoutList } from "lucide-react";

// ✅ Import Drag & Drop
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";

// API & Types
import { 
  getProjectBacklog, 
  getProjectMembers, 
  ProjectBacklogResponse, 
  BacklogQueryParams,
  TaskSummary,
  ProjectMember
} from "@/services/apiProject";
import { moveTaskToSprint } from "@/services/apiTask";

// Components UI
import { Button } from "@/components/ui/button";
import BacklogHeader from "@/components/features/core/backlog/BacklogHeader";
import BacklogToolbar from "@/components/features/core/backlog/BacklogToolbar";
import SprintSection from "@/components/features/core/backlog/SprintSection";
import BacklogTaskItem from "@/components/features/core/backlog/BacklogTaskItem";
import TaskDetailPanel from "@/components/features/core/task/TaskDetailPanel";

// Components Logic
import QuickTaskCreate from "@/components/features/core/task/QuickTaskCreate";
import CreateTaskModal from "@/components/features/core/task/CreateTaskModal";
import QuickSprintButton from "@/components/features/core/sprint/QuickSprintButton";
import SprintDetailModal from "@/components/features/core/sprint/SprintDetailModal";

export default function BacklogPage() {
  const params = useParams();
  const { showToast } = useToast();
  const { activeCompany, isLoading: isAuthLoading } = useAuth();

  const companyId = activeCompany?.companyId;
  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  // --- STATE DATA ---
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [data, setData] = useState<ProjectBacklogResponse | null>(null);
  const [backlogTasks, setBacklogTasks] = useState<TaskSummary[]>([]); 
  const [members, setMembers] = useState<ProjectMember[]>([]); 

  // --- STATE UI ---
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // --- FILTER STATE ---
  const [filters, setFilters] = useState<BacklogQueryParams>({
    keyword: "",
    page: 0,
    size: 20, 
    sortBy: "createdAt",
    sortDir: "desc",
  });

  // ===============================================================
  // 1. FETCH MEMBERS
  // ===============================================================
  useEffect(() => {
    if (!companyId || !workspaceId || !projectId) return;
    
    getProjectMembers(companyId, workspaceId, projectId, { size: 100 })
        .then(res => setMembers(res.content))
        .catch(() => console.error("Failed to load members"));
  }, [companyId, workspaceId, projectId]);


  // ===============================================================
  // 2. FETCH BACKLOG DATA
  // ===============================================================
  const fetchData = useCallback(async (isLoadMore = false) => {
    if (!companyId) return;
    
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getProjectBacklog(companyId, workspaceId, projectId, filters);
      
      setData(res);
      
      if (isLoadMore) {
         setBacklogTasks(prev => [...prev, ...res.backlogTasks]);
      } else {
         setBacklogTasks(res.backlogTasks);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load backlog", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [companyId, workspaceId, projectId, filters, showToast]);

  // Auto reload logic (Debounce + Reset page)
  useEffect(() => {
    if (isAuthLoading) return;

    const t = setTimeout(() => {
       if (filters.page === 0) {
           fetchData(false);
       }
    }, 300);

    return () => clearTimeout(t);
  }, [filters, isAuthLoading, fetchData]); 

  // Pagination Load More
  useEffect(() => {
      if (isAuthLoading) return;
      if ((filters.page || 0) > 0) fetchData(true);
  }, [filters.page, isAuthLoading]); 


  // ===============================================================
  // 3. DRAG & DROP LOGIC
  // ===============================================================
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    // --- Optimistic UI Update ---
    const newBacklogTasks = [...backlogTasks];
    const newSprints = data?.activeSprints ? [...data.activeSprints] : [];
    let movedTask: TaskSummary | undefined;

    // A. Remove from Source
    if (sourceId === 'backlog') {
        [movedTask] = newBacklogTasks.splice(source.index, 1);
        setBacklogTasks(newBacklogTasks);
    } else {
        const sprintId = Number(sourceId.split('-')[1]);
        const sprintIndex = newSprints.findIndex(s => s.id === sprintId);
        if (sprintIndex !== -1) {
            const sprintTasks = [...newSprints[sprintIndex].tasks];
            [movedTask] = sprintTasks.splice(source.index, 1);
            newSprints[sprintIndex] = { ...newSprints[sprintIndex], tasks: sprintTasks, taskCount: sprintTasks.length };
            setData(prev => prev ? { ...prev, activeSprints: newSprints } : null);
        }
    }

    if (!movedTask) return;

    // B. Add to Destination
    if (destId === 'backlog') {
        newBacklogTasks.splice(destination.index, 0, movedTask);
        setBacklogTasks(newBacklogTasks);
    } else {
        const sprintId = Number(destId.split('-')[1]);
        const sprintIndex = newSprints.findIndex(s => s.id === sprintId);
        if (sprintIndex !== -1) {
            const sprintTasks = [...newSprints[sprintIndex].tasks];
            sprintTasks.splice(destination.index, 0, movedTask);
            newSprints[sprintIndex] = { ...newSprints[sprintIndex], tasks: sprintTasks, taskCount: sprintTasks.length };
            setData(prev => prev ? { ...prev, activeSprints: newSprints } : null);
        }
    }

    // C. Call API
    try {
        const taskId = Number(draggableId);
        const targetSprintId = destId === 'backlog' ? null : Number(destId.split('-')[1]);
        await moveTaskToSprint(taskId, targetSprintId, destination.index);
    } catch (error) {
        showToast("Failed to move task. Reverting...", "error");
        handleRefresh(); // Rollback
    }
  };

  // ===============================================================
  // 4. HANDLERS
  // ===============================================================
  const handleRefresh = () => fetchData(false);
  const handleLoadMore = () => setFilters(prev => ({ ...prev, page: (prev.page || 0) + 1 }));

  // ===============================================================
  // 5. RENDER
  // ===============================================================
  if (isAuthLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;
  if (!companyId) return <div className="p-8 text-center">No Active Company</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
       
       <BacklogHeader 
          totalTasks={data?.backlogTotalElements || 0} 
          onCreateClick={() => setIsCreateTaskModalOpen(true)}
          onRefresh={handleRefresh} 
       />

       <DragDropContext onDragEnd={onDragEnd}>
           <div className="flex flex-1 overflow-hidden relative">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 transition-all duration-300">
                 <div className={`mx-auto pb-20 ${selectedTaskId ? 'max-w-full' : 'max-w-[1800px]'}`}>
                    
                    <BacklogToolbar 
                       filters={filters}
                       setFilters={setFilters}
                       members={members}
                    />

                    {loading && (!filters.page || filters.page === 0) ? (
                       <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
                    ) : (
                       <>
                          {/* ACTIVE SPRINTS */}
                          {data?.activeSprints && (
                             <div className="animate-fadeInUp mb-6">
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                                   Active Sprints ({data.activeSprints.length})
                                </h2>
                                <SprintSection 
                                    sprints={data.activeSprints} 
                                    onTaskClick={(id) => setSelectedTaskId(id)} 
                                    onTaskCreated={handleRefresh} 
                                    onSprintSettingsClick={(id) => setSelectedSprintId(id)}
                                    onRefresh={handleRefresh} // ✅ Quan trọng: Truyền hàm refresh xuống để Start/Complete sprint hoạt động
                                />
                             </div>
                          )}

                          {/* QUICK SPRINT BUTTON */}
                          <div className="mb-6">
                              <QuickSprintButton 
                                  projectId={projectId} 
                                  onSuccess={handleRefresh} 
                              />
                          </div>

                          {/* BACKLOG SECTION */}
                          <div className="animate-fadeInUp delay-100">
                             <div className="flex items-center justify-between mb-3 px-1">
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                   Backlog ({data?.backlogTotalElements || 0} issues)
                                </h2>
                                <span className="text-[10px] text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">Unscheduled</span>
                             </div>

                             <div className="bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 min-h-[100px]">
                                {/* Droppable Backlog */}
                                <Droppable droppableId="backlog" type="TASK">
                                   {(provided, snapshot) => (
                                      <div 
                                         ref={provided.innerRef} 
                                         {...provided.droppableProps}
                                         className={`space-y-2 mb-2 min-h-[50px] transition-colors rounded-lg ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                                      >
                                         {backlogTasks.length > 0 ? (
                                            backlogTasks.map((task, index) => (
                                               <BacklogTaskItem 
                                                  key={task.id} 
                                                  task={task} 
                                                  index={index} 
                                                  onClick={() => setSelectedTaskId(task.id)}
                                               />
                                            ))
                                         ) : (
                                            !snapshot.isDraggingOver && (
                                                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                                    <LayoutList className="w-10 h-10 mb-2 opacity-50" />
                                                    <p className="text-sm">Backlog is empty.</p>
                                                </div>
                                            )
                                         )}
                                         {provided.placeholder}
                                      </div>
                                   )}
                                </Droppable>

                                <div className="px-1">
                                    <QuickTaskCreate 
                                        companyId={companyId!}
                                        workspaceId={workspaceId}
                                        projectId={projectId}
                                        sprintId={null} 
                                        onSuccess={handleRefresh}
                                    />
                                </div>
                             </div>

                             {data && !data.last && (
                                <div className="mt-4 text-center">
                                   <Button variant="ghost" onClick={handleLoadMore} disabled={loadingMore} className="text-slate-500">
                                      {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null} Load More
                                   </Button>
                                </div>
                             )}
                          </div>
                       </>
                    )}
                 </div>
              </div>

              {/* Panels */}
              {selectedTaskId && (
                  <TaskDetailPanel 
                     taskId={selectedTaskId} 
                     onClose={() => setSelectedTaskId(null)}
                     onUpdate={handleRefresh}
                     members={members}
                     sprints={data?.activeSprints}
                  />
              )}
           </div>
       </DragDropContext>

       {/* Modals */}
       {selectedSprintId && (
          <SprintDetailModal 
             projectId={projectId}
             sprintId={selectedSprintId}
             onClose={() => setSelectedSprintId(null)}
             onUpdate={handleRefresh}
          />
       )}

       <CreateTaskModal 
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          onSuccess={handleRefresh}
          companyId={companyId!}
          workspaceId={workspaceId}
          projectId={projectId}
          members={members}
       />
    </div>
  );
}