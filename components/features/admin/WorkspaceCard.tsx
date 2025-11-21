"use client";
import {
  Building,
  Trash2,
  ArrowRight,
  Calendar,
  Users,
  Zap,
  Layout,
  RotateCcw
} from "lucide-react";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
  DELETED: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
};

export default function WorkspaceCard({
  workspace,
  onDelete,
  onRestore,
  onNavigate,
  viewMode = "grid",
}: any) {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("en-US");
    } catch {
      return "--";
    }
  };

  // ============================================================
  // 🟦 LIST VIEW
  // ============================================================
  if (viewMode === "list") {
    return (
      <div className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200">

        {/* Thumbnail */}
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
          {workspace.coverImage ? (
            <img src={workspace.coverImage} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${workspace.color}20` }}
            >
              <Building className="w-6 h-6" style={{ color: workspace.color || "#3B82F6" }} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">

          {/* Name */}
          <div className="col-span-4">
            <h3
              className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 cursor-pointer"
              onClick={() => onNavigate(workspace.workspaceId)}
            >
              {workspace.workspaceName}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {workspace.workspaceId}
            </p>
          </div>

          {/* Status */}
          <div className="col-span-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${statusStyles[workspace.status]}`}>
              {statusLabels[workspace.status]}
            </span>
          </div>

          {/* Created */}
          <div className="col-span-3 text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(workspace.createdAt)}
          </div>

          {/* Actions */}
          <div className="col-span-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

            {/* Only show GO TO when not deleted */}
            {workspace.status !== "DELETED" && (
              <button
                onClick={() => onNavigate(workspace.workspaceId)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                title="Go to workspace"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Restore if DELETED */}
            {workspace.status === "DELETED" ? (
              <button
                onClick={() => onRestore(workspace.workspaceId)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                title="Restore workspace"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onDelete(workspace.workspaceId)}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                title="Delete workspace"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // 🟩 GRID VIEW
  // ============================================================
  return (
    <div className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all h-full">

      {/* Thumbnail */}
      <div className="h-28 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
        {workspace.coverImage ? (
          <img src={workspace.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <Layout className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {/* Status */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide shadow-sm ${statusStyles[workspace.status]}`}>
            {statusLabels[workspace.status]}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">

        {/* Icon + title */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border border-slate-100"
            style={{ backgroundColor: `${workspace.color}15` }}
          >
            <Building className="w-5 h-5" style={{ color: workspace.color || "#3B82F6" }} />
          </div>

          <div className="min-w-0">
            <h3
              className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 cursor-pointer"
              onClick={() => onNavigate(workspace.workspaceId)}
            >
              {workspace.workspaceName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {workspace.description || "No description"}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Company #{workspace.companyId}
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(workspace.createdAt)}
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="px-5 pb-4 mt-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">

        {/* OPEN if not deleted */}
        {workspace.status !== "DELETED" && (
          <button
            onClick={() => onNavigate(workspace.workspaceId)}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2"
          >
            <Zap className="w-3 h-3" /> Open
          </button>
        )}

        {/* Restore / Delete */}
        {workspace.status === "DELETED" ? (
          <button
            onClick={() => onRestore(workspace.workspaceId)}
            className="px-3 py-2 border border-green-300 bg-green-50 hover:bg-green-100 text-green-700 rounded text-xs font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onDelete(workspace.workspaceId)}
            className="px-3 py-2 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded text-slate-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
