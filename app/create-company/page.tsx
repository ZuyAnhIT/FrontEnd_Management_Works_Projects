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
  Save,
  Sparkles,
  Loader2,
} from "lucide-react";
// ⛔️ Sửa đường dẫn nếu cần
import { createCompany } from "@/services/apiCompany";
// ✅ TỐI ƯU: Dùng useAuth
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import LoadingButton from "@/components/ui/LoadingButton";

export default function CreateCompanyPage() {
  const router = useRouter();
  const { showToast } = useToast();
  // ✅ Lấy hàm refreshUser từ Context
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

  // ----------------------------------------------------------------
  // ✅ HÀM SUBMIT ĐÃ ĐƯỢC TỐI ƯU
  // ----------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName.trim()) {
      showToast("Vui lòng nhập tên công ty.", "warning");
      return;
    }

    try {
      setLoading(true);

      // 1. Tạo công ty (Lúc này user vẫn là 'USER' cũ)
      await createCompany(form);

      showToast("Tạo công ty thành công! Đang chuyển hướng...", "success");

      // 2. Báo cho AuthContext: "Lấy user mới đi" (User trở thành COMPANY_ADMIN)
      await refreshUser();

      // 3. ✅ REDIRECT CHỦ ĐỘNG: Chuyển hướng sang trang đích
      // (Vì AuthContext đã set role, việc này sẽ nhanh hơn chờ Guard chạy)
      router.push("/admin");
    } catch (err: any) {
      showToast(err.message || "Không thể tạo công ty mới.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">
                  Tạo công ty mới
                </h1>
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-white/80">
                Bước cuối cùng! Điền thông tin để khởi tạo công ty của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fadeInUp">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên công ty */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                Tên công ty <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Nhập tên công ty"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                required
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Mô tả công ty
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Giới thiệu ngắn gọn về công ty..."
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
            </div>

            {/* Liên hệ */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Địa chỉ công ty"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-500" />
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500" />
                  Email công ty
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  Website
                </label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://company.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <LoadingButton
                type="submit"
                isLoading={loading}
                text="Tạo công ty & Bắt đầu"
                loadingText="Đang tạo công ty..."
                className="w-full md:w-auto px-8 py-4"
                icon={<Save className="w-5 h-5" />}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
