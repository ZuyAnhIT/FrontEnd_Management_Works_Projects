"use client";

import {
  X,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import React from "react";

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
  fields: DetailField[]; // danh sách field động
  showStatus?: boolean;
}

export default function MemberDetailModalBase({
  isOpen,
  onClose,
  member,
  loading = false,
  title = "Chi tiết thành viên",
  fields,
  showStatus = true,
}: MemberDetailModalBaseProps) {
  if (!isOpen || !member) return null;

  // ----------------------------
  // Badge trạng thái dùng chung
  // ----------------------------
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
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-white/80 text-sm">{member.fullName}</p>
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
              {/* Avatar + Basic Info */}
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

                  {showStatus && (
                    <div className="mt-2">
                      {renderStatusBadge(member.status)}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Fields */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {fields.map((field) => {
                  const value = member[field.key];

                  return (
                    <div key={field.key}>
                      <p className="text-xs text-gray-500">{field.label}</p>

                      <p className="text-sm font-medium text-gray-800 break-all">
                        {field.render
                          ? field.render(value, member)
                          : field.key.toLowerCase().includes("date")
                          ? formatDate(value)
                          : value ?? "—"}
                      </p>
                    </div>
                  );
                })}
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
