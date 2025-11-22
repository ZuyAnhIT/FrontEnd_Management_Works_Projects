import { Suspense } from "react";
import AcceptInvitationClient from "@/components/features/auth/AcceptInvitationClient";
import Link from "next/link";
import { Loader2, LayoutDashboard } from "lucide-react";

export default function AcceptInvitationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 font-sans text-slate-900">
      
      {/* --- BRANDING --- */}
      <Link href="/" className="flex items-center gap-3 mb-8 group">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
           <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-slate-900">
           WorkNet
        </span>
      </Link>

      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <Suspense
          fallback={
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Verifying invitation...</span>
            </div>
          }
        >
          <AcceptInvitationClient />
        </Suspense>
      </div>

      {/* --- FOOTER --- */}
      <div className="mt-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} WorkNet Inc. All rights reserved.
      </div>
    </div>
  );
}