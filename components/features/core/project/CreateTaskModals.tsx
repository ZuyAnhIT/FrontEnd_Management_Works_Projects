"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useCallback } from "react";
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
  AlertTriangle,
} from "lucide-react";

// Internal Services & Contexts
import { createProjectTask, TaskType, TaskPriority } from "@/services/apiProject";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

// Internal UI Components & Utils
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Cards";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & CONFIG
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
// 3. INTERFACES
// =============================================================================

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  workspaceId: number;
  sprintId?: number | null;
  onCreated?: () => void;
  statusId?: number; 
}

interface FormData {
  title: string;
  description: string;
  priority: string;
  statusName: string;
  subtasks: { title: string }[];
}

const INITIAL_FORM_STATE: FormData = {
  title: "",
  description: "",
  priority: "LOW", 
  statusName: "TODO", 
  subtasks: [],
};

// =============================================================================
// 4. SUB-COMPONENTS
// =============================================================================

interface SelectWrapperProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

/**
 * Thành phần Dropdown Select dùng chung trong Form.
 * Tuân thủ Typography chuẩn Jira (Nhãn in hoa, chữ nhỏ, giãn cách rộng).
 */
const SelectWrapper = ({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  disabled = false,
}: SelectWrapperProps) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full h-10 pl-3 pr-8 border border-slate-300 rounded-md text-[13px] font-medium text-slate-900 bg-white transition-all shadow-sm appearance-none outline-none cursor-pointer",
          "focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF]",
          "disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-500"
        )}
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
// 5. MAIN COMPONENT
// =============================================================================

/**
 * Modal khởi tạo Công việc mới (Create Issue Modal).
 * Giao diện tập trung vào việc tạo nhanh thẻ công việc (Task/Story) kèm Subtasks.
 */
export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  workspaceId,
  sprintId,
  onCreated,
}: CreateTaskModalProps) {
  
  // ---------------------------------------------------------------------------
  // 6. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const { activeCompany } = useAuth();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [newSubtask, setNewSubtask] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 7. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Cập nhật các trường dữ liệu biểu mẫu cơ bản
   */
  const handleUpdateForm = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  }, [errorMsg]);

  /**
   * Thêm một Subtask (Công việc phụ) mới vào danh sách
   */
  const handleAddSubtask = useCallback(() => {
    const trimmedSubtask = newSubtask.trim();
    if (!trimmedSubtask) return;
    
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: trimmedSubtask }],
    }));
    setNewSubtask("");
  }, [newSubtask]);

  /**
   * Xóa một Subtask khỏi danh sách hiện tại
   */
  const handleRemoveSubtask = useCallback((indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, idx) => idx !== indexToRemove),
    }));
  }, []);

  /**
   * Gọi API để tạo mới Task
   */
  const handleCreateTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.title.trim()) {
      setErrorMsg("Task summary is a required field.");
      return;
    }

    if (!activeCompany?.companyId) {
      showToast("Missing workspace identity. Please reload the page.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Chuẩn bị Payload gửi lên API
      // Lưu ý: Tính năng Subtask hiện chỉ lưu ở state form. 
      // Cần BE hỗ trợ gửi mảng Subtasks nếu muốn đồng bộ toàn vẹn.
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        taskType: TaskType.STORY, 
        priority: formData.priority as TaskPriority,
        storyPoints: 0,
        assigneeId: undefined,
        sprintId: sprintId ?? null,
      };

      await createProjectTask(
        activeCompany.companyId,
        workspaceId,
        projectId,
        payload
      );

      showToast("Issue created successfully", "success");
      
      // Cleanup & Close
      onCreated?.();
      setFormData(INITIAL_FORM_STATE);
      onClose();
    } catch (error: any) {
      console.error("Create Task Error:", error);
      const message = error?.message || error.response?.data?.message || "Failed to create issue.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 8. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-[650px] max-h-[90vh] bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ================= HEADER ================= */}
        <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 flex flex-row items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] border border-[#2684FF]/20 flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-[#0052CC]" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-800 font-bold tracking-tight">
                Create Issue
              </CardTitle>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-0.5">
                Add a new task to your project
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#091E4214] transition-colors active:scale-95"
            disabled={isLoading}
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* ================= BODY FORM ================= */}
        <CardContent className="p-8 space-y-6 overflow-y-auto flex-1 bg-white custom-scrollbar">
          
          {/* Thông báo lỗi */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-lg text-[13px] font-medium flex items-start gap-2.5 animate-in fade-in duration-200 shadow-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          <form id="create-task-form" onSubmit={handleCreateTask} className="space-y-6">
            
            {/* Tiêu đề (Summary) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                Summary <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleUpdateForm("title", e.target.value)}
                placeholder="What needs to be done?"
                className="h-11 border-slate-300 text-[13px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm placeholder:text-slate-400"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {/* Mô tả (Description) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5" />
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleUpdateForm("description", e.target.value)}
                placeholder="Add a more detailed description..."
                rows={4}
                className="resize-none border-slate-300 text-[13px] focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm bg-slate-50 focus:bg-white placeholder:text-slate-400 p-3"
                disabled={isLoading}
              />
            </div>

            {/* Phân loại (Priority & Status) */}
            <div className="grid grid-cols-2 gap-6">
              <SelectWrapper
                label="Priority"
                icon={Flag}
                value={formData.priority}
                onChange={(e) => handleUpdateForm("priority", e.target.value)}
                options={PRIORITY_OPTIONS}
                disabled={isLoading}
              />
              <SelectWrapper
                label="Status"
                icon={Activity}
                value={formData.statusName}
                onChange={(e) => handleUpdateForm("statusName", e.target.value)}
                options={STATUS_OPTIONS}
                disabled={isLoading}
              />
            </div>

            {/* Công việc phụ (Subtasks) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <LayoutList className="w-3.5 h-3.5" />
                Subtasks
              </label>

              {/* Danh sách Subtask đã thêm */}
              {formData.subtasks.length > 0 && (
                <div className="space-y-2">
                  {formData.subtasks.map((st, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 group hover:border-slate-300 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <CheckSquare className="w-4 h-4 text-slate-400" />
                        <span className="text-[13px] text-slate-700 font-medium">
                          {st.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100 active:scale-95"
                        onClick={() => handleRemoveSubtask(index)}
                        disabled={isLoading}
                        title="Remove Subtask"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Ô nhập Subtask mới */}
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a new subtask..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); 
                      handleAddSubtask();
                    }
                  }}
                  className="h-10 text-[13px] border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] shadow-sm bg-slate-50 focus:bg-white"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSubtask}
                  className="h-10 px-4 border-slate-300 text-slate-600 hover:bg-[#091E4214] hover:text-slate-900 transition-colors shadow-sm"
                  disabled={isLoading || !newSubtask.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
          </form>
        </CardContent>

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 px-5 text-[12px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-800 hover:bg-[#091E4214] transition-colors"
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            form="create-task-form"
            type="submit"
            disabled={isLoading || !formData.title.trim()}
            className={cn(
              "h-10 px-6 text-[12px] uppercase tracking-widest font-bold text-white shadow-md transition-all",
              "bg-[#0052CC] hover:bg-[#0047B3] active:scale-95 disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Issue"
            )}
          </Button>
        </div>

      </Card>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}