"use client";
import {
  Building,
  Trash2,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  Zap,
} from "lucide-react";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500 text-white",
  INACTIVE: "bg-gray-400 text-white",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
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
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (e) {
      return "--";
    }
  };

  // List view
  if (viewMode === "list") {
    return (
      <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-blue-300">
        <div className="flex items-center gap-6 p-6">
          {/* Thumbnail */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
            {workspace.coverImage ? (
              <img
                src={workspace.coverImage}
                alt="cover"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: workspace.color || "#3B82F6" }}
              >
                <Building className="w-8 h-8 text-white/80" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {workspace.workspaceName}
                </h3>
                <p className="text-sm text-gray-500">ID: {workspace.workspaceId}</p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full font-bold shadow-md ${statusColors[workspace.status] || "bg-gray-400 text-white"}`}>
                {statusLabels[workspace.status] || "UNKNOWN"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-1">{workspace.description || "Không có mô tả"}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                {formatDate(workspace.createdAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-500" />
                Company #{workspace.companyId}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onNavigate(workspace.workspaceId)}
              className="group/btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              Quản lý
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onDelete(workspace.workspaceId)}
              className="p-2.5 text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (enhanced)
  return (
    <div className="group relative bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-300 flex flex-col">
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-teal-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-teal-500/5 transition-all duration-500 pointer-events-none"></div>

      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        {workspace.coverImage ? (
          <img
            src={workspace.coverImage}
            alt="cover"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: workspace.color || "#3B82F6" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <Building className="w-16 h-16 text-white/80 relative z-10 group-hover:scale-110 transition-all duration-300" />
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1.5 text-xs rounded-full font-bold shadow-lg backdrop-blur-sm ${statusColors[workspace.status] || "bg-gray-400 text-white"}`}>
            {statusLabels[workspace.status] || "UNKNOWN"}
          </span>
        </div>

        {/* Company ID badge */}
        <div className="absolute top-3 left-3">
          <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-bold shadow-lg">
            ID: {workspace.workspaceId}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col relative">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 transition-all duration-300"
            style={{ backgroundColor: workspace.color || "#3B82F6" }}
          >
            <Building className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
              {workspace.workspaceName}
            </h3>
            <p className="text-sm text-gray-500 font-mono">#{workspace.workspaceId}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px] flex-1">
          {workspace.description || "Không có mô tả"}
        </p>

        {/* Metadata */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">Company #{workspace.companyId}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-bold">{workspace.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 bg-amber-50 px-3 py-2 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className="font-medium">
              Tạo: {formatDate(workspace.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onNavigate(workspace.workspaceId)}
            className="group/btn relative flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-all"></div>
            <Zap className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Vào workspace</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onDelete(workspace.workspaceId)}
            className="w-full flex items-center justify-center gap-2 text-red-600 border-2 border-red-200 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Xóa workspace
          </button>
        </div>
      </div>
    </div>
  );
}