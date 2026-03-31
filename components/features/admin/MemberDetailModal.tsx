"use client";

import React, { useMemo } from "react";
import { Eye, X, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

// Internal Components & Utils
import { Button } from "@/components/ui/Buttons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

interface Member {
  memberId: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  status: "ACTIVE" | "PENDING" | "INACTIVE" | string;
  roleName: string;
  jobTitle?: string;
  joinedAt: string;
}

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  loading: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần hiển thị chi tiết thông tin thành viên trong hệ thống Worknet.
 * Cung cấp cái nhìn toàn diện về hồ sơ, vai trò và trạng thái hoạt động.
 */
export default function MemberDetailModal({
  isOpen,
  onClose,
  member,
  loading,
}: MemberDetailModalProps) {
  // ---------------------------------------------------------------------------
  // 1. RENDER HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Cấu hình hiển thị nhãn trạng thái dựa trên dữ liệu hệ thống
   */
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: {
        label: "Active",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        styles: "bg-green-50 text-green-700 border-green-200",
      },
      PENDING: {
        label: "Pending",
        icon: <Clock className="w-3.5 h-3.5" />,
        styles: "bg-amber-50 text-amber-700 border-amber-200",
      },
      INACTIVE: {
        label: "Inactive",
        icon: <XCircle className="w-3.5 h-3.5" />,
        styles: "bg-slate-100 text-slate-600 border-slate-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      icon: null,
      styles: "bg-slate-50 text-slate-500 border-slate-200",
    };

    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border uppercase tracking-wide",
        config.styles
      )}>
        {config.icon}
        <span>{config.label}</span>
      </div>
    );
  };

  /**
   * Định dạng ngày tháng sang chuẩn hiển thị văn phòng
   */
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

  // ---------------------------------------------------------------------------
  // 2. MAIN RENDER
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;
  if (!loading && !member) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Khu vực Tiêu đề (Header) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-md shrink-0">
              <Eye className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Member Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">Full profile information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khu vực Nội dung (Body) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading || !member ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Phần 1: Ảnh đại diện và Thông tin cơ bản */}
              <div className="flex items-start gap-5">
                <Avatar className="w-20 h-20 border border-slate-100 p-1 bg-white shadow-sm shrink-0">
                  <AvatarImage src={member.avatarUrl ?? undefined} alt={member.fullName} />
                  <AvatarFallback className="bg-blue-50 text-blue-700 text-xl font-bold uppercase">
                    {member.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-bold text-slate-900 truncate">
                    {member.fullName}
                  </h3>
                  <p className="text-sm text-slate-500 truncate mb-3">
                    {member.email}
                  </p>
                  {renderStatusBadge(member.status)}
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* Phần 2: Chi tiết thuộc tính (Grid System) */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member ID</p>
                  <p className="text-sm font-semibold text-slate-700">#{member.memberId}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User ID</p>
                  <p className="text-sm font-semibold text-slate-700">{member.userId}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</p>
                  <p className="text-sm font-semibold text-slate-700">{member.roleName || "—"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Title</p>
                  <p className="text-sm font-semibold text-slate-700">{member.jobTitle || "—"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined Date</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(member.joinedAt)}</p>
                </div>

                <div className="space-y-1 col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-semibold text-slate-700 break-all">{member.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Khu vực Hành động (Footer) */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white border-slate-300 text-slate-700 h-9 px-6 font-semibold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}