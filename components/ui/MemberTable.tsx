"use client";

import React from "react";
import { Mail, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";

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
    // Container: Nền trắng, viền xám, shadow nhẹ, bo góc vừa phải
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          
          {/* HEADER: Minimalist Style */}
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] tracking-wider w-12">#</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Member</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Contact</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Role</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Joined Date</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-500 uppercase text-[11px] tracking-wider w-24">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {members.map((m, index) => (
              <tr
                key={m.memberId || m.userId || `row-${index}`}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                {/* STT */}
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{index + 1}</td>

                {/* Avatar + Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0">
                        <img
                        src={
                            m.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            m.fullName || "U"
                            )}&background=random&color=fff`
                        }
                        alt={m.fullName}
                        className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">{m.fullName}</div>
                      <div className="text-xs text-slate-400 truncate font-mono">
                        {m.userId ? `ID: ${m.userId}` : "Pending"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[150px]">{m.email || "—"}</span>
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3">{renderRole(m)}</td>

                {/* Status */}
                <td className="px-4 py-3">{renderStatus(m.status)}</td>

                {/* Joined Date */}
                <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                  {formatDateTime(m.joinedAt)}
                </td>

                {/* Actions (Right Aligned) */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    
                    {/* View */}
                    <button
                      onClick={() => onViewDetail(m)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(m)}
                        disabled={disableEdit(m)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Edit Member"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete */}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(m)}
                        disabled={disableDelete(m)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                  </div>
                  
                  {/* Mobile/Fallback Icon when not hovering */}
                  <div className="group-hover:hidden flex justify-end">
                     <MoreHorizontal className="w-4 h-4 text-slate-300" />
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