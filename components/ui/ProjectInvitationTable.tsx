"use client";

import React, { useCallback } from "react";
import { Mail, Trash2, Clock, Shield, User, Copy } from "lucide-react";

// Internal Components & Services
import { ProjectInvitation } from "@/services/apiProject";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatars";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

interface ProjectInvitationTableProps {
  invitations: ProjectInvitation[];
  onCancel: (invitation: ProjectInvitation) => void;
  formatDateTime: (date: string) => string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần bảng hiển thị các lời mời đang chờ xử lý trong dự án.
 * Hỗ trợ sao chép liên kết mời và thu hồi lời mời từ phía quản trị viên.
 */
export default function ProjectInvitationTable({
  invitations,
  onCancel,
  formatDateTime,
}: ProjectInvitationTableProps) {
  const { showToast } = useToast();

  // ---------------------------------------------------------------------------
  // LOGIC HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Chuyển đổi mã vai trò (Role Code) sang định dạng hiển thị dễ đọc
   */
  const formatRoleName = useCallback((roleCode: string) => {
    return roleCode
      .replace("PROJECT_", "")
      .replace("GUEST_", "")
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  /**
   * Sao chép liên kết mời vào bộ nhớ tạm (Clipboard)
   */
  const handleCopyLink = useCallback((link?: string) => {
    if (!link) {
      showToast("Invitation link is not available", "error");
      return;
    }
    
    navigator.clipboard.writeText(link);
    showToast("Copied invitation link to clipboard", "success");
  }, [showToast]);

  // ---------------------------------------------------------------------------
  // RENDER: EMPTY STATE
  // ---------------------------------------------------------------------------

  if (invitations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 text-center text-slate-500">
        <p className="text-sm font-medium">
          No pending invitations found for this project
        </p>
        <p className="text-xs mt-1">Send a new invitation to see it here</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: MAIN TABLE
  // ---------------------------------------------------------------------------

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] w-12 text-center">#</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">Email / Role</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">Invited By</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">Invited At</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] text-right">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {invitations.map((invitation, index) => (
              <tr
                key={invitation.id}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                {/* Số thứ tự */}
                <td className="px-4 py-3 text-slate-400 font-mono text-xs text-center">
                  {index + 1}
                </td>

                {/* Thông tin Email và Vai trò */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {invitation.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      {formatRoleName(invitation.roleCode)}
                    </div>
                  </div>
                </td>

                {/* Thông tin người mời (Avatar + Name) */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 border border-slate-200">
                      <AvatarImage src={invitation.inviterAvatar || undefined} />
                      <AvatarFallback className="text-[10px] bg-slate-200 text-slate-600 font-bold uppercase">
                        {invitation.inviterName?.charAt(0) || <User className="w-3 h-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-slate-600 text-xs">
                      {invitation.inviterName}
                    </span>
                  </div>
                </td>

                {/* Trạng thái lời mời */}
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3 h-3" /> 
                    Pending
                  </div>
                </td>

                {/* Thời gian gửi lời mời */}
                <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                  {formatDateTime(invitation.invitedAt)}
                </td>

                {/* Các nút hành động */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyLink((invitation as any).invitationLink)} 
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Copy Invitation Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onCancel(invitation)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Revoke Invitation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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