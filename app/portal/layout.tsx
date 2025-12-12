"use client";

import { useState } from "react";
import AdminHeader from "@/components/features/admin/Header"; 
import Sidebar from "@/components/features/core/Sidebar"; 
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();

  // 1. Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading Portal...</p>
      </div>
    );
  }

  // 2. Auth Check
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500 gap-2">
        <ShieldAlert className="w-10 h-10 text-red-500" />
        <p>Access Denied. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex-shrink-0 z-50">
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <div className="flex-shrink-0 z-40">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeMenu="/portal" // Highlight menu item nếu cần
            setActiveMenu={() => {}}
            workspaces={[]} // 🔴 Guest không thấy workspace list
          />
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar bg-slate-50/50">
           {children}
        </main>
      </div>
    </div>
  );
}