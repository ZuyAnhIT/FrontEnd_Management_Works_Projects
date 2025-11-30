"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Loader2, LayoutList, Plus, CalendarPlus } from "lucide-react"; // Thêm icon cho nút tạo

// --- DND KIT IMPORTS ---
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

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
// Lưu ý: Không cần BacklogToolbar nữa vì filter đã lên Header
import SprintSection from "@/components/features/core/backlog/SprintSection";
import BacklogTaskItem from "@/components/features/core/backlog/BacklogTaskItem";
import TaskDetailPanel from "@/components/features/core/task/TaskDetailPanel";

// Components Logic
import QuickTaskCreate from "@/components/features/core/task/QuickTaskCreate";
import CreateTaskModal from "@/components/features/core/task/CreateTaskModal";
import QuickSprintButton from "@/components/features/core/sprint/QuickSprintButton"; // Có thể bỏ nếu dùng nút trên Header
import SprintDetailModal from "@/components/features/core/sprint/SprintDetailModal";
import CreateSprintModal from "@/components/features/core/sprint/CreateSprintModal"; // ✅ Import Modal tạo Sprint

// --- Helper Component: Droppable Area ---
function BacklogDroppableArea({ children, id }: { children: React.ReactNode, id: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "Backlog", id }
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 mb-2 min-h-[50px] transition-colors rounded-lg ${isOver ? 'bg-blue-50/50' : ''}`}
    >
      {children}
    </div>
  );
}

function normalizeSprint(raw: any) {
  return {
    ...raw,
    status: raw.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
  };
}

export default function BacklogPage() {
  const params = useParams();
  const router = useRouter();
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
  
  // Modal States
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false); // ✅ State cho Sprint Modal

  // DND Active State
  const [activeTask, setActiveTask] = useState<TaskSummary | null>(null);

  // --- FILTER STATE ---
  const [filters, setFilters] = useState<BacklogQueryParams>({
    keyword: "",
    page: 0,
    size: 20,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  // --- SENSORS ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  // ===============================================================
  // 1. FETCH DATA
  // ===============================================================
  useEffect(() => {
    if (!companyId || !workspaceId || !projectId) return;
    getProjectMembers(companyId, workspaceId, projectId, { size: 100 })
      .then(res => setMembers(res.content))
      .catch(() => console.error("Failed to load members"));
  }, [companyId, workspaceId, projectId]);

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

  // Debounce & Pagination Logic
  useEffect(() => {
    if (isAuthLoading) return;
    const t = setTimeout(() => {
      if (filters.page === 0) fetchData(false);
    }, 300);
    return () => clearTimeout(t);
  }, [filters, isAuthLoading, fetchData]);

  useEffect(() => {
    if (isAuthLoading) return;
    if ((filters.page || 0) > 0) fetchData(true);
  }, [filters.page, isAuthLoading]);

  // ===============================================================
  // 2. DRAG & DROP LOGIC
  // ===============================================================
  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Helper find container
    const findContainerId = (itemId: string) => {
      if (backlogTasks.some(t => t.id.toString() === itemId)) return 'backlog';
      if (data?.activeSprints) {
        for (const s of data.activeSprints) {
          if (s.tasks.some(t => t.id.toString() === itemId)) return `sprint-${s.id}`;
        }
      }
      return null;
    };

    const sourceId = findContainerId(activeId);
    
    let destId = overId;
    if (activeId !== overId && !overId.startsWith('backlog') && !overId.startsWith('sprint-')) {
      destId = findContainerId(overId) || overId;
    }
    if (over.data.current?.type === 'Backlog') destId = 'backlog';
    if (over.data.current?.type === 'Sprint') destId = over.id.toString();

    if (!sourceId || !destId || sourceId === destId) return;

    // --- Optimistic Update ---
    const newBacklogTasks = [...backlogTasks];
    const newSprints = data?.activeSprints ? [...data.activeSprints] : [];
    let movedTask: TaskSummary | undefined;

    // Remove from Source
    if (sourceId === 'backlog') {
      const idx = newBacklogTasks.findIndex(t => t.id.toString() === activeId);
      if (idx !== -1) {
        [movedTask] = newBacklogTasks.splice(idx, 1);
        setBacklogTasks(newBacklogTasks);
      }
    } else {
      const sprintId = Number(sourceId.split('-')[1]);
      const sprintIndex = newSprints.findIndex(s => s.id === sprintId);
      if (sprintIndex !== -1) {
        const sprintTasks = [...newSprints[sprintIndex].tasks];
        const idx = sprintTasks.findIndex(t => t.id.toString() === activeId);
        if (idx !== -1) {
          [movedTask] = sprintTasks.splice(idx, 1);
          newSprints[sprintIndex] = { ...newSprints[sprintIndex], tasks: sprintTasks, taskCount: sprintTasks.length };
          setData(prev => prev ? { ...prev, activeSprints: newSprints } : null);
        }
      }
    }

    if (!movedTask) return;

    // Calculate Dest Index
    let destinationIndex = 0;
    if (destId === 'backlog') {
      if (over.data.current?.sortable?.index !== undefined) {
        destinationIndex = over.data.current.sortable.index;
      } else {
        destinationIndex = newBacklogTasks.length;
      }
    } else {
      const sprintId = Number(destId.split('-')[1]);
      const sprint = newSprints.find(s => s.id === sprintId);
      destinationIndex = sprint ? sprint.tasks.length : 0;
    }

    // Add to Destination
    if (destId === 'backlog') {
      newBacklogTasks.splice(destinationIndex, 0, movedTask);
      setBacklogTasks(newBacklogTasks);
    } else {
      const sprintId = Number(destId.split('-')[1]);
      const sprintIndex = newSprints.findIndex(s => s.id === sprintId);
      if (sprintIndex !== -1) {
        const sprintTasks = [...newSprints[sprintIndex].tasks];
        sprintTasks.splice(destinationIndex, 0, movedTask);
        newSprints[sprintIndex] = { ...newSprints[sprintIndex], tasks: sprintTasks, taskCount: sprintTasks.length };
        setData(prev => prev ? { ...prev, activeSprints: newSprints } : null);
      }
    }

    // Call API
    try {
      const taskId = Number(activeId);
      const targetSprintId = destId === 'backlog' ? null : Number(destId.split('-')[1]);
      await moveTaskToSprint(taskId, targetSprintId, destinationIndex);
    } catch (error) {
      showToast("Failed to move task. Reverting...", "error");
      handleRefresh();
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
  };
  const backlogTaskIds = useMemo(() => backlogTasks.map(t => t.id.toString()), [backlogTasks]);

  // ===============================================================
  // 3. HANDLERS
  // ===============================================================
  const handleRefresh = () => fetchData(false);
  const handleLoadMore = () => setFilters(prev => ({ ...prev, page: (prev.page || 0) + 1 }));

  if (isAuthLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!companyId) return <div className="p-8 text-center">No Active Company</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">

      {/* ✅ 1. HEADER: Tiêu đề & Bộ lọc (Góc phải) */}
      <BacklogHeader
        totalTasks={data?.backlogTotalElements || 0}
        projectId={projectId}
        filters={filters}
        setFilters={setFilters}
        members={members}
        onCreateClick={() => setIsCreateTaskModalOpen(true)} // (Prop thừa nhưng cứ để tránh lỗi type nếu chưa sửa Header)
        onRefresh={handleRefresh} // (Prop thừa)
      />

      {/* ✅ 2. ACTION BAR: 2 Nút tạo nằm dưới Header, căn phải */}
      <div className="flex items-center justify-end gap-3 px-6 py-3 bg-white border-b border-slate-200 shrink-0">
          {/* Create Sprint */}
          <Button
             variant="outline"
             size="sm"
             onClick={() => setIsSprintModalOpen(true)}
             className="h-8 bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-blue-600 font-medium shadow-sm"
          >
             <CalendarPlus className="w-4 h-4 mr-2" />
             Create Sprint
          </Button>

          {/* Create Issue */}
          <Button
            size="sm"
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="h-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> 
            Create Issue
          </Button>
      </div>

      {/* ✅ 3. MAIN CONTENT (Scrollable) */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 transition-all duration-300 pt-4">
            <div className={`mx-auto pb-20 ${selectedTaskId ? 'max-w-full' : 'max-w-[1800px]'}`}>

              {loading && (!filters.page || filters.page === 0) ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
              ) : (
                <>
                  {/* A. ACTIVE SPRINTS */}
                  {data?.activeSprints && (
                    <div className="animate-fadeInUp mb-6">
                      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                        Active Sprints ({data.activeSprints.length})
                      </h2>
                      <SprintSection
                        sprints={data.activeSprints.map(normalizeSprint)}
                        onTaskClick={(id) => setSelectedTaskId(id)}
                        onTaskCreated={handleRefresh}
                        onSprintSettingsClick={(id) => setSelectedSprintId(id)}
                        onRefresh={handleRefresh}
                      />
                    </div>
                  )}

                  {/* B. BACKLOG SECTION */}
                  <div className="animate-fadeInUp delay-100">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Backlog ({data?.backlogTotalElements || 0} issues)
                      </h2>
                      <span className="text-[10px] text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">Unscheduled</span>
                    </div>

                    <div className="bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 min-h-[100px]">
                      {/* Droppable Area */}
                      <BacklogDroppableArea id="backlog">
                        <SortableContext items={backlogTaskIds} strategy={verticalListSortingStrategy}>
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
                            activeTask === null && (
                              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <LayoutList className="w-10 h-10 mb-2 opacity-50" />
                                <p className="text-sm">Backlog is empty.</p>
                              </div>
                            )
                          )}
                        </SortableContext>
                      </BacklogDroppableArea>

                      {/* Quick Create IN Backlog */}
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

                    {/* Pagination */}
                    {data && data.backlogPageNumber + 1 < data.backlogTotalPages && (
                      <div className="mt-4 text-center">
                        <Button variant="ghost" onClick={handleLoadMore} disabled={loadingMore} className="text-slate-500">
                          {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Load More
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
        companyId={companyId}       // 🔥 BẮT BUỘC
        workspaceId={workspaceId}   // 🔥 BẮT BUỘC
        projectId={projectId}       // 🔥 BẮT BUỘC
    />
)}

        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? (
            <BacklogTaskItem task={activeTask} index={0} />
          ) : null}
        </DragOverlay>

      </DndContext>

      {/* --- MODALS --- */}
      
      {/* Modal: Sprint Details/Edit */}
      {selectedSprintId && (
        <SprintDetailModal
          projectId={projectId}
          sprintId={selectedSprintId}
          onClose={() => setSelectedSprintId(null)}
          onUpdate={handleRefresh}
        />
      )}

      {/* Modal: Create Sprint (New) */}
      <CreateSprintModal
         isOpen={isSprintModalOpen}
         onClose={() => setIsSprintModalOpen(false)}
         onSuccess={handleRefresh}
         projectId={projectId}
      />

      {/* Modal: Create Task */}
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