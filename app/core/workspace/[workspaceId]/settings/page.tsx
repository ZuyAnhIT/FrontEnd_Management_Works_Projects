"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal Components -> Services)
// =============================================================================

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Settings,
  Loader2,
  Save,
  Palette,
  AlertTriangle,
  Image as ImageIcon,
  Layout,
  UploadCloud,
  Camera,
} from "lucide-react";

// Services & Context
import {
  getWorkspaceDetail,
  updateWorkspace,
  deleteWorkspace,
} from "@/services/apiWorkspace";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

// UI Components
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Cards";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. UTILS
// =============================================================================

/**
 * Chuan hoa duong dan hinh anh tu backend hoac preview local
 */
const getFullImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith("blob:") || path.startsWith("http")) return path;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
  let cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (!cleanPath.startsWith("uploads/")) cleanPath = `uploads/${cleanPath}`;
  
  return `${API_URL}/${cleanPath}`;
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function WorkspaceSettingsPage() {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & CONTEXT
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const { activeCompany, isLoading: isAuthLoading } = useAuth();
  
  const workspaceId = Number(params.workspaceId);
  const companyId = activeCompany?.companyId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // 5. STATE MANAGEMENT
  // ---------------------------------------------------------------------------

  // Trang thai tai va luu du lieu
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Trang thai Modal va File
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Du lieu bieu mau
  const [formData, setFormData] = useState({
    workspaceName: "",
    description: "",
    color: "#0052CC",
  });

  // ---------------------------------------------------------------------------
  // 6. DATA FETCHING (Handlers)
  // ---------------------------------------------------------------------------

  /**
   * Tai thong tin chi tiet workspace tu server
   */
  const fetchWorkspaceData = useCallback(async () => {
    if (!companyId || !workspaceId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getWorkspaceDetail(companyId, workspaceId);
      
      setFormData({
        workspaceName: data.workspaceName || "",
        description: data.description || "",
        color: data.color || "#0052CC",
      });
      
      setCoverPreview(getFullImageUrl(data.coverImage));
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to load settings";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, workspaceId, showToast]);

  // ---------------------------------------------------------------------------
  // 7. SIDE EFFECTS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isAuthLoading) {
      fetchWorkspaceData();
    }
  }, [isAuthLoading, fetchWorkspaceData]);

  /**
   * Don dep bo nho cua URL xem truoc hinh anh
   */
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  // ---------------------------------------------------------------------------
  // 8. EVENT HANDLERS
  // ---------------------------------------------------------------------------

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Xu ly logic chon file va kiem tra kich thuoc
   */
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be under 5MB", "error");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image format", "error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
    setSelectedFile(file);
  };

  /**
   * Cap nhat toan bo cau hinh workspace
   */
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workspaceName.trim()) {
      showToast("Workspace name is required", "warning");
      return;
    }
    if (!companyId) return;

    setIsSaving(true);
    try {
      await updateWorkspace(companyId, workspaceId, {
        name: formData.workspaceName,
        description: formData.description,
        color: formData.color,
        file: selectedFile,
      });

      showToast("Workspace configuration saved", "success");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to update settings";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Xac nhan xoa vinh vien workspace
   */
  const handleConfirmDelete = async () => {
    if (!companyId) return;
    setIsDeleting(true);
    try {
      await deleteWorkspace(companyId, workspaceId);
      showToast("Workspace permanently removed", "success");
      setIsDeleteModalOpen(false);
      router.push("/core/dashboard");
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to delete workspace";
      showToast(message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 9. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] gap-3">
        <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin" />
        <p className="text-[13px] font-bold text-[#6B778C] uppercase tracking-widest">Syncing Settings...</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
        <p className="font-black text-[#6B778C] uppercase tracking-widest">No active workspace session</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] p-6 sm:p-10 font-sans text-[#172B4D]">
      <div className="max-w-[1000px] mx-auto space-y-10 animate-in fade-in duration-500">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md border border-white/20 transition-transform duration-300 hover:scale-105"
              style={{ backgroundColor: formData.color }}
            >
              <span className="text-white font-black text-2xl">
                {formData.workspaceName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">
                Workspace Settings
              </h1>
              <p className="text-[14px] text-[#42526E] font-medium mt-1">
                Configure identity and branding for <span className="text-[#0052CC] font-bold">{formData.workspaceName}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={handleUpdateSettings}
            disabled={isSaving}
            className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-8 rounded-lg shadow-md active:scale-95 transition-all min-w-[180px]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 stroke-[3]" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* SETTINGS FORM */}
        <form onSubmit={handleUpdateSettings} className="space-y-8">
          
          {/* CARD 1: GENERAL INFORMATION */}
          <Card className="border-[#DFE1E6] shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#FAFBFC] border-b border-[#DFE1E6] px-8 py-5">
              <CardTitle className="text-[13px] font-black text-[#42526E] uppercase tracking-[0.2em] flex items-center gap-3">
                <Layout className="w-4 h-4 opacity-70" /> General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">
                  Workspace Name <span className="text-[#FF5630]">*</span>
                </label>
                <Input
                  value={formData.workspaceName}
                  onChange={(e) => handleInputChange("workspaceName", e.target.value)}
                  placeholder="e.g. Engineering Team"
                  className="h-11 border-[#DFE1E6] focus:border-[#0052CC] rounded-xl font-bold text-[#172B4D]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="What is the primary objective of this workspace?"
                  rows={4}
                  className="resize-none border-[#DFE1E6] focus:border-[#0052CC] rounded-xl font-medium text-[#42526E]"
                />
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: APPEARANCE & BRANDING */}
          <Card className="border-[#DFE1E6] shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#FAFBFC] border-b border-[#DFE1E6] px-8 py-5">
              <CardTitle className="text-[13px] font-black text-[#42526E] uppercase tracking-[0.2em] flex items-center gap-3">
                <Palette className="w-4 h-4 opacity-70" /> Visual Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              
              {/* THEME COLOR SELECTOR */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Brand Color</label>
                <div className="flex items-center gap-4 h-12 px-4 border border-[#DFE1E6] rounded-xl bg-[#F4F5F7] w-full max-w-[240px]">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="w-8 h-8 border-none rounded-lg cursor-pointer bg-transparent p-0"
                  />
                  <span className="text-[14px] font-black font-mono text-[#172B4D] uppercase tracking-wider">
                    {formData.color}
                  </span>
                </div>
              </div>

              {/* COVER IMAGE UPLOAD BOX */}
              <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center p-6 bg-[#F4F5F7] rounded-2xl border border-dashed border-[#DFE1E6] transition-colors hover:border-[#0052CC]">
                <div
                  className="relative group cursor-pointer shrink-0 w-full sm:w-60 h-32 bg-white border-2 border-white shadow-md rounded-xl overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Workspace Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F4F5F7] text-[#DFE1E6]">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-[#091E42]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>

                  <div className="absolute bottom-2 right-2 bg-[#0052CC] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                    <UploadCloud className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-[#172B4D] text-base">Workspace Banner</h3>
                  <p className="text-[12px] text-[#6B778C] font-medium leading-relaxed max-w-xs">
                    Recommended: 1200x400px. JPG, PNG formats supported. <br /> Maximum file size: 5MB.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelection}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: DANGER ZONE */}
          <Card className="border-[#FFEBE6] shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#FFF5F2] border-b border-[#FFEBE6] px-8 py-5">
              <CardTitle className="text-[13px] font-black text-[#BF2600] uppercase tracking-[0.2em] flex items-center gap-3">
                <AlertTriangle className="w-4 h-4" /> Critical Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="font-black text-[#172B4D] text-sm uppercase tracking-wide">
                  Decommission Workspace
                </h4>
                <p className="text-[13px] text-[#6B778C] font-medium leading-relaxed max-w-md">
                  Irreversible action. All associated projects, assets, and historical records will be permanently purged.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
                className="border-[#FFEBE6] text-[#BF2600] hover:bg-[#FFEBE6] hover:text-[#DE350B] font-black text-[12px] uppercase tracking-widest h-11 px-6 rounded-lg active:scale-95 transition-all"
              >
                Delete Workspace
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* MODAL: DELETE CONFIRMATION */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="Confirm Workspace Purge"
          description={`WARNING: This will permanently delete the "${formData.workspaceName}" workspace and all its data. This action cannot be undone.`}
          confirmText="Execute Deletion"
          cancelText="Cancel"
          modalVariant="danger"
        />
      </div>
    </div>
  );
}