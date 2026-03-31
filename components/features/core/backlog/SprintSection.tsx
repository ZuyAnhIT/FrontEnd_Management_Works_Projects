"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

// Thư viện bên ngoài
import React, { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Rocket,
  Calendar,
  Trash2,
  Edit,
} from "lucide-react";

// Internal Services & Contexts
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Sprint,
  startSprint,
  completeSprint,
  deleteSprint,
} from "@/services/apiSprint";

// Internal Components & Utils
import { Button } from "@/components/ui/Buttons";
import BacklogTaskItem from "./BacklogTaskItem";
import QuickTaskCreate from "@/components/features/core/task/QuickTaskCreate";
import SprintActionModals from "@/components/features/core/sprint/SprintActionModals";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS, TYPES & HELPERS
// =============================================================================

type SprintActionType = "START" | "COMPLETE" | "DELETE";

interface SprintSectionProps {
  sprints: Sprint[];
  onTaskClick: (taskId: number) => void;
  onTaskCreated?: () => void;
  onSprintSettingsClick: (sprintId: number) => void;
  onRefresh: () => void;
}

/**
 * Định dạng ngày tháng hiển thị dạng ngắn gọn (Ví dụ: "Oct 24")
 */
const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "—";
  }
};

// =============================================================================
// 3. SUB-COMPONENTS
// =============================================================================

/**
 * Thành phần vùng thả (Droppable Area) dành riêng cho Sprint.
 * Định nghĩa khu vực mà các thẻ công việc (Tasks) có thể được thả vào.
 */
function SprintDroppable({
  id,
  children,
  isExpanded,
}: {
  id: string;
  children: React.ReactNode;
  isExpanded: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "Sprint", id }, 
  });

  if (!isExpanded) return null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-2 min-h-[60px] transition-colors duration-200 rounded-b-xl",
        isOver ? "bg-blue-50/50 ring-2 ring-blue-400 ring-inset" : ""
      )}
    >
      {children}
    </div>
  );
}

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Phân vùng hiển thị danh sách các Sprints trong màn hình Backlog.
 * Quản lý trạng thái mở rộng, hành động thao tác (Start/Complete/Delete) và chứa danh sách Task.
 */
export default function SprintSection({
  sprints,
  onTaskClick,
  onTaskCreated,
  onSprintSettingsClick,
  onRefresh,
}: SprintSectionProps) {
  
  // ---------------------------------------------------------------------------
  // 5. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { activeCompany } = useAuth();
  const params = useParams();
  const { showToast } = useToast();

  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  // Trạng thái mở rộng mặc định cho tất cả các sprint
  const [expanded, setExpanded] = useState<Record<number, boolean>>(
    sprints.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  // Trạng thái menu dropdown và modal
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<SprintActionType | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  
  // Trạng thái xử lý API
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------------------------------------------------------------------------
  // 6. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Chuyển đổi trạng thái đóng/mở của một sprint
   */
  const toggleSprint = useCallback((id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /**
   * Mở modal xác nhận cho các hành động quan trọng
   */
  const openActionModal = useCallback((type: SprintActionType, sprint: Sprint) => {
    setSelectedSprint(sprint);
    setModalType(type);
    setMenuOpenId(null); 
  }, []);

  /**
   * Xử lý thực thi hành động sau khi người dùng xác nhận trên modal
   */
  const handleConfirmAction = async () => {
    if (!selectedSprint || !modalType) return;

    setIsProcessing(true);
    try {
      switch (modalType) {
        case "START":
          await startSprint(projectId, selectedSprint.id);
          showToast(`Sprint "${selectedSprint.name}" has been started`, "success");
          break;

        case "COMPLETE":
          await completeSprint(projectId, selectedSprint.id);
          showToast(`Sprint "${selectedSprint.name}" has been completed`, "success");
          break;

        case "DELETE":
          await deleteSprint(projectId, selectedSprint.id);
          const isCanceled = selectedSprint.status === "IN_PROGRESS";
          showToast(`Sprint has been ${isCanceled ? "canceled" : "deleted"}`, "success");
          break;
      }

      onRefresh(); 
      setModalType(null);
      setSelectedSprint(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to execute sprint action";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 7. RENDER
  // ---------------------------------------------------------------------------

  if (!activeCompany || !sprints || sprints.length === 0) return null;

  return (
    <>
      <div className="space-y-6 mb-8" onClick={() => setMenuOpenId(null)}>
        {sprints.map((sprint) => {
          
          // Xác định trạng thái hiển thị
          const isActive = sprint.status === "IN_PROGRESS";
          const isFuture = sprint.status === "NOT_STARTED";
          const sprintTasks = sprint.tasks || [];
          const taskIds = sprintTasks.map((t) => t.id.toString());

          return (
            <div
              key={sprint.id}
              className={cn(
                "rounded-xl border overflow-visible transition-all relative",
                isActive 
                  ? "bg-blue-50/20 border-blue-200 shadow-sm" 
                  : "bg-slate-50 border-slate-200"
              )}
            >
              {/* KHỐI 1: SPRINT HEADER */}
              <div
                className={cn(
                  "flex items-center justify-between px-5 py-3 border-b cursor-pointer select-none transition-colors",
                  isActive 
                    ? "bg-blue-50/50 border-blue-100" 
                    : "bg-white border-slate-200 hover:bg-slate-50/80 rounded-t-xl"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSprint(sprint.id);
                }}
              >
                
                {/* Thông tin Sprint cơ bản */}
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-slate-600 transition-transform">
                    {expanded[sprint.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                        {sprint.name}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] rounded-md font-bold uppercase tracking-widest border border-emerald-200">
                          Active
                        </span>
                      )}
                      {isFuture && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md font-bold uppercase tracking-widest border border-slate-200">
                          Planned
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-3">
                      {(sprint.startDate || sprint.endDate) && (
                        <div className="flex items-center gap-1.5 opacity-80">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="tracking-wide">
                            {formatDate(sprint.startDate)} <span className="mx-0.5">-</span> {formatDate(sprint.endDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-400">
                          ({sprint.taskCount || 0} issues)
                        </span>
                      </div>
                      {sprint.goal && (
                        <span className="text-slate-400 italic max-w-[250px] truncate hidden md:block">
                          Goal: {sprint.goal}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Các nút hành động (Start, Complete, Menu) */}
                <div className="flex items-center gap-2 relative">
                  
                  {isActive && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openActionModal("COMPLETE", sprint);
                      }}
                      className="h-8 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 font-bold text-xs shadow-none uppercase tracking-wider px-4"
                    >
                      Complete Sprint
                    </Button>
                  )}

                  {isFuture && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openActionModal("START", sprint);
                      }}
                      className="h-8 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-300 shadow-sm font-bold text-xs uppercase tracking-wider px-4"
                    >
                      Start Sprint
                    </Button>
                  )}

                  {/* Menu chức năng mở rộng */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === sprint.id ? null : sprint.id);
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>

                    {menuOpenId === sprint.id && (
                      <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1.5 animate-in fade-in zoom-in-95 origin-top-right">
                        <button
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSprintSettingsClick(sprint.id);
                            setMenuOpenId(null);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5 opacity-70" /> Edit Sprint
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            openActionModal("DELETE", sprint);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 opacity-70" />
                          {isActive ? "Cancel Sprint" : "Delete Sprint"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* KHỐI 2: SPRINT BODY (Danh sách Task có hỗ trợ Kéo Thả) */}
              <SprintDroppable
                id={`sprint-${sprint.id}`}
                isExpanded={expanded[sprint.id]}
              >
                <SortableContext
                  items={taskIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 mb-2">
                    {sprintTasks.length > 0 ? (
                      sprintTasks.map((task, index) => (
                        <BacklogTaskItem
                          key={task.id}
                          // TaskSummary có thể thiếu field so với full Task nhưng UI vẫn render tốt
                          task={task as any}
                          index={index}
                          onClick={() => onTaskClick(task.id)}
                        />
                      ))
                    ) : (
                      // Hiển thị trạng thái rỗng khi Sprint chưa có Task
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg m-1 bg-white/50">
                        <Rocket className="w-8 h-8 mb-2 opacity-40 text-slate-300" />
                        <p className="text-xs font-bold text-slate-500">Plan your sprint</p>
                        <p className="text-[10px] font-medium mt-1 uppercase tracking-widest opacity-70">Drag issues here</p>
                      </div>
                    )}
                  </div>
                </SortableContext>

                {/* Form tạo nhanh Task vào Sprint này */}
                <div className="px-1 mt-3">
                  <QuickTaskCreate
                    companyId={activeCompany.companyId}
                    workspaceId={workspaceId}
                    projectId={projectId}
                    sprintId={sprint.id}
                    onSuccess={() => onTaskCreated && onTaskCreated()}
                  />
                </div>
              </SprintDroppable>
            </div>
          );
        })}
      </div>

      {/* Modal xác nhận các hành động nguy hiểm */}
      <SprintActionModals
        isOpen={!!modalType}
        type={modalType}
        sprint={selectedSprint}
        onClose={() => {
          setModalType(null);
          setSelectedSprint(null);
        }}
        onConfirm={handleConfirmAction}
        loading={isProcessing}
      />
    </>
  );
}