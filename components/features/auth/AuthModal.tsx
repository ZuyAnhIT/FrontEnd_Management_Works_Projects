"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { loginUser, registerUser, verifyEmail } from "@/app/api/apiAuth";
import { getCurrentUser } from "@/app/api/apiUser"; // ✅ đảm bảo import đúng

import AuthHeader from "./AuthHeader";
import AuthTabs from "./AuthTabs";
import AuthFormLogin from "./AuthFormLogin";
import AuthFormRegister from "./AuthFormRegister";
import AuthFormVerify from "./AuthFormVerify";
import AuthFormForgot from "./AuthFormForgot";
import AuthSocialButtons from "./AuthSocialButtons";

type AuthFormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
  token: string;
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
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    token: "",
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
      // 🔹 Đăng nhập
      if (tab === "login") {
        if (!form.email || !form.password) {
          showToast("Vui lòng nhập email và mật khẩu!", "warning");
          return;
        }

        // 🟢 1. Gọi API login
        const res = await loginUser({
          email: form.email.trim(),
          password: form.password.trim(),
        });

        if (!res?.data?.accessToken) {
          showToast(res.message || "Đăng nhập thất bại!", "error");
          return;
        }

        // 🟢 2. Lưu token
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        // 🟢 3. Lấy thông tin user
        const user = await getCurrentUser();
        localStorage.setItem("user", JSON.stringify(user));

        // 🟢 4. Xác định vai trò chính theo thứ tự ưu tiên
        let mainRole = "USER";

        if (user.systemRoles?.length) {
          mainRole = user.systemRoles[0];
        } else if (user.company?.roleCode === "COMPANY_ADMIN") {
          mainRole = "COMPANY_ADMIN";
        } else if (
          user.workspaces?.some((w: any) => w.roleCode === "WORKSPACE_ADMIN")
        ) {
          mainRole = "WORKSPACE_ADMIN";
        } else if (user.company?.roleCode === "COMPANY_MEMBER") {
          mainRole = "COMPANY_MEMBER";
        } else if (
          user.workspaces?.some((w: any) => w.roleCode === "WORKSPACE_MEMBER")
        ) {
          mainRole = "WORKSPACE_MEMBER";
        } else if (
          user.projects?.some((p: any) => p.roleCode === "GUEST_PROJECT")
        ) {
          mainRole = "GUEST_PROJECT";
        }

        localStorage.setItem("userRole", mainRole);
        console.log("🎯 ROLE DETECTED:", mainRole);

        // 🟢 5. Phân hướng dashboard
        switch (mainRole) {
          case "SYSTEM_ADMIN":
            router.push("/adminss/dashboard");
            break;
          case "COMPANY_ADMIN":
          case "COMPANY_MEMBER":
            router.push("/admin");
            break;
          case "WORKSPACE_ADMIN":
          case "WORKSPACE_MEMBER":
            router.push("/core");
            break;
          case "GUEST_PROJECT":
            router.push("/projects");
            break;
          default:
            router.push("/home");
            break;
        }

        showToast("Đăng nhập thành công!", "success");
      }

      // 🔹 Đăng ký
      else if (tab === "register") {
        if (
          !form.fullName ||
          !form.email ||
          !form.password ||
          !form.confirmPassword
        ) {
          showToast("Vui lòng nhập đầy đủ thông tin!", "warning");
          return;
        }

        if (form.password !== form.confirmPassword) {
          showToast("Mật khẩu xác nhận không khớp!", "error");
          return;
        }

        const res = await registerUser({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
        });

        showToast(
          res.message || "Vui lòng kiểm tra email để lấy mã OTP!",
          "info"
        );
        setTab("verify");
      }

      // 🔹 Xác thực email
      else if (tab === "verify") {
        const res = await verifyEmail({
          email: form.email.trim(),
          otp: form.otp.trim(),
        });
        showToast(res.message || "Xác thực thành công!", "success");
        setTab("login");
      }

      // 🔹 Quên mật khẩu
      else if (tab === "forgot") {
        showToast("Vui lòng nhập thông tin đặt lại mật khẩu!", "info");
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
