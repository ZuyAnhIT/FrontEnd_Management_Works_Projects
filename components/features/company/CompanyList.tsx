"use client";

import { ShieldCheck, User, ArrowRight, Plus, ExternalLink, Briefcase } from "lucide-react";
import { CompanyMembership } from "@/services/apiUser";

interface CompanyListProps {
  memberships: CompanyMembership[];
  onSelect: (companyId: number) => void;
  onAddClick: () => void;
}

export default function CompanyList({ memberships, onSelect, onAddClick }: CompanyListProps) {
  
  // Helper render Badge Role đẹp hơn
  const renderRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case "COMPANY_ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-200 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case "GUEST":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border bg-amber-50 text-amber-700 border-amber-200 shadow-sm">
            <ExternalLink className="w-3.5 h-3.5" /> Guest
          </span>
        );
      default: // COMPANY_MEMBER
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border bg-slate-50 text-slate-600 border-slate-200 shadow-sm">
            <User className="w-3.5 h-3.5" /> Member
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
      
      {/* 1. Danh sách Card Công ty */}
      {memberships.map((membership) => {
        const isGuest = membership.roleCode === "GUEST";
        const isAdmin = membership.roleCode === "COMPANY_ADMIN";
        
        return (
          <div 
            key={membership.companyId}
            onClick={() => onSelect(membership.companyId)}
            className={`
              group relative bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[220px]
              ${isGuest 
                ? 'border-amber-200/60 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100/50' 
                : 'border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50'
              }
            `}
          >
            {/* Top Section */}
            <div className="flex justify-between items-start">
              {/* Logo Avatar */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm transition-transform group-hover:scale-105 duration-300
                ${isAdmin 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
                    : isGuest 
                        ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600'
                        : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'
                }`}
              >
                {membership.companyName.charAt(0).toUpperCase()}
              </div>

              {/* Role Badge */}
              {renderRoleBadge(membership.roleCode)}
            </div>

            {/* Middle Section: Company Info */}
            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1" title={membership.companyName}>
                {membership.companyName}
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                 <Briefcase className="w-3.5 h-3.5" /> 
                 Organization
              </p>
            </div>

            {/* Bottom Section: Action Link */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
               <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                  Access Portal
               </span>
               <div className={`flex items-center gap-1 text-sm font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${isGuest ? 'text-amber-600' : 'text-blue-600'}`}>
                  {isAdmin ? "Manage" : "Enter"} <ArrowRight className="w-4 h-4" />
               </div>
            </div>
          </div>
        );
      })}

      {/* 2. Card "Add Organization" (Luôn nằm cuối) */}
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
        <span className="text-xs text-slate-400 mt-1 font-medium">Create a new workspace</span>
      </button>
    </div>
  );
}