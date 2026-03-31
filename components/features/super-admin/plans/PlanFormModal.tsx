"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Services)
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { 
    X, Loader2, Save, Plus, Trash2, Infinity, 
    CheckSquare, Info, LayoutGrid, DollarSign 
} from "lucide-react";

// Internal Components
import { Button } from "@/components/ui/Buttons";

// Services & Types
import { 
    PlanDetail, 
    CreatePlanPayload, 
    UpdatePlanPayload 
} from "@/services/apiPlanSystem";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: CreatePlanPayload | UpdatePlanPayload) => Promise<void>;
    initialData: PlanDetail | null; 
    mode: "create" | "edit";
    loading: boolean;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function PlanFormModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData, 
    mode, 
    loading 
}: PlanFormModalProps) {
    
    // ---------------------------------------------------------------------------
    // 4. STATE
    // ---------------------------------------------------------------------------

    const [formData, setFormData] = useState<any>({
        planCode: "", 
        name: "", 
        description: "",
        monthlyPrice: 0, 
        yearlyPrice: 0,
        maxUsers: 5, 
        maxWorkspaces: 1, 
        maxProjects: 5, 
        maxStorageGb: 5,
        features: [], 
        isActive: true, 
    });

    const [featureInput, setFeatureInput] = useState("");

    // ---------------------------------------------------------------------------
    // 5. HOOKS
    // ---------------------------------------------------------------------------

    /**
     * Khoi tao du lieu khi mo Modal hoac thay doi che do (Create/Edit)
     */
    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && initialData) {
                setFormData({
                    planCode: initialData.planCode,
                    name: initialData.name,
                    description: initialData.description || "",
                    monthlyPrice: initialData.monthlyPrice,
                    yearlyPrice: initialData.yearlyPrice,
                    maxUsers: initialData.maxUsers,
                    maxWorkspaces: initialData.maxWorkspaces,
                    maxProjects: initialData.maxProjects,
                    maxStorageGb: initialData.maxStorageGb,
                    features: initialData.features || [],
                    isActive: initialData.isActive,
                });
            } else {
                setFormData({
                    planCode: "",
                    name: "",
                    description: "",
                    monthlyPrice: 0,
                    yearlyPrice: 0,
                    maxUsers: 5,
                    maxWorkspaces: 1,
                    maxProjects: 5,
                    maxStorageGb: 5,
                    features: [],
                    isActive: true,
                });
            }
            setFeatureInput("");
        }
    }, [isOpen, mode, initialData]);

    // ---------------------------------------------------------------------------
    // 6. HANDLERS (Business Logic)
    // ---------------------------------------------------------------------------

    /**
     * Xu ly thay doi du lieu trong cac o nhap lieu co ban
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let parsedValue: any = value;

        if (name === "planCode") {
            // Ep kieu in hoa va loai bo ky tu dac biet theo logic nghiep vu
            parsedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
        } else if (type === "number") {
            // Xu ly so de khong bi loi Hydration hoac ep kieu ve 0 khi dang xoa
            parsedValue = value === "" ? "" : Number(value);
        }

        setFormData((prev: any) => ({ ...prev, [name]: parsedValue }));
    };

    /**
     * Xu ly bat tat che do khong gioi han cho cac chi so tai nguyen
     */
    const handleLimitToggle = (field: string, isUnlimited: boolean, currentValue: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: isUnlimited ? -1 : (currentValue === -1 ? 10 : currentValue)
        }));
    };

    /**
     * Them tinh nang moi vao danh sach
     */
    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setFormData((prev: any) => ({ 
                ...prev, 
                features: [...prev.features, featureInput.trim()] 
            }));
            setFeatureInput("");
        }
    };

    /**
     * Xoa tinh nang khoi danh sach theo index
     */
    const handleRemoveFeature = (index: number) => {
        setFormData((prev: any) => ({ 
            ...prev, 
            features: prev.features.filter((_: any, i: number) => i !== index) 
        }));
    };

    /**
     * Xu ly chuan hoa du lieu va goi callback onSubmit
     */
    const handleFormSubmit = async () => {
        if (!formData.name || !formData.planCode) return;
        
        const formatNum = (val: any) => val === "" ? 0 : Number(val);

        // Chuan hoa toan bo gia tri so truoc khi gui API
        const formattedData = {
            ...formData,
            monthlyPrice: formatNum(formData.monthlyPrice),
            yearlyPrice: formatNum(formData.yearlyPrice),
            maxUsers: formData.maxUsers === -1 ? -1 : formatNum(formData.maxUsers),
            maxWorkspaces: formData.maxWorkspaces === -1 ? -1 : formatNum(formData.maxWorkspaces),
            maxProjects: formData.maxProjects === -1 ? -1 : formatNum(formData.maxProjects),
            maxStorageGb: formData.maxStorageGb === -1 ? -1 : formatNum(formData.maxStorageGb),
        };

        await onSubmit(formattedData);
    };

    // ---------------------------------------------------------------------------
    // 7. SUB-COMPONENTS (Internal UI)
    // ---------------------------------------------------------------------------

    /**
     * O nhap lieu dac thu cho Quotas co nut toggle Unlimited
     */
    const LimitInput = ({ label, field }: { label: string, field: string }) => {
        const isUnlimited = formData[field] === -1;
        return (
            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={isUnlimited} 
                            onChange={(e) => handleLimitToggle(field, e.target.checked, formData[field])}
                            className="rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC] w-3 h-3 transition-all"
                        />
                        <span className="text-[10px] uppercase font-black text-slate-400 group-hover:text-[#0052CC] transition-colors">Unlimited</span>
                    </label>
                </div>
                <div className="relative">
                    <input
                        type="number" 
                        name={field} 
                        min="0"
                        value={isUnlimited ? "" : formData[field]}
                        onChange={handleChange} 
                        disabled={isUnlimited}
                        placeholder={isUnlimited ? "∞" : "0"}
                        className={cn(
                            "w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-semibold transition-all outline-none",
                            "focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF]",
                            "disabled:bg-slate-50 disabled:text-slate-400"
                        )}
                    />
                    {isUnlimited && <Infinity className="absolute right-3 top-2.5 w-5 h-5 text-[#0052CC]" />}
                </div>
            </div>
        );
    };

    // ---------------------------------------------------------------------------
    // 8. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-[#E3F2FD] text-[#0052CC] rounded-xl border border-blue-100">
                            <Save className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#172B4D] tracking-tight uppercase">
                                {mode === "create" ? "Build New Plan" : "Refine Plan Schema"}
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define commercial and technical boundaries</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#172B4D] transition-all active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8 bg-[#F4F5F7]/30">
                    
                    {/* SECTION 1: BASIC METADATA */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 text-[#42526E] mb-2">
                            <Info className="w-4 h-4" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">1. Basic Metadata</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Plan Identity Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text" name="planCode" value={formData.planCode} onChange={handleChange}
                                    disabled={mode === "edit"} placeholder="e.g. ENTERPRISE_PRO"
                                    className={cn(
                                        "w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-black tracking-wider transition-all outline-none uppercase",
                                        "focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF]",
                                        "disabled:bg-slate-50 disabled:text-slate-400"
                                    )}
                                />
                                {mode === "edit" && <p className="text-[10px] text-amber-600 font-bold px-1 uppercase tracking-tight mt-1">Immutable field: Code cannot be modified</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Display Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Premium Business Tier"
                                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-bold text-[#172B4D] focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Detailed Description</label>
                            <textarea
                                name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Summarize the core value proposition of this tier..."
                                className="w-full p-3 border border-slate-300 rounded-lg text-sm font-medium text-[#42526E] focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] outline-none transition-all resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* SECTION 2: COMMERCIALS */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-2 text-[#42526E]">
                                <DollarSign className="w-4 h-4" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">2. Commercial Configuration</h3>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                                    formData.isActive ? 'text-[#36B37E]' : 'text-slate-400'
                                )}>
                                    {formData.isActive ? "Published" : "Draft Mode"}
                                </span>
                                <div className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                    formData.isActive ? 'bg-[#36B37E]' : 'bg-slate-300'
                                )}>
                                    <input type="checkbox" className="sr-only" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                                    <span className={cn(
                                        "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                                    )} />
                                </div>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Monthly Rate (VNĐ) <span className="text-red-500">*</span></label>
                                <input type="number" name="monthlyPrice" value={formData.monthlyPrice} onChange={handleChange} min="0" className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-black text-[#0052CC] focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Yearly Rate (VNĐ) <span className="text-red-500">*</span></label>
                                <input type="number" name="yearlyPrice" value={formData.yearlyPrice} onChange={handleChange} min="0" className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-black text-[#0052CC] focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: TECHNICAL RESOURCE QUOTAS */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 text-[#42526E] mb-2">
                            <LayoutGrid className="w-4 h-4" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">3. Technical Resource Quotas</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                            <LimitInput label="Workspaces" field="maxWorkspaces" />
                            <LimitInput label="Projects" field="maxProjects" />
                            <LimitInput label="Seat Capacity" field="maxUsers" />
                            <LimitInput label="Storage (GB)" field="maxStorageGb" />
                        </div>
                    </div>

                    {/* SECTION 4: PLATFORM CAPABILITIES */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 text-[#42526E] mb-2">
                            <Plus className="w-4 h-4" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">4. Platform Capabilities</h3>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <input 
                                type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                placeholder="Describe a capability (e.g. Single Sign-On)..." 
                                className="flex-1 h-10 px-3 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] outline-none"
                            />
                            <Button onClick={handleAddFeature} type="button" className="h-10 px-6 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-sm">
                                <Plus className="w-4 h-4 mr-1.5 stroke-[3]" /> Add
                            </Button>
                        </div>
                        
                        {formData.features.length > 0 && (
                            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                                {formData.features.map((feat: string, index: number) => (
                                    <li key={index} className="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-[#2684FF] group">
                                        <span className="flex items-center gap-2.5 text-[13px] text-[#42526E] font-bold">
                                            <CheckSquare className="w-4 h-4 text-[#36B37E] stroke-[2.5]" /> 
                                            {feat}
                                        </span>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveFeature(index)} 
                                            className="text-slate-300 hover:text-[#FF5630] p-1 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-[#F4F5F7]/50 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                    <Button 
                        onClick={onClose} 
                        variant="outline" 
                        disabled={loading} 
                        className="bg-white border-slate-300 text-[#42526E] font-bold text-xs uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleFormSubmit} 
                        disabled={loading || !formData.name || !formData.planCode} 
                        className="bg-[#0052CC] hover:bg-[#0747A6] text-white min-w-[140px] font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-blue-200"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 stroke-[2.5]" />}
                        {mode === "create" ? "Deploy Plan" : "Commit Changes"}
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