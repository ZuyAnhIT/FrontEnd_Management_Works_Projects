"use client";

import React, { useState, useCallback, useMemo } from "react";
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

// Internal Utils & Components
import { Button } from "@/components/ui/Buttons";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES & CONFIGURATIONS
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

/**
 * Cấu hình hiển thị nhãn trạng thái cho Không gian làm việc
 */
const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
  },
  DELETED: {
    label: "Deleted",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400",
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Chuẩn hóa đường dẫn hình ảnh từ máy chủ hoặc dữ liệu tạm thời
 */
const resolveImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith("blob:") || path.startsWith("http")) return path;

  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const finalPath = cleanPath.startsWith("uploads/") ? cleanPath : `uploads/${cleanPath}`;

  return `${API_BASE_URL}/${finalPath}`;
};

/**
 * Định dạng ngày tháng theo chuẩn quốc tế (English US)
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
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần thẻ hiển thị Không gian làm việc.
 * Hỗ trợ chuyển đổi giữa chế độ Grid và List, quản lý trạng thái xóa/khôi phục.
 */
export default function WorkspaceCard({
  workspace,
  onDelete,
  onRestore,
  onNavigate,
  viewMode = "grid",
}: WorkspaceCardProps) {
  // ---------------------------------------------------------------------------
  // 1. STATE & LOGIC
  // ---------------------------------------------------------------------------
  const [imageError, setImageError] = useState(false);

  const coverUrl = useMemo(() => resolveImageUrl(workspace.coverImage), [workspace.coverImage]);
  const hasValidImage = !!coverUrl && !imageError;
  const status = STATUS_CONFIG[workspace.status] || STATUS_CONFIG.INACTIVE;
  const isDeleted = workspace.status === "DELETED";

  // ---------------------------------------------------------------------------
  // 2. RENDER: LIST VIEW (Giao diện danh sách)
  // ---------------------------------------------------------------------------
  if (viewMode === "list") {
    return (
      <div className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200">
        
        {/* Hình ảnh thu nhỏ hoặc biểu tượng thay thế */}
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
          {hasValidImage ? (
            <img
              src={coverUrl!}
              alt={workspace.workspaceName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center opacity-20"
              style={{ backgroundColor: workspace.color || "#3B82F6" }}
            >
              <Building className="w-6 h-6" style={{ color: workspace.color || "#3B82F6" }} />
            </div>
          )}
        </div>

        {/* Thông tin nội dung */}
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-5">
            <h3 
              onClick={() => !isDeleted && onNavigate(workspace.workspaceId)}
              className={cn(
                "font-bold text-slate-900 dark:text-slate-100 text-sm truncate",
                !isDeleted && "cursor-pointer hover:text-blue-600 transition-colors"
              )}
            >
              {workspace.workspaceName}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {workspace.workspaceId}</p>
          </div>

          <div className="col-span-2">
            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider", status.className)}>
              {status.label}
            </span>
          </div>

          <div className="col-span-3 text-xs text-slate-500 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(workspace.createdAt)}
          </div>

          {/* Các nút hành động */}
          <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isDeleted ? (
              <button
                onClick={() => onRestore(workspace.workspaceId)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                title="Restore workspace"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate(workspace.workspaceId)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Open"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(workspace.workspaceId)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. RENDER: GRID VIEW (Giao diện lưới)
  // ---------------------------------------------------------------------------
  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all h-full">
      
      {/* Vùng ảnh bìa */}
      <div className="h-28 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden border-b border-slate-100 dark:border-slate-800">
        {hasValidImage ? (
          <img
            src={coverUrl!}
            alt={workspace.workspaceName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
            <Layout className="w-10 h-10 text-slate-200 dark:text-slate-800" />
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest shadow-sm", status.className)}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Vùng nội dung chính */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 shrink-0"
            style={{ backgroundColor: `${workspace.color || "#3B82F6"}15` }}
          >
            <Building className="w-5 h-5" style={{ color: workspace.color || "#3B82F6" }} />
          </div>

          <div className="min-w-0">
            <h3 
              onClick={() => !isDeleted && onNavigate(workspace.workspaceId)}
              className="font-bold text-slate-900 dark:text-slate-100 text-base truncate group-hover:text-blue-600 transition-colors cursor-pointer"
            >
              {workspace.workspaceName}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {workspace.description || "No description provided for this workspace"}
            </p>
          </div>
        </div>

        {/* Thông tin bổ trợ (Footer Info) */}
        <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            Workspace
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Calendar className="w-3 h-3" />
            {formatDate(workspace.createdAt)}
          </div>
        </div>
      </div>

      {/* Khu vực tương tác (Chỉ hiện khi hover) */}
      <div className="px-5 pb-4 mt-auto opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 flex gap-2">
        {!isDeleted ? (
          <>
            <Button
              onClick={() => onNavigate(workspace.workspaceId)}
              className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-[11px] font-bold h-9 gap-2"
            >
              <Zap className="w-3.5 h-3.5" /> Open
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(workspace.workspaceId)}
              className="px-3 h-9 border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            onClick={() => onRestore(workspace.workspaceId)}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold h-9 gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore Workspace
          </Button>
        )}
      </div>
    </div>
  );
}