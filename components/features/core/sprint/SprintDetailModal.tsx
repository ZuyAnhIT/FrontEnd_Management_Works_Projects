"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";
import {
    X,
    Loader2,
    Calendar,
    Target,
    Layers,
    CheckCircle2,
    Activity,
} from "lucide-react";
import {
    getSprintDetails,
    updateSprint,
    SprintDetails,
    UpdateSprintPayload,
} from "@/services/apiSprint";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & HELPERS
// =============================================================================

interface SprintDetailModalProps {
    projectId: number;
    sprintId: number;
    onClose: () => void;
    onUpdate: () => void; 
    readOnly?: boolean;   
}

/**
 * Chuyển đổi ISO Date sang chuẩn YYYY-MM-DDTHH:MM cho input datetime-local.
 */
const toInputDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16) : "";

/**
 * Kiểu dáng trạng thái Sprint chuẩn Jira.
 */
const getStatusBadgeStyle = (status?: string) => {
    switch(status) {
        case "IN_PROGRESS": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "COMPLETED": return "bg-blue-50 text-blue-700 border-blue-200";
        default: return "bg-slate-100 text-slate-600 border-slate-200"; // NOT_STARTED
    }
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Modal hiển thị và chỉnh sửa chi tiết Sprint.
 * Hỗ trợ tự động lưu (Auto-save) khi mất tiêu điểm (Blur) và phân quyền Read-only.
 */
export default function SprintDetailModal({
    projectId,
    sprintId,
    onClose,
    onUpdate,
    readOnly = false,
}: SprintDetailModalProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [sprint, setSprint] = useState<SprintDetails | null>(null);
    const [formData, setFormData] = useState<UpdateSprintPayload>({});

    // ---------------------------------------------------------------------------
    // 5. DATA FETCHING
    // ---------------------------------------------------------------------------

    useEffect(() => {
        if (!sprintId) return;

        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const data = await getSprintDetails(projectId, sprintId);
                setSprint(data);
                setFormData({
                    name: data.name,
                    goal: data.goal,
                    startDate: data.startDate,
                    endDate: data.endDate,
                });
            } catch (err: any) {
                const message = err.response?.data?.message || err.message || "Failed to load sprint details";
                showToast(message, "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [projectId, sprintId, showToast]);

    // ---------------------------------------------------------------------------
    // 6. HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xử lý cập nhật dữ liệu. Tự động gọi API khi người dùng kết thúc chỉnh sửa một trường.
     */
    const handleUpdateField = useCallback(async (field: keyof UpdateSprintPayload, value: any) => {
        if (!sprint || readOnly) return;

        // Bỏ qua nếu giá trị không thay đổi
        if (sprint[field as keyof SprintDetails] === value) return;

        // Cập nhật UI ngay lập tức (Optimistic Update)
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Chuẩn hóa dữ liệu ngày tháng cho API
        let payloadValue = value;
        if ((field === "startDate" || field === "endDate") && value) {
            payloadValue = new Date(value).toISOString();
        }

        setIsSaving(true);
        try {
            await updateSprint(projectId, sprint.id, { [field]: payloadValue });
            showToast("Sprint updated", "success");

            // Cập nhật state gốc để đồng bộ
            setSprint((prev) => (prev ? { ...prev, [field]: payloadValue } : null));
            onUpdate(); // Reload danh sách bên ngoài
        } catch (error: any) {
            const message = error.response?.data?.message || "Update failed";
            showToast(message, "error");
            
            // Hoàn tác dữ liệu trên UI nếu lỗi
            setFormData(prev => ({ ...prev, [field]: sprint[field as keyof SprintDetails] }));
        } finally {
            setIsSaving(false);
        }
    }, [projectId, readOnly, sprint, showToast, onUpdate]);

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (!sprintId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-[1px] animate-in fade-in duration-300">
            
            {/* Lớp nền click để đóng */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Container Modal */}
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ================= HEADER ================= */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                            Sprint Configuration
                        </span>
                        {isSaving && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded text-[10px] font-bold text-[#0052CC] animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" /> SAVING
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all active:scale-95"
                        title="Close details"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ================= BODY ================= */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-white">
                    {isLoading ? (
                        <div className="h-48 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin opacity-80" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading details...</span>
                        </div>
                    ) : sprint ? (
                        <div className="space-y-8">
                            {/* 1. Tên Sprint & Badge Trạng thái */}
                            <div className="space-y-3">
                                <input
                                    className={cn(
                                        "w-full text-2xl font-bold text-slate-900 border-2 border-transparent outline-none focus:ring-0 rounded-lg p-2 -ml-2 transition-all focus:bg-white focus:border-[#2684FF] placeholder:text-slate-300 leading-tight",
                                        readOnly ? "cursor-not-allowed opacity-80" : "hover:bg-slate-50 cursor-text"
                                    )}
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    onBlur={(e) => handleUpdateField("name", e.target.value)}
                                    placeholder="Sprint Name"
                                    disabled={isSaving || readOnly}
                                />
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-widest shadow-sm",
                                        getStatusBadgeStyle(sprint.status)
                                    )}>
                                        <Activity className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                                        {sprint.status?.replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            {/* 2. Thống kê nhanh (Stats Card) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl flex items-center gap-4 transition-all hover:bg-slate-50">
                                    <div className="p-2.5 bg-white rounded-lg shadow-sm border border-blue-100 text-[#0052CC]">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Story Points</p>
                                        <p className="text-xl font-bold text-slate-800">{sprint.totalStoryPoints || 0}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl flex items-center gap-4 transition-all hover:bg-slate-50">
                                    <div className="p-2.5 bg-white rounded-lg shadow-sm border border-emerald-100 text-emerald-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Issues</p>
                                        <p className="text-xl font-bold text-slate-800">{sprint.taskCount || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-100" />

                            {/* 3. Mục tiêu (Sprint Goal) */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5" /> Sprint Goal
                                </label>
                                <textarea
                                    className={cn(
                                        "w-full min-h-[100px] text-[13px] text-slate-700 p-4 rounded-xl border border-slate-200 outline-none transition-all resize-none shadow-sm",
                                        readOnly 
                                            ? "bg-slate-50 cursor-not-allowed opacity-80" 
                                            : "bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] hover:border-slate-300"
                                    )}
                                    placeholder="What is the main objective of this iteration?"
                                    value={formData.goal || ""}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                    onBlur={(e) => handleUpdateField("goal", e.target.value)}
                                    disabled={isSaving || readOnly}
                                />
                            </div>

                            {/* 4. Khung thời gian (Duration Grid) */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Project Timeline
                                </label>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Start Date</span>
                                        <input
                                            type="datetime-local"
                                            className={cn(
                                                "w-full text-[13px] font-medium p-2.5 border border-slate-200 rounded-lg outline-none transition-all shadow-sm",
                                                readOnly ? "bg-slate-50 cursor-not-allowed" : "bg-white focus:border-[#2684FF] focus:ring-2 focus:ring-blue-50"
                                            )}
                                            value={toInputDate(formData.startDate)}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            onBlur={(e) => handleUpdateField("startDate", e.target.value)}
                                            disabled={isSaving || readOnly}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">End Date</span>
                                        <input
                                            type="datetime-local"
                                            className={cn(
                                                "w-full text-[13px] font-medium p-2.5 border border-slate-200 rounded-lg outline-none transition-all shadow-sm",
                                                readOnly ? "bg-slate-50 cursor-not-allowed" : "bg-white focus:border-[#2684FF] focus:ring-2 focus:ring-blue-50"
                                            )}
                                            value={toInputDate(formData.endDate)}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            onBlur={(e) => handleUpdateField("endDate", e.target.value)}
                                            disabled={isSaving || readOnly}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Layers className="w-12 h-12 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">Sprint data not available</p>
                        </div>
                    )}
                </div>

                {/* ================= FOOTER ================= */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="text-[12px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 px-5 py-2.5 rounded-lg hover:bg-slate-200/50 transition-all active:scale-95"
                    >
                        Close Window
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
}