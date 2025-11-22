"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Settings,
  Loader2,
  Save,
  Palette,
  FileText,
  AlertTriangle,
  Image as ImageIcon,
  Building,
  Check,
  Layout
} from "lucide-react";

import {
  getWorkspaceDetail,
  updateWorkspace,
  deleteWorkspace,
} from "@/services/apiWorkspace";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function WorkspaceSettingsPage() {
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const workspaceId = Number(params.workspaceId);

  // ✅ Lấy activeCompany từ Context
  const { activeCompany, isLoading: isAuthLoading } = useAuth();
  const companyId = activeCompany?.companyId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Delete states
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [form, setForm] = useState({
    workspaceName: "",
    description: "",
    coverImage: "",
    color: "#3B82F6", // Default Blue
  });

  // 1. Load Data
  useEffect(() => {
    if (isAuthLoading) return;
    
    if (!companyId || !workspaceId) {
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

  // 2. Handlers
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

  const handleDeleteConfirm = async () => {
    if (!companyId) return;
    setDeleting(true);
    try {
      await deleteWorkspace(companyId, workspaceId);
      showToast("Workspace deleted successfully", "success");
      setIsDeleteModalOpen(false);
      router.push("/admin/company/workspaces"); // Quay về danh sách workspace
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  // 3. Render UI
  if (isAuthLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );

  if (!companyId)
    return <div className="p-8 text-center">No Active Company</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              {/* Icon đại diện */}
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm border border-slate-200"
                style={{ backgroundColor: form.color }}
              >
                 <span className="text-white font-bold text-2xl">
                    {form.workspaceName.charAt(0).toUpperCase()}
                 </span>
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-slate-900">Workspace Settings</h1>
                 <p className="text-sm text-slate-500">Manage details for <span className="font-semibold text-slate-800">{form.workspaceName}</span></p>
              </div>
           </div>

           <Button 
              onClick={handleSubmit} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-6 min-w-[120px]"
           >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {saving ? "Saving..." : "Save Changes"}
           </Button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. General Info */}
          <Card className="border border-slate-200 shadow-sm bg-white">
             <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                   <Layout className="w-4 h-4 text-slate-500" /> General Information
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-5">
                
                {/* Name */}
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      Workspace Name <span className="text-red-500">*</span>
                   </label>
                   <Input
                      value={form.workspaceName}
                      onChange={(e) => handleChange("workspaceName", e.target.value)}
                      placeholder="e.g. Marketing Team"
                      className="h-10"
                   />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-900">Description</label>
                   <Textarea
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Describe the purpose of this workspace..."
                      rows={3}
                      className="resize-none"
                   />
                </div>
             </CardContent>
          </Card>

          {/* 2. Appearance */}
          <Card className="border border-slate-200 shadow-sm bg-white">
             <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                   <Palette className="w-4 h-4 text-slate-500" /> Appearance
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                
                {/* Cover Image URL */}
                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-slate-400" /> Cover Image URL
                   </label>
                   <Input
                      value={form.coverImage}
                      onChange={(e) => handleChange("coverImage", e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                      className="h-10"
                   />
                   <p className="text-xs text-slate-500">Enter a direct link to an image.</p>
                </div>

                {/* Theme Color */}
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-900">Theme Color</label>
                   <div className="flex items-center gap-3 h-10 px-3 border border-slate-300 rounded-md bg-white w-full max-w-[200px]">
                      <input
                         type="color"
                         value={form.color}
                         onChange={(e) => handleChange("color", e.target.value)}
                         className="w-8 h-8 border-none rounded cursor-pointer bg-transparent p-0"
                      />
                      <span className="text-sm font-mono text-slate-600 uppercase">{form.color}</span>
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* 3. Danger Zone */}
          <Card className="border border-red-200 shadow-sm bg-white overflow-hidden">
             <CardHeader className="border-b border-red-100 bg-red-50/50 pb-4">
                <CardTitle className="text-base font-bold text-red-800 flex items-center gap-2">
                   <AlertTriangle className="w-4 h-4 text-red-600" /> Danger Zone
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                   <h4 className="font-bold text-slate-900 text-sm">Delete this Workspace</h4>
                   <p className="text-xs text-slate-500 mt-1 max-w-md">
                      Once you delete a workspace, there is no going back. All projects and tasks inside will be permanently removed.
                   </p>
                </div>
                <Button
                   type="button"
                   variant="outline"
                   onClick={() => setIsDeleteModalOpen(true)}
                   disabled={deleting}
                   className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-semibold"
                >
                   Delete Workspace
                </Button>
             </CardContent>
          </Card>

        </form>

        {/* MODAL CONFIRM DELETE */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          isLoading={deleting}
          title="Delete Workspace?"
          description={`This will permanently delete "${form.workspaceName}" and all associated data.`}
          confirmText="Delete"
          cancelText="Cancel"
          modalVariant="danger"
        />

      </div>
    </div>
  );
}