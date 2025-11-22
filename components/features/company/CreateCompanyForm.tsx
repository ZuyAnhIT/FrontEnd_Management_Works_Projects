"use client";

import { useState } from "react";
import { 
  Building2, FileText, MapPin, Phone, Mail, Globe 
} from "lucide-react";
import { createCompany } from "@/services/apiCompany";
import { useToast } from "@/components/ui/ToastProvider";
import LoadingButton from "@/components/ui/LoadingButton";
// Giả định bạn có các component UI cơ bản này, nếu chưa hãy dùng input HTML thường
import InputField from "@/components/features/auth/InputField"; 

interface CreateCompanyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateCompanyForm({ onSuccess, onCancel }: CreateCompanyFormProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // State giữ nguyên như code cũ của bạn
  const [form, setForm] = useState({
    companyName: "",
    description: "",
    address: "",
    phoneNumber: "",
    email: "",
    website: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName.trim()) {
      showToast("Company name is required.", "warning");
      return;
    }

    try {
      setLoading(true);
      // Gọi API tạo công ty
      await createCompany(form);
      showToast("Company created successfully!", "success");
      onSuccess(); // Báo cho component cha biết đã xong
    } catch (err: any) {
      showToast(err.message || "Failed to create company.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* --- Company Name --- */}
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
        />
      </div>

      {/* --- Description --- */}
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
        />
      </div>

      <div className="h-px bg-slate-100 my-2"></div>

      {/* --- Contact Info Grid (2 Cột) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
         {/* Address */}
         <div className="space-y-1.5">
           <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
             <MapPin className="w-3.5 h-3.5 text-slate-400" /> Address
           </label>
           <input
             value={form.address}
             onChange={(e) => handleChange("address", e.target.value)}
             placeholder="123 Main St"
             className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-500 outline-none"
           />
         </div>

         {/* Phone */}
         <div className="space-y-1.5">
           <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
             <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
           </label>
           <input
             value={form.phoneNumber}
             onChange={(e) => handleChange("phoneNumber", e.target.value)}
             placeholder="+1 (555) 000-0000"
             className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-500 outline-none"
           />
         </div>

         {/* Email */}
         <div className="space-y-1.5">
           <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
             <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
           </label>
           <input
             type="email"
             value={form.email}
             onChange={(e) => handleChange("email", e.target.value)}
             placeholder="contact@acme.com"
             className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-500 outline-none"
           />
         </div>

         {/* Website */}
         <div className="space-y-1.5">
           <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
             <Globe className="w-3.5 h-3.5 text-slate-400" /> Website
           </label>
           <input
             value={form.website}
             onChange={(e) => handleChange("website", e.target.value)}
             placeholder="https://acme.com"
             className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-500 outline-none"
           />
         </div>
      </div>

      {/* --- Footer Actions --- */}
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
           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm"
         />
      </div>

    </form>
  );
}