"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Utils)
// =============================================================================

import React, { Suspense } from "react";
import Link from "next/link";
import { LayoutDashboard, Loader2 } from "lucide-react";

// Internal Components
import ResetPasswordForm from "@/components/features/auth/ResetPasswordForm";

// Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

/**
 * Trang dat lai mat khau (Reset Password Wrapper).
 * Su dung Suspense de bao boc Client Component, cho phep xu ly an toan cac tham so tu URL.
 */
export default function ResetPasswordPage() {
    
    // ---------------------------------------------------------------------------
    // 3. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <main 
            className={cn(
                "flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-300",
                "bg-[#F4F5F7] font-sans text-[#172B4D]" // Mau nen trung tinh dac trung cua Jira
            )}
        >
            {/* KHOI LOGO & THUONG HIEU */}
            <Link 
                href="/" 
                className="flex items-center gap-3 mb-10 group outline-none"
            >
                <div 
                    className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300",
                        "bg-[#0052CC] group-hover:scale-105 group-hover:bg-[#0747A6]"
                    )}
                >
                    <LayoutDashboard className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <span className="font-black text-[24px] tracking-tighter text-[#172B4D]">
                    WorkNet
                </span>
            </Link>

            {/* KHOI NOI DUNG CHINH (CARD WRAPPER) */}
            <div 
                className={cn(
                    "w-full max-w-sm bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden",
                    "animate-in fade-in zoom-in-95 duration-500"
                )}
            >
                <Suspense 
                    // Giao dien cho thoi gian tai Form (Loading state)
                    fallback={
                        <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-full">
                                <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[14px] font-black uppercase tracking-widest text-[#172B4D]">
                                    Loading Module
                                </p>
                                <p className="text-[12px] font-medium text-slate-400">
                                    Preparing secure environment...
                                </p>
                            </div>
                        </div>
                    }
                >
                    <ResetPasswordForm />
                </Suspense>
            </div>

            {/* KHOI DIEU HUONG BO SUNG (FOOTER) */}
            <p className="mt-8 text-center text-[13px] font-medium text-[#42526E]">
                Remember your password?{" "}
                <Link 
                    href="/" 
                    className="font-black text-[#0052CC] hover:text-[#0747A6] hover:underline transition-all"
                >
                    Back to login
                </Link>
            </p>

        </main>
    );
}