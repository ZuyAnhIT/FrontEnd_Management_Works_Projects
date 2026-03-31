"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useState, useEffect, useRef } from "react";
import { 
    User, Phone, Calendar, Camera, UploadCloud, Loader2, Mail 
} from "lucide-react";

// Context & Services
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/services/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

// UI Components
import { LoadingButton } from "@/components/ui/LoadingButton"; 
import InputField from "@/components/features/auth/InputField";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. UTILS & HELPERS
// =============================================================================

/**
 * Xu ly URL anh dai dien de hien thi chinh xac duong dan tu may chu hoac local
 */
const getFullImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;

    if (path.startsWith("blob:") || path.startsWith("http")) {
        return path;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
    let cleanPath = path.startsWith("/") ? path.slice(1) : path;

    if (!cleanPath.startsWith("uploads/")) {
        cleanPath = `uploads/${cleanPath}`;
    }

    return `${API_URL}/${cleanPath}`;
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function ProfileSettingsPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & CONTEXT
    // ---------------------------------------------------------------------------
    
    const { user, refreshUser, isLoading: isAuthLoading } = useAuth();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ---------------------------------------------------------------------------
    // 5. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    const [isSaving, setIsSaving] = useState(false);

    // State quan ly du lieu bieu mau
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "", 
        gender: "MALE",
    });

    // State quan ly anh dai dien
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // ---------------------------------------------------------------------------
    // 6. SIDE EFFECTS
    // ---------------------------------------------------------------------------

    /**
     * Dong bo du lieu tu AuthContext vao Form khi component duoc mount hoac user thay doi
     */
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                phoneNumber: user.phoneNumber || "",
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "", 
                gender: (user.gender as string) || "MALE",
            });

            setPreviewUrl(getFullImageUrl(user.avatarUrl)); 
        }
    }, [user]);

    /**
     * Don dep bo nho cua URL hinh anh xem truoc de tranh memory leak
     */
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // ---------------------------------------------------------------------------
    // 7. EVENT HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xu ly chon file anh tu thiet bi
     */
    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast("File size exceeds 5MB limit", "error");
            return;
        }
        
        if (!file.type.startsWith("image/")) {
            showToast("Invalid file type. Please select an image (JPG, PNG)", "error");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setSelectedFile(file);
    };

    /**
     * Gui yeu cau cap nhat ho so len may chu
     */
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await updateUserProfile({
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender as "MALE" | "FEMALE" | "OTHER",
                avatarFile: selectedFile, 
            });

            showToast("Profile updated successfully", "success");
            
            // Lam moi du lieu nguoi dung de cap nhat anh dai dien tren toan he thong
            await refreshUser();
            
            if (fileInputRef.current) fileInputRef.current.value = "";
            setSelectedFile(null);
            
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Failed to update profile";
            showToast(message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    // ---------------------------------------------------------------------------
    // 8. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (isAuthLoading || !user) {
        return (
             <div className="flex items-center justify-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-[#0052CC] opacity-80" />
             </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500 py-6">
            
            {/* PAGE HEADER */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">User Profile</h1>
                <p className="text-[14px] text-[#42526E] font-medium mt-1">Manage your identity, avatar, and contact information.</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl shadow-sm border border-[#DFE1E6] overflow-hidden">
                
                {/* SECTION 1: AVATAR MANAGEMENT */}
                <div className="p-8 bg-[#FAFBFC] border-b border-[#DFE1E6] flex flex-col sm:flex-row items-center gap-8">
                    
                    <div 
                        className="relative group cursor-pointer shrink-0" 
                        onClick={() => fileInputRef.current?.click()}
                        title="Change profile picture"
                    >
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[4px] border-white shadow-md overflow-hidden bg-[#F4F5F7] relative transition-transform duration-300 group-hover:scale-[1.02]">
                            {previewUrl ? (
                                <img 
                                    src={previewUrl} 
                                    alt="User Avatar" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                        e.currentTarget.src = ""; 
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.parentElement?.classList.add("image-error");
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#6B778C] bg-[#F4F5F7]">
                                    <User className="w-14 h-14" />
                                </div>
                            )}
                            
                            <div className="absolute inset-0 hidden group-[.image-error]:flex items-center justify-center bg-[#F4F5F7] text-[#6B778C]">
                                <User className="w-14 h-14" />
                            </div>
                            
                            <div className="absolute inset-0 bg-[#091E42]/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-[1px]">
                                <Camera className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                        </div>

                        <div className="absolute bottom-1 right-1 bg-[#0052CC] text-white p-2.5 rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                             <UploadCloud className="w-4.5 h-4.5 stroke-[2.5]" />
                        </div>
                    </div>

                    <div className="text-center sm:text-left space-y-2">
                        <h3 className="font-black text-[#172B4D] text-[16px]">Profile Picture</h3>
                        <p className="text-[12px] font-medium text-[#6B778C] leading-relaxed max-w-xs">
                            Supports JPG, PNG formats. Maximum size 5MB. <br/>
                            Click the image to upload a new photo.
                        </p>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileSelection}
                    />
                </div>

                {/* SECTION 2: PERSONAL DETAILS */}
                <div className="p-8 space-y-8">
                    
                    <div className="grid grid-cols-1 gap-2">
                         <label className="text-[11px] font-black text-[#42526E] uppercase tracking-widest flex items-center gap-2 px-1">
                            <Mail className="w-4 h-4 opacity-70" /> Email Address
                         </label>
                         <div className="h-11 px-4 flex items-center bg-[#F4F5F7] border border-[#DFE1E6] rounded-xl text-[#6B778C] text-[14px] font-bold cursor-not-allowed">
                            {user.email}
                            <span className="ml-auto text-[10px] font-black uppercase tracking-widest bg-[#DFE1E6] px-2 py-0.5 rounded-md text-[#42526E]">
                                Read-only
                            </span>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-widest px-1">Full Name</label>
                            <InputField
                                label=""
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                icon={<User className="w-4.5 h-4.5 text-[#6B778C]"/>}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-widest px-1">Phone Number</label>
                            <InputField
                                label=""
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                icon={<Phone className="w-4.5 h-4.5 text-[#6B778C]"/>}
                                placeholder="e.g. +1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-widest flex items-center gap-2 px-1">
                                <Calendar className="w-4 h-4 opacity-70" /> Date of Birth
                            </label>
                            <input 
                                type="date" 
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                className={cn(
                                    "w-full h-11 px-4 border border-[#DFE1E6] rounded-xl text-[14px] font-medium text-[#172B4D] transition-all outline-none",
                                    "focus:ring-2 focus:ring-blue-100 focus:border-[#0052CC]"
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-widest px-1">Gender</label>
                            <div className="relative">
                                <select 
                                    value={formData.gender}
                                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                    className={cn(
                                        "w-full h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[14px] font-bold text-[#172B4D] transition-all outline-none appearance-none cursor-pointer bg-white",
                                        "focus:ring-2 focus:ring-blue-100 focus:border-[#0052CC]"
                                    )}
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other / Prefer not to say</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B778C]">
                                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="bg-[#FAFBFC] px-8 py-5 border-t border-[#DFE1E6] flex justify-end gap-3">
                    <LoadingButton 
                        type="submit" 
                        text="Save Profile" 
                        loadingText="Updating..."
                        isLoading={isSaving} 
                        className="bg-[#0052CC] hover:bg-[#0747A6] text-white h-11 px-8 rounded-lg shadow-md active:scale-95 transition-all font-black text-[12px] uppercase tracking-widest min-w-[180px]"
                    />
                </div>

            </form>
        </div>
    );
}