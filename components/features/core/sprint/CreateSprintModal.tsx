"use client";

import { useState } from "react";
import { X, Loader2, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { createSprint, SprintPayload } from "@/services/apiSprint";
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback để reload lại danh sách
  projectId: number; // Chỉ cần projectId
}

// Khởi tạo form data với undefined cho date, vì date input có thể trả về string rỗng
const INITIAL_FORM_DATA: SprintPayload = {
  name: "",
  goal: "",
  startDate: undefined,
  endDate: undefined,
};

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function CreateSprintModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
}: CreateSprintModalProps) {
  // --- HOOKS ---
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // --- STATE ---
  const [formData, setFormData] = useState<SprintPayload>(INITIAL_FORM_DATA);

  // --- HANDLER: SUBMIT ---
  const handleSubmit = async () => {
    // 1. Validate (giữ nguyên logic gốc)
    if (!formData.name?.trim()) {
      showToast("Sprint name is required", "error");
      return;
    }

    try {
      setLoading(true);

      // 2. Chuẩn bị payload (Convert date string -> ISO format cho API)
      const payload: SprintPayload = {
        name: formData.name.trim(),
        goal: formData.goal?.trim() || "",

        // Chuyển đổi sang ISO string hoặc undefined nếu rỗng
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : undefined,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : undefined,

        taskIds: [], // Mảng rỗng mặc định
      };

      // 3. Gọi API
      await createSprint(projectId, payload);

      // 4. Thành công
      showToast("Sprint created successfully", "success");
      onSuccess();
      onClose();

      // Reset form
      setFormData(INITIAL_FORM_DATA);
    } catch (error: any) {
      console.error(error);
      // Sử dụng message từ API trả về
      const message =
        error.message ||
        error.response?.data?.message ||
        "Failed to create sprint.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER GUARD ---
  if (!isOpen) return null;

  // --- RENDER UI ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-slate-800">
            Create New Sprint
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              Sprint Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              placeholder="e.g. Sprint 24: Login Flow"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Goal */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
              <Target className="w-3 h-3" /> Sprint Goal
            </label>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow"
              placeholder="What is the main focus of this sprint?"
              value={formData.goal || ""}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Start Date
              </label>
              <input
                type="datetime-local"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> End Date
              </label>
              <input
                type="datetime-local"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.name?.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{" "}
            Create Sprint
          </Button>
        </div>
      </div>
    </div>
  );
}
