"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  FolderKanban, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Loader2 
} from "lucide-react";

// Định nghĩa lại Interface dựa trên API users/me
interface WorkspaceMembership {
  workspaceId: number;
  workspaceName: string;
  companyId: number;
  roleCode: string; // "WORKSPACE_ADMIN" | "WORKSPACE_MEMBER"
}

export default function CoreDashboardPage() {
  const router = useRouter();
  // Lấy user và activeCompany từ AuthContext
  // user chứa mảng workspaceMemberships
  // activeCompany chứa công ty đang được chọn (để lọc workspace thuộc công ty này)
  const { user, activeCompany, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 1. Lọc Workspace theo Công ty đang Active
  // API /users/me trả về TẤT CẢ workspace của user ở MỌI công ty.
  // Chúng ta chỉ hiển thị workspace thuộc activeCompany hiện tại.
  const myWorkspaces = (user?.workspaceMemberships || []).filter(
    (ws) => ws.companyId === activeCompany?.companyId
  );

  const handleEnterWorkspace = (workspaceId: number) => {
    router.push(`/core/workspace/${workspaceId}`);
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
              
              return (
                <div 
                  key={ws.workspaceId}
                  onClick={() => handleEnterWorkspace(ws.workspaceId)}
                  className="group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px]"
                >
                  {/* Top: Icon & Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm transition-colors
                      ${isAdmin ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-purple-50 group-hover:text-purple-600'}`}
                    >
                      {ws.workspaceName.charAt(0).toUpperCase()}
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
                      ${isAdmin 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                      {isAdmin ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5" />
                          Member
                        </>
                      )}
                    </span>
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
                  <div className="mt-6 flex items-center text-sm font-semibold text-purple-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Open Workspace <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // --- EMPTY STATE ---
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <FolderKanban className="w-10 h-10 text-slate-300" />
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