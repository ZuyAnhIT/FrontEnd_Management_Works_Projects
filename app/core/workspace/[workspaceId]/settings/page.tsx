"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Settings,
  Loader2,
  Save,
  Palette,
  FileText,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
  Building
} from "lucide-react";

import {
  getWorkspaceDetail,
  updateWorkspace,
  deleteWorkspace,
} from "@/services/apiWorkspace";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import LoadingButton from "@/components/ui/LoadingButton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Giả sử có
import { Input } from "@/components/ui/input"; // Giả sử có
import { Textarea } from "@/components/ui/textarea"; // Giả sử có

export default function WorkspaceSettingsPage() {
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const workspaceId = Number(params.workspaceId);

  const { user, isLoading: isAuthLoading } = useAuth();
  const companyId = user?.company?.companyId || null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [form, setForm] = useState({
    workspaceName: "",
    description: "",
    coverImage: "",
    color: "#3B82F6",
  });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!companyId || !workspaceId) {
      if (!isAuthLoading)
        showToast("Error: Workspace not found", "error");
      setLoading(false);
      return;
    }

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const data = await getWorkspaceDetail(companyId, workspaceId);
        setForm({
          workspaceName: data.workspaceName || "",
          description: data.description || "",
          coverImage: data.coverImage || "",
          color: data.color || "#3B82F6",
        });
      } catch (err: any) {
        showToast(err.message || "Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [companyId, workspaceId, isAuthLoading, showToast]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workspaceName.trim()) {
      showToast("Workspace name is required", "warning");
      return;
    }
    if (!companyId) return;

    setSaving(true);
    try {
      await updateWorkspace(companyId, workspaceId, {
        name: form.workspaceName,
        description: form.description,
        coverImage: form.coverImage,
        color: form.color,
      });
      showToast("Settings updated successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = () => {
    if (!form.workspaceName) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!companyId) return;

    setDeleting(true);
    try {
      await deleteWorkspace(companyId, workspaceId);
      showToast("Workspace deleted successfully", "success");
      setIsDeleteModalOpen(false); 
      router.push("/core"); 
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
      setDeleting(false); 
    }
  };

  if (isAuthLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto py-10 px-6 space-y-8">
        
        {/* Header Page */}
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Workspace Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage general details and danger zone</p>
        </div>

        {/* 1. GENERAL SETTINGS CARD */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-slate-100 bg-white">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-md">
                   <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                   <CardTitle className="text-lg font-bold text-slate-900">General Details</CardTitle>
                   <p className="text-xs text-slate-500">Update workspace information</p>
                </div>
             </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                   <Building className="w-4 h-4 text-slate-500" />
                   Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.workspaceName}
                  onChange={(e) => handleChange("workspaceName", e.target.value)}
                  className="h-10 border-slate-300 focus:ring-blue-100 focus:border-blue-600"
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
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="resize-none border-slate-300 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover Image */}
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-slate-500" /> Cover URL
                   </label>
                   <Input
                      value={form.coverImage}
                      onChange={(e) => handleChange("coverImage", e.target.value)}
                      placeholder="https://..."
                      className="h-10 border-slate-300 focus:ring-blue-100 focus:border-blue-600"
                   />
                </div>

                {/* Color */}
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-slate-500" /> Theme Color
                   </label>
                   <div className="flex items-center gap-3 h-10 px-3 border border-slate-300 rounded-md bg-white">
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => handleChange("color", e.target.value)}
                        className="w-6 h-6 border-none rounded cursor-pointer bg-transparent p-0"
                      />
                      <span className="text-sm font-mono text-slate-600">{form.color}</span>
                   </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <LoadingButton
                  type="submit"
                  isLoading={saving}
                  text="Save Changes"
                  loadingText="Saving..."
                  className="bg-blue-600 hover:bg-blue-700 font-bold shadow-sm px-6"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 2. DANGER ZONE CARD */}
        <Card className="bg-white border border-red-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-red-100 bg-red-50/50">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-md border border-red-200">
                   <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                   <CardTitle className="text-lg font-bold text-red-900">Danger Zone</CardTitle>
                   <p className="text-xs text-red-700">Irreversible actions</p>
                </div>
             </div>
          </CardHeader>

          <CardContent className="p-6 flex items-center justify-between gap-4">
             <div>
                <h4 className="font-bold text-slate-900 text-sm">Delete this Workspace</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                   Once you delete a workspace, there is no going back. Please be certain.
                </p>
             </div>
             <LoadingButton
                type="button"
                onClick={openDeleteModal}
                isLoading={deleting}
                text="Delete Workspace"
                loadingText="Deleting..."
                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold shadow-sm"
             />
          </CardContent>
        </Card>

        {/* CONFIRM MODAL */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isLoading={deleting}
          title="Delete Workspace?"
          description={`This will permanently delete "${form.workspaceName}" and all of its data.`}
          confirmText="Delete"
        />
      </div>
    </div>
  );
}