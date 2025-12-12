"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { FolderKanban, ArrowRight, ExternalLink, ShieldCheck, User, Search, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useMemo } from "react";

export default function GuestPortalPage() {
  const { user, activeCompany, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Lấy workspaceId từ URL (nếu có)
  const targetWorkspaceId = searchParams.get("workspaceId") ? Number(searchParams.get("workspaceId")) : null;

  // Local state cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc danh sách dự án
  const displayProjects = useMemo(() => {
    if (!user?.projectMemberships) return [];

    let projects = user.projectMemberships;

    // 1. Lọc theo Workspace (nếu được chỉ định từ trang trước)
    if (targetWorkspaceId) {
        projects = projects.filter(p => p.workspaceId === targetWorkspaceId);
    } 
    // Nếu không có targetWorkspaceId, có thể lọc theo Active Company hiện tại (Optional)
    else if (activeCompany) {
        // Logic này cần thiết nếu user tham gia nhiều công ty
        // API hiện tại trả về projectMemberships không có companyId trực tiếp, 
        // nhưng ta có thể check chéo qua workspaceMemberships nếu cần thiết.
        // Tạm thời hiển thị tất cả nếu không có ID.
    }

    // 2. Lọc theo Search Term
    if (searchTerm) {
        projects = projects.filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return projects;
  }, [user, targetWorkspaceId, searchTerm, activeCompany]);

  // Helper tìm tên Workspace (để hiển thị trên Header)
  const currentWorkspaceName = useMemo(() => {
      if (!targetWorkspaceId) return null;
      return user?.workspaceMemberships?.find(w => w.workspaceId === targetWorkspaceId)?.workspaceName;
  }, [user, targetWorkspaceId]);

  // Helper render Badge
  const getRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case "PROJECT_ADMIN":
        return <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Admin</span>;
      case "GUEST_PROJECT":
        return <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"><ExternalLink className="w-3 h-3"/> Guest</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase border bg-slate-50 text-slate-600 border-slate-200 flex items-center gap-1"><User className="w-3 h-3"/> Member</span>;
    }
  };

  // Helper Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {targetWorkspaceId 
                    ? `Workspace: ${currentWorkspaceName}` 
                    : `${getGreeting()}, ${user?.fullName?.split(" ").pop()}! 👋`
                }
              </h1>
              <p className="text-slate-500 mt-2 text-base">
                {targetWorkspaceId 
                    ? "Here are the projects you are participating in within this workspace."
                    : `You are currently accessing ${activeCompany?.companyName}.`
                }
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search projects..." 
                    className="w-full pl-9 pr-4 h-10 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </div>

        {/* --- PROJECTS GRID --- */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-600" />
              {targetWorkspaceId ? "Participating Projects" : "All Your Projects"}
            </h2>
            <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              {displayProjects.length} Projects
            </span>
          </div>

          {displayProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProjects.map((project) => (
                <div 
                  key={project.projectId}
                  // Chuyển hướng vào Board của Project
                  onClick={() => router.push(`/core/workspace/${project.workspaceId}/project/${project.projectId}/board`)}
                  className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 cursor-pointer transition-all duration-300 flex flex-col h-full animate-in fade-in zoom-in-95"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-inner group-hover:scale-110 transition-transform">
                      <FolderKanban className="w-6 h-6" />
                    </div>
                    {getRoleBadge(project.roleCode)}
                  </div>

                  {/* Card Body */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {project.projectName}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded w-fit">
                        <Filter className="w-3 h-3" />
                        <span>WS ID: #{project.workspaceId}</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                      Open Board
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <FolderKanban className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
               <p className="text-slate-500 mt-2 max-w-xs text-center">
                 {targetWorkspaceId 
                    ? "You are not a member of any project in this workspace."
                    : "You haven't been invited to any projects yet."}
               </p>
               {/* Nút quay lại nếu đang lọc */}
               {targetWorkspaceId && (
                   <button 
                      onClick={() => router.push("/core")}
                      className="mt-6 text-sm font-medium text-blue-600 hover:underline"
                   >
                      Back to Workspaces
                   </button>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}