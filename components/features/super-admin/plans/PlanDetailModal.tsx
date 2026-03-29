// components/features/super-admin/plans/PlanDetailModal.tsx
"use client";

import { X, Loader2, Package, CheckCircle, XCircle, Users, FolderKanban, HardDrive, LayoutGrid, Check, Infinity, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { PlanDetail } from "@/services/apiPlanSystem";

interface PlanDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: PlanDetail | null;
    loading: boolean;
}

export default function PlanDetailModal({ isOpen, onClose, plan, loading }: PlanDetailModalProps) {
    if (!isOpen) return null;

    // --- Format Utils ---
    const formatCurrency = (amount: number) => {
        if (amount === 0) return "Free";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    // Helper render giới hạn (Limits)
    const renderLimitItem = (label: string, value: number, Icon: any) => {
        const isUnlimited = value === -1;
        return (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                    <Icon className="w-4 h-4 text-slate-400" />
                    {label}
                </div>
                <div className="text-sm font-bold text-slate-900">
                    {isUnlimited ? (
                        <span className="flex items-center text-blue-600 gap-1"><Infinity className="w-4 h-4" /> Unlimited</span>
                    ) : (
                        value.toLocaleString()
                    )}
                </div>
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
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Plan Details</h2>
                            <p className="text-xs text-slate-500 mt-0.5">View subscription tier configuration</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {loading || !plan ? (
                        <div className="flex flex-col justify-center items-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="text-sm text-slate-500">Loading plan configuration...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            
                            {/* Section 1: Overview Info & Status */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold border border-slate-200 tracking-wider">
                                            {plan.planCode}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                                </div>
                                <div className="shrink-0">
                                    {plan.isActive ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <CheckCircle className="w-4 h-4" /> ACTIVE (ON SALE)
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                            <XCircle className="w-4 h-4" /> INACTIVE (HIDDEN)
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-100" />

                            {/* Section 2: Pricing Grid */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                                    <DollarSign className="w-4 h-4 text-slate-400" /> Pricing Configuration
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Monthly Billing</p>
                                        <p className="text-xl font-bold text-blue-700">{formatCurrency(plan.monthlyPrice)}</p>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Yearly Billing</p>
                                        <p className="text-xl font-bold text-blue-700">{formatCurrency(plan.yearlyPrice)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Quotas & Limits */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                                    <LayoutGrid className="w-4 h-4 text-slate-400" /> Resource Limits (Quotas)
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {renderLimitItem("Max Workspaces", plan.maxWorkspaces, LayoutGrid)}
                                    {renderLimitItem("Max Projects", plan.maxProjects, FolderKanban)}
                                    {renderLimitItem("Max Users", plan.maxUsers, Users)}
                                    {renderLimitItem("Storage (GB)", plan.maxStorageGb, HardDrive)}
                                </div>
                            </div>

                            {/* Section 4: Features List */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                                    <CheckCircle className="w-4 h-4 text-slate-400" /> Included Features
                                </h4>
                                {plan.features && plan.features.length > 0 ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                                                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No specific features listed for this plan.</p>
                                )}
                            </div>

                            {/* Footer Info: Timestamps */}
                            <div className="pt-4 flex items-center justify-between text-xs text-slate-400 font-mono border-t border-slate-100">
                                <span>Created: {formatDate(plan.createdAt)}</span>
                                <span>Last Updated: {formatDate(plan.updatedAt)}</span>
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <Button onClick={onClose} variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}