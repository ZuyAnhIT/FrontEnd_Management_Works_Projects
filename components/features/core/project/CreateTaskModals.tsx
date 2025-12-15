"use client";

import { useState } from "react";
import {
  X,
  Plus,
  FileText,
  Flag,
  Activity,
  CheckSquare,
  Trash2,
  AlignLeft,
  LayoutList,
  ChevronDown,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextAreas";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Cards";
import { useToast } from "@/components/ui/ToastProvider";
import {
  createProjectTask,
  TaskType,
  TaskPriority,
} from "@/services/apiProject";
import { useAuth } from "@/context/AuthContext";

// =============================================================================
// 1. CONSTANTS & CONFIG
// =============================================================================

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
];

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  workspaceId: number;
  sprintId?: number | null;
  onCreated?: () => void;
  statusId?: number; // Cho phép component cha truyền default status ID
}

interface FormData {
  title: string;
  description: string;
  priority: string;
  statusName: string;
  subtasks: { title: string }[];
}

// =============================================================================
// 3. SUB-COMPONENT: SELECT WRAPPER
// =============================================================================

interface SelectWrapperProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

const SelectWrapper = ({
  label,
  icon: Icon,
  value,
  onChange,
  options,
}: SelectWrapperProps) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-500" />
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 appearance-none cursor-pointer shadow-sm transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  </div>
);

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  workspaceId,
  sprintId,
  onCreated,
}: CreateTaskModalProps) {
  // --- HOOKS ---
  const { showToast } = useToast();
  const { activeCompany } = useAuth();

  // --- STATE ---
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    priority: "LOW", // Default
    statusName: "TODO", // Default (Chỉ dùng cho UI, API sẽ dùng statusId)
    subtasks: [],
  });

  const [newSubtask, setNewSubtask] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HANDLERS: SUBTASK ---

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: newSubtask.trim() }],
    }));
    setNewSubtask("");
  };

  const handleRemoveSubtask = (i: number) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, idx) => idx !== i),
    }));
  };

  // --- HANDLER: CREATE TASK ---

  const handleCreate = async () => {
    setError(null);

    // 1. Validation cơ bản
    if (!formData.title.trim()) {
      setError("Summary is required!");
      return;
    }

    // 2. Check Active Company
    if (!activeCompany?.companyId) {
      showToast("Missing company information. Cannot create task.", "error");
      return;
    }

    try {
      setLoading(true);

      // 3. Chuẩn bị Payload khớp với Interface CreateTaskPayload
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),

        // Mặc định tạo STORY
        taskType: TaskType.STORY,

        // Ép kiểu string sang Enum
        priority: formData.priority as TaskPriority,

        storyPoints: 0,
        assigneeId: undefined,
        sprintId: sprintId ?? null,
        // statusId: undefined // Backend sẽ tự set default là TODO nếu không truyền
      };

      // 4. Gọi API
      await createProjectTask(
        activeCompany.companyId,
        workspaceId,
        projectId,
        payload
      );

      showToast(
        `Task "${formData.title.trim()}" created successfully!`,
        "success"
      );
      onCreated?.();

      // Reset Form & Close
      setFormData({
        title: "",
        description: "",
        priority: "LOW",
        statusName: "TODO",
        subtasks: [],
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      // Sử dụng message từ API trả về
      const message =
        err?.message || err.response?.data?.message || "Cannot create task.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER GUARD ---
  if (!isOpen) return null;

  // --- RENDER UI ---
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200 shadow-2xl rounded-xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 flex flex-row items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 font-bold">
                Create Issue
              </CardTitle>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Add a new task to your backlog
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* BODY: Scrollable Content */}
        <CardContent className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {error}
            </div>
          )}

          {/* Summary (Title) */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900">
              Summary <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="What needs to be done?"
              className="h-10 border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-400"
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-500" />
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add a more detailed description..."
              rows={4}
              className="resize-none border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-400"
              disabled={loading}
            />
          </div>

          {/* Row: Priority & Status */}
          <div className="grid grid-cols-2 gap-6">
            <SelectWrapper
              label="Priority"
              icon={Flag}
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              options={PRIORITY_OPTIONS}
            />
            <SelectWrapper
              label="Status"
              icon={Activity}
              value={formData.statusName}
              onChange={(e) =>
                setFormData({ ...formData, statusName: e.target.value })
              }
              options={STATUS_OPTIONS}
            />
          </div>

          {/* Subtasks Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100 mt-2">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2 pt-2">
              <LayoutList className="w-4 h-4 text-slate-500" />
              Subtasks
            </label>

            {/* List Subtasks */}
            {formData.subtasks.length > 0 && (
              <div className="space-y-2">
                {formData.subtasks.map((st, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200 group hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 font-medium">
                        {st.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => handleRemoveSubtask(index)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Input */}
            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask..."
                onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
                className="h-9 text-sm border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 flex-1"
                disabled={loading}
              />
              <Button
                variant="outline"
                onClick={handleAddSubtask}
                className="h-9 px-3 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                disabled={loading || !newSubtask.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 px-5 text-sm font-semibold text-slate-700 border-slate-300 hover:bg-white hover:text-slate-900 transition-colors"
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleCreate}
            disabled={loading || !formData.title.trim()}
            className="h-10 px-6 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </span>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
