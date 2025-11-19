"use client";

import React from "react";
import { X, Mail, Crown, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button"; // Giả sử bạn có component Button chuẩn
import { Input } from "@/components/ui/input";   // Giả sử bạn có component Input chuẩn

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, roleId: number) => void;
  isLoading?: boolean;

  email: string;
  setEmail: (val: string) => void;
  roleId: number;
  setRoleId: (val: number) => void;

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
  title = "Invite Team Member",
  description = "Add new people to your team",
  contextType = "company",
}: InviteMemberModalProps) {
  if (!isOpen) return null;

  return (
    // Backdrop: Đen mờ nhẹ
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      
      {/* Modal Card: Nền trắng, Shadow lớn, Viền xám */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header: Trắng, Border dưới */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
               <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
               <h2 className="text-lg font-bold text-slate-900">{title}</h2>
               <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
               <Mail className="w-4 h-4 text-slate-500" />
               Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
              autoFocus
            />
          </div>

          {/* Role Select */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
               <Crown className="w-4 h-4 text-slate-500" />
               Role
            </label>
            <div className="relative">
                <select
                value={roleId}
                onChange={(e) => setRoleId(Number(e.target.value))}
                className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 appearance-none cursor-pointer shadow-sm transition-all"
                >
                {contextType === "company" ? (
                    <>
                    <option value={2}>Administrator</option>
                    <option value={3}>Member</option>
                    </>
                ) : (
                    <>
                    <option value={1}>Workspace Admin</option>
                    <option value={2}>Workspace Member</option>
                    </>
                )}
                </select>
                {/* Custom Arrow Icon */}
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
          </div>

        </div>

        {/* Footer: Actions */}
        <div className="bg-slate-50/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
            <Button 
                onClick={onClose}
                variant="outline"
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-9 px-4 font-medium"
            >
              Cancel
            </Button>
            
            <Button
              onClick={() => onInvite(email, roleId)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 font-bold shadow-sm transition-all active:scale-95"
            >
               {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
        </div>

      </div>
    </div>
  );
}