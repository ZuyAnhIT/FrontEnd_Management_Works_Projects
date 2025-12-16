"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    pointerWithin,
    rectIntersection,
    defaultDropAnimationSideEffects,
    DropAnimation,
    CollisionDetection,
} from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Loader2, AlertCircle } from "lucide-react";

// Services & Hooks
import {
    getProjectBoardData,
    getProjectStatuses,
    BoardColumnResponse,
    RawBoardColumn,
    RawStatusColumn,
    moveTaskToStatus,
    BoardFilterParams,
    reorderProjectStatuses,
} from "@/services/apiBoard";
import { getProjectMembers, ProjectMember, TaskSummary } from "@/services/apiProject";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { useProjectRole } from "@/hooks/useProjectRole"; // ✅ Import Hook

// Components
import BoardHeader from "@/components/features/core/board/BoardHeader";
import BoardColumn from "@/components/features/core/board/BoardColumn";
import CreateColumnButton from "@/components/features/core/board/CreateColumnButton";
import BoardTaskCard from "@/components/features/core/board/BoardTaskCard";
import TaskDetailModalFloating from "@/components/features/core/task/TaskDetailModalFloating";
import TaskDetailPanel from "@/components/features/core/task/TaskDetailPanel";
import { Chatbot } from "@/components/chatbot/chatbot";

export default function BoardPage() {
    const params = useParams();
    const router = useRouter(); 
    const { showToast } = useToast();
    const { activeCompany, isLoading: isAuthLoading } = useAuth();

    // Lấy IDs
    const paramCompanyId = Number(params.companyId);
    const companyId = !isNaN(paramCompanyId) ? paramCompanyId : activeCompany?.companyId;
    const workspaceId = Number(params.workspaceId);
    const projectId = Number(params.projectId);

    // ✅ 1. Lấy quyền Guest
    const { isGuest } = useProjectRole(projectId);

    // --- STATE ---
    const [columns, setColumns] = useState<BoardColumnResponse[]>([]);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeColumn, setActiveColumn] = useState<BoardColumnResponse | null>(null);
    const [activeTask, setActiveTask] = useState<TaskSummary | null>(null);

    // Task Detail Modal State
    const [viewMode, setViewMode] = useState<'panel' | 'floating'>('panel'); 
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [filters, setFilters] = useState<BoardFilterParams>({
        keyword: "",
        sprintId: null,
        assigneeId: undefined,
        priority: undefined,
        taskType: undefined,
    });

    // --- SENSORS CONFIGURATION (Logic nghiệp vụ quan trọng) ---
    // ✅ 2. Disable sensors nếu là Guest để chặn kéo thả
    const sensors = useSensors(
        useSensor(PointerSensor, { 
            activationConstraint: { distance: 5 }, 
            disabled: isGuest // ⛔ DISABLE IF GUEST
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
            disabled: isGuest // ⛔ DISABLE IF GUEST
        })
    );

    // --- HELPER NORMALIZE DATA ---
    const normalizeData = (boardData: RawBoardColumn[], statusList: RawStatusColumn[]): BoardColumnResponse[] => {
        const columnMap = new Map<number, BoardColumnResponse>();
        
        // 1. Init from Status List
        if (Array.isArray(statusList)) {
            statusList.forEach((st) => {
                columnMap.set(st.id, { 
                    id: st.id, 
                    name: st.name, 
                    color: st.color, 
                    position: st.sortOrder, 
                    isCompletedStatus: st.isCompletedStatus, 
                    tasks: [], 
                });
            });
        }
        
        // 2. Fill Tasks
        if (Array.isArray(boardData)) {
            boardData.forEach((bd) => {
                const existingCol = columnMap.get(bd.statusId);
                if (existingCol) { 
                    existingCol.tasks = bd.tasks || []; 
                } else {
                    columnMap.set(bd.statusId, { 
                        id: bd.statusId, 
                        name: bd.statusName, 
                        color: bd.color || "#000000", 
                        position: bd.order || 0, 
                        isCompletedStatus: bd.isCompleted || false, 
                        tasks: bd.tasks || [], 
                    });
                }
            });
        }
        return Array.from(columnMap.values()).sort((a, b) => a.position - b.position);
    };

    // --- FETCH BOARD DATA ---
    const fetchBoardData = useCallback(async () => {
        if (isAuthLoading) return;
        if (!companyId || !workspaceId || !projectId) return;
        
        setLoading(true); 
        setError(null);
        
        try {
            const [rawBoardData, rawStatusList, membersRes] = await Promise.all([
                getProjectBoardData(companyId, workspaceId, projectId, filters),
                getProjectStatuses(projectId),
                getProjectMembers(companyId, workspaceId, projectId, { size: 100 }),
            ]);
            
            setMembers(membersRes.content || []);
            const normalizedColumns = normalizeData(rawBoardData, rawStatusList);
            setColumns(normalizedColumns);
        } catch (err: any) {
            console.error("API ERROR:", err); 
            const message = err.response?.data?.message || err.message || "Failed to load board data";
            setError(message); 
            showToast(message, "error");
        } finally { 
            setLoading(false); 
        }
    }, [companyId, workspaceId, projectId, filters, showToast, isAuthLoading]);

    useEffect(() => {
        const t = setTimeout(() => { if (!isAuthLoading && companyId) fetchBoardData(); }, 300);
        return () => clearTimeout(t);
    }, [fetchBoardData, isAuthLoading, companyId]);

    // --- COLUMN & TASK HANDLERS ---
    const handleColumnCreated = (newStatusData: any) => {
        const newColumn: BoardColumnResponse = { 
            id: newStatusData.id, 
            name: newStatusData.name, 
            color: newStatusData.color, 
            position: newStatusData.sortOrder, 
            isCompletedStatus: newStatusData.isCompletedStatus, 
            tasks: [], 
        };
        setColumns((prev) => [...prev, newColumn]); 
        showToast("Column created successfully", "success");
    };

    const handleColumnDeleted = (columnId: string) => { 
        setColumns((prev) => prev.filter((col) => String(col.id) !== columnId)); 
        showToast("Column deleted successfully", "success");
    };
    
    const handleTaskClick = (task: TaskSummary) => {
        setSelectedTaskId(task.id);
        setIsModalOpen(true);
    };

    const handleTaskUpdate = () => {
        fetchBoardData(); // Reload board data
    };

    // --- DND LOGIC ---
    const customCollisionDetection: CollisionDetection = useCallback((args) => {
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) return pointerCollisions;
        return rectIntersection(args);
    }, []);

    const onDragStart = (event: DragStartEvent) => {
        if (isGuest) return; // Block logic
        if (event.active.data.current?.type === "Column") { setActiveColumn(event.active.data.current.column); return; }
        if (event.active.data.current?.type === "Task") { setActiveTask(event.active.data.current.task); return; }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        if (isGuest) return; // Block logic
        
        const { active, over } = event;
        setActiveColumn(null); setActiveTask(null);
        if (!over) return;

        // 1. COLUMN REORDER
        if (active.data.current?.type === "Column") {
            if (active.id === over.id) return;

            const oldIndex = columns.findIndex((col) => col.id.toString() === active.id);
            const newIndex = columns.findIndex((col) => col.id.toString() === over.id);

            const newColumns = arrayMove(columns, oldIndex, newIndex);
            setColumns(newColumns);

            try {
                const orderedStatusIds = newColumns.map(col => Number(col.id));
                await reorderProjectStatuses(projectId, orderedStatusIds);
                showToast("Column reordered successfully", "success");
            } catch (error: any) {
                console.error("Reorder failed:", error);
                const message = error.response?.data?.message || error.message || "Reorder failed. Reverting...";
                showToast(message, "error");
                fetchBoardData();
            }
            return;
        }

        // 2. TASK MOVE/REORDER
        if (active.data.current?.type === "Task") {
            const activeId = active.id; const overId = over.id;
            const sourceCol = columns.find((col) => col.tasks.some((t) => t.id.toString() === activeId));
            let destCol = columns.find((col) => col.id.toString() === over.id);
            
            if (!destCol) { destCol = columns.find((col) => col.tasks.some((t) => t.id.toString() === over.id)); }
            if (!sourceCol || !destCol) return;
            if (sourceCol.id === destCol.id && activeId === over.id) return;

            // Optimistic Update
            const sourceColIndex = columns.findIndex((c) => c.id === sourceCol.id);
            const destColIndex = columns.findIndex((c) => c.id === destCol.id);
            const newColumns = JSON.parse(JSON.stringify(columns)); // Deep copy
            const newSourceCol = newColumns[sourceColIndex];
            const newDestCol = newColumns[destColIndex];
            const oldIndex = newSourceCol.tasks.findIndex((t: TaskSummary) => t.id.toString() === activeId);
            
            let newIndex;
            if (over.data.current?.type === "Column") { 
                newIndex = newDestCol.tasks.length; 
            } else {
                const overTaskIndex = newDestCol.tasks.findIndex((t: TaskSummary) => t.id.toString() === over.id);
                const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overTaskIndex >= 0 ? overTaskIndex + modifier : newDestCol.tasks.length;
            }

            const [movedTask] = newSourceCol.tasks.splice(oldIndex, 1);
            movedTask.statusId = newDestCol.id;
            newDestCol.tasks.splice(newIndex, 0, movedTask);
            setColumns(newColumns);

            try {
                await moveTaskToStatus(Number(activeId), { 
                    newStatusId: Number(newDestCol.id), 
                    newSortOrder: newIndex, 
                });
                showToast("Task moved successfully", "success");
            } catch (error: any) {
                console.error("Move failed:", error); 
                const message = error.response?.data?.message || error.message || "Move failed. Reverting...";
                showToast(message, "error"); 
                fetchBoardData();
            }
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
    };
    const columnIds = useMemo(() => columns.map((col) => col.id.toString()), [columns]);

    // --- RENDER UI ---
    if (isAuthLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-white overflow-hidden">
            {/* Header & Filter (Guest vẫn dùng được) */}
            <BoardHeader 
                filters={filters} 
                setFilters={setFilters} 
                members={members} 
                totalTasks={columns.reduce((acc, col) => acc + (col.tasks?.length || 0), 0)} 
            />

            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-white">
                {loading && columns.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                        <p className="text-sm text-slate-500 font-medium">Loading board...</p>
                    </div>
                ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center text-red-500 gap-3">
                        <AlertCircle className="w-10 h-10 opacity-80" />
                        <p className="font-medium">{error}</p>
                        <button onClick={fetchBoardData} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md shadow-sm hover:bg-red-50 font-semibold text-sm">
                            Try Again
                        </button>
                    </div>
                ) : (
                    <DndContext 
                        sensors={sensors} // ✅ Disabled if Guest
                        collisionDetection={customCollisionDetection} 
                        onDragStart={onDragStart} 
                        onDragEnd={onDragEnd}
                    >
                        <div className="h-full flex px-6 pt-6 pb-4 gap-4 items-start min-w-max">
                            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                                {columns.map((col, index) => (
                                    <BoardColumn 
                                        key={col.id} 
                                        column={col} 
                                        index={index} 
                                        projectId={projectId} 
                                        members={members} 
                                        onDeleteColumn={handleColumnDeleted} 
                                        // ✅ Truyền hàm click task (cho phép xem chi tiết)
                                        onTaskClick={handleTaskClick}
                                        // ✅ Truyền quyền readOnly để ẩn nút "Add Task" và chặn edit cột
                                        isReadOnly={isGuest} 
                                    />
                                ))}
                            </SortableContext>
                            
                            {/* ✅ 3. Ẩn nút tạo cột nếu là Guest */}
                            {!isGuest && (
                                <CreateColumnButton projectId={projectId} onSuccess={handleColumnCreated} />
                            )}
                        </div>
                        
                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeColumn && (
                                <div className="h-full cursor-grabbing opacity-90 scale-[1.02] shadow-2xl rounded-xl bg-transparent">
                                    <div className="h-full bg-[#F4F5F7] rounded-xl border-2 border-blue-500">
                                        <BoardColumn column={activeColumn} index={0} projectId={projectId} members={members} /> 
                                    </div>
                                </div>
                            )}
                            {activeTask && (
                                <BoardTaskCard task={activeTask} index={0} users={members} /> 
                            )}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>

            {/* ✅ RENDER MODAL CHI TIẾT VỚI CHẾ ĐỘ READ-ONLY */}
            {/* TRƯỜNG HỢP 1: HIỆN PANEL DỌC */}
            {isModalOpen && selectedTaskId && viewMode === 'panel' && (
                <TaskDetailPanel
                    taskId={selectedTaskId}
                    onClose={() => setIsModalOpen(false)}
                    onSwitchToFloating={() => setViewMode('floating')} 
                    onUpdate={handleTaskUpdate} 
                    
                    // Data Props
                    members={members}
                    statuses={columns.map(c => ({ id: c.id, name: c.name, color: c.color }))} 
                    sprints={[]} 
                    epics={[]} 
                    
                    // Context IDs
                    companyId={companyId!}
                    workspaceId={workspaceId}
                    projectId={projectId}

                    // ✅ 4. Bật chế độ chỉ xem (Cho phép comment/upload)
                    readOnly={isGuest} 
                />
            )}

            {/* TRƯỜNG HỢP 2: HIỆN MODAL NỔI */}
            {isModalOpen && selectedTaskId && viewMode === 'floating' && (
                <TaskDetailModalFloating
                    taskId={selectedTaskId}
                    isOpen={true}
                    onClose={() => setIsModalOpen(false)}
                    onSwitchToPanel={() => setViewMode('panel')} 
                    onUpdate={handleTaskUpdate}
                    
                    members={members}
                    statuses={columns.map(c => ({ id: c.id, name: c.name, color: c.color }))}
                    sprints={[]} 
                    epics={[]}
                    
                    companyId={companyId!}
                    workspaceId={workspaceId}
                    projectId={projectId}

                    // ✅ 4. Bật chế độ chỉ xem
                    readOnly={isGuest}
                />
            )}
            <Chatbot />
        </div>
    );
}