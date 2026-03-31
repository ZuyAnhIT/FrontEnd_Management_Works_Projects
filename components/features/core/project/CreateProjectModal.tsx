"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Loader2,
  FolderPlus,
  Image as ImageIcon,
  Calendar,
  Flag,
  Target,
  FileText,
  Code,
  UploadCloud,
  Trash2,
} from "lucide-react";

// Internal Services & Context
import { createProject, ProjectRequest } from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

// Internal Components & Utils
import { Card, CardHeader, CardTitle } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & HELPERS
// =============================================================================

const PRIORITY_OPTIONS = [
  {
    value: "LOW",
    label: "Low",
    color: "bg-slate-50 text-slate-600 border-slate-200",
    activeColor: "bg-slate-100 text-slate-800 border-slate-300 ring-2 ring-slate-200",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    color: "bg-blue-50/50 text-blue-600 border-blue-100",
    activeColor: "bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-100",
  },
  {
    value: "HIGH",
    label: "High",
    color: "bg-orange-50/50 text-orange-600 border-orange-100",
    activeColor: "bg-orange-50 text-orange-700 border-orange-300 ring-2 ring-orange-100",
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Trích xuất ID số nguyên (Number ID) một cách an toàn.
 */
export const toNumberId = (maybeId: unknown): number => {
  if (typeof maybeId === "number") return maybeId;
  if (typeof maybeId === "string") return Number(maybeId);
  if (typeof maybeId === "object" && maybeId && "id" in maybeId) {
    return Number((maybeId as any).id);
  }
  return NaN;
};

// =============================================================================
// 3. INTERFACES
// =============================================================================

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  workspaceId: number | { id: number };
  onSuccess: (project: any) => void;
}

interface ProjectFormState {
  name: string;
  projectCode: string;
  description: string;
  goal: string;
  priority: string;
  startDate: string;
  dueDate: string;
}

const INITIAL_FORM_STATE: ProjectFormState = {
  name: "",
  projectCode: "",
  description: "",
  goal: "",
  priority: "MEDIUM",
  startDate: "",
  dueDate: "",
};

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Modal khởi tạo Dự án mới (Create Project Modal).
 * Cho phép thiết lập tên dự án, mã KEY dự án, mục tiêu, độ ưu tiên và ảnh bìa.
 */
export default function CreateProjectModal({
  isOpen,
  onClose,
  companyId,
  workspaceId,
  onSuccess,
}: CreateProjectModalProps) {
  
  // ---------------------------------------------------------------------------
  // 5. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<ProjectFormState>(INITIAL_FORM_STATE);
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 6. EFFECTS
  // ---------------------------------------------------------------------------

  /**
   * Reset toàn bộ dữ liệu form khi modal đóng lại
   */
  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_FORM_STATE);
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Cố tình bỏ qua `previewUrl` ở deps để tránh re-run liên tục

  // ---------------------------------------------------------------------------
  // 7. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Cập nhật thông tin từng trường riêng lẻ (Patch Update form)
   */
  const handleUpdateForm = useCallback((field: keyof ProjectFormState, value: string) => {
     setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Tự động sinh mã KEY (projectCode) dự án dựa trên Tên dự án.
   * Logic: Lấy các chữ cái đầu của mỗi từ, tối đa 5 ký tự.
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    
    // Nếu projectCode đang trống (hoặc đang auto-gen giống cái cũ), thì tự động gen mã KEY
    const words = newName.trim().split(/\s+/);
    let autoCode = "";
    
    if (words.length === 1) {
       autoCode = words[0].substring(0, 3).toUpperCase();
    } else {
       autoCode = words.map(w => w.charAt(0)).join("").toUpperCase().substring(0, 5);
    }

    setForm(prev => ({ 
      ...prev, 
      name: newName, 
      // Chỉ auto-gen nếu mã key hiện tại chưa bị user tự sửa thủ công
      projectCode: prev.projectCode ? prev.projectCode : autoCode 
    }));
  };

  /**
   * Xử lý tiếp nhận file ảnh tải lên
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      showToast("File size too large (Max. 5MB allowed)", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /**
   * Gỡ bỏ ảnh đã tải lên
   */
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /**
   * Submit gọi API tạo Project
   */
  const handleCreateProject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation cơ bản
    if (!form.name.trim() || !form.projectCode.trim()) {
      showToast("Project Name and Key are required fields", "warning");
      return;
    }

    const wsId = toNumberId(workspaceId);
    if (Number.isNaN(companyId) || Number.isNaN(wsId)) {
      showToast("System error: Invalid workspace identity", "error");
      return;
    }

    setIsLoading(true);
    try {
      const payload: ProjectRequest = {
        name: form.name.trim(),
        projectCode: form.projectCode.trim(),
        description: form.description || null,
        goal: form.goal || null,
        priority: form.priority as "LOW" | "MEDIUM" | "HIGH",
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        coverImageUrl: null, // Ảnh được gửi kèm như một part của FormData 
      };

      const newProject = await createProject(companyId, wsId, payload, selectedFile);

      onSuccess(newProject);
      showToast("Project initialized successfully", "success");
      onClose();
    } catch (error: any) {
      console.error("Create Project Error:", error);
      const message = error.response?.data?.message || error.message || "Failed to initialize project";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 8. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      
      {/* KHỐI MODAL */}
      <Card 
        className="w-full max-w-[700px] max-h-[90vh] bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        
        {/* ================= HEADER ================= */}
        <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] border border-[#2684FF]/20 flex items-center justify-center shadow-sm">
              <FolderPlus className="w-5 h-5 text-[#0052CC]" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-800 font-bold tracking-tight">
                Create New Project
              </CardTitle>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-0.5">
                Start a fresh initiative
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
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-white custom-scrollbar">
          <form onSubmit={handleCreateProject} className="space-y-6">
            
            {/* Tên Dự án */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Project Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={handleNameChange}
                placeholder="e.g. Website Redesign 2026"
                className="h-11 border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {/* Mã Project (KEY) & Độ ưu tiên (Priority) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Code className="w-3.5 h-3.5" /> Project Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={form.projectCode}
                    onChange={(e) => handleUpdateForm("projectCode", e.target.value.toUpperCase())}
                    placeholder="WBR26"
                    className="h-10 border-slate-300 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm pr-12"
                    disabled={isLoading}
                    maxLength={10}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    KEY
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5" /> Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITY_OPTIONS.map((option) => {
                    const isActive = form.priority === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleUpdateForm("priority", option.value)}
                        className={cn(
                          "px-2 h-10 rounded-md text-[11px] font-bold uppercase tracking-widest border transition-all",
                          isActive 
                            ? option.activeColor 
                            : cn(option.color, "bg-white hover:bg-slate-50")
                        )}
                        disabled={isLoading}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Thời gian thực hiện (Timeline) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Start Date
                </label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleUpdateForm("startDate", e.target.value)}
                  className="h-10 border-slate-300 text-[13px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm bg-white"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" /> Target End Date
                </label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => handleUpdateForm("dueDate", e.target.value)}
                  className="h-10 border-slate-300 text-[13px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm bg-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Mô tả (Description) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Project Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => handleUpdateForm("description", e.target.value)}
                rows={3}
                placeholder="What is the main objective of this project?"
                className="resize-none border-slate-300 text-[13px] focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] transition-all shadow-sm bg-slate-50 focus:bg-white placeholder:text-slate-400 p-3"
                disabled={isLoading}
              />
            </div>

            {/* Tải ảnh bìa (Cover Image Upload) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" /> Cover Image
              </label>

              {!previewUrl ? (
                // Nút tải ảnh lên
                <div
                  onClick={() => !isLoading && fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all group",
                    isLoading
                      ? "cursor-not-allowed border-slate-200 bg-slate-50/50"
                      : "cursor-pointer border-slate-300 hover:bg-[#E3F2FD] hover:border-[#2684FF]"
                  )}
                >
                  <div className={cn(
                    "p-3 bg-blue-50 border border-blue-100 rounded-full mb-3 transition-transform",
                    isLoading ? "opacity-50" : "group-hover:scale-110"
                  )}>
                    <UploadCloud className="w-5 h-5 text-[#0052CC]" />
                  </div>
                  <p className="text-[13px] font-bold text-slate-700">
                    Upload an image cover
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">
                    SVG, PNG, JPG (Max 5MB)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isLoading}
                  />
                </div>
              ) : (
                // Khu vực xem trước ảnh
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm w-full h-[180px] bg-slate-100 group">
                  <img
                    src={previewUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="gap-2 shadow-xl font-bold uppercase tracking-widest text-[11px]"
                    >
                      <Trash2 className="w-4 h-4" /> Remove Image
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Nút Submit ẩn để bắt sự kiện Enter trên bàn phím */}
            <button type="submit" className="hidden" />
          </form>
        </div>

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
            onClick={() => handleCreateProject()}
            disabled={isLoading || !form.name.trim() || !form.projectCode.trim()}
            className={cn(
              "h-10 px-6 text-[12px] uppercase tracking-widest font-bold text-white shadow-md transition-all",
              "bg-[#0052CC] hover:bg-[#0047B3] active:scale-95 disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Initializing
              </span>
            ) : (
              "Create Project"
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