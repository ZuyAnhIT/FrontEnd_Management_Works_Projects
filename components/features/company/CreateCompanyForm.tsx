"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

// Thư viện bên ngoài
import React, { useState, useCallback } from "react";
import { 
  Building2, FileText, MapPin, Phone, Mail, Globe, LucideIcon 
} from "lucide-react";

// Internal Services & Components
import { createCompany } from "@/services/apiCompany";
import { useToast } from "@/components/ui/ToastProvider";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & CONFIG
// =============================================================================

interface CreateCompanyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface CompanyFormData {
  companyName: string;
  description: string;
  address: string;
  phoneNumber: string;
  email: string;
  website: string;
}

const INITIAL_FORM_STATE: CompanyFormData = {
  companyName: "",
  description: "",
  address: "",
  phoneNumber: "",
  email: "",
  website: "",
};

/**
 * Danh sách cấu hình các trường liên hệ để tự động hóa việc render
 */
const CONTACT_FIELDS: {
  key: keyof CompanyFormData;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  type?: string;
}[] = [
  { key: "address", label: "Office Address", icon: MapPin, placeholder: "e.g. 123 Business Bay, NY" },
  { key: "phoneNumber", label: "Phone Number", icon: Phone, placeholder: "+1 (555) 000-0000" },
  { key: "email", label: "Business Email", icon: Mail, placeholder: "contact@company.com", type: "email" },
  { key: "website", label: "Official Website", icon: Globe, placeholder: "https://company.com" },
];

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Biểu mẫu tạo mới Tổ chức/Công ty.
 * Hỗ trợ thu thập thông tin cơ bản và thông tin liên lạc của doanh nghiệp.
 */
export default function CreateCompanyForm({ onSuccess, onCancel }: CreateCompanyFormProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>(INITIAL_FORM_STATE);

  // ---------------------------------------------------------------------------
  // 5. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Cập nhật trạng thái form khi người dùng nhập liệu
   */
  const handleInputChange = useCallback((field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Xử lý gửi dữ liệu đăng ký công ty lên máy chủ
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra tính hợp lệ cơ bản
    if (!formData.companyName.trim()) {
      showToast("Company name is required", "warning");
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API nghiệp vụ tạo công ty
      await createCompany(formData);
      
      showToast("Organization created successfully", "success");
      onSuccess(); 
    } catch (error: any) {
      // Ưu tiên hiển thị message lỗi chi tiết từ Backend trả về
      const errorMessage = error.message || error.detail || "Failed to create organization";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. RENDER
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      
      {/* PHẦN 1: THÔNG TIN CHÍNH (IDENTITY) */}
      <div className="space-y-4">
        {/* Tên công ty */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Building2 className="w-3.5 h-3.5" />
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            value={formData.companyName}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
            placeholder="e.g. Acme Corporation"
            className={cn(
              "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm transition-all outline-none",
              "focus:ring-2 focus:ring-blue-100 focus:border-blue-600 placeholder:text-slate-400",
              "disabled:bg-slate-50 disabled:cursor-not-allowed"
            )}
            autoFocus
            disabled={isLoading}
          />
        </div>

        {/* Mô tả doanh nghiệp */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
            <FileText className="w-3.5 h-3.5" />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Tell us about your organization's mission..."
            rows={3}
            className={cn(
              "w-full p-3 border border-slate-200 rounded-lg text-sm transition-all outline-none resize-none",
              "focus:ring-2 focus:ring-blue-100 focus:border-blue-600 placeholder:text-slate-400",
              "disabled:bg-slate-50 disabled:cursor-not-allowed"
            )}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Dòng kẻ phân cách khu vực */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
        <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-[0.2em] text-slate-300">
          <span className="bg-white px-2">Contact Details</span>
        </div>
      </div>

      {/* PHẦN 2: THÔNG TIN LIÊN HỆ (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {CONTACT_FIELDS.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Icon className="w-3.5 h-3.5 opacity-70" /> 
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                value={formData[field.key]}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={cn(
                  "w-full h-9 px-3 border border-slate-200 rounded-lg text-sm transition-all outline-none",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 placeholder:text-slate-300",
                  "disabled:bg-slate-50 disabled:cursor-not-allowed"
                )}
                disabled={isLoading}
              />
            </div>
          );
        })}
      </div>

      {/* PHẦN 3: NÚT HÀNH ĐỘNG (FOOTER) */}
      <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-2">
         <button 
           type="button"
           onClick={onCancel}
           disabled={isLoading}
           className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all uppercase tracking-widest"
         >
           Cancel
         </button>
         
         <LoadingButton
           text="Create Organization"
           isLoading={isLoading}
           loadingText="Initializing..."
           className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg shadow-md font-bold text-sm min-w-[180px]"
         />
      </div>

    </form>
  );
}