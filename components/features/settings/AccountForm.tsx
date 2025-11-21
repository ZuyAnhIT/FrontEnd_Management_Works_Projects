"use client";
import { useState } from "react";
import { changeUserPassword } from "@/services/apiUser";
import { useToast } from "@/components/ui/ToastProvider";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";

export default function AccountPage() {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleShow = (field: "old" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.oldPassword || !form.newPassword || !form.confirmNewPassword) {
      showToast("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      showToast("Mật khẩu xác nhận không khớp!", "error");
      return;
    }

    try {
      setIsLoading(true);
      await changeUserPassword(form);
      showToast("✅ Đổi mật khẩu thành công!", "success");
      setForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err: any) {
      showToast(err.message || "❌ Không thể đổi mật khẩu!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
            <LockKeyhole className="w-5 h-5 text-blue-600" />
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
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mật khẩu hiện tại
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword.old ? "text" : "password"}
                value={form.oldPassword}
                onChange={(e) => handleChange("oldPassword", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => toggleShow("old")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.old ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mật khẩu mới
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword.new ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => toggleShow("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={form.confirmNewPassword}
                onChange={(e) =>
                  handleChange("confirmNewPassword", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => toggleShow("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Nút submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-lg text-white font-medium transition ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}
