"use client";
import { useEffect, useState } from "react";
import { getCurrentUser, updateUserProfile } from "@/services/apiUser";
import { useToast } from "@/components/ui/ToastProvider";
import { User, Calendar, Phone, ImageIcon, Save } from "lucide-react";

type GenderType = "MALE" | "FEMALE" | "OTHER";

interface ProfileForm {
  fullName: string;
  avatarUrl: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: GenderType;
  email?: string; // để hiển thị thêm email từ API
}

export default function ProfilePage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    avatarUrl: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "MALE",
    email: "",
  });

  // 🧩 Lấy thông tin người dùng hiện tại
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getCurrentUser();
        setForm({
          fullName: user.fullName || "",
          avatarUrl: user.avatarUrl || "",
          phoneNumber: user.phoneNumber || "",
          dateOfBirth: user.dateOfBirth || "",
          gender: (user.gender as GenderType) || "MALE",
          email: user.email || "",
        });
      } catch (err: any) {
        showToast(err.message || "Không thể tải thông tin cá nhân", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

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
        gender: form.gender as GenderType,
      });
      showToast("✅ Cập nhật thông tin thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "❌ Không thể cập nhật thông tin!", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-gray-500 text-center">Đang tải thông tin...</div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* 🧍 Header thông tin */}
        <div className="flex items-center gap-3 mb-6">
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
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          )}

          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Nhập họ và tên"
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="Nhập số điện thoại"
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ngày sinh
            </label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={form.dateOfBirth || ""}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Giới tính
            </label>
            <select
              value={form.gender}
              onChange={(e) =>
                handleChange("gender", e.target.value as GenderType)
              }
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          {/* Ảnh đại diện */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ảnh đại diện (URL)
            </label>
            <div className="relative mt-1">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.avatarUrl}
                onChange={(e) => handleChange("avatarUrl", e.target.value)}
                placeholder="Dán URL ảnh đại diện"
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 🔍 Preview ảnh */}
            {form.avatarUrl && (
              <div className="mt-3 flex justify-center">
                <img
                  src={form.avatarUrl}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full object-cover border"
                />
              </div>
            )}
          </div>

          {/* Nút lưu */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg transition ${
                saving
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700 active:scale-[0.98]"
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
