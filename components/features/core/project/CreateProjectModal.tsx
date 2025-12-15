"use client";

import { useState, useRef } from "react";
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
import { createProject, ProjectRequest } from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";
import { Card, CardHeader, CardTitle } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextAreas";

// =============================================================================
// 1. CONSTANTS & HELPERS
// =============================================================================

const PRIORITY_OPTIONS = [
  {
    value: "LOW",
    label: "Low",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "HIGH",
    label: "High",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Helper: Chuyển đổi ID sang number an toàn
export const toNumberId = (maybeId: unknown): number => {
  if (typeof maybeId === "number") return maybeId;
  if (typeof maybeId === "string") return Number(maybeId);
  if (typeof maybeId === "object" && maybeId && (maybeId as any).id != null) {
    return Number((maybeId as any).id);
  }
  return NaN;
};

// =============================================================================
// 2. INTERFACES
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

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function CreateProjectModal({
  isOpen,
  onClose,
  companyId,
  workspaceId,
  onSuccess,
}: CreateProjectModalProps) {
  // --- HOOKS ---
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE FORM ---
  const [form, setForm] = useState<ProjectFormState>({
    name: "",
    projectCode: "",
    description: "",
    goal: "",
    priority: "MEDIUM",
    startDate: "",
    dueDate: "",
  });

  // --- STATE FILE UPLOAD ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- HANDLERS: FILE ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        showToast("File size too large (max. 5MB)", "error");
        // Reset input field
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Update state and create preview URL
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Revoke old URL to free memory (cleanup)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // --- HANDLERS: FORM ---

  const resetForm = () => {
    setForm({
      name: "",
      projectCode: "",
      description: "",
      goal: "",
      priority: "MEDIUM",
      startDate: "",
      dueDate: "",
    });
    handleRemoveFile(); // Reset file state as well
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim() || !form.projectCode.trim()) {
      showToast("Please enter the project name and key.", "warning");
      return;
    }

    const wsId = toNumberId(workspaceId);
    if (Number.isNaN(companyId) || Number.isNaN(wsId)) {
      showToast("Invalid Company ID or Workspace ID.", "error");
      return;
    }

    setLoading(true);
    try {
      // 1. Prepare Payload
      const payload: ProjectRequest = {
        name: form.name.trim(),
        projectCode: form.projectCode.trim(),
        description: form.description || null,
        goal: form.goal || null,
        priority: form.priority as "LOW" | "MEDIUM" | "HIGH",
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        // coverImageUrl is now handled by the file upload logic, sent as null in payload
        coverImageUrl: null,
      };

      // 2. Call API (including file upload if selectedFile is present)
      const newProject = await createProject(
        companyId,
        wsId,
        payload,
        selectedFile
      );

      // 3. Success
      onSuccess(newProject);
      resetForm();
      showToast("Project created successfully!", "success");
      onClose();
    } catch (err: any) {
      console.error("CreateProject error:", err?.response?.data || err);
      // Use API error message if available
      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to create project.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER GUARD ---
  if (!isOpen) return null;

  // --- RENDER UI ---
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Modal Card */}
      <Card className="w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 shadow-2xl rounded-xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* HEADER */}
        <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 flex flex-row items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
              <FolderPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 font-bold">
                Create Project
              </CardTitle>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Start a new initiative
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* BODY: Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
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
                disabled={loading}
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
                    onChange={(e) =>
                      setForm({
                        ...form,
                        projectCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="PRJ"
                    className="h-10 border-slate-300 rounded-md text-sm font-mono font-medium uppercase focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm pr-10"
                    disabled={loading}
                    maxLength={10}
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
                  {PRIORITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, priority: option.value })
                      }
                      className={`
                        px-3 py-2 rounded-md text-xs font-bold border transition-all
                        ${
                          form.priority === option.value
                            ? `${option.color} ring-2 ring-offset-1 ring-slate-200`
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }
                      `}
                      disabled={loading}
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
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Due Date
                </label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                  disabled={loading}
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
                disabled={loading}
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
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="Describe the project scope..."
                className="resize-none border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                disabled={loading}
              />
            </div>

            {/* FILE UPLOAD (Cover Image) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                Cover Image
              </label>

              {!previewUrl ? (
                // 1. Upload Button
                <div
                  onClick={() => !loading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all group ${
                    loading
                      ? "cursor-not-allowed border-slate-200 bg-slate-50/50"
                      : "cursor-pointer border-slate-300 hover:bg-blue-50 hover:border-blue-400"
                  }`}
                >
                  <div
                    className={`p-3 bg-blue-50 rounded-full mb-3 transition-transform ${
                      loading ? "opacity-50" : "group-hover:scale-110"
                    }`}
                  >
                    <UploadCloud className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Click to upload image
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    SVG, PNG, JPG or GIF (max. 5MB)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={loading}
                  />
                </div>
              ) : (
                // 2. Preview + Remove Button
                <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm w-full h-40 bg-slate-100 group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="gap-2 shadow-md"
                    >
                      <Trash2 className="w-4 h-4" /> Remove Image
                    </Button>
                  </div>
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
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit" // Trigger form submit
            onClick={handleCreate}
            disabled={loading || !form.name.trim() || !form.projectCode.trim()}
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
