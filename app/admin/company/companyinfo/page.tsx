"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Check,
  Layout,
  Loader2,
  Image as ImageIcon,
  Camera,
  UploadCloud,
} from "lucide-react";

// Services & Context
import { getCompanyById, updateCompany } from "@/services/apiCompany";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

// UI Components
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Cards";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. UTILS
// =============================================================================

/**
 * Chuan hoa duong dan anh tu Backend hoac Preview
 */
const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("blob:") || path.startsWith("http")) return path;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
  let cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (!cleanPath.startsWith("uploads/")) cleanPath = `uploads/${cleanPath}`;

  return `${API_URL}/${cleanPath}`;
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function CompanyInfoPage() {
  // ---------------------------------------------------------------------------
  // 4. HOOKS, CONTEXT & REFS
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const { activeCompany, refreshUser, isLoading: isAuthLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const companyId = activeCompany?.companyId || null;

  // ---------------------------------------------------------------------------
  // 5. STATE MANAGEMENT
  // ---------------------------------------------------------------------------

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form du lieu text
  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    address: "",
    phoneNumber: "",
    email: "",
    website: "",
  });

  // State xu ly File Logo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 6. DATA FETCHING (Handlers)
  // ---------------------------------------------------------------------------

  /**
   * Tai thong tin chi tiet cong ty tu server
   */
  const fetchCompanyDetails = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getCompanyById(companyId);

      setFormData({
        companyName: data.companyName || "",
        description: data.description || "",
        address: data.address || "",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        website: data.website || "",
      });

      setLogoPreview(getFullImageUrl(data.logo));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load company profile";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, showToast]);

  // ---------------------------------------------------------------------------
  // 7. SIDE EFFECTS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isAuthLoading) {
      fetchCompanyDetails();
    }
  }, [isAuthLoading, fetchCompanyDetails]);

  /**
   * Don dep bo nho cho URL Preview khi component bi huy
   */
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // ---------------------------------------------------------------------------
  // 8. EVENT HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Cap nhat gia tri input vao state
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Xu ly logic chon file va hien thi xem truoc
   */
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size exceeds 5MB limit", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("Invalid file type. Please upload an image", "error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setSelectedFile(file);
  };

  /**
   * Gui du lieu cap nhat len server
   */
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    if (!formData.companyName.trim()) {
      showToast("Company name is required", "warning");
      return;
    }

    try {
      setIsSaving(true);
      await updateCompany(companyId, {
        ...formData,
        logoFile: selectedFile,
      });

      showToast("Company profile updated successfully", "success");
      await refreshUser();

      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to update profile";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 9. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] gap-3">
        <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin" />
        <p className="text-[13px] font-bold text-[#42526E] uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] p-6">
        <div className="max-w-md w-full text-center p-12 bg-white rounded-2xl border border-[#DFE1E6] shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#F4F5F7] rounded-full flex items-center justify-center border border-[#DFE1E6]">
            <Building2 className="w-10 h-10 text-[#6B778C]" />
          </div>
          <h3 className="text-xl font-black text-[#172B4D] tracking-tight">No Active Workspace</h3>
          <p className="text-[#42526E] text-sm mt-2 leading-relaxed">
            Please select a company from your dashboard to manage its profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-10">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white border border-[#DFE1E6] rounded-2xl flex items-center justify-center shadow-sm overflow-hidden p-1 shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-10 h-10 text-[#DFE1E6]" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">Company Profile</h1>
              <p className="text-[14px] text-[#42526E] font-medium mt-1">
                Configure details for <span className="text-[#0052CC] font-bold">{activeCompany?.companyName}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={handleProfileSubmit}
            disabled={isSaving}
            className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-8 rounded-lg shadow-md active:scale-95 transition-all min-w-[160px]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2 stroke-[3]" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleProfileSubmit} className="space-y-8">
          
          {/* CARD 1: GENERAL INFORMATION */}
          <Card className="border-[#DFE1E6] shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#FAFBFC] border-b border-[#DFE1E6] px-8 py-5">
              <CardTitle className="text-[13px] font-black text-[#42526E] uppercase tracking-[0.2em] flex items-center gap-3">
                <Layout className="w-4 h-4 opacity-70" /> General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              
              {/* LOGO UPLOAD BOX */}
              <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center p-6 bg-[#F4F5F7] rounded-2xl border border-dashed border-[#DFE1E6] transition-colors hover:border-[#0052CC]">
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-28 h-28 bg-white border-2 border-white shadow-md rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.02]">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-[#DFE1E6]" />
                    )}
                    <div className="absolute inset-0 bg-[#091E42]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#0052CC] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                    <UploadCloud className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-[#172B4D] text-base">Corporate Logo</h3>
                  <p className="text-[12px] text-[#6B778C] font-medium leading-relaxed max-w-xs">
                    Click image to upload. Supports JPG, PNG. <br /> Maximum 5MB. Recommended: 512x512px.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelection}
                  />
                </div>
              </div>

              {/* TEXT INPUTS */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">
                    Company Name <span className="text-[#FF5630]">*</span>
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter official company name"
                    className="h-11 border-[#DFE1E6] focus:border-[#0052CC] rounded-lg font-bold text-[#172B4D] placeholder:font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Provide a brief overview of your business operations"
                    rows={4}
                    className="resize-none border-[#DFE1E6] focus:border-[#0052CC] rounded-lg font-medium text-[#42526E] leading-relaxed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: CONTACT DETAILS */}
          <Card className="border-[#DFE1E6] shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#FAFBFC] border-b border-[#DFE1E6] px-8 py-5">
              <CardTitle className="text-[13px] font-black text-[#42526E] uppercase tracking-[0.2em] flex items-center gap-3">
                <MapPin className="w-4 h-4 opacity-70" /> Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid md:grid-cols-2 gap-8">
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Physical Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B778C] group-focus-within:text-[#0052CC] transition-colors" />
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="pl-11 h-11 border-[#DFE1E6] focus:border-[#0052CC] rounded-lg font-medium"
                    placeholder="e.g. 123 Innovation Drive, Tech Park"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B778C] group-focus-within:text-[#0052CC] transition-colors" />
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="pl-11 h-11 border-[#DFE1E6] focus:border-[#0052CC] rounded-lg font-medium"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Corporate Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B778C] group-focus-within:text-[#0052CC] transition-colors" />
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-11 h-11 border-[#DFE1E6] focus:border-[#0052CC] rounded-lg font-medium"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-black text-[#42526E] uppercase tracking-wider px-1">Official Website</label>
                <div className="relative group">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B778C] group-focus-within:text-[#0052CC] transition-colors" />
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="pl-11 h-11 border-[#DFE1E6] focus:border-[#0052CC] rounded-lg font-medium"
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}