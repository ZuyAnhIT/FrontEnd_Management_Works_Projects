// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Utils)
// =============================================================================

import React, { Suspense } from "react";
import Link from "next/link";
import { Loader2, LayoutDashboard } from "lucide-react";

// Internal Components
import AcceptInvitationClient from "@/components/features/auth/AcceptInvitationClient";

// Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

/**
 * Trang tiep nhan loi moi (Accept Invitation Page).
 * Su dung Suspense de bao boc Client Component, cho phep su dung useSearchParams() an toan.
 */
export default function AcceptInvitationPage() {
    
    // ---------------------------------------------------------------------------
    // 3. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <main 
            className={cn(
                "flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-300",
                "bg-[#F4F5F7] font-sans text-[#172B4D]" // Mau nen trung tinh giong Jira
            )}
        >
            {/* KHỐI LOGO & THƯƠNG HIỆU */}
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

            {/* KHỐI NỘI DUNG CHÍNH (CARD) */}
            <div 
                className={cn(
                    "w-full max-w-md bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden",
                    "animate-in fade-in zoom-in-95 duration-500"
                )}
            >
                <Suspense
                    // Giao dien cho thoi gian cho (Loading state)
                    fallback={
                        <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-full">
                                <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[14px] font-black uppercase tracking-widest text-[#172B4D]">
                                    Verifying Invitation
                                </p>
                                <p className="text-[12px] font-medium text-slate-400">
                                    Please wait a moment...
                                </p>
                            </div>
                        </div>
                    }
                >
                    {/* Component xu ly logic xac thuc loi moi o phia Client */}
                    <AcceptInvitationClient />
                </Suspense>
            </div>

            {/* PHẦN CHÂN TRANG (FOOTER) */}
            <footer className="mt-8 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    &copy; {new Date().getFullYear()} WorkNet Inc. All rights reserved.
                </p>
            </footer>
        </main>
    );
}