"use client";

import { useEffect, useState } from "react";
import {
    X,
    Loader2,
    Calendar,
    Target,
    Layers,
    CheckCircle2,
} from "lucide-react";
import {
    getSprintDetails,
    updateSprint,
    SprintDetails,
    UpdateSprintPayload,
} from "@/services/apiSprint";
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// 1. INTERFACES & HELPERS
// =============================================================================

interface SprintDetailModalProps {
    projectId: number;
    sprintId: number;
    onClose: () => void;
    onUpdate: () => void; // Callback reload list
    readOnly?: boolean;   // ✅ Prop mới để check quyền Guest
}

// Helper: Convert ISO Date to YYYY-MM-DDTHH:MM for datetime-local input
const toInputDate = (iso?: string) =>
    iso ? new Date(iso).toISOString().slice(0, 16) : "";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function SprintDetailModal({
    projectId,
    sprintId,
    onClose,
    onUpdate,
    readOnly = false, // ✅ Mặc định là false (cho phép sửa) nếu không truyền
}: SprintDetailModalProps) {
    // --- HOOKS ---
    const { showToast } = useToast();
    
    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [sprint, setSprint] = useState<SprintDetails | null>(null);
    const [formData, setFormData] = useState<UpdateSprintPayload>({});
    const [isSaving, setIsSaving] = useState(false);

    // 1. Fetch Data
    useEffect(() => {
        if (sprintId) {
            setLoading(true);
            getSprintDetails(projectId, sprintId)
                .then((data) => {
                    setSprint(data);
                    // Sync initial form data
                    setFormData({
                        name: data.name,
                        goal: data.goal,
                        startDate: data.startDate,
                        endDate: data.endDate,
                    });
                })
                .catch((err) => {
                    // Sử dụng message từ API trả về
                    const message = err.message || err.response?.data?.message || "Failed to load sprint details";
                    showToast(message, "error");
                })
                .finally(() => setLoading(false));
        }
    }, [projectId, sprintId, showToast]);

    // 2. Handle Update (Auto-save on Blur)
    const handleUpdate = async (field: keyof UpdateSprintPayload, value: any) => {
        // ✅ Chặn nếu chưa có data hoặc là Guest (Read Only)
        if (!sprint || readOnly) return;

        // Optimistic Update UI local
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Prepare Payload: Convert Date to ISO format for API
        let payloadValue = value;
        if (field === "startDate" || field === "endDate") {
            payloadValue = value ? new Date(value).toISOString() : null;
        }

        try {
            setIsSaving(true);
            // Call API
            await updateSprint(projectId, sprint.id, { [field]: payloadValue });
            showToast("Sprint updated successfully", "success");

            // Update local sprint object
            setSprint((prev) => (prev ? { ...prev, [field]: payloadValue } : null));

            // Notify parent
            onUpdate();
        } catch (error: any) {
            console.error(error);
            // Sử dụng message từ API trả về
            const message = error.message || error.response?.data?.message || "Update failed";
            showToast(message, "error");
            
            // Revert optimistic update (simplified: can be improved to revert only the failed field)
            setFormData(prev => ({ ...prev, [field]: sprint[field as keyof SprintDetails] }));
        } finally {
            setIsSaving(false);
        }
    };

    // --- RENDER GUARD ---
    if (!sprintId) return null;

    // --- RENDER UI ---
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 animate-in fade-in duration-200">
            
            {/* Overlay click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            {/* Modal Container */}
            <div
                className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Sprint Details
                        </span>
                        {isSaving && (
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                        title="Close"
                        disabled={isSaving}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BODY (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : sprint ? (
                        <div className="space-y-6">
                            {/* 1. NAME & STATUS */}
                            <div>
                                <input
                                    className={`w-full text-xl font-bold text-slate-800 border-none outline-none focus:ring-0 bg-transparent placeholder:text-slate-300 p-0 ${readOnly ? 'cursor-not-allowed' : ''}`}
                                    value={formData.name || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    onBlur={(e) => handleUpdate("name", e.target.value)}
                                    placeholder="Sprint Name"
                                    disabled={isSaving || readOnly} // ✅ Disable input
                                />
                                <div className="mt-2">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${
                                            sprint.status === "IN_PROGRESS"
                                                ? "bg-green-100 text-green-700 border-green-200"
                                                : sprint.status === "COMPLETED"
                                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                        }`}
                                    >
                                        {sprint.status.replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            {/* 2. STATS GRID */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-3">
                                    <div className="p-2 bg-white rounded shadow-sm text-blue-600">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">
                                            Story Points
                                        </p>
                                        <p className="text-lg font-bold text-slate-800 leading-none mt-0.5">
                                            {sprint.totalStoryPoints || 0}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-3">
                                    <div className="p-2 bg-white rounded shadow-sm text-green-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">
                                            Total Issues
                                        </p>
                                        <p className="text-lg font-bold text-slate-800 leading-none mt-0.5">
                                            {sprint.taskCount || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* 3. GOAL (Editable) */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                    <Target className="w-3 h-3" /> Sprint Goal
                                </label>
                                <textarea
                                    className={`w-full min-h-[80px] text-sm text-slate-700 p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none ${readOnly ? 'cursor-not-allowed' : ''}`}
                                    placeholder="What is the goal of this sprint?"
                                    value={formData.goal || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, goal: e.target.value })
                                    }
                                    onBlur={(e) => handleUpdate("goal", e.target.value)}
                                    disabled={isSaving || readOnly} // ✅ Disable input
                                />
                            </div>

                            {/* 4. DATES (Editable) */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Duration
                                </label>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                                            Start Date
                                        </span>
                                        <input
                                            type="datetime-local"
                                            className={`w-full text-sm p-2 border border-slate-200 rounded-md bg-white text-slate-700 focus:border-blue-500 outline-none shadow-sm ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
                                            value={toInputDate(formData.startDate)}
                                            onChange={(e) =>
                                                setFormData({ ...formData, startDate: e.target.value })
                                            }
                                            onBlur={(e) => handleUpdate("startDate", e.target.value)}
                                            disabled={isSaving || readOnly} // ✅ Disable input
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                                            End Date
                                        </span>
                                        <input
                                            type="datetime-local"
                                            className={`w-full text-sm p-2 border border-slate-200 rounded-md bg-white text-slate-700 focus:border-blue-500 outline-none shadow-sm ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
                                            value={toInputDate(formData.endDate)}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            onBlur={(e) => handleUpdate("endDate", e.target.value)}
                                            disabled={isSaving || readOnly} // ✅ Disable input
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-slate-500">
                            Sprint not found
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right shrink-0">
                    <button
                        onClick={onClose}
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded hover:bg-slate-200 transition-colors"
                        disabled={isSaving}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}