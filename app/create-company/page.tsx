"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react";
import { createCompany } from "@/services/apiCompany";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import LoadingButton from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input"; // Giả sử có
import { Textarea } from "@/components/ui/textarea"; // Giả sử có

export default function CreateCompanyPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
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
      await createCompany(form);
      showToast("Company created successfully! Redirecting...", "success");
      await refreshUser();
      router.push("/admin");
    } catch (err: any) {
      showToast(err.message || "Failed to create company.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header Minimalist */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Set up your Company
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Create a new organization to manage your teams, projects, and workspaces.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="e.g. Acme Inc."
                className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="What does your company do?"
                rows={3}
                className="resize-none border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
            </div>

            <div className="h-px bg-slate-100 my-4"></div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Address */}
               <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-slate-500" />
                   Address
                 </label>
                 <Input
                   value={form.address}
                   onChange={(e) => handleChange("address", e.target.value)}
                   placeholder="123 Main St, City"
                   className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                 />
               </div>

               {/* Phone */}
               <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                   <Phone className="w-4 h-4 text-slate-500" />
                   Phone Number
                 </label>
                 <Input
                   value={form.phoneNumber}
                   onChange={(e) => handleChange("phoneNumber", e.target.value)}
                   placeholder="+1 (555) 000-0000"
                   className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                 />
               </div>

               {/* Email */}
               <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                   <Mail className="w-4 h-4 text-slate-500" />
                   Email
                 </label>
                 <Input
                   type="email"
                   value={form.email}
                   onChange={(e) => handleChange("email", e.target.value)}
                   placeholder="contact@acme.com"
                   className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                 />
               </div>

               {/* Website */}
               <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                   <Globe className="w-4 h-4 text-slate-500" />
                   Website
                 </label>
                 <Input
                   value={form.website}
                   onChange={(e) => handleChange("website", e.target.value)}
                   placeholder="https://acme.com"
                   className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                 />
               </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 flex items-center gap-3">
               <LoadingButton
                 text="Create Company"
                 isLoading={loading}
                 loadingText="Creating..."
                 className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-10 px-6 font-bold shadow-sm"
               />
               <button 
                  type="button"
                  onClick={() => router.back()}
                  className="h-10 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
               >
                  Cancel
               </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}