"use client";

import React from "react";
import { Mail, Eye, Edit, Trash2, MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react";

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

  onSort?: (field: string) => void;
  currentSortBy?: string;
  currentSortDir?: "asc" | "desc";
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
  onSort,
  currentSortBy,
  currentSortDir,
}: MemberTableProps) {

  const renderSortIcon = (field: string) => {
    if (!onSort) return null;

    if (currentSortBy !== field)
      return <ChevronUp className="w-3 h-3 opacity-30" />;

    return currentSortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-600" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-600" />
    );
  };

  const sortableTh = (label: string, field: string, width?: string) => (
    <th
      onClick={() => onSort && onSort(field)}
      className={`px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] tracking-wider 
        select-none cursor-pointer hover:text-blue-600 ${width}`}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {renderSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              {/* SORT STT DỰA THEO memberId */}
              {sortableTh("#", "memberId", "w-12")}

              {sortableTh("Member", "fullName")}
              {sortableTh("Contact", "email")}
              {sortableTh("Role", "roleName")}
              {sortableTh("Status", "status")}
              {sortableTh("Joined Date", "joinedAt")}

              <th className="px-4 py-3 text-right font-semibold text-slate-500 uppercase text-[11px] tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {members.map((m, index) => (
              <tr
                key={m.memberId || m.userId || `row-${index}`}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                  {index + 1}
                </td>

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
                      <div className="font-medium text-slate-900 truncate">
                        {m.fullName}
                      </div>
                      <div className="text-xs text-slate-400 truncate font-mono">
                        {m.userId ? `ID: ${m.userId}` : "Pending"}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[150px]">{m.email || "—"}</span>
                  </div>
                </td>

                <td className="px-4 py-3">{renderRole(m)}</td>
                <td className="px-4 py-3">{renderStatus(m.status)}</td>

                <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                  {formatDateTime(m.joinedAt)}
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onViewDetail(m)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {onEdit && (
                      <button
                        onClick={() => onEdit(m)}
                        disabled={disableEdit(m)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md disabled:opacity-30"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => onDelete(m)}
                        disabled={disableDelete(m)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

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
