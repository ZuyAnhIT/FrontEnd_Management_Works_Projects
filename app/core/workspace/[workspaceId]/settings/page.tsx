"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Settings,
  Loader2,
  Save,
  Palette,
  FileText,
  AlertTriangle,
  Image as ImageIcon,
  Layout,
  UploadCloud,
  Camera
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

// Hàm tiện ích xử lý URL ảnh
const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("blob:") || path.startsWith("http")) return path;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
  let cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (!cleanPath.startsWith("uploads/")) cleanPath = `uploads/${cleanPath}`;
  return `${API_URL}/${cleanPath}`;
};

export default function WorkspaceSettingsPage() {
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const workspaceId = Number(params.workspaceId);

  const { activeCompany, isLoading: isAuthLoading } = useAuth();
  const companyId = activeCompany?.companyId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Refs & File State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [form, setForm] = useState({
    workspaceName: "",
    description: "",
    color: "#3B82F6",
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
          color: data.color || "#3B82F6",
        });
        // Set preview từ server url
        setCoverPreview(getFullImageUrl(data.coverImage));
      } catch (err: any) {
        showToast(err.message || "Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [companyId, workspaceId, isAuthLoading, showToast]);

  // Cleanup preview blob
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  // 2. Handlers
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
    setSelectedFile(file);
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
        color: form.color,
        file: selectedFile, // Truyền file mới
      });
      
      showToast("Settings updated successfully", "success");
      // Reset file input
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

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
      router.push("/core/dashboard"); 
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

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
              {/* Icon đại diện Workspace */}
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 transition-colors"
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
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
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

          {/* 2. Appearance (Color & Cover) */}
          <Card className="border border-slate-200 shadow-sm bg-white">
             <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                   <Palette className="w-4 h-4 text-slate-500" /> Appearance
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                
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

                {/* Cover Image Upload */}
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <div 
                        className="relative group cursor-pointer shrink-0 w-full sm:w-48 h-28 bg-white border-2 border-white shadow-sm rounded-lg overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {coverPreview ? (
                            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        
                        <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-md">
                            <UploadCloud className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900">Workspace Cover</h3>
                        <p className="text-xs text-slate-500 max-w-xs">
                            Recommended size: 1200x300px. <br/> Supports JPG, PNG. Max 5MB.
                        </p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                        />
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