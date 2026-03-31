"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Styles)
// =============================================================================

import React from "react";
import { 
    X, Loader2, Building, Activity, CreditCard, 
    HardDrive, Users, FolderKanban, AlertTriangle, Infinity 
} from "lucide-react";

// Internal Components & Utils
import { Button } from "@/components/ui/Buttons";
import { Tenant360View } from "@/services/apiCompanySystem";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & HELPERS
// =============================================================================

interface CompanyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: Tenant360View | null;
    loading: boolean;
}

interface ProgressBarProps {
    label: string;
    current: number | string;
    max: number | string;
    icon: React.ElementType;
    isExceeded?: boolean;
    unit?: string;
}

/**
 * Định dạng dung lượng lưu trữ từ Bytes sang đơn vị đọc được.
 */
const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Định dạng ngày tháng chuẩn hóa cho Dashboard.
 */
const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", { 
        day: "numeric", month: "short", year: "numeric" 
    });
};

/**
 * Định dạng tiền tệ VND.
 */
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// =============================================================================
// 3. SUB-COMPONENT: RESOURCE PROGRESS BAR
// =============================================================================

/**
 * Thành phần hiển thị tiến độ sử dụng tài nguyên (Quota Usage).
 */
const ResourceProgressBar = ({ label, current, max, icon: Icon, isExceeded, unit = "" }: ProgressBarProps) => {
    const isUnlimited = max === -1;
    const currentNum = typeof current === 'string' ? parseFloat(current) : current;
    const maxNum = typeof max === 'string' ? parseFloat(max) : max;
    
    // Tính toán tỷ lệ phần trăm (mặc định 0 nếu là vô hạn)
    const percent = isUnlimited ? 0 : Math.min((currentNum / maxNum) * 100, 100);
    
    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 text-[#42526E] dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    <Icon className="w-4 h-4 opacity-70" />
                    {label}
                </div>
                <div className="text-[12px] font-black text-[#172B4D] dark:text-white">
                    {isUnlimited ? (
                        <div className="flex items-center gap-1.5">
                            {current} {unit} / <Infinity className="w-3.5 h-3.5 text-[#0052CC]" />
                        </div>
                    ) : (
                        <span>{current} {unit} / <span className="text-slate-400 font-bold">{max} {unit}</span></span>
                    )}
                </div>
            </div>

            {!isUnlimited && (
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                        className={cn(
                            "h-full rounded-full transition-all duration-700 ease-out",
                            isExceeded ? 'bg-[#FF5630]' : 'bg-[#0052CC]'
                        )}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            )}

            {isExceeded && !isUnlimited && (
                <p className="text-[10px] text-[#FF5630] mt-2 font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> Quota Exceeded
                </p>
            )}
        </div>
    );
};

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Modal hiển thị cái nhìn 360 độ về một Tenant (Công ty).
 * Dùng cho Super Admin để quản lý trạng thái tài khoản và tài nguyên.
 */
export default function CompanyDetailModal({ isOpen, onClose, tenant, loading }: CompanyDetailModalProps) {
    
    // ---------------------------------------------------------------------------
    // 5. RENDER GUARD
    // ---------------------------------------------------------------------------
    
    if (!isOpen) return null;

    // ---------------------------------------------------------------------------
    // 6. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-[#E3F2FD] dark:bg-[#0052CC]/10 text-[#0052CC] rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <Activity className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#172B4D] dark:text-white tracking-tight uppercase">Tenant 360 View</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Health & Resource Diagnostics</p>
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
                    {loading || !tenant ? (
                        /* Trạng thái Loading */
                        <div className="flex flex-col justify-center items-center py-24 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-[#0052CC] opacity-80" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Scanning tenant core...</span>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            
                            {/* KHỐI CẢNH BÁO (Alert Banners) */}
                            <div className="space-y-3">
                                {tenant.isGracePeriod && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 px-5 py-4 rounded-xl text-sm flex items-start gap-4 shadow-sm">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="font-black uppercase text-[12px] tracking-tight">Payment Overdue (Grace Period)</p>
                                            <p className="text-[12px] opacity-80 mt-1 leading-relaxed">Tenant has missed a payment but remains functional during the grace period.</p>
                                        </div>
                                    </div>
                                )}

                                {tenant.status === 'SUSPENDED' && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-200 px-5 py-4 rounded-xl text-sm flex items-start gap-4 shadow-sm ring-1 ring-red-100 dark:ring-0">
                                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="font-black uppercase text-[12px] tracking-tight">Account Suspended</p>
                                            <p className="text-[12px] opacity-80 mt-1 leading-relaxed">System operations are halted. Access is restricted due to suspension policy.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* KHỐI 1: THÔNG TIN TỔNG QUAN (Overview) */}
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
                                    <Building className="w-10 h-10 text-slate-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-2xl font-black text-[#172B4D] dark:text-white truncate tracking-tighter">{tenant.companyName}</h3>
                                    <p className="text-[#0052CC] dark:text-blue-400 font-bold text-sm">{tenant.email}</p>
                                    <div className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
                                        Registered: {formatDate(tenant.createdAt)}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            {/* KHỐI 2: CHI TIẾT GÓI CƯỚC (Subscription) */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 opacity-60" /> Subscription Tier
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-all hover:border-[#0052CC]">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Active Plan</p>
                                        <p className="text-[15px] font-black text-[#0052CC] mt-1.5">{tenant.planName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{formatCurrency(tenant.monthlyPrice)}</span>
                                            <span className="text-[10px] font-bold text-slate-400">/ MONTH</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Billing Cycle</p>
                                        <div className={cn(
                                            "text-[13px] font-black mt-1.5 uppercase tracking-tight",
                                            tenant.subscriptionStatus === 'ACTIVE' ? 'text-[#36B37E]' : 'text-[#FF991F]'
                                        )}>
                                            {tenant.subscriptionStatus}
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase">Ends: {formatDate(tenant.currentPeriodEnd)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* KHỐI 3: SỬ DỤNG TÀI NGUYÊN (Resource usage) */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 opacity-60" /> Resource Telemetry
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <ResourceProgressBar 
                                        label="Active Members" icon={Users}
                                        current={tenant.totalMembers} max={tenant.maxUsers} 
                                        isExceeded={tenant.isUserLimitExceeded} 
                                    />
                                    <ResourceProgressBar 
                                        label="Total Projects" icon={FolderKanban}
                                        current={tenant.totalProjects} max={tenant.maxProjects} 
                                        isExceeded={tenant.isProjectLimitExceeded} 
                                    />
                                    <ResourceProgressBar 
                                        label="Data Storage" icon={HardDrive}
                                        current={formatBytes(tenant.currentStorageBytes)} 
                                        max={tenant.maxStorageBytes === -1 ? -1 : formatBytes(tenant.maxStorageBytes)} 
                                        isExceeded={tenant.isStorageLimitExceeded} 
                                        unit=""
                                    />
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* ===== FOOTER ===== */}
                <div className="flex justify-end px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                    <Button 
                        onClick={onClose} 
                        variant="outline" 
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-[#42526E] dark:text-slate-300 font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                    >
                        Close Inspector
                    </Button>
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
            `}</style>
        </div>
    );
}