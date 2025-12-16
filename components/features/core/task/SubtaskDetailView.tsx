"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  X,
  CheckSquare,
  Loader2,
  User,
  Clock,
  AlignLeft,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { useToast } from "@/components/ui/ToastProvider";

// API
import {
  getSubtaskDetail,
  updateSubtask,
  Subtask,
} from "@/services/apiSubTask";

// =============================================================================
// 1. INTERFACES & HELPERS
// =============================================================================

interface SubtaskDetailViewProps {
  subtaskId: number;
  taskId: number; // Parent Task ID
  companyId: number;
  workspaceId: number;
  projectId: number;
  members: any[];
  onBack: () => void; // Hàm quay lại màn hình cha
  onClose: () => void; // Hàm đóng hẳn Modal
  onUpdateParent: () => void; // Hàm refresh lại list subtask ở cha
}

// Helper: Format Date
const formatTimestamp = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB") : "N/A";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function SubtaskDetailView({
  subtaskId,
  taskId,
  companyId,
  workspaceId,
  projectId,
  members,
  onBack,
  onClose,
  onUpdateParent,
}: SubtaskDetailViewProps) {
  const { showToast } = useToast();
  // Sử dụng any để linh hoạt xử lý cấu trúc assignee lúc mới load và lúc update
  const [subtask, setSubtask] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. Load Data ---
  useEffect(() => {
    if (subtaskId) {
      setLoading(true);
      getSubtaskDetail(companyId, workspaceId, projectId, taskId, subtaskId)
        .then((data) => {
          // --- FIX: CHUẨN HÓA DỮ LIỆU ASSIGNEE ---
          // Nếu API chưa trả về object assignee mà chỉ có id hoặc các trường flat, ta tự tạo nó
          if (!data.assignee) {
             let assigneeObj = null;

             // Ưu tiên 1: Tìm thông tin từ danh sách members (nếu có assigneeId)
             if (data.assigneeId && members && members.length > 0) {
                 const m = members.find((x: any) => (x.userId || x.id) === data.assigneeId);
                 if (m) {
                     assigneeObj = {
                         name: m.fullName || m.name,
                         avatarUrl: m.avatarUrl || m.avatar
                     };
                 }
             }

             // Ưu tiên 2: Lấy từ các trường flat của API (thường là assigneeName/assigneeAvatar)
             // fallback nếu members chưa load kịp
             if (!assigneeObj && (data.assigneeName || data.assigneeAvatar)) {
                 assigneeObj = {
                     name: data.assigneeName,
                     avatarUrl: data.assigneeAvatar
                 };
             }

             // Gán ngược lại vào data để UI hiển thị thống nhất
             if (assigneeObj) {
                 data.assignee = assigneeObj;
             }
          }
          // ----------------------------------------
          
          setSubtask(data);
        })
        .catch((error: any) => {
          const message =
            error.message ||
            error.response?.data?.message ||
            "Failed to load subtask";
          showToast(message, "error");
        })
        .finally(() => setLoading(false));
    }
    // Thêm members vào dependency để nếu members load chậm hơn subtask thì vẫn map được
  }, [subtaskId, taskId, companyId, workspaceId, projectId, members]); 

  // --- 2. Handle Update (Auto-save on Blur) ---
  const handleUpdate = async (field: string, value: any) => {
    if (!subtask) return;

    // Optimistic Update UI
    if (field === "assigneeId") {
       const userId = Number(value);
       if (userId === 0) {
           setSubtask((prev: any) => ({ ...prev, assignee: null, assigneeId: null }));
       } else {
           const member = members.find(m => (m.userId || m.id) === userId);
           if (member) {
               setSubtask((prev: any) => ({
                   ...prev,
                   assigneeId: userId,
                   assignee: {
                       name: member.fullName || member.name,
                       avatarUrl: member.avatarUrl || member.avatar
                   }
               }));
           }
       }
    } else {
        setSubtask((prev: any) => (prev ? { ...prev, [field]: value } : null));
    }

    // Payload Processing
    let payloadValue = value;
    if (field === "assigneeId" && Number(value) === 0) {
      payloadValue = null;
    }

    try {
      setIsSaving(true);
      await updateSubtask(
        companyId,
        workspaceId,
        projectId,
        taskId,
        subtaskId,
        {
          [field]: payloadValue,
        }
      );
      onUpdateParent();
    } catch (error: any) {
      console.error(error);
      const message =
        error.message || error.response?.data?.message || "Update failed";
      showToast(message, "error");
      // Có thể thêm logic revert state ở đây nếu cần
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER GUARD ---
  if (loading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  if (!subtask)
    return (
      <div className="p-8 text-center text-slate-500">Subtask not found</div>
    );

  // --- RENDER UI ---
  return (
    <div className="flex flex-col h-full bg-white">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 gap-1 pl-1 pr-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <CheckSquare className="w-4 h-4 text-blue-500" />
            <span>SUB-{subtask.id}</span>
            {isSaving && (
              <Loader2 className="w-3 h-3 animate-spin ml-2 text-blue-500" />
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* --- BODY --- */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 border-r border-slate-100">
          <div className="space-y-6">
            <Input
              value={subtask.title}
              onChange={(e) =>
                setSubtask({ ...subtask, title: e.target.value })
              }
              onBlur={(e) => handleUpdate("title", e.target.value)}
              className="text-xl font-bold border-none px-0 h-auto focus-visible:ring-0 text-slate-900 bg-transparent placeholder:text-slate-300"
              placeholder="Subtask title"
              disabled={isSaving}
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <AlignLeft className="w-4 h-4" /> Description
              </div>
              <Textarea
                value={subtask.description || ""}
                onChange={(e) =>
                  setSubtask({ ...subtask, description: e.target.value })
                }
                onBlur={(e) => handleUpdate("description", e.target.value)}
                className="min-h-[120px] resize-none text-sm focus-visible:ring-1"
                placeholder="Add a more detailed description..."
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[320px] bg-slate-50/50 overflow-y-auto custom-scrollbar p-6 space-y-6 shrink-0">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Status
            </label>
            <select
              className="w-full p-2 bg-white border border-slate-200 rounded text-sm font-semibold cursor-pointer outline-none focus:border-blue-500"
              value={subtask.status || "TO_DO"}
              onChange={(e) => handleUpdate("status", e.target.value)}
              disabled={isSaving}
            >
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <hr className="border-slate-200" />

          {/* Assignee */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
              <User className="w-3 h-3" /> Assignee
            </label>
            <div className="relative flex items-center justify-between p-2 bg-white border border-slate-200 rounded-md">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  {/* Sử dụng optional chaining và fallback an toàn */}
                  <AvatarImage
                    src={subtask.assignee?.avatarUrl || subtask.assignee?.avatar || subtask.assigneeAvatar || ""}
                    alt={subtask.assignee?.name || subtask.assignee?.fullName || "Unassigned"}
                  />
                  <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                    {(subtask.assignee?.name || subtask.assignee?.fullName || subtask.assigneeName || "UN").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={`text-sm font-medium truncate max-w-[140px] ${(!subtask.assignee?.name && !subtask.assignee?.fullName && !subtask.assigneeName) ? "text-slate-400 italic" : "text-slate-700"}`}>
                  {subtask.assignee?.name || subtask.assignee?.fullName || subtask.assigneeName || "Unassigned"}
                </span>
              </div>

              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={subtask.assigneeId || 0}
                onChange={(e) =>
                  handleUpdate("assigneeId", Number(e.target.value))
                }
                title="Change Assignee"
                disabled={isSaving}
              >
                <option value={0}>Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId || m.id} value={m.userId || m.id}>
                    {m.fullName || m.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-blue-600 font-bold cursor-pointer hover:underline pointer-events-none">
                Change
              </span>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Estimated Hours */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
              <Clock className="w-3 h-3" /> Estimation
            </label>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded p-2">
              <input
                type="number"
                min="0"
                className="w-full text-sm outline-none font-semibold text-slate-700"
                value={subtask.estimatedHours || ""}
                onChange={(e) =>
                  setSubtask({
                    ...subtask,
                    estimatedHours: Number(e.target.value),
                  })
                }
                onBlur={(e) =>
                  handleUpdate("estimatedHours", Number(e.target.value))
                }
                placeholder="0"
                disabled={isSaving}
              />
              <span className="text-xs text-slate-400 font-bold shrink-0">
                Hours
              </span>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Timestamps */}
          <div className="space-y-2 text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>Created</span>
              <span className="text-slate-600 font-medium">
                {formatTimestamp(subtask.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Updated</span>
              <span className="text-slate-600 font-medium">
                {formatTimestamp(subtask.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}