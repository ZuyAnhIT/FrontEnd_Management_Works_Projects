"use client";

import { useState } from "react";
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

import { Button } from "@/components/ui/Buttons";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";

// API & Services
import {
  Sprint,
  startSprint,
  completeSprint,
  deleteSprint,
} from "@/services/apiSprint";

// Components
import BacklogTaskItem from "./BacklogTaskItem";
import QuickTaskCreate from "@/components/features/core/task/QuickTaskCreate";
import SprintActionModals from "@/components/features/core/sprint/SprintActionModals";

// =============================================================================
// 1. HELPERS & SUB-COMPONENTS
// =============================================================================

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })
    : "...";

/**
 * Component vùng thả (Droppable) cho Sprint.
 * Tách ra để code chính gọn hơn.
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
    data: { type: "Sprint", id }, // Tag data để nhận diện khi va chạm (collision)
  });

  if (!isExpanded) return null;

  return (
    <div
      ref={setNodeRef}
      className={`p-2 min-h-[50px] transition-colors duration-200 ${
        isOver ? "bg-blue-50/80" : ""
      }`}
    >
      {children}
    </div>
  );
}

// =============================================================================
// 2. TYPES & INTERFACES
// =============================================================================

type SprintActionType = "START" | "COMPLETE" | "DELETE";

interface SprintSectionProps {
  sprints: Sprint[];
  onTaskClick: (taskId: number) => void;
  onTaskCreated?: () => void;
  onSprintSettingsClick: (sprintId: number) => void;
  onRefresh: () => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function SprintSection({
  sprints,
  onTaskClick,
  onTaskCreated,
  onSprintSettingsClick,
  onRefresh,
}: SprintSectionProps) {
  // --- HOOKS ---
  const { activeCompany } = useAuth();
  const params = useParams();
  const { showToast } = useToast();

  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  // --- STATE ---
  // Mặc định mở tất cả các sprint
  const [expanded, setExpanded] = useState<Record<number, boolean>>(
    sprints.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<SprintActionType | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- HANDLERS ---

  const toggleSprint = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openActionModal = (type: SprintActionType, sprint: Sprint) => {
    setSelectedSprint(sprint);
    setModalType(type);
    setMenuOpenId(null); // Đóng menu dropdown
  };

  const handleConfirmAction = async () => {
    if (!selectedSprint || !modalType) return;

    try {
      setIsProcessing(true);

      switch (modalType) {
        case "START":
          await startSprint(projectId, selectedSprint.id);
          showToast(
            `Sprint "${selectedSprint.name}" started successfully!`,
            "success"
          );
          break;

        case "COMPLETE":
          await completeSprint(projectId, selectedSprint.id);
          showToast(`Sprint completed successfully.`, "success");
          break;

        case "DELETE":
          await deleteSprint(projectId, selectedSprint.id);
          const actionText =
            selectedSprint.status === "IN_PROGRESS" ? "canceled" : "deleted";
          showToast(`Sprint ${actionText} successfully.`, "success");
          break;
      }

      onRefresh(); // Làm mới dữ liệu
      setModalType(null);
      setSelectedSprint(null);
    } catch (error: any) {
      // Sử dụng message từ API trả về
      const message =
        error.message || error.response?.data?.message || "Action failed.";
      showToast(message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- GUARD ---
  if (!activeCompany || !sprints || sprints.length === 0) return null;

  // --- RENDER ---
  return (
    <>
      <div className="space-y-6 mb-8" onClick={() => setMenuOpenId(null)}>
        {sprints.map((sprint) => {
          // Logic xác định trạng thái
          const isActive = sprint.status === "IN_PROGRESS";
          const isFuture = sprint.status === "NOT_STARTED";
          const sprintTasks = sprint.tasks || [];
          const taskIds = sprintTasks.map((t) => t.id.toString()); // ID cho SortableContext

          return (
            <div
              key={sprint.id}
              className={`rounded-xl border overflow-visible transition-all relative
                ${
                  isActive
                    ? "bg-blue-50/30 border-blue-200 shadow-sm"
                    : "bg-slate-50 border-slate-200"
                }
              `}
            >
              {/* ================= HEADER SECTION ================= */}
              <div
                className={`flex items-center justify-between px-4 py-3 border-b cursor-pointer select-none
                   ${
                     isActive
                       ? "bg-blue-50/50 border-blue-100"
                       : "bg-white border-slate-200"
                   }
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSprint(sprint.id);
                }}
              >
                {/* LEFT: Sprint Info */}
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-slate-600 transition-transform">
                    {expanded[sprint.id] ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {sprint.name}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-extrabold uppercase border border-green-200">
                          Active
                        </span>
                      )}
                      {isFuture && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full font-bold uppercase border border-slate-200">
                          Planned
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      {(sprint.startDate || sprint.endDate) && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDate(sprint.startDate)} -{" "}
                            {formatDate(sprint.endDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-slate-700">
                          ({sprint.taskCount || 0} issues)
                        </span>
                      </div>
                      {sprint.goal && (
                        <span className="text-slate-400 italic max-w-[300px] truncate hidden sm:block">
                          Goal: {sprint.goal}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Actions Buttons */}
                <div className="flex items-center gap-2 relative">
                  {/* Nút Complete (Chỉ hiện khi Active) */}
                  {isActive && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openActionModal("COMPLETE", sprint);
                      }}
                      className="h-8 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 font-semibold shadow-none"
                    >
                      Complete Sprint
                    </Button>
                  )}

                  {/* Nút Start (Chỉ hiện khi Future) */}
                  {isFuture && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openActionModal("START", sprint);
                      }}
                      className="h-8 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-sm"
                    >
                      Start Sprint
                    </Button>
                  )}

                  {/* Dropdown Menu (More) */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(
                          menuOpenId === sprint.id ? null : sprint.id
                        );
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>

                    {/* Dropdown Content */}
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
                            openActionModal("DELETE", sprint);
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

              {/* ================= BODY SECTION (Droppable) ================= */}
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
                          // Cast as any vì TaskSummary có thể thiếu vài field so với full Task,
                          // nhưng UI BacklogTaskItem vẫn render được các field cơ bản.
                          task={task as any}
                          index={index}
                          onClick={() => onTaskClick(task.id)}
                        />
                      ))
                    ) : (
                      // Empty State
                      <div className="flex flex-col items-center justify-center py-6 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg m-1 bg-white/50">
                        <Rocket className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-xs font-medium">Plan your sprint</p>
                        <p className="text-[10px]">Drag issues here</p>
                      </div>
                    )}
                  </div>
                </SortableContext>

                {/* Quick Create Task Input */}
                <div className="px-1">
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

      {/* Action Modals */}
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
