"use client";

import { useState } from "react";
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
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}: any) {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  // ảnh người dùng chọn từ máy
  const [file, setFile] = useState<File | null>(null);

  // preview hình ảnh
  const [preview, setPreview] = useState<string | null>(null);

  // form
  const [form, setForm] = useState({
    workspaceName: "",
    description: "",
    color: "#3B82F6",
  });

  const resetForm = () => {
    setForm({
      workspaceName: "",
      description: "",
      color: "#3B82F6",
    });
    setFile(null);
    setPreview(null);
  };

  const handleImageChange = (e: any) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) {
      setPreview(URL.createObjectURL(f)); // FIX: luôn hiển thị preview
    } else {
      setPreview(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.workspaceName.trim()) {
      showToast("Vui lòng nhập tên workspace!", "warning");
      return;
    }

    setLoading(true);
    try {
      const newWs = await createWorkspace(companyId, {
        ...form,
        file, // gửi file hoặc null
      });

      onSuccess(newWs);
      resetForm();
    } catch (err: any) {
      showToast(err.message || "Không thể tạo workspace!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const colorOptions = [
    "#3B82F6", "#8B5CF6", "#EC4899", "#10B981",
    "#F59E0B", "#EF4444", "#14B8A6", "#6366F1"
  ];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] rounded-xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
      >
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Layout className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Create Workspace</CardTitle>
              <p className="text-xs text-slate-500">Set up a new workspace</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleCreate} className="space-y-6">

            {/* NAME */}
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
                placeholder="e.g. Marketing Team"
                className="h-10"
                autoFocus
              />
            </div>

            {/* DESCRIPTION */}
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
                placeholder="Describe this workspace..."
                className="resize-none"
              />
            </div>

            {/* COLOR PICKER */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-500" />
                Background Color (if no image)
              </label>

              <div className="flex flex-wrap gap-3">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{ backgroundColor: c }}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-full ${
                      form.color === c ? "ring-2 ring-offset-2 ring-slate-400" : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                Cover Image (optional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="border border-slate-300 h-10 rounded-md file:bg-slate-200 file:px-4 file:py-2 file:border-0"
              />

              {/* PREVIEW */}
              {preview ? (
                <div className="mt-2 w-full h-32 rounded-lg border overflow-hidden">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="mt-2 w-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-slate-400 text-xs"
                  style={{ backgroundColor: `${form.color}20` }}
                >
                  No image selected
                </div>
              )}
            </div>

            <button type="submit" className="hidden" />
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-4 border-t bg-slate-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            disabled={loading}
            onClick={handleCreate}
            className="bg-blue-600 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating…
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
