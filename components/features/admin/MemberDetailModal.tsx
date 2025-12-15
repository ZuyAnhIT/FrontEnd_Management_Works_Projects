"use client";

import { Eye, X, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

// =============================================================================
// 1. INTERFACES (Định nghĩa kiểu dữ liệu)
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
// 2. MAIN COMPONENT
// =============================================================================

export default function MemberDetailModal({
  isOpen,
  onClose,
  member,
  loading,
}: MemberDetailModalProps) {
  // Nếu modal đóng hoặc chưa có dữ liệu thành viên (và không đang loading) thì không render
  if (!isOpen) return null;
  if (!loading && !member) return null;

  // ---------------------------------------------------------------------------
  // HELPER FUNCTIONS (Hàm tiện ích hiển thị)
  // ---------------------------------------------------------------------------

  // Render badge trạng thái (Active/Pending/Inactive)
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
        // Fallback cho trạng thái lạ
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
            <span>{status}</span>
          </div>
        );
    }
  };

  // Format ngày tháng sang chuẩn EN-US
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
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* --- Header --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-md">
              <Eye className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Member Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full profile information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading || !member ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Phần 1: Ảnh đại diện & Thông tin chính */}
              <div className="flex items-start gap-5">
                <div className="relative w-20 h-20 rounded-full border border-slate-200 p-1 bg-white shadow-sm shrink-0">
                  <img
                    src={
                      member.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.fullName
                      )}&background=random&color=fff`
                    }
                    alt={member.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-bold text-slate-900 truncate">
                    {member.fullName}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">
                    {member.email}
                  </p>
                  <div className="mt-3">{renderStatusBadge(member.status)}</div>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full"></div>

              {/* Phần 2: Chi tiết dạng lưới (Grid) */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Member ID
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    #{member.memberId}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    User ID
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {member.userId}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {member.roleName || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Job Title
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {member.jobTitle || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Joined Date
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(member.joinedAt)}
                  </p>
                </div>

                <div className="space-y-1 col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-slate-900 break-all">
                    {member.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Footer --- */}
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
