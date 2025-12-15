"use client";

import { ShieldCheck, User, ArrowRight, Plus, ExternalLink, Briefcase, LucideIcon } from "lucide-react";
import { CompanyMembership } from "@/services/apiUser";

// =============================================================================
// 1. CONFIGURATION (Cấu hình giao diện theo Role)
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

// Map role code sang style tương ứng để tránh hardcode trong JSX
const ROLE_CONFIG: Record<string, RoleStyle> = {
  COMPANY_ADMIN: {
    label: "Admin",
    icon: ShieldCheck,
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    cardBorderClass: "border-slate-200 hover:border-blue-400 hover:shadow-blue-100/50",
    avatarClass: "bg-gradient-to-br from-blue-600 to-indigo-600 text-white",
    actionTextClass: "text-blue-600",
    actionLabel: "Manage",
  },
  GUEST: {
    label: "Guest",
    icon: ExternalLink,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    cardBorderClass: "border-amber-200/60 hover:border-amber-400 hover:shadow-amber-100/50",
    avatarClass: "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600",
    actionTextClass: "text-amber-600",
    actionLabel: "Enter",
  },
  // Default fallback
  COMPANY_MEMBER: {
    label: "Member",
    icon: User,
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
    cardBorderClass: "border-slate-200 hover:border-blue-400 hover:shadow-blue-100/50",
    avatarClass: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600",
    actionTextClass: "text-blue-600",
    actionLabel: "Enter",
  },
};

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface CompanyListProps {
  memberships: CompanyMembership[];
  onSelect: (companyId: number) => void;
  onAddClick: () => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function CompanyList({ memberships, onSelect, onAddClick }: CompanyListProps) {
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
      
      {/* --- Render Danh sách Company --- */}
      {memberships.map((membership) => {
        // Lấy config dựa trên role, fallback về MEMBER nếu không tìm thấy
        const config = ROLE_CONFIG[membership.roleCode] || ROLE_CONFIG["COMPANY_MEMBER"];
        const RoleIcon = config.icon;

        return (
          <div
            key={membership.companyId}
            onClick={() => onSelect(membership.companyId)}
            className={`
              group relative bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[220px] hover:shadow-lg
              ${config.cardBorderClass}
            `}
          >
            {/* Top Section: Avatar & Badge */}
            <div className="flex justify-between items-start">
              {/* Avatar Logo */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm transition-transform group-hover:scale-105 duration-300 ${config.avatarClass}`}>
                {membership.companyName.charAt(0).toUpperCase()}
              </div>

              {/* Role Badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-sm ${config.badgeClass}`}>
                <RoleIcon className="w-3.5 h-3.5" /> {config.label}
              </span>
            </div>

            {/* Middle Section: Info */}
            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1" title={membership.companyName}>
                {membership.companyName}
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Organization
              </p>
            </div>

            {/* Bottom Section: Actions */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                Access Portal
              </span>
              <div className={`flex items-center gap-1 text-sm font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${config.actionTextClass}`}>
                {config.actionLabel} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}

      {/* --- Card "Add Organization" (Luôn nằm cuối) --- */}
      <button
        onClick={onAddClick}
        className="group flex flex-col items-center justify-center h-[220px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300"
      >
        <div className="w-16 h-16 rounded-full bg-white border border-slate-200 group-hover:border-blue-500 group-hover:scale-110 flex items-center justify-center mb-4 transition-all shadow-sm group-hover:shadow-md">
          <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
        <span className="text-lg font-bold text-slate-500 group-hover:text-blue-700 transition-colors">
          Add Organization
        </span>
        <span className="text-xs text-slate-400 mt-1 font-medium">
          Create a new workspace
        </span>
      </button>
    </div>
  );
}