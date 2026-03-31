"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

// Thư viện bên ngoài
import React from "react";
import { X, Building2 } from "lucide-react";

// Internal Components
import CreateCompanyForm from "./CreateCompanyForm";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Cửa sổ bật lên để thiết lập Tổ chức/Công ty (Setup Organization Modal).
 * Quản lý trạng thái hiển thị và bao bọc biểu mẫu đăng ký doanh nghiệp.
 */
export default function CreateCompanyModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateCompanyModalProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý sau khi nghiệp vụ tạo công ty hoàn tất thành công
   */
  const handleSuccess = () => {
    onSuccess(); // Kích hoạt làm mới dữ liệu tại trang cha
    onClose();   // Đóng modal
  };

  // ---------------------------------------------------------------------------
  // 5. RENDER
  // ---------------------------------------------------------------------------

  // Ngừng render nếu trạng thái modal đang đóng
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Container của Modal */}
      <div 
        className={cn(
          "bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden",
          "animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* PHẦN ĐẦU (HEADER) */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-4">
            {/* Biểu tượng đại diện cho hành động thiết lập */}
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Setup Organization
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Create a centralized workspace for your entire team.
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PHẦN THÂN (BODY - CHỨA FORM) */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <CreateCompanyForm 
            onSuccess={handleSuccess} 
            onCancel={onClose}
          />
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}