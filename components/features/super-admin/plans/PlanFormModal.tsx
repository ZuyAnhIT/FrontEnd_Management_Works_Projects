"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Save, Plus, Trash2, Infinity, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { PlanDetail, CreatePlanPayload, UpdatePlanPayload } from "@/services/apiPlanSystem";

interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: any) => Promise<void>;
    initialData: PlanDetail | null; 
    mode: "create" | "edit";
    loading: boolean;
}

export default function PlanFormModal({ isOpen, onClose, onSubmit, initialData, mode, loading }: PlanFormModalProps) {
    // --- Form States ---
    const [formData, setFormData] = useState<any>({
        planCode: "", name: "", description: "",
        monthlyPrice: 0, yearlyPrice: 0,
        maxUsers: 5, maxWorkspaces: 1, maxProjects: 5, maxStorageGb: 5,
        features: [], isActive: true, 
    });

    const [featureInput, setFeatureInput] = useState("");

    // Khởi tạo data khi mở modal
    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && initialData) {
                setFormData({
                    planCode: initialData.planCode, name: initialData.name, description: initialData.description || "",
                    monthlyPrice: initialData.monthlyPrice, yearlyPrice: initialData.yearlyPrice,
                    maxUsers: initialData.maxUsers, maxWorkspaces: initialData.maxWorkspaces,
                    maxProjects: initialData.maxProjects, maxStorageGb: initialData.maxStorageGb,
                    features: initialData.features || [], isActive: initialData.isActive,
                });
            } else {
                setFormData({
                    planCode: "", name: "", description: "",
                    monthlyPrice: 0, yearlyPrice: 0,
                    maxUsers: 5, maxWorkspaces: 1, maxProjects: 5, maxStorageGb: 5,
                    features: [], isActive: true,
                });
            }
            setFeatureInput("");
        }
    }, [isOpen, mode, initialData]);

    if (!isOpen) return null;

    // --- Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        let parsedValue: any = value;

        if (name === "planCode") {
            // Ép in hoa thẳng vào State và bỏ mọi ký tự lạ (khoảng trắng, ký tự đặc biệt) ngay lúc gõ
            parsedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
        } else if (type === "number") {
            
            // - Nếu gõ "01", Number("01") = 1 (Tự mất số 0 ở đầu)
            // - Nếu người dùng xóa hết (value === ""), lưu State là chuỗi rỗng "" để không bị ép về lại 0 cứng ngắc
            parsedValue = value === "" ? "" : Number(value);
        }

        setFormData((prev: any) => ({
            ...prev,
            [name]: parsedValue
        }));
    };

    const handleLimitChange = (field: string, isUnlimited: boolean, currentValue: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: isUnlimited ? -1 : (currentValue === -1 ? 10 : currentValue)
        }));
    };

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setFormData((prev: any) => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
            setFeatureInput("");
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFormData((prev: any) => ({ ...prev, features: prev.features.filter((_: any, i: number) => i !== index) }));
    };

    const handleSubmit = async () => {
        // Validation trống cơ bản
        if (!formData.name || !formData.planCode) return;
        
        // Xử lý trước khi nộp: Nếu người dùng để trống ô số (value === ""), tự động gắn bằng 0 để gửi API không lỗi
        const formatNumber = (val: any) => val === "" ? 0 : Number(val);

        const formattedData = {
            ...formData,
            monthlyPrice: formatNumber(formData.monthlyPrice),
            yearlyPrice: formatNumber(formData.yearlyPrice),
            maxUsers: formData.maxUsers === -1 ? -1 : formatNumber(formData.maxUsers),
            maxWorkspaces: formData.maxWorkspaces === -1 ? -1 : formatNumber(formData.maxWorkspaces),
            maxProjects: formData.maxProjects === -1 ? -1 : formatNumber(formData.maxProjects),
            maxStorageGb: formData.maxStorageGb === -1 ? -1 : formatNumber(formData.maxStorageGb),
        };

        const payload = mode === "create" 
            ? { ...formattedData } as CreatePlanPayload
            : { ...formattedData } as UpdatePlanPayload; 
            
        await onSubmit(payload);
    };

    // --- Sub-components ---
    const LimitInput = ({ label, field }: { label: string, field: string }) => {
        const isUnlimited = formData[field] === -1;
        return (
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                    <span>{label}</span>
                    <label className="flex items-center gap-1 cursor-pointer text-blue-600">
                        <input 
                            type="checkbox" checked={isUnlimited} 
                            onChange={(e) => handleLimitChange(field, e.target.checked, formData[field])}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        <span className="text-[10px] uppercase font-bold">Unlimited</span>
                    </label>
                </label>
                <div className="relative">
                    <input
                        type="number" name={field} min="0"
                        value={isUnlimited ? "" : formData[field]}
                        onChange={handleChange} disabled={isUnlimited}
                        placeholder={isUnlimited ? "∞" : "0"}
                        className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                    />
                    {isUnlimited && <Infinity className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{mode === "create" ? "Create New Plan" : "Edit Plan Configuration"}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Define pricing, limits, and features for this tier.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6 bg-slate-50/30">
                    
                    {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">1. Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Plan Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text" name="planCode" value={formData.planCode} onChange={handleChange}
                                    disabled={mode === "edit"} placeholder="e.g., ENTERPRISE"
                                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500 font-mono"
                                />
                                {mode === "edit" && <p className="text-[10px] text-amber-600 mt-1">Plan code cannot be changed after creation.</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Plan Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Professional Plan"
                                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Description</label>
                            <textarea
                                name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Brief summary of this plan..."
                                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none"
                            />
                        </div>
                    </div>

                    {/* KHỐI 2: GIÁ & TRẠNG THÁI */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h3 className="text-sm font-bold text-slate-900">2. Pricing & Visibility</h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className={`text-xs font-bold ${formData.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    {formData.isActive ? "ACTIVE (ON SALE)" : "INACTIVE (HIDDEN)"}
                                </span>
                                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                    <input type="checkbox" className="sr-only" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Monthly Price (VNĐ) <span className="text-red-500">*</span></label>
                                <input type="number" name="monthlyPrice" value={formData.monthlyPrice} onChange={handleChange} min="0" className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Yearly Price (VNĐ) <span className="text-red-500">*</span></label>
                                <input type="number" name="yearlyPrice" value={formData.yearlyPrice} onChange={handleChange} min="0" className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* KHỐI 3: QUOTA LIMITS */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">3. Resource Quotas</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <LimitInput label="Max Workspaces" field="maxWorkspaces" />
                            <LimitInput label="Max Projects" field="maxProjects" />
                            <LimitInput label="Max Users" field="maxUsers" />
                            <LimitInput label="Storage (GB)" field="maxStorageGb" />
                        </div>
                    </div>

                    {/* KHỐI 4: DANH SÁCH TÍNH NĂNG */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">4. Highlighted Features</h3>
                        <div className="flex gap-2">
                            <input 
                                type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                placeholder="Type a feature and press Enter or Add..." 
                                className="flex-1 h-10 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            />
                            <Button onClick={handleAddFeature} type="button" className="h-10 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                        </div>
                        
                        {formData.features.length > 0 && (
                            <ul className="mt-3 space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                {formData.features.map((feat: string, index: number) => (
                                    <li key={index} className="flex items-center justify-between bg-white p-2.5 rounded-md border border-slate-200 shadow-sm">
                                        <span className="flex items-center gap-2 text-sm text-slate-700 font-medium"><CheckSquare className="w-4 h-4 text-emerald-500" /> {feat}</span>
                                        <button type="button" onClick={() => handleRemoveFeature(index)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <Button onClick={onClose} variant="outline" disabled={loading} className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || !formData.name || !formData.planCode} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {mode === "create" ? "Create Plan" : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}