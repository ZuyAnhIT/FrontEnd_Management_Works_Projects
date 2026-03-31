"use client";

import React from "react";
import { X, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

// Internal Components & Utils
import { Button } from "@/components/ui/Buttons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Định nghĩa cấu trúc cho một trường dữ liệu hiển thị trong modal
 */
interface DetailField {
  label: string;
  key: string;
  icon?: React.ReactNode;
  // Cho phép tùy chỉnh cách hiển thị giá trị hoặc xử lý logic riêng biệt
  render?: (value: any, member: any) => React.ReactNode;
}

interface MemberDetailModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  member: any | null;
  loading?: boolean;
  title?: string;
  fields: DetailField[];
  showStatus?: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần nền tảng hiển thị thông tin chi tiết thành viên.
 * Hỗ trợ hiển thị ảnh đại diện, trạng thái hệ thống và các trường dữ liệu động.
 */
export default function MemberDetailModalBase({
  isOpen,
  onClose,
  member,
  loading = false,
  title = "Member Details",
  fields,
  showStatus = true,
}: MemberDetailModalBaseProps) {
  
  // ---------------------------------------------------------------------------
  // 1. RENDER HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Hiển thị nhãn trạng thái (Status Badge) dựa trên giá trị hệ thống
   */
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: {
        label: "Active",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        className: "bg-green-50 text-green-700 border-green-200",
      },
      PENDING: {
        label: "Pending",
        icon: <Clock className="w-3.5 h-3.5" />,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      },
      INACTIVE: {
        label: "Inactive",
        icon: <XCircle className="w-3.5 h-3.5" />,
        className: "bg-slate-100 text-slate-600 border-slate-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border uppercase tracking-wide",
        config.className
      )}>
        {config.icon}
        <span>{config.label}</span>
      </div>
    );
  };

  /**
   * Định dạng chuỗi ngày tháng sang chuẩn hiển thị (Month Day, Year)
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  // ---------------------------------------------------------------------------
  // 2. MAIN RENDER
  // ---------------------------------------------------------------------------

  if (!isOpen || !member) return null;

  return (
    // Lớp nền (Backdrop)
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      
      {/* Khung nội dung (Modal Container) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Phần Đầu (Header) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and manage member information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phần Thân (Body) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Thông tin định danh (Identity Section) */}
              <div className="flex items-start gap-5">
                {/* Ảnh đại diện sử dụng hệ thống Avatar chuẩn */}
                <Avatar className="w-20 h-20 border border-slate-100 p-1 bg-white shadow-sm shrink-0">
                  <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                  <AvatarFallback className="bg-blue-50 text-blue-700 text-xl font-bold">
                    {member.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Tên và Email */}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-bold text-slate-900 truncate">
                    {member.fullName}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">
                    {member.email}
                  </p>

                  {showStatus && (
                    <div className="mt-3">
                      {renderStatusBadge(member.status)}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* Lưới dữ liệu động (Dynamic Fields Grid) */}
              <div className="grid grid-cols-2 gap-6">
                {fields.map((field) => {
                  const rawValue = member[field.key];

                  return (
                    <div key={field.key} className="space-y-1">
                      {/* Tiêu đề trường dữ liệu */}
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {field.icon && (
                          <span className="text-slate-300">{field.icon}</span>
                        )}
                        {field.label}
                      </div>

                      {/* Giá trị hiển thị */}
                      <div className="text-sm font-semibold text-slate-700 break-words">
                        {field.render
                          ? field.render(rawValue, member)
                          : field.key.toLowerCase().includes("date") || field.key.toLowerCase().includes("at")
                          ? formatDate(rawValue)
                          : rawValue ?? "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Phần Chân (Footer) */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white border-slate-300 text-slate-700 h-9 px-5"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}