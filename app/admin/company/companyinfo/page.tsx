"use client";

import { useEffect, useState, useRef } from "react";
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

import { getCompanyById, updateCompany } from "@/services/apiCompany";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Cards";

// =================================================================
// 1️⃣ HÀM TIỆN ÍCH: XỬ LÝ URL ẢNH (Giữ nguyên logic)
// =================================================================

const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  // 1. Nếu là ảnh preview từ máy (blob:) hoặc ảnh online (http) thì giữ nguyên
  if (path.startsWith("blob:") || path.startsWith("http")) return path;

  // 2. Lấy domain backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

  // 3. Chuẩn hóa đường dẫn (thêm uploads/ nếu thiếu)
  let cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (!cleanPath.startsWith("uploads/")) cleanPath = `uploads/${cleanPath}`;

  return `${API_URL}/${cleanPath}`;
};

// =================================================================
// 2️⃣ MAIN COMPONENT
// =================================================================

export default function CompanyInfoPage() {
  const { showToast } = useToast();
  const { activeCompany, refreshUser, isLoading: isAuthLoading } = useAuth();

  // State quản lý loading
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Ref cho input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lấy ID công ty hiện tại
  const companyId = activeCompany?.companyId || null;

  // State Form dữ liệu text
  const [form, setForm] = useState({
    companyName: "",
    description: "",
    address: "",
    phoneNumber: "",
    email: "",
    website: "",
  });

  // State xử lý File Logo (Upload & Preview)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // =================================================================
  // 3️⃣ USE EFFECT: TẢI DỮ LIỆU CÔNG TY
  // =================================================================
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

        // Đổ dữ liệu vào Form
        setForm({
          companyName: data.companyName || "",
          description: data.description || "",
          address: data.address || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          website: data.website || "",
        });

        // Tạo link preview chuẩn từ dữ liệu server
        setLogoPreview(getFullImageUrl(data.logo));
      } catch (err: any) {
        // Sửa lỗi: Lấy message từ API nếu có
        const message =
          err.message ||
          err.response?.data?.message ||
          "Failed to load company info";
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, isAuthLoading, showToast]);

  // Cleanup URL preview để tránh memory leak khi component unmount
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // =================================================================
  // 4️⃣ HANDLERS: XỬ LÝ SỰ KIỆN (CHANGE, UPLOAD, SUBMIT)
  // =================================================================

  // Xử lý thay đổi input text
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý chọn file ảnh từ máy (Giữ nguyên logic validation)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate kích thước (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      return;
    }
    // Validate định dạng ảnh
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPG, PNG, JPEG)", "error");
      return;
    }

    // Tạo Preview ngay lập tức (UX Instant Feedback)
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    setSelectedFile(file);
  };

  // Xử lý Submit Form (Giữ nguyên logic)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId) return;

    if (!form.companyName.trim()) {
      showToast("Company name is required.", "warning");
      return;
    }

    try {
      setSaving(true);

      // Gọi API updateCompany (truyền file và form data)
      await updateCompany(companyId, {
        ...form,
        logoFile: selectedFile, // Truyền file thực tế vào
      });

      showToast("Company information updated successfully!", "success");

      // 🔄 Quan trọng: Refresh User để cập nhật lại Logo trên Sidebar/Header nếu cần
      await refreshUser();

      // Reset file đã chọn (để input file rỗng)
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
    } catch (err: any) {
      // Sửa lỗi: Lấy message từ API nếu có
      const message =
        err.response?.data?.message || err.message || "Update failed.";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  // =================================================================
  // 5️⃣ RENDER UI
  // =================================================================

  // Màn hình Loading
  if (isAuthLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">
            Loading company details...
          </p>
        </div>
      </div>
    );

  // Màn hình Lỗi (Không có Active Company)
  if (!companyId)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center border-2 border-dashed border-slate-200 p-12 rounded-xl bg-white">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No Active Workspace
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Please select a company from the dashboard to manage.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo Preview nhỏ trên Header */}
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Building2 className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Company Profile
              </h1>
              <p className="text-sm text-slate-500">
                Manage details for{" "}
                <span className="font-semibold text-blue-600">
                  {activeCompany?.companyName}
                </span>
              </p>
            </div>
          </div>

          {/* Nút Save Changes */}
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-6 rounded-[3px] min-w-[120px]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* --- FORM CONTENT --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CARD 1: THÔNG TIN CHUNG & LOGO */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Layout className="w-4 h-4 text-slate-500" /> General
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Khu vực Upload Logo */}
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {/* Logo Display/Preview */}
                  <div className="w-24 h-24 bg-white border-2 border-white shadow-sm rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}

                    {/* Overlay khi hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center rounded-lg">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Icon badge upload */}
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-md border-2 border-white">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">Company Logo</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Click the image to upload. Supports JPG, PNG. <br /> Max
                    size 5MB. Recommended size: 512x512px.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Tên công ty */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="h-10 border-slate-300"
                />
              </div>

              {/* Mô tả */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900">
                  Description
                </label>
                <Textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief description of your company..."
                  rows={3}
                  className="resize-none border-slate-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: THÔNG TIN LIÊN HỆ */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" /> Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid md:grid-cols-2 gap-6">
              {/* Địa chỉ */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-900">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="pl-9 h-10 border-slate-300"
                    placeholder="123 Business Rd, Tech City"
                  />
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    value={form.phoneNumber}
                    onChange={(e) =>
                      handleChange("phoneNumber", e.target.value)
                    }
                    className="pl-9 h-10 border-slate-300"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Email Liên hệ */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="pl-9 h-10 border-slate-300"
                    placeholder="contact@acme.com"
                  />
                </div>
              </div>

              {/* Website */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-900">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    value={form.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    className="pl-9 h-10 border-slate-300"
                    placeholder="https://acme.com"
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
