"use client";

import { useState } from "react";
import { 
  Building2, FileText, MapPin, Phone, Mail, Globe, LucideIcon 
} from "lucide-react";

import { createCompany } from "@/services/apiCompany";
import { useToast } from "@/components/ui/ToastProvider";
import LoadingButton from "@/components/ui/LoadingButton";

// =============================================================================
// 1. INTERFACES & CONFIG
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

// Cấu hình cho các trường thông tin liên hệ (để render vòng lặp)
const CONTACT_FIELDS: {
  key: keyof CompanyFormData;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  type?: string;
}[] = [
  { key: "address", label: "Address", icon: MapPin, placeholder: "123 Main St" },
  { key: "phoneNumber", label: "Phone", icon: Phone, placeholder: "+1 (555) 000-0000" },
  { key: "email", label: "Email", icon: Mail, placeholder: "contact@acme.com", type: "email" },
  { key: "website", label: "Website", icon: Globe, placeholder: "https://acme.com" },
];

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function CreateCompanyForm({ onSuccess, onCancel }: CreateCompanyFormProps) {
  // --- HOOKS ---
  const { showToast } = useToast();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CompanyFormData>(INITIAL_FORM_STATE);

  // --- HANDLERS ---
  
  // Hàm xử lý thay đổi input chung
  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cơ bản
    if (!form.companyName.trim()) {
      showToast("Company name is required.", "warning");
      return;
    }

    try {
      setLoading(true);
      
      // Gọi API tạo công ty
      await createCompany(form);
      
      showToast("Company created successfully!", "success");
      onSuccess(); // Callback báo thành công
    } catch (err: any) {
      // Lấy message lỗi từ API trả về
      const errorMessage = err.message || err.detail || "Failed to create company.";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* --- SECTION 1: MAIN INFO --- */}
      <div className="space-y-4">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            value={form.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            placeholder="e.g. Acme Inc."
            className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            autoFocus
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="What does your company do?"
            rows={3}
            className="w-full p-3 border border-slate-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            disabled={loading}
          />
        </div>
      </div>

      <div className="h-px bg-slate-100 my-2"></div>

      {/* --- SECTION 2: CONTACT INFO (GRID) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONTACT_FIELDS.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-slate-400" /> 
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-500 outline-none transition-colors"
                disabled={loading}
              />
            </div>
          );
        })}
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-4">
         <button 
           type="button"
           onClick={onCancel}
           disabled={loading}
           className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
         >
           Cancel
         </button>
         
         <LoadingButton
           text="Create Organization"
           isLoading={loading}
           loadingText="Creating..."
           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm font-medium"
         />
      </div>

    </form>
  );
}