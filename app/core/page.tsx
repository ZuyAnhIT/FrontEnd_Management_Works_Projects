"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  FolderKanban, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Loader2,
  ExternalLink, // Icon cho Guest
  Briefcase
} from "lucide-react";

// Interface Workspace từ API profile
interface WorkspaceMembership {
  workspaceId: number;
  workspaceName: string;
  companyId: number;
  roleCode: string; // "WORKSPACE_ADMIN" | "WORKSPACE_MEMBER" | "GUEST"
}

export default function CoreDashboardPage() {
  const router = useRouter();
  const { user, activeCompany, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 1. Lọc Workspace thuộc công ty đang active
  const myWorkspaces = (user?.workspaceMemberships || []).filter(
    (ws) => ws.companyId === activeCompany?.companyId
  );

  // 2. Hàm xử lý Click dựa trên Role
  const handleEnterWorkspace = (ws: WorkspaceMembership) => {
    // Nếu là ADMIN -> Vào Dashboard quản lý Workspace
    if (ws.roleCode === "WORKSPACE_ADMIN") {
        router.push(`/core/workspace/${ws.workspaceId}`);
    } 
    // Nếu là MEMBER hoặc GUEST -> Chuyển sang Portal xem danh sách dự án
    // (Lọc dự án theo Workspace này)
    else {
        router.push(`/portal?workspaceId=${ws.workspaceId}`);
    }
  };

  // Helper render Badge
  const renderRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case "WORKSPACE_ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-purple-50 text-purple-700 border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case "GUEST":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
            <ExternalLink className="w-3.5 h-3.5" /> Guest
          </span>
        );
      default: // MEMBER
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-50 text-slate-600 border-slate-200">
            <User className="w-3.5 h-3.5" /> Member
          </span>
        );
    }
  };

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            My Workspaces
          </h1>
          <p className="text-slate-500 text-lg">
            Select a workspace in <span className="font-semibold text-slate-700">{activeCompany?.companyName}</span> to start working.
          </p>
        </div>

        {/* --- WORKSPACE LIST GRID --- */}
        {myWorkspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myWorkspaces.map((ws: WorkspaceMembership) => {
              const isAdmin = ws.roleCode === "WORKSPACE_ADMIN";
              const isGuest = ws.roleCode === "GUEST";
              
              return (
                <div 
                  key={ws.workspaceId}
                  onClick={() => handleEnterWorkspace(ws)}
                  className={`
                    group relative bg-white rounded-2xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px]
                    ${isGuest 
                        ? 'border-amber-200 hover:border-amber-400' 
                        : 'border-slate-200 hover:border-purple-300'}
                  `}
                >
                  {/* Top: Icon & Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm transition-colors
                      ${isAdmin 
                          ? 'bg-purple-600 text-white' 
                          : isGuest
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-purple-50 group-hover:text-purple-600'}`}
                    >
                      {ws.workspaceName.charAt(0).toUpperCase()}
                    </div>

                    {renderRoleBadge(ws.roleCode)}
                  </div>

                  {/* Content: Name & ID */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                      {ws.workspaceName}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Workspace ID: #{ws.workspaceId}
                    </p>
                  </div>

                  {/* Bottom: Action Arrow */}
                  <div className="mt-6 flex items-center text-sm font-semibold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <span className={isGuest ? "text-amber-600" : "text-purple-600"}>
                        {isAdmin ? "Manage Workspace" : "View Projects"}
                    </span>
                    <ArrowRight className={`w-4 h-4 ml-2 ${isGuest ? "text-amber-600" : "text-purple-600"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // --- EMPTY STATE ---
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-slate-300" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-2">No Workspaces Found</h2>
             <p className="text-slate-500 max-w-md text-lg">
               You haven't been added to any workspaces in this company yet.
             </p>
             <p className="text-slate-400 text-sm mt-2">
               Contact your Company Admin to get access.
             </p>
          </div>
        )}

      </div>
    </div>
  );
}