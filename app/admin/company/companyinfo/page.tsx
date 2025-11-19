"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  FileText,
  Image as ImageIcon,
  Loader2,
  Layout,
  Check
} from "lucide-react";

import { getCompanyById, updateCompany } from "@/services/apiCompany";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/button"; // Giả sử có Button component
import { Input } from "@/components/ui/input";   // Giả sử có Input component
import { Textarea } from "@/components/ui/textarea"; // Giả sử có Textarea component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Giả sử có Card components

export default function CompanyInfoPage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const companyId = user?.company?.companyId || null;

  const [form, setForm] = useState({
    companyName: "",
    description: "",
    logo: "",
    address: "",
    phoneNumber: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    if (isAuthLoading) return;

    if (!companyId) {
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const data = await getCompanyById(companyId);
        setForm({
          companyName: data.companyName || "",
          description: data.description || "",
          logo: data.logo || "",
          address: data.address || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          website: data.website || "",
        });
      } catch (err: any) {
        showToast(err.message || "Failed to load company info", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, isAuthLoading, showToast]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId) return;

    if (!form.companyName.trim()) {
      showToast("Company name is required.", "warning");
      return;
    }

    try {
      setSaving(true);
      await updateCompany(companyId, form);
      showToast("Company information updated successfully!", "success");

      const updated = await getCompanyById(companyId);
      setForm({
        companyName: updated.companyName || "",
        description: updated.description || "",
        logo: updated.logo || "",
        address: updated.address || "",
        phoneNumber: updated.phoneNumber || "",
        email: updated.email || "",
        website: updated.website || "",
      });
    } catch (err: any) {
      showToast(err.message || "Update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (isAuthLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
           <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
           <p className="text-sm text-slate-500 font-medium">Loading company details...</p>
        </div>
      </div>
    );

  if (!companyId && !isAuthLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center border-2 border-dashed border-slate-200 p-12 rounded-xl bg-white">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Company Found</h3>
          <p className="text-slate-500 text-sm mt-1">
            You are not associated with any company yet.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              {/* Logo Preview on Header */}
              <div className="w-14 h-14 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                 {form.logo ? (
                    <img src={form.logo} alt="Logo" className="w-full h-full object-contain" />
                 ) : (
                    <Building2 className="w-6 h-6 text-slate-300" />
                 )}
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
                 <p className="text-sm text-slate-500">Manage your organization details and branding</p>
              </div>
           </div>

           {/* Save Button (Header Action) */}
           <Button 
              onClick={handleSubmit} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-6 rounded-[3px] min-w-[120px]"
           >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {saving ? "Saving..." : "Save Changes"}
           </Button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* General Info Card */}
          <Card className="border border-slate-200 shadow-sm bg-white">
             <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                   <Layout className="w-4 h-4 text-slate-500" /> General Information
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-5">
                {/* Company Name */}
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      Company Name <span className="text-red-500">*</span>
                   </label>
                   <Input
                      value={form.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                   />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      Description
                   </label>
                   <Textarea
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Brief description of your company..."
                      rows={4}
                      className="resize-none border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                   />
                </div>
             </CardContent>
          </Card>

          {/* Contact Info Card */}
          <Card className="border border-slate-200 shadow-sm bg-white">
             <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-slate-500" /> Contact Details
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                {/* Address */}
                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-sm font-semibold text-slate-900">Address</label>
                   <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input
                         value={form.address}
                         onChange={(e) => handleChange("address", e.target.value)}
                         placeholder="123 Business Rd, Tech City"
                         className="pl-9 h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                      />
                   </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-900">Phone Number</label>
                   <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input
                         value={form.phoneNumber}
                         onChange={(e) => handleChange("phoneNumber", e.target.value)}
                         placeholder="+1 (555) 000-0000"
                         className="pl-9 h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                      />
                   </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-900">Email Address</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input
                         type="email"
                         value={form.email}
                         onChange={(e) => handleChange("email", e.target.value)}
                         placeholder="contact@acme.com"
                         className="pl-9 h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                      />
                   </div>
                </div>

                {/* Website */}
                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-sm font-semibold text-slate-900">Website</label>
                   <div className="relative">
                      <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input
                         value={form.website}
                         onChange={(e) => handleChange("website", e.target.value)}
                         placeholder="https://acme.com"
                         className="pl-9 h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                      />
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Branding Card */}
          <Card className="border border-slate-200 shadow-sm bg-white">
             <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                   <ImageIcon className="w-4 h-4 text-slate-500" /> Branding
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-900">Logo URL</label>
                   <Input
                      value={form.logo}
                      onChange={(e) => handleChange("logo", e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
                   />
                </div>
                
                {/* Logo Preview Area */}
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-3">
                    {form.logo ? (
                       <img 
                          src={form.logo} 
                          alt="Company Logo Preview" 
                          className="h-24 w-auto object-contain p-2 bg-white border border-slate-100 rounded-md shadow-sm"
                       />
                    ) : (
                       <div className="h-24 w-24 bg-white border border-slate-100 rounded-md flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                       </div>
                    )}
                    <p className="text-xs text-slate-400 font-medium">Logo Preview</p>
                </div>
             </CardContent>
          </Card>

          {/* Bottom Submit Button (Mobile only) */}
          <div className="md:hidden pt-4">
             <Button 
                type="submit" 
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-bold shadow-lg"
             >
                {saving ? "Saving Changes..." : "Save Changes"}
             </Button>
          </div>

        </form>
      </div>
    </div>
  );
}