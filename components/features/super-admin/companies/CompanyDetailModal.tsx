// components/features/super-admin/companies/CompanyDetailModal.tsx
"use client";

import { X, Loader2, Building, Activity, CreditCard, HardDrive, Users, FolderKanban, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { Tenant360View } from "@/services/apiCompanySystem";

interface CompanyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: Tenant360View | null;
    loading: boolean;
}

export default function CompanyDetailModal({ isOpen, onClose, tenant, loading }: CompanyDetailModalProps) {
    if (!isOpen) return null;

    // --- Format Utils ---
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // --- Progress Bar Component ---
    const ProgressBar = ({ label, current, max, icon: Icon, isExceeded, unit = "" }: any) => {
        const isUnlimited = max === -1;
        const percent = isUnlimited ? 0 : Math.min((current / max) * 100, 100);
        
        return (
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                        <Icon className="w-4 h-4 text-slate-400" />
                        {label}
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                        {isUnlimited ? (
                            <span>{current} {unit} / <span className="text-slate-500 font-medium">Unlimited</span></span>
                        ) : (
                            <span>{current} {unit} / <span className="text-slate-500 font-medium">{max} {unit}</span></span>
                        )}
                    </div>
                </div>
                {!isUnlimited && (
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${isExceeded ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                )}
                {isExceeded && !isUnlimited && (
                    <p className="text-[10px] text-red-500 mt-1.5 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Quota Exceeded
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Tenant 360 View</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Health & Resource Usage</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {loading || !tenant ? (
                        <div className="flex flex-col justify-center items-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="text-sm text-slate-500">Scanning tenant data...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Alert Banners (Cờ cảnh báo từ Backend) */}
                            {tenant.isGracePeriod && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Payment Overdue (Grace Period)</strong>
                                        <p className="text-amber-700 text-xs mt-0.5">This tenant has an overdue payment but is still within the grace period.</p>
                                    </div>
                                </div>
                            )}

                            {/* ✅ CẬP NHẬT LOGIC STATUS: Đổi từ LOCKED sang SUSPENDED */}
                            {tenant.status === 'SUSPENDED' && (
                                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Account Suspended</strong>
                                        <p className="text-red-700 text-xs mt-0.5">This company account is currently suspended by the system.</p>
                                    </div>
                                </div>
                            )}

                            {/* Section 1: Overview Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                    <Building className="w-8 h-8 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900">{tenant.companyName}</h3>
                                    <p className="text-sm text-slate-500">{tenant.email}</p>
                                    <div className="text-xs text-slate-400 mt-1 font-mono">Registered: {formatDate(tenant.createdAt)}</div>
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-100" />

                            {/* Section 2: Billing & Plan */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                                    <CreditCard className="w-4 h-4 text-slate-400" /> Subscription Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Current Plan</p>
                                        <p className="text-sm font-bold text-blue-700 mt-1">{tenant.planName} ({tenant.planCode})</p>
                                        <p className="text-xs text-slate-500 font-medium">{formatCurrency(tenant.monthlyPrice)} / month</p>
                                    </div>
                                    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Status & Period</p>
                                        <p className={`text-sm font-bold mt-1 ${tenant.subscriptionStatus === 'ACTIVE' ? 'text-green-600' : 'text-amber-600'}`}>
                                            {tenant.subscriptionStatus}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">Ends: {formatDate(tenant.currentPeriodEnd)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Quota Usage (Tiến trình) */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                                    <HardDrive className="w-4 h-4 text-slate-400" /> Resource Usage
                                </h4>
                                <div className="space-y-3">
                                    <ProgressBar 
                                        label="Members" 
                                        icon={Users}
                                        current={tenant.totalMembers} 
                                        max={tenant.maxUsers} 
                                        isExceeded={tenant.isUserLimitExceeded} 
                                    />
                                    <ProgressBar 
                                        label="Projects" 
                                        icon={FolderKanban}
                                        current={tenant.totalProjects} 
                                        max={tenant.maxProjects} 
                                        isExceeded={tenant.isProjectLimitExceeded} 
                                    />
                                    <ProgressBar 
                                        label="Storage" 
                                        icon={HardDrive}
                                        current={formatBytes(tenant.currentStorageBytes)} 
                                        max={tenant.maxStorageBytes === -1 ? -1 : formatBytes(tenant.maxStorageBytes)} 
                                        isExceeded={tenant.isStorageLimitExceeded} 
                                    />
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <Button onClick={onClose} variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium">
                        Close View
                    </Button>
                </div>
            </div>
        </div>
    );
}