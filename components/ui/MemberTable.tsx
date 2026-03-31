"use client";

import React from "react";
import { Mail, Eye, Edit, Trash2, MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react";

// Internal Components & Utils
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

interface MemberTableProps {
  members: any[];
  renderStatus: (status: string) => React.ReactNode;
  renderRole: (member: any) => React.ReactNode;
  formatDateTime: (date?: string | null) => string;

  // Event Handlers
  onViewDetail: (member: any) => void;
  onEdit?: (member: any) => void;
  onDelete?: (member: any) => void;

  // Permissions
  disableEdit?: (member: any) => boolean;
  disableDelete?: (member: any) => boolean;

  // Sorting
  onSort?: (field: string) => void;
  currentSortBy?: string;
  currentSortDir?: "asc" | "desc";
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần bảng hiển thị danh sách thành viên.
 * Hỗ trợ sắp xếp theo cột, hiển thị thông tin chi tiết và các thao tác quản lý.
 */
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

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Hiển thị biểu tượng trạng thái sắp xếp của cột
   */
  const renderSortIcon = (field: string) => {
    if (!onSort) return null;

    if (currentSortBy !== field) {
      return <ChevronUp className="w-3 h-3 opacity-30" />;
    }

    return currentSortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-600" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-600" />
    );
  };

  /**
   * Render tiêu đề cột có tích hợp chức năng sắp xếp
   */
  const SortableTh = ({ label, field, width }: { label: string; field: string; width?: string }) => (
    <th
      onClick={() => onSort && onSort(field)}
      className={cn(
        "px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] tracking-wider select-none",
        onSort ? "cursor-pointer hover:text-blue-600 transition-colors" : "",
        width
      )}
      title={onSort ? `Sort by ${label}` : undefined}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {renderSortIcon(field)}
      </div>
    </th>
  );

  // ---------------------------------------------------------------------------
  // RENDER: EMPTY STATE
  // ---------------------------------------------------------------------------

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 text-center text-slate-500">
        <p className="text-sm font-medium">No members found matching the criteria</p>
        <p className="text-xs mt-1">Try inviting new members or adjusting your filters</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: TABLE
  // ---------------------------------------------------------------------------

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <SortableTh label="#" field="memberId" width="w-12" />
              <SortableTh label="Member" field="fullName" />
              <SortableTh label="Contact" field="email" />
              <SortableTh label="Role" field="roleName" />
              <SortableTh label="Status" field="status" />
              <SortableTh label="Joined Date" field="joinedAt" />
              <th className="px-4 py-3 text-right font-semibold text-slate-500 uppercase text-[11px] tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {members.map((member, index) => (
              <tr
                key={member.memberId || member.userId || `row-${index}`}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                {/* Số thứ tự */}
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                  {index + 1}
                </td>

                {/* Thông tin định danh thành viên */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border border-slate-100 shrink-0">
                      <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                      <AvatarFallback className="bg-blue-50 text-blue-700 text-sm font-bold">
                        {member.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">
                        {member.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate font-mono">
                        {member.userId ? `ID: ${member.userId}` : "Pending"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Liên hệ (Email) */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[150px]" title={member.email || ""}>
                      {member.email || "—"}
                    </span>
                  </div>
                </td>

                {/* Vai trò và Trạng thái */}
                <td className="px-4 py-3">{renderRole(member)}</td>
                <td className="px-4 py-3">{renderStatus(member.status)}</td>

                {/* Thời gian tham gia */}
                <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                  {formatDateTime(member.joinedAt)}
                </td>

                {/* Các nút hành động */}
                <td className="px-4 py-3 text-right">
                  {/* Nhóm hành động hiện khi hover */}
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onViewDetail(member)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {onEdit && (
                      <button
                        onClick={() => onEdit(member)}
                        disabled={disableEdit(member)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md disabled:opacity-30 transition-colors"
                        title="Edit Role"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => onDelete(member)}
                        disabled={disableDelete(member)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30 transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Icon chỉ dẫn cho trải nghiệm trên thiết bị di động */}
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