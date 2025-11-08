"use client";
import { useEffect, useState } from "react";
import { Building2, MapPin, Phone, Mail, Globe, Save, FileText } from "lucide-react";
import { getCompanyById, updateCompany } from "@/app/api/apiCompany";
import { useToast } from "@/components/ui/ToastProvider";

export default function CompanyInfoPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🧩 Giả định ID công ty (sau này bạn có thể lấy từ user.currentCompanyId)
  const companyId = 1;

  const [form, setForm] = useState({
    companyName: "",
    description: "",
    logo: "",
    address: "",
    phoneNumber: "",
    email: "",
    website: "",
  });

  // 🧩 Lấy thông tin công ty khi load trang
  useEffect(() => {
    const fetchCompany = async () => {
      try {
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
  }, [showToast]);

  // 🧩 Cập nhật form
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 🧩 Lưu cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName) {
      showToast("Vui lòng nhập tên công ty.", "warning");
      return;
    }

    try {
      setSaving(true);
      await updateCompany(companyId, form);
      showToast(" Cập nhật thông tin công ty thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "Cập nhật thất bại.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-6 text-gray-500 text-center">Đang tải thông tin công ty...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Thông tin công ty</h1>
            <p className="text-sm text-gray-500">
              Cập nhật thông tin hồ sơ và liên hệ của công ty bạn.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 🏢 Tên công ty */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên công ty</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="Nhập tên công ty"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* 📝 Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
            <div className="relative mt-1">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Giới thiệu ngắn gọn về công ty..."
                rows={3}
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 🌆 Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Địa chỉ công ty"
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 📞 Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="Nhập số điện thoại"
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 📧 Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contact@company.com"
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 🌐 Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <div className="relative mt-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://company.com"
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 🖼️ Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo (URL)</label>
            <input
              type="text"
              value={form.logo}
              onChange={(e) => handleChange("logo", e.target.value)}
              placeholder="Dán URL logo công ty"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            {form.logo && (
              <div className="mt-3">
                <img
                  src={form.logo}
                  alt="Company Logo"
                  className="w-24 h-24 object-contain border rounded-lg"
                />
              </div>
            )}
          </div>

          {/* 💾 Nút lưu */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg transition ${
                saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
