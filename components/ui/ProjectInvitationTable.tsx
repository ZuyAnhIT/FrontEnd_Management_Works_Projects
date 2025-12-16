"use client";

import React from "react";
import { Mail, Trash2, Clock, Shield, User, Copy } from "lucide-react"; // 1. Thêm icon Copy
import { ProjectInvitation } from "@/services/apiProject";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatars";
import { useToast } from "@/components/ui/ToastProvider"; // 2. Thêm hook Toast

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface ProjectInvitationTableProps {
  invitations: ProjectInvitation[];
  onCancel: (invitation: ProjectInvitation) => void;
  formatDateTime: (date: string) => string;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function ProjectInvitationTable({
  invitations,
  onCancel,
  formatDateTime,
}: ProjectInvitationTableProps) {
  const { showToast } = useToast(); // 3. Khởi tạo Toast

  // 4. Logic Copy Link
  const copyLink = (link?: string) => {
    if (!link) {
      showToast("Invitation link not found", "error");
      return;
    }
    navigator.clipboard.writeText(link);
    showToast("Copied invitation link!", "success");
  };

  // Helper: Render role name (Logic cũ giữ nguyên)
  const renderRoleName = (roleCode: string) => {
    return roleCode
      .replace("PROJECT_", "")
      .replace("GUEST_", "")
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (invitations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 text-center text-slate-500">
        <p className="text-sm font-medium">
          No pending invitations found for this project.
        </p>
        <p className="text-xs mt-1">Send a new invitation to see it here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] w-12">
                #
              </th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">
                Email / Role
              </th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">
                Invited By
              </th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">
                Invited At
              </th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invitations.map((inv, index) => (
              <tr
                key={inv.id}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                  {index + 1}
                </td>

                {/* Email & Role */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />{" "}
                      {inv.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      {renderRoleName(inv.roleCode)}
                    </div>
                  </div>
                </td>

                {/* Inviter Info */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 border border-slate-200">
                      <AvatarImage src={inv.inviterAvatar || undefined} />
                      <AvatarFallback className="text-[10px] bg-slate-200 text-slate-600">
                        {inv.inviterName?.charAt(0) || (
                          <User className="w-3 h-3" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-slate-600 text-xs">
                      {inv.inviterName}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3 h-3" /> Pending
                  </div>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                  {formatDateTime(inv.invitedAt)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* 5. Nút Copy Link */}
                    <button
                      // Lưu ý: Đảm bảo trong interface ProjectInvitation có trường `invitationLink` hoặc tương tự
                      onClick={() => copyLink((inv as any).invitationLink)} 
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Copy Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    {/* Nút Cancel (Cũ) */}
                    <button
                      onClick={() => onCancel(inv)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Cancel Invitation"
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