"use client";
import { useState } from "react";
// ⛔️ SỬA LỖI: Import từ 'services/'
import { changeUserPassword } from "@/services/apiUser";
import { useToast } from "@/components/ui/ToastProvider";
import { LockKeyhole, Eye, EyeOff, Loader2 } from "lucide-react";
import LoadingButton from "@/components/ui/LoadingButton"; // Dùng LoadingButton thống nhất

// Tách PasswordInput ra component con
function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full border-2 border-gray-200 rounded-xl px-10 py-3 pr-10 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.oldPassword || !form.newPassword || !form.confirmNewPassword) {
      showToast("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    if (form.newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự.", "warning");
      return;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      showToast("Mật khẩu xác nhận không khớp!", "error");
      return;
    }

    try {
      setIsLoading(true);
      // ⛔️ SỬA LỖI: Import từ 'services/'
      await changeUserPassword(form);
      showToast("✅ Đổi mật khẩu thành công!", "success");
      setForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err: any) {
      showToast(err.message || "❌ Không thể đổi mật khẩu!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 🎨 CHỈ RETURN CARD (Nội dung)
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 sm:p-8 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
          <LockKeyhole className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Đổi mật khẩu</h1>
          <p className="text-sm text-gray-500">
            Cập nhật mật khẩu mới để bảo mật tài khoản của bạn.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mật khẩu hiện tại */}
        <PasswordInput
          label="Mật khẩu hiện tại"
          value={form.oldPassword}
          onChange={(e) => handleChange("oldPassword", e.target.value)}
          placeholder="Nhập mật khẩu hiện tại"
        />

        {/* Mật khẩu mới */}
        <PasswordInput
          label="Mật khẩu mới"
          value={form.newPassword}
          onChange={(e) => handleChange("newPassword", e.target.value)}
          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
        />

        {/* Xác nhận mật khẩu */}
        <PasswordInput
          label="Xác nhận mật khẩu mới"
          value={form.confirmNewPassword}
          onChange={(e) => handleChange("confirmNewPassword", e.target.value)}
          placeholder="Nhập lại mật khẩu mới"
        />

        {/* Nút submit */}
        <div className="pt-4 border-t border-gray-100">
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            text="Lưu thay đổi"
            loadingText="Đang xử lý..."
            className="w-full md:w-auto px-6 py-3" // Thêm padding
          />
        </div>
      </form>
    </div>
  );
}
