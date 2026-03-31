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
    Trash2,
    AlertTriangle,
    Hash,
    Image as ImageIcon,
    Camera,
    UploadCloud,
} from "lucide-react";

// Services & Hooks
import {
    getProjectDetail,
    updateProject,
    deleteProject,
} from "@/services/apiProject";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { useProjectRole } from "@/hooks/useProjectRole";

// UI Components
import { LoadingButton } from "@/components/ui/LoadingButton"; // ✅ Da sua loi Import
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Chatbot } from "@/components/chatbot/chatbot";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. UTILS
// =============================================================================

/**
 * Chuan hoa URL hinh anh tu may chu hoac local preview
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

export default function ProjectSettingsPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & CONTEXT
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    const params = useParams();
    const router = useRouter();
    const { activeCompany, isLoading: isAuthLoading } = useAuth();

    const workspaceId = Number(params.workspaceId);
    const projectId = Number(params.projectId);
    const companyId = activeCompany?.companyId;

    // Kiem tra phan quyen de bao ve tuyen duong
    const { isGuest } = useProjectRole(projectId);

    // ---------------------------------------------------------------------------
    // 5. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // File & Preview States
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        projectCode: "",
        description: "",
        goal: "",
        priority: "MEDIUM",
        startDate: "",
        dueDate: "",
    });

    // ---------------------------------------------------------------------------
    // 6. BUSINESS LOGIC (Handlers)
    // ---------------------------------------------------------------------------

    /**
     * Chan nguoi dung vao trang settings neu khong co quyen (Guest)
     */
    useEffect(() => {
        if (isGuest) {
            router.replace(`/core/workspace/${workspaceId}/project/${projectId}`);
        }
    }, [isGuest, router, workspaceId, projectId]);

    /**
     * Tai thong tin chi tiet dự án
     */
    const fetchProjectDetails = useCallback(async () => {
        if (!companyId || !workspaceId || !projectId || isGuest) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await getProjectDetail(companyId, workspaceId, projectId);

            setFormData({
                name: data.name || "",
                projectCode: data.projectCode || "",
                description: data.description || "",
                goal: data.goal || "",
                priority: data.priority || "MEDIUM",
                startDate: data.startDate ? data.startDate.split("T")[0] : "",
                dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
            });
            setCoverPreview(getFullImageUrl(data.coverImageUrl));
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to load project configuration", "error");
        } finally {
            setIsLoading(false);
        }
    }, [companyId, workspaceId, projectId, isGuest, showToast]);

    useEffect(() => {
        if (!isAuthLoading) fetchProjectDetails();
    }, [isAuthLoading, fetchProjectDetails]);

    /**
     * Don dep memory leak cho blob URL
     */
    useEffect(() => {
        return () => {
            if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
        };
    }, [coverPreview]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    /**
     * Xu ly chon hinh anh cover
     */
    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast("Asset size exceeds 5MB limit", "error");
            return;
        }
        if (!file.type.startsWith("image/")) {
            showToast("Invalid file format. Please use JPG or PNG", "error");
            return;
        }

        setCoverPreview(URL.createObjectURL(file));
        setSelectedFile(file);
    };

    /**
     * Cap nhat toan bo thong tin du an
     */
    const handleUpdateExecution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast("Identity (Name) is mandatory", "warning");
            return;
        }
        if (!companyId) return;

        setIsSaving(true);
        try {
            await updateProject(companyId, workspaceId, projectId, {
                ...formData,
                file: selectedFile,
            });
            showToast("Project identity updated", "success");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
            showToast(err.message || "Execution failed", "error");
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Xac nhan tieu huy dự án
     */
    const handleConfirmPurge = async () => {
        if (!companyId || !workspaceId || !projectId) return;
        setIsDeleting(true);
        try {
            await deleteProject(companyId, workspaceId, projectId);
            showToast("Project moved to archive", "success");
            router.push(`/core/workspace/${workspaceId}/project`); 
        } catch (err: any) {
            showToast(err.message || "Purge execution failed", "error");
            setIsDeleting(false);
        }
    };

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (isGuest) return null;

    if (isAuthLoading || isLoading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6B778C]">Syncing Project Data</span>
            </div>
        );
    }

    if (!companyId) return <div className="p-20 text-center font-black uppercase text-[#6B778C]">No Active Context</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-10 px-6 animate-in fade-in duration-500">
            
            {/* MAIN SETTINGS CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#DFE1E6] overflow-hidden">
                <header className="p-6 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#E3F2FD] flex items-center justify-center rounded-xl border border-[#B3D4FF]">
                            <Settings className="w-6 h-6 text-[#0052CC] stroke-[2.5]" />
                        </div>
                        <div>
                            <h1 className="text-[18px] font-black text-[#172B4D] uppercase tracking-tight">Project Attributes</h1>
                            <p className="text-[13px] text-[#42526E] font-medium">Configure global identity and timeline.</p>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleUpdateExecution} className="p-8 space-y-8">
                    
                    {/* COVER UPLOAD BOX */}
                    <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center p-6 bg-[#F4F5F7] rounded-2xl border border-dashed border-[#DFE1E6] transition-colors hover:border-[#0052CC]">
                        <div 
                            className="relative group cursor-pointer shrink-0 w-full sm:w-60 h-32 bg-white border-2 border-white shadow-md rounded-xl overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {coverPreview ? (
                                <img src={coverPreview} alt="Project Brand" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#F4F5F7] text-[#DFE1E6]">
                                    <ImageIcon className="w-10 h-10" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-[#091E42]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                <Camera className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-[#0052CC] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                                <UploadCloud className="w-4 h-4 stroke-[3]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-black text-[#172B4D] text-base uppercase tracking-wide">Visual Identity</h3>
                            <p className="text-[12px] text-[#6B778C] font-medium leading-relaxed max-w-xs">Recommended: 1200x400px. JPG, PNG formats supported. Max size 5MB.</p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileSelection}
                            />
                        </div>
                    </div>

                    {/* CORE FIELDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-1">
                            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Project Name <span className="text-[#FF5630]">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className="w-full h-12 border border-[#DFE1E6] rounded-xl px-4 font-bold text-[#172B4D] focus:border-[#0052CC] focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-1">
                            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Internal Code</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B778C]" />
                                <input
                                    type="text"
                                    value={formData.projectCode}
                                    onChange={(e) => handleInputChange("projectCode", e.target.value)}
                                    className="w-full h-12 border border-[#DFE1E6] rounded-xl px-4 pl-11 font-black text-[#172B4D] focus:border-[#0052CC] uppercase outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Mission Statement / Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                className="w-full border border-[#DFE1E6] rounded-xl px-4 py-3 font-medium text-[#42526E] focus:border-[#0052CC] outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* TIMELINE & CRITICALITY */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Priority Level</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => handleInputChange("priority", e.target.value)}
                                className="w-full h-11 border border-[#DFE1E6] rounded-xl px-4 font-bold text-[#172B4D] bg-white outline-none cursor-pointer appearance-none focus:border-[#0052CC]"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Kick-off Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleInputChange("startDate", e.target.value)}
                                className="w-full h-11 border border-[#DFE1E6] rounded-xl px-4 font-medium text-[#172B4D] focus:border-[#0052CC] outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Target Deadline</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                                className="w-full h-11 border border-[#DFE1E6] rounded-xl px-4 font-medium text-[#172B4D] focus:border-[#0052CC] outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end border-t border-[#F4F5F7]">
                        <LoadingButton
                            type="submit"
                            isLoading={isSaving}
                            text="Update Settings"
                            loadingText="Committing Changes..."
                            className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-10 rounded-lg shadow-md active:scale-95 transition-all"
                        />
                    </div>
                </form>
            </div>

            {/* DANGER ZONE (Jira Style) */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#FFEBE6] overflow-hidden">
                <div className="p-6 border-b border-[#FFEBE6] flex items-center gap-4 bg-[#FFF5F2]">
                    <div className="w-12 h-12 bg-[#FFEBE6] flex items-center justify-center rounded-xl border border-[#FFBDAD]">
                        <AlertTriangle className="w-6 h-6 text-[#BF2600]" />
                    </div>
                    <div>
                        <h1 className="text-[16px] font-black text-[#BF2600] uppercase tracking-tight">Critical Actions</h1>
                        <p className="text-[13px] text-[#DE350B] font-medium">Operations with irreversible impact.</p>
                    </div>
                </div>
                <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="font-black text-[#172B4D] text-sm uppercase tracking-wide">Decommission Project</h3>
                        <p className="text-[13px] text-[#6B778C] font-medium leading-relaxed max-w-lg">
                            Move this project to the trash. All tasks, cycles, and assets will be restricted and queued for archival.
                        </p>
                    </div>
                    <LoadingButton
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        isLoading={isDeleting}
                        text="Archive Project"
                        className="bg-[#FF5630] hover:bg-[#DE350B] text-white font-black text-[12px] uppercase tracking-widest h-11 px-8 rounded-lg active:scale-95 transition-all"
                        icon={<Trash2 className="w-4 h-4 mr-2" />}
                    />
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmPurge}
                isLoading={isDeleting}
                title="Archive Project?"
                description={`This will move "${formData.name}" to the global recycle bin. Access for all members will be revoked.`}
                confirmText="Execute Deletion"
                modalVariant="danger"
            />
            <Chatbot />
        </div>
    );
}