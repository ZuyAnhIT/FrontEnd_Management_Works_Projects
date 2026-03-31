"use client";

import React, { useCallback } from "react";
import { Mail, Trash2, Copy, Clock, Shield } from "lucide-react";

// Internal Services & Components
import { CompanyInvitation } from "@/services/apiCompany";
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// INTERFACES
// =============================================================================

interface InvitationTableProps {
  invitations: CompanyInvitation[];
  onCancel: (invitation: CompanyInvitation) => void;
  formatDateTime: (date: string) => string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần bảng hiển thị danh sách các lời mời gia nhập công ty.
 * Hỗ trợ các thao tác sao chép liên kết mời và thu hồi lời mời.
 */
export default function InvitationTable({ 
  invitations, 
  onCancel,
  formatDateTime 
}: InvitationTableProps) {
  const { showToast } = useToast();

  // ---------------------------------------------------------------------------
  // LOGIC HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Sao chép liên kết mời vào bộ nhớ tạm (Clipboard)
   */
  const handleCopyLink = useCallback((link: string) => {
    if (!link) {
      showToast("Invitation link is missing", "error");
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
        <p className="text-sm font-medium">No pending invitations found</p>
        <p className="text-xs mt-1">Send a new invitation to see it here</p>
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
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] w-12 text-center">#</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">Email / Role</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">Invited By</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px]">Expires At</th>
              <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] text-right">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {invitations.map((inv, index) => (
              <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-slate-400 font-mono text-xs text-center">
                  {index + 1}
                </td>
                
                {/* Cột Email và Vai trò */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Mail className="w-3.5 h-3.5 text-slate-400"/> 
                      {inv.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Shield className="w-3 h-3 text-blue-500"/> 
                      {inv.roleName}
                    </div>
                  </div>
                </td>

                {/* Cột Người mời */}
                <td className="px-4 py-3 text-slate-600">
                  {inv.invitedByName || "System"}
                </td>

                {/* Cột Trạng thái (Mặc định hiển thị Pending cho các lời mời chưa kích hoạt) */}
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3 h-3"/> 
                    {inv.status || "PENDING"}
                  </div>
                </td>

                {/* Cột Thời gian hết hạn */}
                <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                  {formatDateTime(inv.expiresAt)}
                </td>

                {/* Cột Hành động (Hiển thị khi hover vào hàng) */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleCopyLink(inv.invitationLink)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Copy Invitation Link"
                    >
                      <Copy className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={() => onCancel(inv)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Revoke Invitation"
                    >
                      <Trash2 className="w-4 h-4"/>
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