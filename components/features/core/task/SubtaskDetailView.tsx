"use client";

// =============================================================================
// 1. IMPORTS (Libraries -> Internal -> Styles)
// =============================================================================

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  X,
  CheckSquare,
  Loader2,
  User,
  Clock,
  AlignLeft,
} from "lucide-react";

// Internal Components & Hooks
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// Internal Services & Interfaces
import { getSubtaskDetail, updateSubtask } from "@/services/apiSubTask";

// =============================================================================
// 2. INTERFACES & CONSTANTS
// =============================================================================

interface SubtaskDetailViewProps {
  subtaskId: number;
  taskId: number;
  companyId: number;
  workspaceId: number;
  projectId: number;
  members: any[];
  onBack: () => void;
  onClose: () => void;
  onUpdateParent: () => void;
}

/**
 * Định dạng ngày giờ chuẩn xác
 */
const formatTimestamp = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { 
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  }) : "N/A";

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Khung xem chi tiết Subtask (Nhiệm vụ phụ).
 * Hiển thị dạng Split Panel: Nội dung chính bên trái, thông tin Meta bên phải.
 * Tự động lưu (Auto-save) khi người dùng hoàn tất chỉnh sửa các trường.
 */
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
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  
  const [subtask, setSubtask] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ---------------------------------------------------------------------------
  // 5. EFFECTS: DATA FETCHING
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!subtaskId) return;
    
    setIsLoading(true);
    getSubtaskDetail(companyId, workspaceId, projectId, taskId, subtaskId)
      .then((data) => {
        
        // --- CHUẨN HÓA DỮ LIỆU ASSIGNEE ---
        // Đảm bảo UI luôn có Object assignee hợp lệ để hiển thị Avatar
        if (!data.assignee) {
          let assigneeObj = null;

          // TH1: Ánh xạ từ danh sách members của dự án
          if (data.assigneeId && members?.length > 0) {
            const m = members.find((x: any) => (x.userId || x.id) === data.assigneeId);
            if (m) {
              assigneeObj = {
                name: m.fullName || m.name,
                avatarUrl: m.avatarUrl || m.avatar
              };
            }
          }

          // TH2: Fallback lấy dữ liệu phẳng từ payload API
          if (!assigneeObj && (data.assigneeName || data.assigneeAvatar)) {
            assigneeObj = {
              name: data.assigneeName,
              avatarUrl: data.assigneeAvatar
            };
          }

          if (assigneeObj) {
            data.assignee = assigneeObj;
          }
        }
        
        setSubtask(data);
      })
      .catch((error: any) => {
        console.error("Subtask Detail Fetch Error:", error);
        const message = error.response?.data?.message || error.message || "Failed to load subtask details.";
        showToast(message, "error");
      })
      .finally(() => setIsLoading(false));
      
  }, [subtaskId, taskId, companyId, workspaceId, projectId, members, showToast]);

  // ---------------------------------------------------------------------------
  // 6. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý cập nhật trường dữ liệu (Auto-save)
   */
  const handleUpdate = async (field: string, value: any) => {
    if (!subtask) return;

    // --- OPTIMISTIC UPDATE UI ---
    if (field === "assigneeId") {
      const userId = Number(value);
      
      if (userId === 0) {
        // Gỡ người phụ trách
        setSubtask((prev: any) => ({ ...prev, assignee: null, assigneeId: null }));
      } else {
        // Gán người phụ trách mới
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
      // Cập nhật các trường text thông thường
      setSubtask((prev: any) => (prev ? { ...prev, [field]: value } : null));
    }

    // --- PREPARE PAYLOAD ---
    let payloadValue = value;
    if (field === "assigneeId" && Number(value) === 0) {
      payloadValue = null;
    }

    // --- EXECUTE API ---
    setIsSaving(true);
    try {
      await updateSubtask(
        companyId,
        workspaceId,
        projectId,
        taskId,
        subtaskId,
        { [field]: payloadValue }
      );
      
      // Trigger update danh sách ở màn hình cha
      onUpdateParent(); 
    } catch (error: any) {
      console.error(`Subtask Update Error [${field}]:`, error);
      const message = error.response?.data?.message || error.message || `Failed to update ${field}.`;
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 7. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 opacity-60">
          <Loader2 className="animate-spin w-8 h-8 text-[#0052CC]" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Loading subtask...</span>
        </div>
      </div>
    );
  }

  if (!subtask) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 text-slate-400">
        <span className="text-[12px] font-bold uppercase tracking-widest">Subtask not found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-200">
      
      {/* ==================== HEADER ==================== */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shrink-0">
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 hover:bg-[#091E4214] gap-1.5 pl-1 pr-3"
            title="Back to Parent Task"
          >
            <ArrowLeft className="w-4 h-4" /> 
            <span className="text-[12px] font-bold uppercase tracking-widest">Back</span>
          </Button>
          
          <div className="h-5 w-px bg-slate-300" />
          
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-50 rounded">
              <CheckSquare className="w-4 h-4 text-[#0052CC]" />
            </div>
            <span className="text-[13px] text-slate-600 font-mono font-bold tracking-tight">
              SUB-{subtask.id}
            </span>
            {isSaving && (
              <div className="flex items-center gap-1.5 ml-3 px-2 py-0.5 bg-blue-50 text-[#0052CC] rounded-md animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Saving</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-[#091E4214] rounded-md transition-colors"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ==================== BODY (Split Layout) ==================== */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Lõi bên trái: Nội dung chính */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 border-r border-slate-200">
          <div className="max-w-3xl space-y-8">
            
            <Input
              value={subtask.title || ""}
              onChange={(e) => setSubtask({ ...subtask, title: e.target.value })}
              onBlur={(e) => handleUpdate("title", e.target.value)}
              placeholder="What needs to be done?"
              disabled={isSaving}
              className={cn(
                "text-2xl font-black text-[#172B4D] border-2 border-transparent px-2 -ml-2 h-auto outline-none transition-all resize-none shadow-none focus-visible:ring-0 leading-tight",
                "hover:bg-slate-50 focus:bg-white focus:border-[#2684FF] placeholder:text-slate-300"
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
                <AlignLeft className="w-4 h-4" /> Description
              </div>
              <Textarea
                value={subtask.description || ""}
                onChange={(e) => setSubtask({ ...subtask, description: e.target.value })}
                onBlur={(e) => handleUpdate("description", e.target.value)}
                placeholder="Add more details to this subtask..."
                disabled={isSaving}
                className={cn(
                  "min-h-[160px] text-[14px] text-[#172B4D] border border-slate-200 rounded-xl p-4 outline-none transition-all shadow-sm resize-y leading-relaxed",
                  "bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] placeholder:text-slate-400"
                )}
              />
            </div>
          </div>
        </div>

        {/* Lõi bên phải: Metadata (Context) */}
        <div className="w-[320px] bg-[#F4F5F7] overflow-y-auto custom-scrollbar p-6 space-y-8 shrink-0">
          
          {/* Status Select */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] block">
              Status
            </label>
            <select
              className={cn(
                "w-full h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-[12px] font-bold uppercase tracking-wide text-slate-700 outline-none shadow-sm cursor-pointer transition-all",
                "hover:border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF]"
              )}
              value={subtask.status || "TO_DO"}
              onChange={(e) => handleUpdate("status", e.target.value)}
              disabled={isSaving}
            >
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <hr className="border-slate-200/80" />

          {/* Assignee Select */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Assignee
            </label>
            
            {/* Custom Fake Dropdown Container */}
            <div className="relative flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors shadow-sm group">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-7 h-7 shadow-sm border border-slate-100">
                  <AvatarImage
                    src={subtask.assignee?.avatarUrl || subtask.assignee?.avatar || subtask.assigneeAvatar || ""}
                    alt={subtask.assignee?.name || subtask.assignee?.fullName || "Unassigned"}
                  />
                  <AvatarFallback className="text-[10px] font-bold bg-[#091E420A] text-[#42526E]">
                    {(subtask.assignee?.name || subtask.assignee?.fullName || subtask.assigneeName || "UN").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "text-[13px] font-semibold truncate max-w-[140px]",
                  (!subtask.assignee?.name && !subtask.assignee?.fullName && !subtask.assigneeName) ? "text-slate-400 italic" : "text-[#172B4D]"
                )}>
                  {subtask.assignee?.name || subtask.assignee?.fullName || subtask.assigneeName || "Unassigned"}
                </span>
              </div>

              {/* The invisible real select element */}
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={subtask.assigneeId || 0}
                onChange={(e) => handleUpdate("assigneeId", Number(e.target.value))}
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
              
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-[#0052CC] transition-colors pr-1">
                Change
              </span>
            </div>
          </div>

          <hr className="border-slate-200/80" />

          {/* Estimation Input */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Estimation
            </label>
            <div className={cn(
              "flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2 px-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-[#2684FF]",
            )}>
              <input
                type="number"
                min="0"
                className="w-full text-[13px] outline-none font-bold text-[#172B4D] bg-transparent"
                value={subtask.estimatedHours || ""}
                onChange={(e) => setSubtask({ ...subtask, estimatedHours: Number(e.target.value) })}
                onBlur={(e) => handleUpdate("estimatedHours", Number(e.target.value))}
                placeholder="0"
                disabled={isSaving}
              />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0">
                Hours
              </span>
            </div>
          </div>

          <hr className="border-slate-200/80" />

          {/* Meta Timestamps */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</span>
              <span className="text-[11px] text-slate-600 font-medium">
                {formatTimestamp(subtask.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updated</span>
              <span className="text-[11px] text-slate-600 font-medium">
                {formatTimestamp(subtask.updatedAt)}
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}