"use client";

import { useEffect, useState, useRef } from "react";
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

import {
    getProjectDetail,
    updateProject,
    deleteProject,
} from "@/services/apiProject";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import LoadingButton from "@/components/ui/LoadingButton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Chatbot } from "@/components/chatbot/chatbot";
import { useProjectRole } from "@/hooks/useProjectRole"; // ✅ Import Hook

// Helper URL ảnh (Giữ nguyên logic)
const getFullImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
    let cleanPath = path.startsWith("/") ? path.slice(1) : path;
    if (!cleanPath.startsWith("uploads/")) cleanPath = `uploads/${cleanPath}`;
    return `${API_URL}/${cleanPath}`;
};

export default function ProjectSettingsPage() {
    const { showToast } = useToast();
    const params = useParams();
    const router = useRouter();

    const workspaceId = Number(params.workspaceId);
    const projectId = Number(params.projectId);

    const { activeCompany, isLoading: isAuthLoading } = useAuth();
    const companyId = activeCompany?.companyId;

    // ✅ Lấy role hiện tại
    const { isGuest } = useProjectRole(projectId);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // File State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [deleting, setDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [form, setForm] = useState({
        name: "",
        projectCode: "",
        description: "",
        goal: "",
        priority: "MEDIUM",
        startDate: "",
        dueDate: "",
    });

    // ===================================================
    // 1. ROUTE PROTECTION (Logic mới)
    // ===================================================
    useEffect(() => {
        if (isGuest) {
            router.replace(`/core/workspace/${workspaceId}/project/${projectId}`);
        }
    }, [isGuest, router, workspaceId, projectId]);

    // ===================================================
    // 2. LOAD DETAIL (Logic nghiệp vụ quan trọng)
    // ===================================================
    useEffect(() => {
        if (isAuthLoading) return;
        if (!companyId || !workspaceId || !projectId) {
            setLoading(false);
            return;
        }

        // Nếu là Guest thì không fetch data (vì sẽ redirect)
        if (isGuest) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getProjectDetail(companyId, workspaceId, projectId);

                setForm({
                    name: data.name || "",
                    projectCode: data.projectCode || "",
                    description: data.description || "",
                    goal: data.goal || "",
                    priority: data.priority || "MEDIUM",
                    // Loại bỏ phần T...Z nếu có để format cho input type="date"
                    startDate: data.startDate ? data.startDate.split("T")[0] : "",
                    dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
                });
                // Set preview ảnh từ server
                setCoverPreview(getFullImageUrl(data.coverImageUrl));
            } catch (err: any) {
                const message = err.response?.data?.message || err.message || "Failed to load project details";
                showToast(message, "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [companyId, workspaceId, projectId, isAuthLoading, showToast, isGuest]);

    // Cleanup URL blob
    useEffect(() => {
        return () => {
            if (coverPreview && coverPreview.startsWith("blob:")) {
                URL.revokeObjectURL(coverPreview);
            }
        };
    }, [coverPreview]);

    // ===================================================
    // 3. HANDLERS (Logic nghiệp vụ quan trọng)
    // ===================================================
    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 5 * 1024 * 1024) {
            showToast("File size must be less than 5MB", "error");
            return;
        }
        if (!file.type.startsWith("image/")) {
            showToast("Please select a valid image file", "error");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setCoverPreview(objectUrl);
        setSelectedFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            showToast("Project name is required", "warning");
            return;
        }
        if (!companyId) return;

        setSaving(true);
        try {
            await updateProject(companyId, workspaceId, projectId, {
                ...form,
                file: selectedFile, // Gửi file mới
            });

            showToast("Project updated successfully!", "success");
            // Reset input file
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Update failed";
            showToast(message, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!companyId || !workspaceId || !projectId) return;
        setDeleting(true);
        try {
            await deleteProject(companyId, workspaceId, projectId);
            showToast("Project deleted successfully!", "success");
            setIsDeleteModalOpen(false);
            // Quan trọng: Điều hướng về trang Project List
            router.push(`/core/workspace/${workspaceId}/project`); 
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Delete failed";
            showToast(message, "error");
            setDeleting(false);
        }
    };

    // ===================================================
    // 4. RENDER UI
    // ===================================================

    // ✅ Chặn render nếu là Guest (đang chờ redirect)
    if (isGuest) return null;

    if (isAuthLoading || loading)
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );

    if (!companyId) return <div className="p-8 text-center">No Active Company</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8 px-4">
            
            {/* Settings Card */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fadeInUp">
                <div className="p-6 border-b border-gray-200 flex items-center gap-4 bg-slate-50">
                    <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-lg border border-blue-200">
                        <Settings className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Project Settings</h1>
                        <p className="text-sm text-gray-500">Manage general information.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        
                        {/* Cover Image Upload */}
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <div 
                                className="relative group cursor-pointer shrink-0 w-full sm:w-48 h-28 bg-white border-2 border-white shadow-sm rounded-lg overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-md">
                                    <UploadCloud className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-slate-900">Project Cover</h3>
                                <p className="text-xs text-slate-500 max-w-xs">Click image to upload. Max 5MB.</p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="font-semibold text-gray-700 text-sm mb-1.5 block">Project Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                required
                            />
                        </div>

                        {/* Code */}
                        <div>
                            <label className="font-semibold text-gray-700 text-sm mb-1.5 block">Project Code</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={form.projectCode}
                                    onChange={(e) => handleChange("projectCode", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 pl-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 uppercase"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="font-semibold text-gray-700 text-sm mb-1.5 block">Description</label>
                            <textarea
                                rows={3}
                                value={form.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                            />
                        </div>

                        {/* Goal */}
                        <div>
                            <label className="font-semibold text-gray-700 text-sm mb-1.5 block">Goal</label>
                            <textarea
                                rows={2}
                                value={form.goal}
                                onChange={(e) => handleChange("goal", e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                            />
                        </div>

                        {/* Other Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="font-semibold text-gray-700 text-sm mb-1.5 block">Priority</label>
                                <select
                                    value={form.priority}
                                    onChange={(e) => handleChange("priority", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-semibold text-gray-700 text-sm mb-1.5 block">Start Date</label>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => handleChange("startDate", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-gray-700 text-sm mb-1.5 block">Due Date</label>
                                <input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={(e) => handleChange("dueDate", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end rounded-b-xl">
                         <LoadingButton
                            type="submit"
                            isLoading={saving}
                            text="Save Changes"
                            loadingText="Saving..."
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm px-8 py-2.5 rounded-lg"
                            icon={<Save className="w-4 h-4 mr-2" />}
                         />
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden animate-fadeInUp delay-100">
                <div className="p-6 border-b border-red-200 flex items-center gap-4 bg-red-50">
                    <div className="w-12 h-12 bg-red-100 flex items-center justify-center rounded-lg border border-red-200">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-red-900">Danger Zone</h1>
                        <p className="text-sm text-red-700">Irreversible actions.</p>
                    </div>
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                         <h3 className="font-bold text-gray-900">Delete Project</h3>
                         <p className="text-sm text-gray-600 mt-1">This action will move the project to trash.</p>
                    </div>
                    <LoadingButton
                        type="button"
                        onClick={() => { if (form.name) setIsDeleteModalOpen(true); }}
                        isLoading={deleting}
                        text="Delete Project"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm px-8 py-2.5 rounded-lg bg-red-600 hover:bg-red-700"
                        icon={<Trash2 className="w-4 h-4 mr-2" />}
                    />
                </div>
            </div>

            {/* Modal Delete */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isLoading={deleting}
                title="Delete Project?"
                description={`Are you sure you want to delete "${form.name}"?`}
                confirmText="Delete Project"
                cancelText="Cancel"
                modalVariant="danger"
            />
            <Chatbot />
        </div>
    );
}