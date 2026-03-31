"use client";

// =============================================================================
// 1. IMPORT (Thư viện -> Internal -> Styles)
// =============================================================================

import React from "react";
import { 
    X, Loader2, Package, CheckCircle, XCircle, 
    Users, FolderKanban, HardDrive, LayoutGrid, 
    Check, Infinity, DollarSign 
} from "lucide-react";

// Internal Components
import { Button } from "@/components/ui/Buttons";

// Types & Utils
import { PlanDetail } from "@/services/apiPlanSystem";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & HELPERS
// =============================================================================

interface PlanDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: PlanDetail | null;
    loading: boolean;
}

/**
 * Định dạng tiền tệ VND
 */
const formatCurrency = (amount: number) => {
    if (amount === 0) return "Free";
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
};

/**
 * Định dạng ngày tháng hiển thị chi tiết (giờ:phút)
 */
const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", { 
        day: "numeric", 
        month: "short", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
    });
};

/**
 * Thành phần hiển thị từng chỉ số giới hạn tài nguyên (Quota)
 */
const QuotaItem = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) => {
    const isUnlimited = value === -1;
    return (
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl transition-all hover:border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 text-[#42526E] dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                <Icon className="w-4 h-4 opacity-70" />
                {label}
            </div>
            <div className="text-[13px] font-black text-[#172B4D] dark:text-white">
                {isUnlimited ? (
                    <span className="flex items-center text-[#0052CC] gap-1">
                        <Infinity className="w-4 h-4 stroke-[3]" /> Unlimited
                    </span>
                ) : (
                    value.toLocaleString()
                )}
            </div>
        </div>
    );
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Modal hiển thị thông tin cấu hình chi tiết của một gói cước (Service Plan).
 * Dùng cho Super Admin để kiểm tra thông số kỹ thuật và thương mại.
 */
export default function PlanDetailModal({ isOpen, onClose, plan, loading }: PlanDetailModalProps) {
    
    // ---------------------------------------------------------------------------
    // 4. RENDER GUARD
    // ---------------------------------------------------------------------------
    
    if (!isOpen) return null;

    // ---------------------------------------------------------------------------
    // 5. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-[#E3F2FD] dark:bg-[#0052CC]/10 text-[#0052CC] rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                            <Package className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#172B4D] dark:text-white tracking-tight uppercase">Plan Blueprint</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Subscription Tier Specification</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#172B4D] dark:hover:text-white transition-all active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ===== BODY (SCROLLABLE) ===== */}
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar dark:bg-slate-900">
                    {loading || !plan ? (
                        /* Trạng thái Loading */
                        <div className="flex flex-col justify-center items-center py-24 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-[#0052CC] opacity-80" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Mapping plan schema...</span>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            
                            {/* KHỐI 1: TỔNG QUAN (Overview) */}
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-2xl font-black text-[#172B4D] dark:text-white tracking-tighter">
                                            {plan.name}
                                        </h3>
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md uppercase font-black border border-slate-200 dark:border-slate-700 tracking-[0.1em]">
                                            ID: {plan.planCode}
                                        </span>
                                    </div>
                                    <p className="text-[14px] text-[#42526E] dark:text-slate-400 leading-relaxed font-medium">
                                        {plan.description || "No service description available for this tier."}
                                    </p>
                                </div>
                                <div className="shrink-0 pt-1">
                                    {plan.isActive ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#36B37E] border border-emerald-100 shadow-sm uppercase tracking-wider">
                                            <CheckCircle className="w-3.5 h-3.5" /> Published (Live)
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200 shadow-sm uppercase tracking-wider">
                                            <XCircle className="w-3.5 h-3.5" /> Draft (Hidden)
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* KHỐI 2: CẤU HÌNH GIÁ (Commercial Config) */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 opacity-60" /> Commercial Configuration
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-center transition-all hover:border-[#0052CC]">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Monthly Billing</p>
                                        <p className="text-xl font-black text-[#0052CC] tracking-tight">{formatCurrency(plan.monthlyPrice)}</p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-center transition-all hover:border-[#0052CC]">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Yearly Billing (Saver)</p>
                                        <p className="text-xl font-black text-[#0052CC] tracking-tight">{formatCurrency(plan.yearlyPrice)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* KHỐI 3: GIỚI HẠN TÀI NGUYÊN (Quotas) */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4 opacity-60" /> Technical Resource Quotas
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <QuotaItem label="Workspaces" value={plan.maxWorkspaces} icon={LayoutGrid} />
                                    <QuotaItem label="Active Projects" value={plan.maxProjects} icon={FolderKanban} />
                                    <QuotaItem label="Seat Capacity" value={plan.maxUsers} icon={Users} />
                                    <QuotaItem label="Storage (GB)" value={plan.maxStorageGb} icon={HardDrive} />
                                </div>
                            </div>

                            {/* KHỐI 4: DANH SÁCH TÍNH NĂNG (Capabilities) */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 opacity-60" /> Platform Capabilities
                                </h4>
                                {plan.features && plan.features.length > 0 ? (
                                    <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-3 group">
                                                    <Check className="w-4.5 h-4.5 text-[#36B37E] shrink-0 mt-0.5 stroke-[3] transition-transform group-hover:scale-110" />
                                                    <span className="text-[14px] font-semibold text-[#42526E] dark:text-slate-300 leading-snug">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-[13px] text-slate-400 italic font-medium">No specialized features defined for this tier.</p>
                                    </div>
                                )}
                            </div>

                            {/* KHỐI 5: THÔNG TIN LỊCH SỬ (Metadata) */}
                            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-t border-slate-100 dark:border-slate-800">
                                <span>Registry: {formatDate(plan.createdAt)}</span>
                                <span>Snapshot: {formatDate(plan.updatedAt)}</span>
                            </div>

                        </div>
                    )}
                </div>

                {/* ===== FOOTER ===== */}
                <div className="flex justify-end px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                    <Button 
                        onClick={onClose} 
                        variant="outline" 
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-[#42526E] dark:text-slate-300 font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 active:scale-95 shadow-sm px-6"
                    >
                        Close Blueprint
                    </Button>
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
            `}</style>
        </div>
    );
}