"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  FolderPlus, // Thay icon Plus bằng FolderPlus cho hợp ngữ cảnh Project
  Image as ImageIcon,
  Calendar,
  Flag,
  Target,
  FileText,
  Code,
  ChevronDown // Thêm icon cho select
} from "lucide-react";
import { createProject, ProjectRequest } from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Giả sử bạn có component Button
import { Input } from "@/components/ui/input";   // Giả sử bạn có component Input
import { Textarea } from "@/components/ui/textarea"; // Giả sử bạn có component Textarea
import { useParams } from "next/navigation";


export const toNumberId = (maybeId: unknown): number => {
  if (typeof maybeId === 'number') return maybeId;
  if (typeof maybeId === 'string') return Number(maybeId);
  if (typeof maybeId === 'object' && maybeId && (maybeId as any).id != null) {
    return Number((maybeId as any).id);
  }
  return NaN;
};


export default function CreateProjectModal({
  isOpen,
  onClose,
  companyId,
  workspaceId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;                        // ✅ truyền từ parent
  workspaceId: number | { id: number };    // ✅ truyền từ parent
  onSuccess: (project: any) => void;
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    projectCode: "",
    description: "",
    goal: "",
    coverImageUrl: "",
    priority: "MEDIUM",
    startDate: "",
    dueDate: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      projectCode: "",
      description: "",
      goal: "",
      coverImageUrl: "",
      priority: "MEDIUM",
      startDate: "",
      dueDate: "",
    });
  };

const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.projectCode.trim()) {
      showToast("Vui lòng nhập đầy đủ tên và mã dự án!", "warning");
      return;
    }

    
    const wsId = toNumberId(workspaceId);
    if (Number.isNaN(companyId) || Number.isNaN(wsId)) { /* guard */ }


    setLoading(true);
    try {
      const payload: ProjectRequest = {
        name: form.name,
        projectCode: form.projectCode,
        description: form.description || null,
        goal: form.goal || null,
        priority: form.priority as "LOW" | "MEDIUM" | "HIGH",
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        coverImageUrl: form.coverImageUrl || null, // nếu sau này có upload file, đặt null và truyền file
      };

      const newProject = await createProject(companyId, wsId, payload /*, file */);
      onSuccess(newProject);
      resetForm();
      showToast("Tạo dự án thành công!", "success");
      onClose?.();
    } catch (err: any) {
      console.error("CreateProject error:", err?.response?.data || err);
      showToast(err?.message || "Không thể tạo dự án!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;


  const priorityOptions = [
    { value: "LOW", label: "Low", color: "bg-slate-100 text-slate-700 border-slate-200" },
    { value: "MEDIUM", label: "Medium", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { value: "HIGH", label: "High", color: "bg-orange-50 text-orange-700 border-orange-200" },
  ];

  return (
    // 1. Backdrop tối giản
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* 2. Modal Card: Nền trắng, Shadow lớn */}
      <Card className="w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 shadow-2xl rounded-xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">

        {/* HEADER */}
        <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 flex flex-row items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
              <FolderPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 font-bold">Create Project</CardTitle>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Start a new initiative</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* BODY: Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form onSubmit={handleCreate} className="space-y-6">
            
            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                Project Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Customer Portal Revamp"
                className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                autoFocus
              />
            </div>

            {/* Row: Code & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Code */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Code className="w-4 h-4 text-slate-500" />
                  Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Input
                        value={form.projectCode}
                        onChange={(e) => setForm({ ...form, projectCode: e.target.value.toUpperCase() })}
                        placeholder="PRJ"
                        className="h-10 border-slate-300 rounded-md text-sm font-mono font-medium uppercase focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm pr-10"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-xs text-slate-400 font-medium">
                        KEY
                    </div>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-slate-500" />
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: option.value })}
                      className={`
                        px-3 py-2 rounded-md text-xs font-bold border transition-all
                        ${form.priority === option.value 
                            ? `${option.color} ring-2 ring-offset-1 ring-slate-200` 
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Goal */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-500" />
                Project Goal
              </label>
              <Input
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                placeholder="What is the main objective?"
                className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
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
                placeholder="Describe the project scope..."
                className="resize-none border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                Cover Image (URL)
              </label>
              <Input
                value={form.coverImageUrl}
                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
              />
              {form.coverImageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 shadow-sm w-full h-32 bg-slate-50 flex items-center justify-center">
                  <img
                    src={form.coverImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Hidden Submit Button to allow Enter key submission */}
            <button type="submit" className="hidden" />
          </form>
        </div>

        {/* FOOTER ACTIONS */}
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
              "Create Project"
            )}
          </Button>
        </div>

      </Card>
    </div>
  );
}