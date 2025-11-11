"use client";
import { Eye, X, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any | null;
  loading: boolean;
}

export default function MemberDetailModal({
  isOpen,
  onClose,
  member,
  loading,
}: MemberDetailModalProps) {
  if (!isOpen || !member) return null;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Hoạt động</span>
          </div>
        );
      case "PENDING":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Đang chờ</span>
          </div>
        );
      case "INACTIVE":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Tạm khóa</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-6">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Chi tiết thành viên</h2>
                <p className="text-white/80 text-sm">{member.fullName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* Ảnh + Thông tin cơ bản */}
              <div className="flex items-center gap-4">
                <img
                  src={
                    member.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      member.fullName
                    )}&background=random`
                  }
                  alt={member.fullName}
                  className="w-20 h-20 rounded-xl border-2 border-gray-200 object-cover shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {member.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <div className="mt-2">{renderStatusBadge(member.status)}</div>
                </div>
              </div>

              {/* Các trường chi tiết */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500">ID thành viên</p>
                  <p className="text-sm font-medium text-gray-800">
                    #{member.memberId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="text-sm font-medium text-gray-800">
                    {member.userId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vai trò</p>
                  <p className="text-sm font-medium text-gray-800">
                    {member.roleName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Chức danh</p>
                  <p className="text-sm font-medium text-gray-800">
                    {member.jobTitle || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ngày tham gia</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(member.joinedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-800 break-all">
                    {member.email}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
