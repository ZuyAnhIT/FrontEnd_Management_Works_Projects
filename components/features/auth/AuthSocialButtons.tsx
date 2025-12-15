"use client";

import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { loginWithGoogle } from "@/services/apiAuth";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface AuthSocialButtonsProps {
  onAuthSuccess: (data: { accessToken: string; refreshToken: string }) => Promise<void>;
  onError: (message: string) => void;
  setLoading: (isLoading: boolean) => void;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function AuthSocialButtons({
  onAuthSuccess,
  onError,
  setLoading,
}: AuthSocialButtonsProps) {
  // --- STATE ---
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // --- HANDLERS ---

  /**
   * Xử lý khi người dùng đăng nhập thành công qua Google Popup
   * Quy trình: Lấy ID Token từ Google -> Gửi về Backend -> Nhận App Token
   */
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsGoogleLoading(true);
    setLoading(true); // Báo cho Modal cha biết đang xử lý

    try {
      // 1. Lấy ID Token (Credential) từ phản hồi của Google
      const googleToken = credentialResponse.credential;
      
      if (!googleToken) {
        throw new Error("Google token not found.");
      }

      // 2. Gọi API Backend để xác thực và đổi token
      const res = await loginWithGoogle(googleToken);

      // 3. Kiểm tra kết quả trả về từ Backend
      if (!res?.data?.accessToken) {
        // Ưu tiên hiển thị message từ API trả về
        throw new Error(res.message || "Google login failed.");
      }

      // 4. Thành công: Trả dữ liệu về cho component cha xử lý tiếp
      await onAuthSuccess(res.data);

    } catch (err: any) {
      // Hiển thị lỗi từ API hoặc lỗi mặc định
      onError(err.message || "An error occurred during Google login.");
    } finally {
      setIsGoogleLoading(false);
      setLoading(false);
    }
  };

  /**
   * Xử lý khi Popup Google bị đóng hoặc lỗi kết nối
   */
  const handleGoogleError = () => {
    onError("Google login failed. Please try again.");
  };

  // --- RENDER ---
  return (
    <div className="mt-4">
      {/* Divider: OR */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Button Area */}
      {isGoogleLoading ? (
        <div className="flex justify-center items-center p-2 h-[40px] bg-gray-50 rounded border border-gray-200">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="flex justify-center w-full">
          {/* Lưu ý: Component GoogleLogin được cung cấp bởi thư viện @react-oauth/google.
            Nó tự động render iframe/button của Google.
          */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            width="100%"
            theme="outline"
            size="large"
            shape="rectangular"
            text="signin_with"
          />
        </div>
      )}
    </div>
  );
}