"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import {
  loginUser,
  registerUser,
  verifyEmail,
} from "@/app/api/apiAuth";

import AuthHeader from "./AuthHeader";
import AuthTabs from "./AuthTabs";
import AuthFormLogin from "./AuthFormLogin";
import AuthFormRegister from "./AuthFormRegister";
import AuthFormVerify from "./AuthFormVerify";
import AuthFormForgot from "./AuthFormForgot";
import AuthSocialButtons from "./AuthSocialButtons";

// 🔹 Kiểu dữ liệu form
type AuthFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
};

type AuthTab = "login" | "register" | "verify" | "forgot";

export default function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState<AuthTab>("login");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<AuthFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange =
    (field: keyof AuthFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (tab === "login") {
  if (!form.email || !form.password) {
    showToast("Vui lòng nhập email và mật khẩu!", "warning");
    return;
  }

  try {
    const res = await loginUser({
      email: form.email.trim(),
      matKhau: form.password.trim(),
    });

    if (!res?.data?.accessToken) {
      showToast(res.message || "Đăng nhập thất bại!", "error");
      onClose();
    }

    showToast("Đăng nhập thành công!", "success");
    router.push("/admin"); 
  } catch (err: any) {
    showToast(err.response?.data?.message || "Sai thông tin đăng nhập!", "error");
    onClose();
  }
}


      else if (tab === "register") {
        if (!form.name || !form.email || !form.password || !form.confirmPassword) {
    showToast("Vui lòng nhập đầy đủ thông tin!", "warning");
    return;
  }

  if (form.password !== form.confirmPassword) {
    showToast("Mật khẩu xác nhận không khớp!", "error");
    return;
  }

  const res = await registerUser({
    hoTen: form.name.trim(),
    email: form.email.trim(),
    matKhau: form.password.trim(),
  });
  showToast(res.message || "Vui lòng kiểm tra email để lấy mã OTP!", "info");
  setTab("verify");
      }

      else if (tab === "verify") {
        const res = await verifyEmail({
          email: form.email.trim(),
          otp: form.otp.trim(),
        });
        showToast(res.message || "Xác thực thành công!", "success");
        setTab("login");
      }

      else if (tab === "forgot") {
        if (!form.newPassword || !form.confirmNewPassword) {
          showToast("Vui lòng nhập đầy đủ thông tin!", "warning");
        } else if (form.newPassword !== form.confirmNewPassword) {
          showToast("Mật khẩu xác nhận không khớp!", "error");
        } else {
          showToast("Mật khẩu mới đã được đặt lại thành công!", "success");
          setTab("login");
        }
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all"
      >
        <AuthHeader tab={tab} setTab={setTab} onClose={onClose} />

        <div className="bg-white mx-3 mt-2 mb-4 rounded-xl shadow-sm p-5">
          {(tab === "login" || tab === "register") && (
            <AuthTabs tab={tab} setTab={setTab} />
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "login" && (
              <AuthFormLogin
                form={form}
                handleChange={handleChange as any}
                isLoading={isLoading}
                setTab={setTab as any}
              />
            )}
            {tab === "register" && (
              <AuthFormRegister
                form={form}
                handleChange={handleChange as any}
                isLoading={isLoading}
                setTab={setTab as any}
              />
            )}
            {tab === "verify" && (
              <AuthFormVerify
                form={form}
                handleChange={handleChange as any}
                isLoading={isLoading}
                setTab={setTab as any}
              />
            )}
            {tab === "forgot" && (
              <AuthFormForgot
                form={form}
                handleChange={handleChange as any}
                isLoading={isLoading}
                setTab={setTab as any}
              />
            )}
          </form>

          {(tab === "login" || tab === "register") && <AuthSocialButtons />}
        </div>
      </div>
    </div>
  );
}
