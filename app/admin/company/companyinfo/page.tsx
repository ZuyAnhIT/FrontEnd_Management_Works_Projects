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
  Sparkles,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { getCompanyById, updateCompany } from "@/app/api/apiCompany";
import { getCurrentUser } from "@/app/api/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

export default function CompanyInfoPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const [form, setForm] = useState({
    companyName: "",
    description: "",
    logo: "",
    address: "",
    phoneNumber: "",
    email: "",
    website: "",
  });

  // 🧩 1️⃣ Lấy ID công ty từ user hiện tại
  useEffect(() => {
    const fetchUserCompany = async () => {
      try {
        const user = await getCurrentUser();
        const id = user.company?.companyId || null;
        if (!id)
          throw new Error("Tài khoản của bạn chưa thuộc công ty nào.");
        setCompanyId(id);
      } catch (err: any) {
        showToast(
          err.message || "Không thể lấy thông tin người dùng.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUserCompany();
  }, [showToast]);

  // 🧩 2️⃣ Lấy thông tin công ty sau khi có companyId
  useEffect(() => {
    if (!companyId) return;

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
        showToast(err.message || "Không thể tải thông tin công ty.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, showToast]);

  // 🧩 3️⃣ Cập nhật form
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 🧩 4️⃣ Lưu cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId) {
      showToast("Không tìm thấy công ty để cập nhật.", "error");
      return;
    }

    if (!form.companyName.trim()) {
      showToast("Vui lòng nhập tên công ty.", "warning");
      return;
    }

    try {
      setSaving(true);
      await updateCompany(companyId, form);
      showToast("Cập nhật thông tin công ty thành công!", "success");

      // 🔄 Reload lại dữ liệu để đảm bảo đồng bộ
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
      showToast(err.message || "Cập nhật thất bại.", "error");
    } finally {
      setSaving(false);
    }
  };

  // 🧭 5️⃣ Render
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-blue-50/40 to-white">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );

  if (!companyId)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-blue-50/40 to-white">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500">Bạn chưa thuộc công ty nào để xem thông tin.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl p-8 mb-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">Thông tin công ty</h1>
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-white/80">
                Cập nhật thông tin hồ sơ và liên hệ của công ty bạn
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fadeInUp">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                Tên công ty
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Nhập tên công ty"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 outline-none hover:border-gray-300"
              />
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Mô tả
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Giới thiệu ngắn gọn về công ty..."
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 outline-none hover:border-gray-300 resize-none"
              />
            </div>

            {/* Grid Layout for Contact Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Địa chỉ công ty"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 outline-none hover:border-gray-300"
                />
              </div>

              {/* Phone */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-500" />
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300 outline-none hover:border-gray-300"
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500" />
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none hover:border-gray-300"
                />
              </div>

              {/* Website */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  Website
                </label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://company.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all duration-300 outline-none hover:border-gray-300"
                />
              </div>
            </div>

            {/* Logo */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                Logo công ty (URL)
              </label>
              <input
                type="text"
                value={form.logo}
                onChange={(e) => handleChange("logo", e.target.value)}
                placeholder="Dán URL logo công ty"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all duration-300 outline-none hover:border-gray-300"
              />
              {form.logo && (
                <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Preview:</p>
                  <img
                    src={form.logo}
                    alt="Company Logo"
                    className="w-32 h-32 object-contain bg-white rounded-lg shadow-md border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="group relative w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex items-center gap-3">
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Lưu thay đổi</span>
                      <Check className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
      `}</style>
    </div>
  );
}