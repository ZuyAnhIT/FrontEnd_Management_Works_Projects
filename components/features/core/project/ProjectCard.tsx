"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Folder,
  Calendar,
  User,
  Trash2,
  ArrowRight,
  MoreHorizontal,
  Layout,
  Zap,
  RotateCcw,
  Settings as SettingsIcon,
} from "lucide-react";

// Internal Services & Utils
import { Project } from "@/services/apiProject";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & HELPERS
// =============================================================================

/**
 * Xử lý và chuẩn hóa đường dẫn ảnh động từ Backend.
 */
const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("blob:") || path.startsWith("http")) return path;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
  let cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (!cleanPath.startsWith("uploads/")) cleanPath = `uploads/${cleanPath}`;
  
  return `${API_URL}/${cleanPath}`;
};

/**
 * Hệ màu trạng thái ưu tiên chuẩn Jira
 */
const priorityStyles: Record<string, string> = {
  HIGH: "text-red-700 bg-red-50 border-red-200",
  MEDIUM: "text-orange-700 bg-orange-50 border-orange-200",
  LOW: "text-[#0052CC] bg-blue-50 border-blue-200",
};

/**
 * Hệ màu trạng thái tiến độ dự án
 */
const statusStyles: Record<string, string> = {
  ACTIVE: "text-emerald-700 bg-emerald-50 border-emerald-200",
  PLANNING: "text-[#0052CC] bg-blue-50 border-blue-200",
  ARCHIVED: "text-slate-600 bg-slate-100 border-slate-200",
  DELETED: "text-red-700 bg-red-50 border-red-200",
  UNKNOWN: "text-slate-600 bg-slate-50 border-slate-200",
};

/**
 * Định dạng ngày tháng hiển thị ngắn gọn (VD: Oct 24)
 */
const formatDate = (dateString: string) => {
  if (!dateString) return "--";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  } catch (e) {
    return "--";
  }
};

// =============================================================================
// 3. INTERFACES
// =============================================================================

interface ProjectCardProps {
  p: Project;
  workspaceId: number;
  viewMode?: "grid" | "list";
  isTrash?: boolean;
  onDelete: (id: number) => void;
  onRestore?: (id: number) => void;
  onNavigate?: (id: number) => void;
}

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Thẻ hiển thị thông tin tổng quan của Dự án (Project Card).
 * Hỗ trợ linh hoạt 2 chế độ hiển thị: Dạng lưới (Grid - Card) và Dạng danh sách (List - Row).
 */
export default function ProjectCard({
  p,
  workspaceId,
  onDelete,
  onRestore,
  onNavigate,
  isTrash = false,
  viewMode = "grid",
}: ProjectCardProps) {
  
  // ---------------------------------------------------------------------------
  // 5. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const router = useRouter();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ---------------------------------------------------------------------------
  // 6. DATA PREPARATION
  // ---------------------------------------------------------------------------
  
  const projectLink = `/core/workspace/${workspaceId}/project/${p.id}/board`;
  const settingsLink = `/core/workspace/${workspaceId}/project/${p.id}/settings`;
  
  const coverUrl = getFullImageUrl(p.coverImageUrl);
  const hasValidImage = coverUrl && !imageError;
  
  const projectStatusStyle = statusStyles[p.status] || statusStyles.UNKNOWN;
  const cardPriorityStyle = priorityStyles[p.priority] || priorityStyles.LOW;

  // ---------------------------------------------------------------------------
  // 7. RENDER LOGIC: LIST VIEW
  // ---------------------------------------------------------------------------
  
  if (viewMode === "list") {
    return (
      <div className={cn(
        "group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg transition-all duration-200",
        isTrash ? "opacity-75" : "hover:border-[#2684FF] hover:shadow-md"
      )}>
        
        {/* Hình đại diện (Thumbnail) */}
        <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200 relative">
          {hasValidImage ? (
            <img
              src={coverUrl}
              alt={`${p.name} cover`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Folder className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {/* Thông tin chính (Info Grid) */}
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
          
          {/* Tên & Mã dự án */}
          <div className="col-span-4">
            <div
              onClick={() => !isTrash && router.push(projectLink)}
              className={cn("block", !isTrash && "cursor-pointer")}
            >
              <h3 className="font-bold text-[#172B4D] text-[13px] truncate group-hover:text-[#0052CC] transition-colors">
                {p.name}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {p.projectCode}
              </p>
            </div>
          </div>

          {/* Trạng thái (Status Badge) */}
          <div className="col-span-2">
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border",
              projectStatusStyle
            )}>
              {p.status || "UNKNOWN"}
            </span>
          </div>

          {/* Quản lý dự án (Manager) */}
          <div className="col-span-3 flex items-center gap-2.5 text-[13px] text-slate-600 font-medium">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
              <User className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="truncate">{p.managerName || "Unassigned"}</span>
          </div>

          {/* Thời gian (Dates) */}
          <div className="col-span-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
            {formatDate(p.startDate)} - {formatDate(p.dueDate)}
          </div>
        </div>

        {/* Các nút hành động (Actions) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isTrash ? (
            <>
              <button
                onClick={() => onRestore && onRestore(p.id)}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors active:scale-95"
                title="Restore project"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(p.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors active:scale-95"
                title="Permanently delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href={settingsLink}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-[#091E4214] rounded-md transition-colors active:scale-95"
                title="Project Settings"
                onClick={(e) => e.stopPropagation()}
              >
                <SettingsIcon className="w-4 h-4" />
              </Link>
              <button
                onClick={() => onDelete(p.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors active:scale-95"
                title="Archive project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <Link
                href={projectLink}
                className="p-2 text-[#0052CC] hover:bg-[#E3F2FD] rounded-md transition-colors active:scale-95 ml-1"
                title="Open Board"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 8. RENDER LOGIC: GRID VIEW
  // ---------------------------------------------------------------------------
  
  return (
    <div className={cn(
      "group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 h-full",
      isTrash ? "opacity-75 border-red-100" : "hover:shadow-lg hover:border-slate-300"
    )}>
      
      {/* Ảnh bìa (Cover Image) */}
      <div
        className="h-32 w-full bg-slate-50 relative overflow-hidden border-b border-slate-100 cursor-pointer"
        onClick={() => !isTrash && router.push(projectLink)}
      >
        {hasValidImage ? (
          <img
            src={coverUrl}
            alt={`${p.name} cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#091E420A]">
            <Layout className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {/* Nhãn Độ ưu tiên (Priority Badge) */}
        <div className="absolute top-3 right-3">
          <span className={cn(
            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm border",
            cardPriorityStyle
          )}>
            {p.priority}
          </span>
        </div>
      </div>

      {/* Nội dung Thẻ (Card Body) */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Tên dự án & Menu */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-[#172B4D] text-[15px] leading-snug line-clamp-1 group-hover:text-[#0052CC] transition-colors cursor-pointer"
              onClick={() => !isTrash && router.push(projectLink)}
            >
              {p.name}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {p.projectCode}
            </p>
          </div>

          {/* Menu Context (3 chấm) */}
          <div className="relative shrink-0 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className={cn(
                "p-1.5 rounded-md transition-colors active:scale-95",
                isMenuOpen ? "bg-[#091E4214] text-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-[#091E4214]"
              )}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-xl border border-slate-100 z-20 py-1.5 animate-in fade-in zoom-in-95">
                  {!isTrash ? (
                    <>
                      <Link
                        href={settingsLink}
                        className="w-full text-left px-4 py-2 text-[12px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <SettingsIcon className="w-3.5 h-3.5" /> Project Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onDelete(p.id);
                        }}
                        className="w-full text-left px-4 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Archive Project
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onRestore && onRestore(p.id);
                      }}
                      className="w-full text-left px-4 py-2 text-[12px] font-semibold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mô tả Dự án */}
        <p className="text-[13px] text-slate-600 line-clamp-2 mb-4 h-10 leading-relaxed">
          {p.description || "No description provided."}
        </p>

        {/* Thanh Tiến độ (Progress Bar) */}
        <div className="mb-5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            <span>Progress</span>
            <span className="text-[#0052CC]">{p.progress || 0}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${p.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Meta Grid (Thông tin Manager, Trạng thái, Thời gian) */}
        <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-300" />
            <span className="truncate max-w-[100px] text-slate-500" title={p.managerName || "Unassigned"}>
              {p.managerName || "Unassigned"}
            </span>
          </div>

          <div className="flex items-center justify-end">
            <span className={cn("px-2 py-0.5 rounded-md border", projectStatusStyle)}>
              {p.status}
            </span>
          </div>

          <div className="flex items-center gap-2 col-span-2">
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-500">
              {formatDate(p.startDate)} - {formatDate(p.dueDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Hành động dưới cùng (Footer Actions - Hover để hiện) */}
      <div className="px-5 pb-5 pt-0 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
        {!isTrash ? (
          <Link
            href={projectLink}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] uppercase tracking-widest font-bold py-2.5 rounded-lg text-center transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" /> Open Board
          </Link>
        ) : (
          <button
            onClick={() => onRestore && onRestore(p.id)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-widest font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore Project
          </button>
        )}
      </div>
    </div>
  );
}