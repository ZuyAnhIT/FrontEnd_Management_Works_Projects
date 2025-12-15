"use client";

import { useState } from "react";
import {
  Building,
  Trash2,
  ArrowRight,
  Calendar,
  Users,
  Zap,
  Layout,
  RotateCcw,
} from "lucide-react";

// =============================================================================
// 1. INTERFACES & TYPES
// =============================================================================

export interface Workspace {
  workspaceId: number;
  workspaceName: string;
  description?: string;
  coverImage?: string | null;
  color?: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: string;
  companyId: number;
}

interface WorkspaceCardProps {
  workspace: Workspace;
  viewMode?: "grid" | "list";
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onNavigate: (id: number) => void;
}

// =============================================================================
// 2. CONSTANTS & CONFIG
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  DELETED: {
    label: "Deleted",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

// =============================================================================
// 3. HELPER FUNCTIONS
// =============================================================================

/**
 * Xử lý và chuẩn hóa URL ảnh từ server
 */
const resolveImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith("blob:") || path.startsWith("http")) return path;

  // Chuẩn hóa đường dẫn tương đối (loại bỏ dấu / ở đầu nếu có)
  let cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (!cleanPath.startsWith("uploads/")) cleanPath = `uploads/${cleanPath}`;

  return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Format ngày tháng sang chuẩn EN-US
 */
const formatDate = (dateString: string) => {
  if (!dateString) return "--";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "--";
  }
};

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

export default function WorkspaceCard({
  workspace,
  onDelete,
  onRestore,
  onNavigate,
  viewMode = "grid",
}: WorkspaceCardProps) {
  // --- STATE ---
  const [imageError, setImageError] = useState(false);

  // --- DERIVED DATA ---
  const coverUrl = resolveImageUrl(workspace.coverImage);
  const hasValidImage = coverUrl && !imageError;
  const statusInfo =
    STATUS_CONFIG[workspace.status] || STATUS_CONFIG["INACTIVE"];
  const isDeleted = workspace.status === "DELETED";

  // ---------------------------------------------------------------------------
  // RENDER: LIST VIEW
  // ---------------------------------------------------------------------------
  if (viewMode === "list") {
    return (
      <div className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200">
        {/* Image / Placeholder */}
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative">
          {hasValidImage ? (
            <img
              src={coverUrl!}
              alt={workspace.workspaceName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${workspace.color || "#3B82F6"}20` }}
            >
              <Building
                className="w-6 h-6"
                style={{ color: workspace.color || "#3B82F6" }}
              />
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
          {/* Name & ID */}
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

          {/* Status Badge */}
          <div className="col-span-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${statusInfo.className}`}
            >
              {statusInfo.label}
            </span>
          </div>

          {/* Date */}
          <div className="col-span-3 text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(workspace.createdAt)}
          </div>

          {/* Actions */}
          <div className="col-span-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isDeleted && (
              <button
                onClick={() => onNavigate(workspace.workspaceId)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Go to workspace"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {isDeleted ? (
              <button
                onClick={() => onRestore(workspace.workspaceId)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                title="Restore workspace"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onDelete(workspace.workspaceId)}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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

  // ---------------------------------------------------------------------------
  // RENDER: GRID VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all h-full">
      {/* Cover Image Area */}
      <div className="h-28 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
        {hasValidImage ? (
          <img
            src={coverUrl!}
            alt={workspace.workspaceName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <Layout className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {/* Status Badge (Absolute) */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide shadow-sm ${statusInfo.className}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title Block */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border border-slate-100 shrink-0"
            style={{ backgroundColor: `${workspace.color || "#3B82F6"}15` }}
          >
            <Building
              className="w-5 h-5"
              style={{ color: workspace.color || "#3B82F6" }}
            />
          </div>

          <div className="min-w-0">
            <h3
              className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 cursor-pointer"
              onClick={() => onNavigate(workspace.workspaceId)}
            >
              {workspace.workspaceName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {workspace.description || "No description provided"}
            </p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Workspace
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(workspace.createdAt)}
          </div>
        </div>
      </div>

      {/* Footer Actions (Hover only) */}
      <div className="px-5 pb-4 mt-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        {!isDeleted && (
          <button
            onClick={() => onNavigate(workspace.workspaceId)}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Zap className="w-3 h-3" /> Open
          </button>
        )}

        {isDeleted ? (
          <button
            onClick={() => onRestore(workspace.workspaceId)}
            className="px-3 py-2 border border-green-300 bg-green-50 hover:bg-green-100 text-green-700 rounded text-xs font-semibold w-full transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Restore
          </button>
        ) : (
          <button
            onClick={() => onDelete(workspace.workspaceId)}
            className="px-3 py-2 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded text-slate-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
