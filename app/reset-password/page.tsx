"use client";

import { Suspense } from "react";
import ResetPasswordForm from "@/components/features/auth/ResetPasswordForm";
import Link from "next/link";
import { LayoutDashboard, Loader2 } from "lucide-react";

// =================================================================
// 1. MAIN COMPONENT (LAYOUT)
// =================================================================

export default function ResetPasswordPage() {
    return (
        // Layout nền xám nhạt minimalist
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 font-sans text-slate-900">
            
            {/* Logo Branding */}
            <Link
                href="/"
                className="flex items-center gap-3 mb-8 group"
            >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    WorkNet
                </span>
            </Link>

            {/* Thẻ Form chính: Nền trắng, shadow sâu, viền mỏng */}
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                <Suspense 
                    fallback={
                        <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="text-sm font-medium">Loading form...</span>
                        </div>
                    }
                >
                    <ResetPasswordForm />
                </Suspense>
            </div>

            {/* Footer Link (Optional) */}
            <p className="mt-6 text-center text-sm text-slate-500">
                Remember your password?{" "}
                <Link href="/" className="font-semibold text-blue-600 hover:underline transition-all">
                    Log in
                </Link>
            </p>

        </div>
    );
}