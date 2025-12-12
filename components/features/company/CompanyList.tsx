"use client";

import { ShieldCheck, User, ArrowRight, Plus, ExternalLink } from "lucide-react";
import { CompanyMembership } from "@/services/apiUser";

interface CompanyListProps {
  memberships: CompanyMembership[];
  onSelect: (companyId: number) => void;
  onAddClick: () => void;
}

export default function CompanyList({ memberships, onSelect, onAddClick }: CompanyListProps) {
  
  // Helper để render Badge Role
  const renderRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case "COMPANY_ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case "GUEST":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
            <ExternalLink className="w-3.5 h-3.5" /> Guest
          </span>
        );
      default: // COMPANY_MEMBER
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-50 text-slate-600 border-slate-200">
            <User className="w-3.5 h-3.5" /> Member
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {memberships.map((membership) => {
        const isGuest = membership.roleCode === "GUEST";
        const isAdmin = membership.roleCode === "COMPANY_ADMIN";
        
        return (
          <div 
            key={membership.companyId}
            onClick={() => onSelect(membership.companyId)}
            className={`
              group relative bg-white rounded-2xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px]
              ${isGuest 
                ? 'border-amber-200 hover:border-amber-400' // Viền vàng cho Guest
                : 'border-slate-200 hover:border-blue-300'  // Viền xanh cho Member/Admin
              }
            `}
          >
            {/* Header Card */}
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm transition-colors
                ${isAdmin 
                    ? 'bg-blue-600 text-white' 
                    : isGuest 
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}
              >
                {membership.companyName.charAt(0).toUpperCase()}
              </div>

              {/* Gọi hàm render badge */}
              {renderRoleBadge(membership.roleCode)}
            </div>

            {/* Content */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                {membership.companyName}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                ID: #{membership.companyId}
              </p>
            </div>

            {/* Footer Action (Thay đổi text dựa trên Role) */}
            <div className="mt-6 flex items-center text-sm font-semibold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <span className={isGuest ? "text-amber-600" : "text-blue-600"}>
                 {isGuest ? "View Projects" : "Go to Workspace"}
              </span>
              <ArrowRight className={`w-4 h-4 ml-2 ${isGuest ? "text-amber-600" : "text-blue-600"}`} />
            </div>
          </div>
        );
      })}

      {/* Card "Tạo mới" */}
      <button
        onClick={onAddClick}
        className="group flex flex-col items-center justify-center min-h-[200px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/30 hover:bg-blue-50/50 hover:border-blue-400 transition-all duration-300"
      >
        <div className="w-14 h-14 rounded-full bg-white border border-slate-200 group-hover:border-blue-400 group-hover:scale-110 flex items-center justify-center mb-4 transition-all shadow-sm">
          <Plus className="w-7 h-7 text-slate-400 group-hover:text-blue-600" />
        </div>
        <span className="text-lg font-semibold text-slate-600 group-hover:text-blue-700">Add Organization</span>
      </button>
    </div>
  );
}