"use client";

import React from "react";
import { X, Mail, Crown, UserPlus, FolderKanban, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: () => void | Promise<void>;
  isLoading?: boolean;

  email: string;
  setEmail: (val: string) => void;

  roleCode: string;
  setRoleCode: (val: string) => void;

  title?: string;
  description?: string;
  
  // ✅ Context xác định đang mời vào đâu để render Role phù hợp
  contextType?: "company" | "workspace" | "project"; 
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
  isLoading = false,
  email,
  setEmail,
  roleCode,
  setRoleCode,
  title = "Invite Team Member",
  description = "Add new people to your team",
  contextType = "company",
}: InviteMemberModalProps) {
  
  if (!isOpen) return null;

  // 1. Helper: Render Icon Header dựa trên Context
  const renderHeaderIcon = () => {
    switch (contextType) {
      case "project":
        return <FolderKanban className="w-5 h-5 text-blue-600" />;
      case "workspace":
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      default: // company
        return <UserPlus className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">

      {/* Modal Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              {renderHeaderIcon()}
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

        {/* --- BODY --- */}
        <div className="p-6 space-y-5">

          {/* 1. Email Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
              autoFocus
            />
          </div>

          {/* 2. Role Select (Dynamic options based on contextType) */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Crown className="w-4 h-4 text-slate-500" />
              Assign Role
            </label>
            <div className="relative">
              <select
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value)}
                className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 appearance-none cursor-pointer shadow-sm transition-all"
              >
                {/* OPTION CHO COMPANY */}
                {contextType === "company" && (
                  <>
                    <option value="COMPANY_MEMBER">Company Member (Default)</option>
                    <option value="COMPANY_ADMIN">Company Admin (Full Access)</option>
                  </>
                )}

                {/* OPTION CHO PROJECT */}
                {contextType === "project" && (
                  <>
                    <option value="PROJECT_MEMBER">Project Member (Can edit)</option>
                    <option value="GUEST_PROJECT">Guest (View Only)</option>
                    <option value="PROJECT_ADMIN">Project Admin (Full Access)</option>
                  </>
                )}

                {/* OPTION CHO WORKSPACE (Nếu cần) */}
                {contextType === "workspace" && (
                  <>
                    <option value="WORKSPACE_MEMBER">Workspace Member</option>
                    <option value="WORKSPACE_ADMIN">Workspace Admin</option>
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

        {/* --- FOOTER --- */}
        <div className="bg-slate-50/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-9 px-4 font-medium"
          >
            Cancel
          </Button>

          <Button
            onClick={onInvite}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 font-medium"
          >
            {isLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </div>

      </div>
    </div>
  );
}