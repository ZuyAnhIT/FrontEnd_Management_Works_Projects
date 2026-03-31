"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo } from "react";
import { 
  ShieldCheck, 
  User, 
  ArrowRight, 
  Plus, 
  ExternalLink, 
  Briefcase, 
  LucideIcon 
} from "lucide-react";

// Internal Services & Utils
import { CompanyMembership } from "@/services/apiUser";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. TYPES & CONFIGURATION
// =============================================================================

interface RoleStyle {
  label: string;
  icon: LucideIcon;
  badgeClass: string;
  cardBorderClass: string;
  avatarClass: string;
  actionTextClass: string;
  actionLabel: string;
}

/**
 * Cấu hình hiển thị theo vai trò người dùng trong công ty.
 * Giúp tách biệt logic hiển thị ra khỏi phần render chính.
 */
const ROLE_CONFIG: Record<string, RoleStyle> = {
  COMPANY_ADMIN: {
    label: "Admin",
    icon: ShieldCheck,
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
    cardBorderClass: "border-slate-200 hover:border-blue-400 hover:shadow-blue-100/30",
    avatarClass: "bg-gradient-to-br from-blue-600 to-indigo-600 text-white",
    actionTextClass: "text-blue-600",
    actionLabel: "Manage",
  },
  GUEST: {
    label: "Guest",
    icon: ExternalLink,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
    cardBorderClass: "border-amber-200/60 hover:border-amber-400 hover:shadow-amber-100/30",
    avatarClass: "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600",
    actionTextClass: "text-amber-600",
    actionLabel: "Enter",
  },
  COMPANY_MEMBER: {
    label: "Member",
    icon: User,
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
    cardBorderClass: "border-slate-200 hover:border-blue-400 hover:shadow-blue-100/30",
    avatarClass: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600",
    actionTextClass: "text-blue-600",
    actionLabel: "Enter",
  },
};

interface CompanyListProps {
  memberships: CompanyMembership[];
  onSelect: (companyId: number) => void;
  onAddClick: () => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần hiển thị danh sách các Công ty/Tổ chức mà người dùng tham gia.
 * Hỗ trợ các trạng thái hiển thị khác nhau dựa trên quyền hạn (Role).
 */
export default function CompanyList({ memberships, onSelect, onAddClick }: CompanyListProps) {
  
  // ---------------------------------------------------------------------------
  // 4. RENDER HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Render thẻ hiển thị thông tin từng công ty
   */
  const renderCompanyCard = (membership: CompanyMembership) => {
    const config = ROLE_CONFIG[membership.roleCode] || ROLE_CONFIG.COMPANY_MEMBER;
    const RoleIcon = config.icon;

    return (
      <div
        key={membership.companyId}
        onClick={() => onSelect(membership.companyId)}
        className={cn(
          "group relative bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[230px]",
          "hover:shadow-xl dark:bg-slate-900 dark:border-slate-800",
          config.cardBorderClass
        )}
      >
        {/* Phần đầu: Ảnh đại diện và Nhãn vai trò */}
        <div className="flex justify-between items-start">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm transition-transform group-hover:scale-105 duration-300",
            config.avatarClass
          )}>
            {membership.companyName.charAt(0).toUpperCase()}
          </div>

          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
            config.badgeClass
          )}>
            <RoleIcon className="w-3 h-3" />
            {config.label}
          </span>
        </div>

        {/* Phần giữa: Tên công ty và thông tin loại hình */}
        <div className="mt-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
            {membership.companyName}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 opacity-70" />
            Organization Workspace
          </p>
        </div>

        {/* Phần cuối: Hành động điều hướng */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
            Access Portal
          </span>
          <div className={cn(
            "flex items-center gap-1 text-sm font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300",
            config.actionTextClass
          )}>
            {config.actionLabel} 
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // 5. MAIN RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
      
      {/* Danh sách các tổ chức hiện có */}
      {memberships.map(renderCompanyCard)}

      {/* Nút thêm tổ chức mới (Luôn hiển thị ở cuối danh sách) */}
      <button
        onClick={onAddClick}
        className={cn(
          "group flex flex-col items-center justify-center h-[230px] rounded-2xl border-2 border-dashed border-slate-200 transition-all duration-300",
          "hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-800 dark:hover:bg-blue-900/10"
        )}
      >
        <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 transition-all shadow-sm group-hover:border-blue-500 group-hover:scale-110 group-hover:shadow-md dark:bg-slate-900 dark:border-slate-800">
          <Plus className="w-8 h-8 text-slate-300 group-hover:text-blue-600 transition-colors" />
        </div>
        <span className="text-lg font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
          Add Organization
        </span>
        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-70 group-hover:opacity-100">
          Create a new workspace
        </span>
      </button>

    </div>
  );
}