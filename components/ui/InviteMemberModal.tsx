"use client";

import React from "react";
import { X, Mail, Crown, UserPlus } from "lucide-react";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, roleId: number) => void;
  isLoading?: boolean;

  // Giá trị hiện tại
  email: string;
  setEmail: (val: string) => void;
  roleId: number;
  setRoleId: (val: number) => void;

  // Tuỳ chỉnh tiêu đề
  title?: string;
  description?: string;
  contextType?: "company" | "workspace";
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
  isLoading = false,
  email,
  setEmail,
  roleId,
  setRoleId,
  title = "Mời thành viên mới",
  description = "Thêm người vào nhóm hoặc công ty",
  contextType = "company",
}: InviteMemberModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-6">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-white/80 text-sm">{description}</p>
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
        <div className="p-6 space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.com"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 outline-none hover:border-gray-300"
            />
          </div>

          {/* Role select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Vai trò
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 outline-none hover:border-gray-300 cursor-pointer"
            >
              {contextType === "company" ? (
                <>
                  <option value={2}>Quản trị viên (Admin)</option>
                  <option value={3}>Thành viên (Member)</option>
                </>
              ) : (
                <>
                  <option value={1}>Quản trị Workspace</option>
                  <option value={2}>Thành viên Workspace</option>
                </>
              )}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-300"
            >
              Hủy
            </button>
            <button
              onClick={() => onInvite(email, roleId)}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
            >
              {isLoading ? "Đang gửi..." : "Gửi lời mời"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
