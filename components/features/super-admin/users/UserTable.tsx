"use client";

import React from "react";
import { MoreVertical, Mail, Phone, Calendar, UserCheck, UserX, Trash2 } from "lucide-react";
import { GlobalUser } from "@/services/apiUserSystem";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatars";

interface UserTableProps {
  users: GlobalUser[];
  onAction: (user: GlobalUser, type: string) => void;
}

export const UserTable = ({ users, onAction }: UserTableProps) => {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]";
      case "LOCKED":
        return "bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]";
      case "DELETED":
        return "bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6]";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px] border-collapse">
        <thead className="bg-[#FAFBFC] text-[#6B778C] text-[11px] font-black uppercase tracking-wider border-b border-[#DFE1E6]">
          <tr>
            <th className="p-4 pl-6">Người dùng</th>
            <th className="p-4">Liên hệ</th>
            <th className="p-4">Vai trò</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4">Ngày tạo</th>
            <th className="p-4 text-right pr-6">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F4F5F7]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-[#F4F5F7]/50 transition-colors group">
              <td className="p-4 pl-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-[#DFE1E6]">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="bg-[#DEEBFF] text-[#0052CC] font-bold text-[11px]">
                      {user.fullName?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#172B4D] leading-tight">{user.fullName}</span>
                    <span className="text-[11px] text-[#6B778C] font-medium mt-0.5">ID: {user.id}</span>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[#42526E]">
                    <Mail className="w-3.5 h-3.5 opacity-60" />
                    <span>{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center gap-1.5 text-[#6B778C] text-[12px]">
                      <Phone className="w-3.5 h-3.5 opacity-60" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <span key={role} className="px-2 py-0.5 bg-[#EAE6FF] text-[#403294] text-[10px] font-black rounded uppercase tracking-wider">
                      {role.replace("ROLE_", "")}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-4">
                <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm", getStatusBadge(user.status))}>
                  {user.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-1.5 text-[#42526E]">
                  <Calendar className="w-3.5 h-3.5 opacity-60" />
                  <span>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </td>
              <td className="p-4 text-right pr-6">
                <button className="p-2 hover:bg-[#EBECF0] rounded-full text-[#6B778C] transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};