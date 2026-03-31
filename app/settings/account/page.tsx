"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

// Services & Context
import { changeUserPassword } from "@/services/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

// UI Components
import { LoadingButton } from "@/components/ui/LoadingButton"; // Da sua loi import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Cards";
import { Input } from "@/components/ui/Inputs";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & SUB-COMPONENTS
// =============================================================================

interface PasswordInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}

/**
 * Component phu ho tro nhap mat khau voi chuc nang an/hien
 */
const PasswordInput: React.FC<PasswordInputProps> = ({ label, value, onChange, placeholder }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            <label className="text-[11px] font-black text-[#42526E] uppercase tracking-widest px-1">
                {label} <span className="text-[#FF5630]">*</span>
            </label>
            <div className="relative group">
                <Input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className={cn(
                        "w-full pl-4 pr-12 h-11 bg-white border border-[#DFE1E6] rounded-xl text-[14px] font-medium transition-all placeholder:text-slate-400",
                        "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0052CC]"
                    )}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B778C] hover:text-[#0052CC] transition-colors outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
            </div>
        </div>
    );
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Trang quan ly tai khoan (Doi mat khau)
 */
export default function AccountPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    // ---------------------------------------------------------------------------
    // 5. EVENT HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Cap nhat du lieu form vao state
     */
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    /**
     * Xu ly gui yeu cau doi mat khau
     */
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiem tra du lieu dau vao co ban
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmNewPassword) {
            showToast("Please fill in all required fields.", "warning");
            return;
        }
        if (formData.newPassword.length < 6) {
            showToast("New password must be at least 6 characters.", "warning");
            return;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }

        try {
            setIsLoading(true);
            await changeUserPassword(formData);
            showToast("Password updated successfully!", "success");
            
            // Xoa trang form sau khi thanh cong
            setFormData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to update password.";
            showToast(message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------------------------------------------------------------------
    // 6. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500 py-6">
            <Card className="border border-[#DFE1E6] shadow-sm bg-white rounded-2xl overflow-hidden">
                
                {/* HEADER SECTION */}
                <CardHeader className="bg-[#FAFBFC] border-b border-[#DFE1E6] px-8 py-6">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <KeyRound className="w-6 h-6 text-[#FF8B00]" />
                        </div>
                        <div>
                            <CardTitle className="text-[16px] font-black text-[#172B4D] uppercase tracking-tight">
                                Security Settings
                            </CardTitle>
                            <p className="text-[13px] text-[#42526E] font-medium mt-1">
                                Update your password to maintain account security.
                            </p>
                        </div>
                    </div>
                </CardHeader>

                {/* FORM SECTION */}
                <CardContent className="p-8">
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        
                        {/* Mat khau hien tai */}
                        <PasswordInput
                            label="Current Password"
                            value={formData.oldPassword}
                            onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                            placeholder="Enter your current password"
                        />

                        <div className="h-px w-full bg-[#DFE1E6] my-6" />

                        {/* Mat khau moi va thanh do luong suc manh */}
                        <div className="space-y-4 bg-[#F4F5F7] p-5 rounded-xl border border-slate-100">
                            <PasswordInput
                                label="New Password"
                                value={formData.newPassword}
                                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                placeholder="Create a strong new password"
                            />
                            
                            <div className="pt-2">
                                <PasswordStrengthMeter password={formData.newPassword} />
                            </div>
                        </div>

                        {/* Xac nhan mat khau moi */}
                        <PasswordInput
                            label="Confirm New Password"
                            value={formData.confirmNewPassword}
                            onChange={(e) => handleInputChange("confirmNewPassword", e.target.value)}
                            placeholder="Re-enter to verify"
                        />

                        {/* FOOTER ACTIONS */}
                        <div className="pt-8 flex justify-end">
                            <LoadingButton
                                type="submit"
                                isLoading={isLoading}
                                text="Update Password"
                                loadingText="Saving Changes..."
                                className={cn(
                                    "h-11 px-8 rounded-lg shadow-md transition-all active:scale-95",
                                    "bg-[#0052CC] hover:bg-[#0747A6] text-white",
                                    "font-black text-[12px] uppercase tracking-widest min-w-[200px]"
                                )}
                            />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}