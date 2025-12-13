"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Loader2,
  ExternalLink,
  Briefcase,
  Search,
  LayoutGrid
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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => setMounted(true), []);

  // 1. Lấy danh sách Workspace thuộc công ty đang active
  const myWorkspaces = useMemo(() => {
    return (user?.workspaceMemberships || []).filter(
      (ws) => ws.companyId === activeCompany?.companyId
    );
  }, [user, activeCompany]);

  // 2. Lọc theo từ khóa tìm kiếm
  const filteredWorkspaces = useMemo(() => {
    if (!searchTerm) return myWorkspaces;
    return myWorkspaces.filter((ws) =>
      ws.workspaceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [myWorkspaces, searchTerm]);

  // 3. Hàm xử lý Click dựa trên Role (Giữ nguyên logic cũ)
  const handleEnterWorkspace = (ws: WorkspaceMembership) => {
    // Nếu là ADMIN -> Vào Dashboard quản lý Workspace
    if (ws.roleCode === "WORKSPACE_ADMIN") {
        router.push(`/core/workspace/${ws.workspaceId}`);
    } 
    // Nếu là MEMBER hoặc GUEST -> Chuyển sang Portal xem danh sách dự án
    else {
        router.push(`/portal?workspaceId=${ws.workspaceId}`);
    }
  };

  // Helper render Badge
  const renderRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case "WORKSPACE_ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border bg-purple-50 text-purple-700 border-purple-200 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case "GUEST":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border bg-amber-50 text-amber-700 border-amber-200 shadow-sm">
            <ExternalLink className="w-3.5 h-3.5" /> Guest
          </span>
        );
      default: // MEMBER
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border bg-slate-50 text-slate-600 border-slate-200 shadow-sm">
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
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              My Workspaces
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Select a workspace in <span className="font-semibold text-slate-800">{activeCompany?.companyName}</span> to start working.
            </p>
          </div>

          {/* Search Bar (Chỉ hiện khi có workspace) */}
          {myWorkspaces.length > 0 && (
            <div className="relative flex-1 md:w-80 md:flex-none group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search workspaces..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 pl-10 pr-4 h-11 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          )}
        </div>

        {/* --- CONTENT SECTION --- */}
        {myWorkspaces.length > 0 ? (
          
          filteredWorkspaces.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <LayoutGrid className="w-4 h-4" />
                    Available Workspaces ({filteredWorkspaces.length})
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWorkspaces.map((ws: WorkspaceMembership) => {
                    const isAdmin = ws.roleCode === "WORKSPACE_ADMIN";
                    const isGuest = ws.roleCode === "GUEST";
                    
                    return (
                      <div 
                        key={ws.workspaceId}
                        onClick={() => handleEnterWorkspace(ws)}
                        className={`
                          group relative bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px]
                          ${isGuest 
                              ? 'border-amber-200/60 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100/50' 
                              : 'border-slate-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100/50'}
                        `}
                      >
                        {/* Top: Icon & Badge */}
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm transition-transform group-hover:scale-105 duration-300
                            ${isAdmin 
                                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white' 
                                : isGuest
                                    ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600'
                                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'}`}
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
                        </div>

                        {/* Bottom: Action Arrow */}
                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                             Action
                          </span>
                          <div className={`flex items-center gap-1 text-sm font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300
                             ${isGuest ? "text-amber-600" : "text-purple-600"}`}
                          >
                             {isAdmin ? "Manage Workspace" : "View Projects"}
                             <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>
          ) : (
            // Search Empty State
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No workspaces found</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm">
                   We couldn't find any workspace matching "{searchTerm}"
                </p>
                <button 
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-blue-600 font-medium hover:underline text-sm"
                >
                    Clear search
                </button>
            </div>
          )

        ) : (
          // --- EMPTY STATE (Initial) ---
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm text-center animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                <Briefcase className="w-12 h-12 text-slate-300" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-2">No Workspaces Yet</h2>
             <p className="text-slate-500 max-w-md text-lg mb-6">
               You haven't been added to any workspaces in this company yet.
             </p>
             <p className="text-slate-400 text-sm bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
               Contact your Company Admin to get access.
             </p>
          </div>
        )}

      </div>
    </div>
  );
}