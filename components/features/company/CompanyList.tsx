"use client";

import { ShieldCheck, User, ArrowRight, Plus } from "lucide-react";
import { CompanyMembership } from "@/services/apiUser";

interface CompanyListProps {
  memberships: CompanyMembership[];
  onSelect: (companyId: number) => void; // Hàm nhận ID
  onAddClick: () => void;
}

export default function CompanyList({ memberships, onSelect, onAddClick }: CompanyListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Render từng công ty */}
      {memberships.map((membership) => {
        const isAdmin = membership.roleCode === "COMPANY_ADMIN";
        
        return (
          <div 
            key={membership.companyId}
            // 🎯 KHI CLICK: Truyền ID của chính công ty này ra ngoài
            onClick={() => onSelect(membership.companyId)}
            className="group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px]"
          >
            {/* Header Card */}
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm transition-colors
                ${isAdmin ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'}`}
              >
                {membership.companyName.charAt(0).toUpperCase()}
              </div>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
                ${isAdmin 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {isAdmin ? "Admin" : "Member"}
              </span>
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

            {/* Footer Action (Mũi tên hiện ra khi hover) */}
            <div className="mt-6 flex items-center text-sm font-semibold text-blue-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Go to Workspace <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        );
      })}

      {/* Card "Tạo mới" (Dấu cộng) */}
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