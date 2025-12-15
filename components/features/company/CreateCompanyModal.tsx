"use client";

import { X } from "lucide-react";
import CreateCompanyForm from "./CreateCompanyForm";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function CreateCompanyModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateCompanyModalProps) {
  
  // Nếu modal chưa mở thì không render gì cả
  if (!isOpen) return null;

  // --- HANDLERS ---

  // Xử lý khi tạo công ty thành công
  const handleSuccess = () => {
    onSuccess(); // Gọi callback cập nhật dữ liệu ở cha
    onClose();   // Đóng modal
  };

  // --- RENDER ---
  return (
    // Overlay: Nền tối, làm mờ, click ra ngoài để đóng (tùy chọn logic đóng ở đây nếu cần)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Modal Container: Giới hạn chiều rộng, bo góc, đổ bóng */}
      <div 
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click xuyên qua đóng modal
      >
        
        {/* --- Header Section --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Setup Organization</h2>
            <p className="text-xs text-slate-500">Create a new space for your team.</p>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- Body Section (Chứa Form) --- */}
        <div className="p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <CreateCompanyForm 
            onSuccess={handleSuccess} 
            onCancel={onClose}
          />
        </div>

      </div>
    </div>
  );
}