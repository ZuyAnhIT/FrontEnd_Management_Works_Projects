"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  X,
  Loader2,
  Image as ImageIcon,
  FileText,
  Building,
  Palette,
  Layout,
} from "lucide-react";

// Internal Services & Components
import { createWorkspace } from "@/services/apiWorkspace";
import { useToast } from "@/components/ui/ToastProvider";
import { Card, CardHeader, CardTitle } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { cn } from "@/lib/utils";

// =============================================================================
// CONSTANTS & TYPES
// =============================================================================

/**
 * Danh sách mã màu chủ đạo cho không gian làm việc
 */
const WORKSPACE_COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#10B981",
  "#F59E0B", "#EF4444", "#14B8A6", "#6366F1",
];

interface WorkspaceFormState {
  workspaceName: string;
  description: string;
  color: string;
}

const INITIAL_FORM_STATE: WorkspaceFormState = {
  workspaceName: "",
  description: "",
  color: "#3B82F6",
};

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  onSuccess: (newWorkspace: any) => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần cửa sổ tạo mới Không gian làm việc (Workspace).
 * Quản lý logic nhập liệu, xem trước hình ảnh và tương tác với API.
 */
export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}: CreateWorkspaceModalProps) {
  // ---------------------------------------------------------------------------
  // 1. HOOKS & STATE
  // ---------------------------------------------------------------------------
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<WorkspaceFormState>(INITIAL_FORM_STATE);
  
  // Quản lý tệp tin và hình ảnh xem trước
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 2. LOGIC HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Khôi phục trạng thái form về mặc định
   */
  const handleResetForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  /**
   * Xử lý lựa chọn tệp tin hình ảnh
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  /**
   * Gửi dữ liệu tạo Workspace lên máy chủ
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.workspaceName.trim()) {
      showToast("Workspace name is required", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createWorkspace(companyId, {
        ...form,
        file,
      });

      showToast("Workspace created successfully", "success");
      onSuccess(response);
      handleResetForm();
      onClose();
    } catch (error: any) {
      showToast(error.message || "Failed to create workspace", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. RENDER
  // ---------------------------------------------------------------------------
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] rounded-xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* KHU VỰC TIÊU ĐỀ (HEADER) */}
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Layout className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Create Workspace
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Set up a new shared environment for your team projects
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* KHU VỰC NHẬP LIỆU (BODY) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="create-workspace-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tên không gian làm việc */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                Workspace Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.workspaceName}
                onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
                placeholder="e.g. Engineering, Marketing Campaign..."
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Mô tả chi tiết */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What is the primary goal of this workspace?"
                rows={3}
                className="resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Lựa chọn màu sắc chủ đạo */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-400" />
                Theme Color
              </label>
              <div className="flex flex-wrap gap-3 p-1">
                {WORKSPACE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    style={{ backgroundColor: color }}
                    onClick={() => setForm({ ...form, color })}
                    disabled={isLoading}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all hover:scale-110",
                      form.color === color 
                        ? "ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-md" 
                        : "opacity-80"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Tải lên ảnh bìa */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                Cover Image
              </label>
              
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />

                {/* Vùng xem trước hình ảnh */}
                <div 
                  className="w-full h-32 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors"
                  style={{ 
                    backgroundColor: `${form.color}08`,
                    borderColor: previewUrl ? "transparent" : `${form.color}30` 
                  }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover animate-in fade-in duration-300"
                    />
                  ) : (
                    <span className="text-slate-400 text-xs font-medium">
                      No cover image selected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* KHU VỰC HÀNH ĐỘNG (FOOTER) */}
        <div className="flex justify-end gap-3 p-4 border-t bg-slate-50/50 shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className="h-10 px-6"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="create-workspace-form"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px] h-10 shadow-sm"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              "Create Workspace"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}