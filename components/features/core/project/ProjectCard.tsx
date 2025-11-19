"use client";
import {
  Folder,
  Calendar,
  User,
  Flag,
  Target,
  Trash2,
  ArrowRight,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

const priorityStyles: Record<string, string> = {
  HIGH: "text-red-700 bg-red-50 border-red-200",
  MEDIUM: "text-orange-700 bg-orange-50 border-orange-200",
  LOW: "text-blue-700 bg-blue-50 border-blue-200",
};

const statusStyles: Record<string, string> = {
  ACTIVE: "text-green-700 bg-green-50 border-green-200",
  PLANNING: "text-blue-700 bg-blue-50 border-blue-200",
  ARCHIVED: "text-slate-600 bg-slate-100 border-slate-200",
};

export default function ProjectCard({
  p,
  onDelete,
  isTrash = false,
  workspaceId,
  viewMode = "grid",
}: any) {
  const projectLink = `/core/workspace/${workspaceId}/project/${p.id}`;

  const formatDate = (dateString: string) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (e) {
      return "--";
    }
  };

  // ========================================================
  // 1. LIST VIEW (Minimalist Row)
  // ========================================================
  if (viewMode === "list") {
    return (
      <div className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200">
        
        {/* Icon / Thumbnail */}
        <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
          {p.coverImageUrl ? (
            <img
              src={p.coverImageUrl}
              alt="cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <Folder className="w-6 h-6 text-slate-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
          
          {/* Name & Code */}
          <div className="col-span-4">
             <Link href={projectLink} className="block">
                <h3 className="font-bold text-slate-900 text-sm truncate hover:text-blue-600 transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{p.projectCode}</p>
             </Link>
          </div>

          {/* Status Badge */}
          <div className="col-span-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${statusStyles[p.status] || "text-slate-600 bg-slate-50 border-slate-200"}`}>
              {p.status || "UNKNOWN"}
            </span>
          </div>

          {/* Manager */}
          <div className="col-span-3 flex items-center gap-2 text-sm text-slate-600">
             <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                <User className="w-3 h-3" />
             </div>
             <span className="truncate text-xs">{p.managerName || "N/A"}</span>
          </div>

          {/* Dates */}
          <div className="col-span-3 text-xs text-slate-500 text-right">
             {formatDate(p.startDate)} - {formatDate(p.dueDate)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <Link
             href={projectLink}
             className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
             title="Go to project"
           >
             <ArrowRight className="w-4 h-4" />
           </Link>
           {!isTrash && (
             <button
               onClick={() => onDelete(p.id)}
               className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
               title="Delete project"
             >
               <Trash2 className="w-4 h-4" />
             </button>
           )}
        </div>
      </div>
    );
  }

  // ========================================================
  // 2. GRID VIEW (Modern Card)
  // ========================================================
  return (
    <div className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 h-full">
      
      {/* Header Image */}
      <div className="h-32 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
        {p.coverImageUrl ? (
          <img
            src={p.coverImageUrl}
            alt="cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <Folder className="w-12 h-12 text-slate-300" />
          </div>
        )}

        {/* Priority Badge (Top Right) */}
        <div className="absolute top-3 right-3">
           <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide shadow-sm ${priorityStyles[p.priority] || "bg-white border-slate-200 text-slate-600"}`}>
             {p.priority}
           </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Title Section */}
        <div className="flex justify-between items-start mb-2">
           <div>
              <h3 className="font-bold text-slate-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                <Link href={projectLink}>{p.name}</Link>
              </h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{p.projectCode}</p>
           </div>
           {/* Context Menu Trigger (Placeholder) */}
           <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
              <MoreHorizontal className="w-4 h-4" />
           </button>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">
          {p.description || "No description provided."}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
           <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Progress</span>
              <span className="font-medium">{p.progress || 0}%</span>
           </div>
           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${p.progress || 0}%` }}
              ></div>
           </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100">
           <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[100px]">{p.managerName || "Unassigned"}</span>
           </div>
           
           <div className="flex items-center gap-2 justify-end">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${statusStyles[p.status]}`}>
                 {p.status}
              </span>
           </div>

           <div className="flex items-center gap-2 col-span-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(p.startDate)} - {formatDate(p.dueDate)}</span>
           </div>
        </div>
      </div>

      {/* Footer Actions (Hiển thị khi hover) */}
      <div className="px-5 pb-4 pt-0 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
        <Link 
           href={projectLink}
           className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded text-center transition-colors"
        >
           Open Project
        </Link>
        {!isTrash && (
            <button 
               onClick={() => onDelete(p.id)}
               className="px-3 py-2 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded text-slate-500 transition-colors"
            >
               <Trash2 className="w-4 h-4" />
            </button>
        )}
      </div>
    </div>
  );
}