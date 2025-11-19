"use client";
import {
  Building,
  Trash2,
  ArrowRight,
  Calendar,
  Users,
  Zap,
  Layout
} from "lucide-react";
import Link from "next/link"; // Dùng Link thay vì button navigate nếu có thể

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export default function WorkspaceCard({
  workspace,
  onDelete,
  onNavigate,
  viewMode = "grid",
}: any) {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("en-US");
    } catch (e) {
      return "--";
    }
  };

  // --------------------------
  // 1. LIST VIEW (Horizontal)
  // --------------------------
  if (viewMode === "list") {
    return (
      <div className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200">
        
        {/* Thumbnail */}
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative">
           {workspace.coverImage ? (
              <img
                src={workspace.coverImage}
                alt="cover"
                className="w-full h-full object-cover"
              />
           ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${workspace.color}20` }} // Giảm opacity màu nền
              >
                 <Building className="w-6 h-6" style={{ color: workspace.color || "#3B82F6" }} />
              </div>
           )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
           <div className="col-span-4">
              <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onNavigate(workspace.workspaceId)}>
                 {workspace.workspaceName}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {workspace.workspaceId}</p>
           </div>

           <div className="col-span-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${statusStyles[workspace.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                 {statusLabels[workspace.status] || workspace.status}
              </span>
           </div>

           <div className="col-span-3 text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(workspace.createdAt)}
           </div>

           {/* Actions */}
           <div className="col-span-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button
                 onClick={() => onNavigate(workspace.workspaceId)}
                 className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                 title="Go to workspace"
               >
                 <ArrowRight className="w-4 h-4" />
               </button>
               <button
                 onClick={() => onDelete(workspace.workspaceId)}
                 className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                 title="Delete workspace"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
           </div>
        </div>
      </div>
    );
  }

  // --------------------------
  // 2. GRID VIEW (Vertical Card)
  // --------------------------
  return (
    <div className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 h-full">
      
      {/* Cover Section */}
      <div className="h-28 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
        {workspace.coverImage ? (
          <img
            src={workspace.coverImage}
            alt="cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
             <Layout className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
           <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide shadow-sm ${statusStyles[workspace.status] || "bg-white text-slate-600 border-slate-200"}`}>
              {statusLabels[workspace.status] || workspace.status}
           </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Icon & Title */}
        <div className="flex items-start gap-3 mb-3">
           <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-100"
              style={{ backgroundColor: `${workspace.color}15` }} // Màu nền rất nhạt
           >
              <Building className="w-5 h-5" style={{ color: workspace.color || "#3B82F6" }} />
           </div>
           <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onNavigate(workspace.workspaceId)}>
                 {workspace.workspaceName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{workspace.description || "No description"}</p>
           </div>
        </div>

        {/* Meta Grid */}
        <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
           <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Company #{workspace.companyId}</span>
           </div>
           <div className="flex items-center gap-1.5 justify-end">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(workspace.createdAt)}</span>
           </div>
        </div>

      </div>

      {/* Footer Actions (Hover show) */}
      <div className="px-5 pb-4 pt-0 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
        <button
           onClick={() => onNavigate(workspace.workspaceId)}
           className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded text-center transition-colors flex items-center justify-center gap-2"
        >
           <Zap className="w-3 h-3" /> Open
        </button>
        <button 
           onClick={() => onDelete(workspace.workspaceId)}
           className="px-3 py-2 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded text-slate-500 transition-colors"
        >
           <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}