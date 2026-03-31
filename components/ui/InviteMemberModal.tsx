"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Mail,
  Crown,
  UserPlus,
  FolderKanban,
  Briefcase,
  Loader2,
} from "lucide-react";

// Internal Components & Services
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { searchCompanyMembers, CompanyMember } from "@/services/apiCompany";

// =============================================================================
// INTERFACES
// =============================================================================

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: () => void | Promise<void>;
  isLoading?: boolean;

  // Trạng thái dữ liệu (được quản lý bởi component cha)
  email: string;
  setEmail: (val: string) => void;
  roleCode: string;
  setRoleCode: (val: string) => void;

  // Tùy chỉnh hiển thị
  title?: string;
  description?: string;
  contextType?: "company" | "workspace" | "project";

  // Dùng để thực hiện tìm kiếm thành viên trong nội bộ công ty
  companyId?: number;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần cửa sổ mời thành viên tham gia hệ thống.
 * Hỗ trợ tìm kiếm gợi ý thành viên dựa trên dữ liệu công ty và phân quyền theo ngữ cảnh.
 */
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
  description = "Add new people to your team via email or user search.",
  contextType = "company",
  companyId,
}: InviteMemberModalProps) {
  // ---------------------------------------------------------------------------
  // 1. STATE & REFS
  // ---------------------------------------------------------------------------
  const [suggestions, setSuggestions] = useState<CompanyMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionWrapperRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // 2. SIDE EFFECTS
  // ---------------------------------------------------------------------------

  // Xử lý đóng danh sách gợi ý khi người dùng nhấn chuột ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionWrapperRef.current && 
        !suggestionWrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Làm sạch dữ liệu khi đóng cửa sổ modal
  useEffect(() => {
    if (!isOpen) {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // 3. LOGIC HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý thay đổi nội dung nhập liệu và thực hiện tìm kiếm gợi ý (Debounce)
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Điều kiện thực hiện tìm kiếm: có mã công ty và từ khóa dài hơn 1 ký tự
    if (!companyId || value.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    setIsSearching(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const response = await searchCompanyMembers(companyId, {
          email: value,
          page: 0,
          size: 5,
        });
        setSuggestions(response.content || []);
      } catch (error) {
        console.error("[Invite Service] Member search failed:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  };

  /**
   * Chọn một thành viên từ danh sách gợi ý
   */
  const handleSelectSuggestion = (memberEmail: string) => {
    setEmail(memberEmail);
    setShowSuggestions(false);
  };

  /**
   * Xác định biểu tượng hiển thị dựa trên ngữ cảnh mời
   */
  const renderHeaderIcon = () => {
    switch (contextType) {
      case "project":
        return <FolderKanban className="w-5 h-5 text-blue-600" />;
      case "workspace":
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      default:
        return <UserPlus className="w-5 h-5 text-blue-600" />;
    }
  };

  // ---------------------------------------------------------------------------
  // 4. RENDER
  // ---------------------------------------------------------------------------
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Khu vực Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white shrink-0">
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
            className="p-2 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khu vực Nội dung (Body) */}
        <div className="p-6 space-y-5 overflow-visible">
          
          {/* Nhập liệu Email và Gợi ý thành viên */}
          <div className="space-y-1.5 relative" ref={suggestionWrapperRef}>
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              Email Address <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={handleInputChange}
                placeholder="Type email or name to search..."
                className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm pr-8"
                autoFocus
                autoComplete="off"
              />

              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              )}
            </div>

            {/* Menu thả xuống hiển thị danh sách gợi ý */}
            {showSuggestions && (suggestions.length > 0 || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                {suggestions.length > 0 ? (
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                      Suggestions from Company
                    </div>
                    {suggestions.map((member) => (
                      <button
                        key={member.memberId || member.userId}
                        onMouseDown={(e) => e.preventDefault()} // Giữ focus cho input
                        onClick={() => handleSelectSuggestion(member.email)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left group border-b border-slate-50 last:border-0"
                      >
                        <Avatar className="w-8 h-8 border border-slate-200 shrink-0">
                          <AvatarImage
                            src={member.avatarUrl || undefined}
                            alt={member.fullName}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                            {member.fullName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {member.email}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <UserPlus className="w-4 h-4 text-blue-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  !isSearching && (
                    <div className="p-3 text-center text-xs text-slate-500 italic">
                      No matching company members found
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Lựa chọn vai trò (Role) */}
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
                {contextType === "company" && (
                  <>
                    <option value="COMPANY_MEMBER">Company Member</option>
                    <option value="COMPANY_ADMIN">Company Admin</option>
                  </>
                )}
                {contextType === "project" && (
                  <>
                    <option value="PROJECT_MEMBER">Project Member</option>
                    <option value="GUEST_PROJECT">Guest</option>
                    <option value="PROJECT_ADMIN">Project Admin</option>
                  </>
                )}
                {contextType === "workspace" && (
                  <>
                    <option value="WORKSPACE_MEMBER">Workspace Member</option>
                    <option value="WORKSPACE_ADMIN">Workspace Admin</option>
                  </>
                )}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Khu vực Nút hành động (Footer) */}
        <div className="bg-slate-50/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white border-slate-300 text-slate-700 h-9 px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={onInvite}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}