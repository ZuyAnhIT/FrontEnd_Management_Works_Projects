"use client";

import { Users, Briefcase, ChevronRight, Crown, Shield, Layout, Trash2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { DashboardWorkspace } from "@/services/apiDashboard"; // Uncomment nếu cần type chặt

interface WorkspaceCardProps {
  workspace: any; // ✅ SỬA TÊN PROP: từ 'ws' thành 'workspace' để khớp với cha
  isImpersonating?: boolean; // Optional
  onNavigate?: (id: number) => void; // Optional để tương thích
  onDelete?: (id: number) => void; // Optional
  viewMode?: "grid" | "list";
}

export default function WorkspaceCard({ 
  workspace, 
  isImpersonating, 
  onNavigate,
  onDelete,
  viewMode = "grid" 
}: WorkspaceCardProps) {
  const router = useRouter();

  // Fallback function nếu không truyền onNavigate
  const handleNavigate = () => {
    if (onNavigate) {
        onNavigate(workspace.workspaceId);
    } else {
        router.push(`/core/workspace/${workspace.workspaceId}`);
    }
  };
  
  // Safe check để tránh crash nếu workspace null (dù TypeScript đã check)
  if (!workspace) return null;

  // Màu sắc Minimalist
  const roleColor = workspace.roleCode?.includes('ADMIN') 
    ? 'bg-amber-50 text-amber-700 border-amber-200' 
    : 'bg-blue-50 text-blue-700 border-blue-200';
    
  const isAdmin = workspace.roleCode?.includes('ADMIN');
  const Icon = isAdmin ? Crown : Shield;

  // ========================================================
  // 1. LIST VIEW (Dùng cho Dashboard bên phải)
  // ========================================================
  if (viewMode === "list") {
    return (
      <div 
        onClick={handleNavigate}
        className="group flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all duration-200 cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="w-10 h-10 shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative">
           {workspace.coverImage ? (
              <img src={workspace.coverImage} alt="cover" className="w-full h-full object-cover" />
           ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${workspace.color || '#3B82F6'}20` }}
              >
                 <Layout className="w-5 h-5" style={{ color: workspace.color || "#3B82F6" }} />
              </div>
           )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                {workspace.workspaceName}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                <span className={`inline-flex items-center gap-0.5 ${isAdmin ? 'text-amber-600' : 'text-blue-600'}`}>
                    {isAdmin ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {workspace.roleName}
                </span>
            </div>
        </div>

        {/* Action */}
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    );
  }

  // ========================================================
  // 2. GRID VIEW (Mặc định)
  // ========================================================
  return (
    <div 
      onClick={handleNavigate}
      className="group relative bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      {/* Header Background */}
      <div 
        className="h-24 w-full relative border-b border-slate-100"
        style={{ 
            backgroundColor: workspace.color ? `${workspace.color}15` : '#f1f5f9',
        }}
      >
         {/* Icon Logo */}
         <div 
            className="absolute bottom-0 left-6 translate-y-1/2 w-12 h-12 rounded-lg shadow-sm border-2 border-white flex items-center justify-center overflow-hidden bg-white"
         >
            {workspace.coverImage ? (
                <img src={workspace.coverImage} alt="logo" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: workspace.color || '#3b82f6' }}>
                    <span className="text-white font-bold text-xl uppercase">
                    {workspace.workspaceName.charAt(0)}
                    </span>
                </div>
            )}
         </div>

         {/* Role Badge */}
         <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border rounded-sm ${roleColor}`}>
               <Icon className="w-3 h-3" />
               {workspace.roleName}
            </span>
         </div>
      </div>

      {/* Body */}
      <div className="px-6 pt-8 pb-5 flex-1 flex flex-col">
         <div className="mb-3">
            <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
               {workspace.workspaceName}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[40px]">
               {workspace.description || workspace.workspaceDescription || "No description provided."}
            </p>
         </div>

         {/* Stats */}
         <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
               <div className="flex items-center gap-1.5" title="Members">
                  <Users className="w-3.5 h-3.5" />
                  {workspace.memberCount || 0}
               </div>
               <div className="flex items-center gap-1.5" title="Projects">
                  <Briefcase className="w-3.5 h-3.5" />
                  {workspace.projectCount || 0}
               </div>
            </div>

            {/* Hover Action */}
            <div className="flex items-center gap-1 text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
               Open <ChevronRight className="w-3.5 h-3.5" />
            </div>
         </div>
      </div>
      
      {/* Delete Button (Only if onDelete provided) */}
      {onDelete && (
          <button 
             onClick={(e) => {
                 e.stopPropagation();
                 onDelete(workspace.workspaceId);
             }}
             className="absolute top-3 left-3 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
             title="Delete Workspace"
          >
             <Trash2 className="w-4 h-4" />
          </button>
      )}
    </div>
  );
}