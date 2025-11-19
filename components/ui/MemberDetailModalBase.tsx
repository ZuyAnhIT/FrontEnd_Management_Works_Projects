"use client";

import {
  X,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  User
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button"; // Giả sử bạn có component Button chuẩn

interface DetailField {
  label: string;
  key: string;
  icon?: React.ReactNode;
  render?: (value: any, member: any) => React.ReactNode;
}

interface MemberDetailModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  member: any | null;
  loading?: boolean;
  title?: string;
  fields: DetailField[];
  showStatus?: boolean;
}

export default function MemberDetailModalBase({
  isOpen,
  onClose,
  member,
  loading = false,
  title = "Member Details",
  fields,
  showStatus = true,
}: MemberDetailModalBaseProps) {
  if (!isOpen || !member) return null;

  // ----------------------------
  // Badge trạng thái (Minimalist)
  // ----------------------------
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active</span>
          </div>
        );
      case "PENDING":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </div>
        );
      case "INACTIVE":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
            <XCircle className="w-3.5 h-3.5" />
            <span>Inactive</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    // Backdrop: Đen mờ nhẹ
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      
      {/* Modal Card: Nền trắng, Shadow lớn */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        {/* Header: Trắng, Border dưới */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0 sticky top-0 z-10">
          <div>
             <h2 className="text-lg font-bold text-slate-900">{title}</h2>
             <p className="text-xs text-slate-500 mt-0.5">View member information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* User Identity Section */}
              <div className="flex items-start gap-5">
                {/* Avatar to */}
                <div className="relative w-20 h-20 rounded-full border border-slate-200 p-1 bg-white shadow-sm shrink-0">
                    <img
                    src={
                        member.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=random&color=fff`
                    }
                    alt={member.fullName}
                    className="w-full h-full rounded-full object-cover"
                    />
                </div>
                
                {/* Name & Email */}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-bold text-slate-900 truncate">
                    {member.fullName}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">{member.email}</p>

                  {showStatus && (
                    <div className="mt-3">
                      {renderStatusBadge(member.status)}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full"></div>

              {/* Dynamic Fields Grid */}
              <div className="grid grid-cols-2 gap-6">
                {fields.map((field) => {
                  const value = member[field.key];

                  return (
                    <div key={field.key} className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                         {field.icon && <span className="text-slate-400">{field.icon}</span>}
                         {field.label}
                      </div>

                      <div className="text-sm font-medium text-slate-900 break-words">
                        {field.render
                          ? field.render(value, member)
                          : field.key.toLowerCase().includes("date") || field.key.toLowerCase().includes("at")
                          ? formatDate(value)
                          : value ?? "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Actions */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}