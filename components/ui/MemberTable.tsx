"use client";

import React from "react";
import { Mail, Eye, Edit, Trash2 } from "lucide-react";

interface MemberTableProps {
  members: any[];
  renderStatus: (status: string) => React.ReactNode;
  renderRole: (member: any) => React.ReactNode;
  formatDateTime: (date?: string | null) => string;

  onViewDetail: (member: any) => void;
  onEdit?: (member: any) => void;
  onDelete?: (member: any) => void;

  disableEdit?: (member: any) => boolean;
  disableDelete?: (member: any) => boolean;
}

export default function MemberTable({
  members,
  renderStatus,
  renderRole,
  formatDateTime,
  onViewDetail,
  onEdit,
  onDelete,
  disableEdit = () => false,
  disableDelete = () => false,
}: MemberTableProps) {

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-fadeInUp">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">STT</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Thành viên</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Vai trò</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ngày tham gia</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {members.map((m, index) => (
              <tr
                key={m.memberId || m.userId || `row-${index}`}
                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all"
              >
                {/* STT */}
                <td className="px-6 py-4 text-sm font-medium text-gray-700">{index + 1}</td>

                {/* Avatar + Tên */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        m.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          m.fullName || "A"
                        )}&background=random`
                      }
                      alt={m.fullName}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 object-cover shadow-sm"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{m.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {m.userId ? `ID: ${m.userId}` : "(Chưa xác nhận)"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {m.email || "—"}
                  </div>
                </td>

                {/* Vai trò */}
                <td className="px-6 py-4">{renderRole(m)}</td>

                {/* Trạng thái */}
                <td className="px-6 py-4">{renderStatus(m.status)}</td>

                {/* Ngày tham gia */}
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {formatDateTime(m.joinedAt)}
                </td>

                {/* Thao tác */}
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-1">

                    {/* Xem chi tiết */}
                    <button
                      onClick={() => onViewDetail(m)}
                      className="group p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Sửa */}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(m)}
                        disabled={disableEdit(m)}
                        className="group p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all disabled:text-gray-300 disabled:hover:bg-transparent"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {/* Xóa */}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(m)}
                        disabled={disableDelete(m)}
                        className="group p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:text-gray-300 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
