"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  Sparkles, // Thay PlusCircle bằng Sparkles hoặc icon khác phù hợp hơn nếu muốn
  Image as ImageIcon,
  FileText,
  Building,
  Palette,
  Layout,
} from "lucide-react";
import { createWorkspace } from "@/services/apiWorkspace";
import { useToast } from "@/components/ui/ToastProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [form, setForm] = useState({
    workspaceName: "",
    description: "",
    coverImage: "",
    color: "#3B82F6",
  });

  const resetForm = () => {
    setForm({
      workspaceName: "",
      description: "",
      coverImage: "",
      color: "#3B82F6",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workspaceName.trim()) {
      showToast("Vui lòng nhập tên workspace!", "warning");
      return;
    }
    setLoading(true);
    try {
      const newWorkspace = await createWorkspace(companyId, form);
      onSuccess(newWorkspace);
      resetForm();
    } catch (err: any) {
      showToast(err.message || "Không thể tạo workspace!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const colorOptions = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Green", value: "#10B981" },
    { name: "Orange", value: "#F59E0B" },
    { name: "Red", value: "#EF4444" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Indigo", value: "#6366F1" },
  ];

  return (
    // 1. Backdrop tối giản
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 2. Modal Card */}
      <Card 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200 shadow-2xl rounded-xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Header */}
        <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 flex flex-row items-center justify-between sticky top-0 z-10 shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                <Layout className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                 <CardTitle className="text-xl text-slate-900 font-bold">Create Workspace</CardTitle>
                 <p className="text-slate-500 text-xs font-medium mt-0.5">Set up a new space for your team</p>
              </div>
           </div>

           <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* Body: Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
           <form onSubmit={handleCreate} className="space-y-6">
              
              {/* Name */}
              <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-500" />
                    Workspace Name <span className="text-red-500">*</span>
                 </label>
                 <Input
                    value={form.workspaceName}
                    onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
                    placeholder="e.g. Marketing Team"
                    className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                    autoFocus
                 />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Description
                 </label>
                 <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="What is this workspace for?"
                    className="resize-none border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                 />
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-500" />
                    Theme Color
                 </label>
                 <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                       <button
                          key={color.value}
                          type="button"
                          onClick={() => setForm({ ...form, color: color.value })}
                          className={`
                             w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center
                             ${form.color === color.value ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"}
                          `}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                       >
                          {form.color === color.value && <div className="w-2 h-2 bg-white rounded-full" />}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    Cover Image (URL)
                 </label>
                 <Input
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                 />
                 {form.coverImage ? (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 shadow-sm w-full h-32 bg-slate-50 flex items-center justify-center">
                       <img
                          src={form.coverImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                       />
                    </div>
                 ) : (
                    <div className="mt-2 h-24 w-full rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center" style={{backgroundColor: `${form.color}10`}}>
                       <span className="text-xs text-slate-400">No cover image selected</span>
                    </div>
                 )}
              </div>

              {/* Hidden Submit */}
              <button type="submit" className="hidden" />
           </form>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
           <Button
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 text-sm font-semibold text-slate-700 border-slate-300 hover:bg-white hover:text-slate-900 transition-colors"
           >
              Cancel
           </Button>

           <Button
              onClick={handleCreate}
              disabled={loading}
              className="h-10 px-6 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
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