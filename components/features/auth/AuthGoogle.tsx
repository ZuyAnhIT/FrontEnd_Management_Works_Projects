"use client";

import { Chrome } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";
import { loginWithGoogle } from "@/app/api/apiAuth";
import { getCurrentUser } from "@/app/api/apiUser";

export default function AuthGoogle() {
    const { showToast } = useToast();
    const router = useRouter();

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const googleToken = credentialResponse.credential;
            if (!googleToken) {
                showToast("Không lấy được Google token!", "error");
                return;
            }

            // 🟢 Gọi API đăng nhập Google
            const res = await loginWithGoogle(googleToken);

            if (!res?.data?.accessToken) {
                showToast(res.message || "Đăng nhập Google thất bại!", "error");
                return;
            }

            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);

            // 🟢 Lấy thông tin user
            const user = await getCurrentUser();
            localStorage.setItem("user", JSON.stringify(user));

            // 🟢 Xác định vai trò & điều hướng
            let mainRole = "USER";
            if (user.systemRoles?.length) mainRole = user.systemRoles[0];
            else if (user.company?.roleCode === "COMPANY_ADMIN") mainRole = "COMPANY_ADMIN";
            else if (user.company?.roleCode === "COMPANY_MEMBER") mainRole = "COMPANY_MEMBER";
            else if (user.workspaces?.some((w: any) => w.roleCode === "WORKSPACE_ADMIN"))
                mainRole = "WORKSPACE_ADMIN";
            else if (user.workspaces?.some((w: any) => w.roleCode === "WORKSPACE_MEMBER"))
                mainRole = "WORKSPACE_MEMBER";
            else if (user.projects?.some((p: any) => p.roleCode === "GUEST_PROJECT"))
                mainRole = "GUEST_PROJECT";

            localStorage.setItem("userRole", mainRole);

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
                    router.push("/member");
                    break;
            }

            showToast("Đăng nhập Google thành công!", "success");
        } catch (err: any) {
            showToast(err.message || "Lỗi đăng nhập Google!", "error");
        }
    };

    return (
        <div className=" hover:bg-gray-50 transition">
            
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => showToast("Đăng nhập Google thất bại!", "error")}
                useOneTap
            />
        </div>
    );
}
