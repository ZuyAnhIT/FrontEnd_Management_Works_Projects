"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MoreVertical, Mail, Phone, Calendar, 
  ShieldCheck, ShieldAlert, Lock, Unlock 
} from "lucide-react";
import { GlobalUser } from "@/services/apiUserSystem";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatars";

interface UserTableProps {
  users: GlobalUser[];
  currentUserId: number | undefined; // ID of the currently logged-in Admin
  onToggleStatus: (user: GlobalUser, newStatus: "ACTIVE" | "LOCKED") => void;
  onToggleRole: (user: GlobalUser, assignAdmin: boolean) => void;
}

export const UserTable = ({ users, currentUserId, onToggleStatus, onToggleRole }: UserTableProps) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="overflow-x-auto min-h-[300px]" ref={menuRef}>
      <table className="w-full text-left text-[13px] border-collapse">
        <thead className="bg-[#FAFBFC] text-[#6B778C] text-[11px] font-black uppercase tracking-wider border-b border-[#DFE1E6]">
          <tr>
            <th className="p-4 pl-6">User</th>
            <th className="p-4">Contact</th>
            <th className="p-4">Roles</th>
            <th className="p-4">Status</th>
            <th className="p-4">Created At</th>
            <th className="p-4 text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F4F5F7]">
          {users.map((user) => {
            // SELF-PROTECTION LOGIC
            const isMe = user.id === currentUserId; 
            const isSystemAdmin = user.roles.includes("SYSTEM_ADMIN") || user.roles.includes("ROLE_SYSTEM_ADMIN");
            const isLocked = user.status === "LOCKED";

            return (
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
                      <span className="font-bold text-[#172B4D] leading-tight flex items-center gap-2">
                        {user.fullName} 
                        {isMe && (
                          <span className="px-1.5 py-[1px] bg-blue-100 text-blue-700 text-[9px] font-black rounded-sm uppercase tracking-widest">
                            You
                          </span>
                        )}
                      </span>
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
                    <span>{new Date(user.createdAt).toLocaleDateString("en-US")}</span>
                  </div>
                </td>

                {/* ACTIONS COLUMN */}
                <td className="p-4 text-right pr-6 relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                    className="p-2 hover:bg-[#EBECF0] rounded-full text-[#6B778C] transition-colors outline-none focus:ring-2 focus:ring-[#0052CC]/20"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Action Dropdown Menu */}
                  {openMenuId === user.id && (
                    <div className="absolute right-6 top-10 mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#DFE1E6] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      
                      {/* Action 1: Toggle Admin Role */}
                      <button
                        disabled={isMe}
                        title={isMe ? "You cannot modify your own permissions" : ""}
                        onClick={() => { setOpenMenuId(null); onToggleRole(user, !isSystemAdmin); }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 transition-colors",
                          isMe ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:bg-[#F4F5F7] text-[#172B4D]"
                        )}
                      >
                        {isSystemAdmin ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-[#36B37E]" />}
                        {isSystemAdmin ? "Revoke Admin Rights" : "Grant Admin Rights"}
                      </button>

                      <div className="h-px bg-[#DFE1E6] my-1" />

                      {/* Action 2: Toggle Status (Lock/Unlock) */}
                      <button
                        disabled={isMe}
                        title={isMe ? "You cannot lock your own account" : ""}
                        onClick={() => { setOpenMenuId(null); onToggleStatus(user, isLocked ? "ACTIVE" : "LOCKED"); }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 transition-colors",
                          isMe ? "opacity-50 cursor-not-allowed bg-slate-50" : (isLocked ? "hover:bg-[#E3FCEF] text-[#006644]" : "hover:bg-[#FFEBE6] text-[#BF2600]")
                        )}
                      >
                        {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {isLocked ? "Unlock Account" : "Lock Account"}
                      </button>

                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};