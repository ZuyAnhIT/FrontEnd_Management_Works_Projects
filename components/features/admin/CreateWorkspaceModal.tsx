"use client";

import { useState, useRef } from "react";
import {
  X,
  Loader2,
  Image as ImageIcon,
  FileText,
  Building,
  Palette,
  Layout,
} from "lucide-react";

import { createWorkspace } from "@/services/apiWorkspace";
import { useToast } from "@/components/ui/ToastProvider";
import { Card, CardHeader, CardTitle } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextAreas";

// =============================================================================
// 1. CONSTANTS & TYPES
// =============================================================================

// Danh sách màu nền mặc định
const COLOR_OPTIONS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#6366F1",
];

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  onSuccess: (newWorkspace: any) => void;
}

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

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}: CreateWorkspaceModalProps) {
  // --- HOOKS ---
  const { showToast } = useToast();

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<WorkspaceFormState>(INITIAL_FORM_STATE);

  // State quản lý file upload & preview
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // =========================================================================
  // 3. HANDLERS
  // =========================================================================

  // Reset form về trạng thái ban đầu
  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setFile(null);
    setPreview(null);
  };

  // Xử lý khi người dùng chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);

    if (selectedFile) {
      // Tạo URL preview cho ảnh vừa chọn
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  // Xử lý Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dữ liệu đầu vào
    if (!form.workspaceName.trim()) {
      showToast("Workspace name is required.", "warning");
      return;
    }

    setLoading(true);
    try {
      // Gọi API tạo Workspace (kèm file nếu có)
      const newWs = await createWorkspace(companyId, {
        ...form,
        file,
      });

      // Thành công: gọi callback và reset form
      onSuccess(newWs);
      resetForm();
      onClose(); // Đóng modal sau khi tạo thành công (Thêm vào cho UX tốt hơn)
    } catch (err: any) {
      // Lỗi: hiển thị message từ API trả về
      showToast(err.message || "Failed to create workspace.", "error");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 4. RENDER
  // =========================================================================

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] rounded-xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* --- HEADER --- */}
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Layout className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                Create Workspace
              </CardTitle>
              <p className="text-xs text-slate-500">
                Set up a new workspace for your team
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* --- BODY --- */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field: Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-500" />
                Workspace Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.workspaceName}
                onChange={(e) =>
                  setForm({ ...form, workspaceName: e.target.value })
                }
                placeholder="e.g. Marketing Team, Product Design..."
                className="h-10"
                autoFocus
                disabled={loading}
              />
            </div>

            {/* Field: Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="Briefly describe the purpose of this workspace..."
                className="resize-none"
                disabled={loading}
              />
            </div>

            {/* Field: Color Picker */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-500" />
                Theme Color
              </label>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{ backgroundColor: c }}
                    onClick={() => setForm({ ...form, color: c })}
                    disabled={loading}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      form.color === c
                        ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Field: Image Upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                Cover Image (Optional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />

              {/* Preview Area */}
              {preview ? (
                <div className="mt-2 w-full h-32 rounded-lg border overflow-hidden relative group">
                  <img
                    src={preview}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="mt-2 w-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-slate-400 text-xs transition-colors"
                  style={{ backgroundColor: `${form.color}15` }} // 15% opacity của màu đã chọn
                >
                  No image selected
                </div>
              )}
            </div>

            {/* Hidden submit button to allow Enter key submission */}
            <button type="submit" className="hidden" />
          </form>
        </div>

        {/* --- FOOTER --- */}
        <div className="flex justify-end gap-3 p-4 border-t bg-slate-50">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Workspace"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
