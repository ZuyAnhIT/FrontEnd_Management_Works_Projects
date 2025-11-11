"use client";
import { useEffect, useState } from "react";
// ⛔️ SỬA LỖI: Import từ 'services/'
import { updateUserProfile } from "@/services/apiUser";
import { useToast } from "@/components/ui/ToastProvider";
import { User, Calendar, Phone, ImageIcon, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type GenderType = "MALE" | "FEMALE" | "OTHER";

interface ProfileForm {
  fullName: string;
  avatarUrl: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: GenderType;
  email?: string;
}

export default function ProfilePage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth(); // Lấy từ Context

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    avatarUrl: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "MALE",
    email: "",
  });

  // Set form khi user từ Context đã sẵn sàng
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        avatarUrl: user.avatarUrl || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: (user.gender as GenderType) || "MALE",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName) {
      showToast("Vui lòng nhập họ và tên!", "warning");
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile({
        fullName: form.fullName,
        avatarUrl: form.avatarUrl,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
      });
      showToast("✅ Cập nhật thông tin thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "❌ Không thể cập nhật thông tin!", "error");
    } finally {
      setSaving(false);
    }
  };

  if (isAuthLoading)
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );

  // 🎨 CHỈ RETURN CARD (Nội dung)
  // Bỏ div bọc 'p-6 max-w-3xl'
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 sm:p-8 animate-fadeInUp">
      {/* 🧍 Header thông tin */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-lg">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-sm text-gray-500">
            Cập nhật thông tin tài khoản của bạn tại đây
          </p>
        </div>
      </div>

      {/* ✍️ Form cập nhật */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email (không chỉnh sửa) */}
        {form.email && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              disabled
              className="mt-1 w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
        )}

        {/* 🎨 Grid cho các trường */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Nhập họ và tên"
                className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="Nhập số điện thoại"
                className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày sinh
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={form.dateOfBirth || ""}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới tính
            </label>
            <select
              value={form.gender}
              onChange={(e) =>
                handleChange("gender", e.target.value as GenderType)
              }
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        {/* Ảnh đại diện */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ảnh đại diện (URL)
          </label>
          <div className="relative">
            <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={form.avatarUrl}
              onChange={(e) => handleChange("avatarUrl", e.target.value)}
              placeholder="Dán URL ảnh đại diện"
              className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {form.avatarUrl && (
            <div className="mt-3">
              <img
                src={form.avatarUrl}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 p-1"
              />
            </div>
          )}
        </div>

        {/* Nút lưu */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition ${
              saving
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/30"
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
