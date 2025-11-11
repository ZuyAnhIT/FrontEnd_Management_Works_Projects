"use client";
import { GoogleLogin } from "@react-oauth/google";
// ⛔️ ĐÂY LÀ LỖI CŨ, ĐẢM BẢO SỬA ĐƯỜNG DẪN NẾU BẠN DI CHUYỂN
import { loginWithGoogle } from "@/services/apiAuth";
import { useState } from "react";
import { Loader2 } from "lucide-react";

// 1. Nhận các hàm điều khiển từ AuthModal
interface AuthSocialButtonsProps {
  onAuthSuccess: (data: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  onError: (message: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export default function AuthSocialButtons({
  onAuthSuccess,
  onError,
  setLoading,
}: AuthSocialButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 2. Xử lý khi Google Login thành công
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsGoogleLoading(true);
    setLoading(true); // Báo cho modal cha biết là đang loading

    try {
      // 3. Lấy ID Token (đây là thứ backend của bạn cần)
      const googleToken = credentialResponse.credential;
      if (!googleToken) {
        throw new Error("Không lấy được Google token!");
      }

      // 4. Gọi API backend của bạn để đổi Google Token lấy App Token
      const res = await loginWithGoogle(googleToken);

      if (!res?.data?.accessToken) {
        throw new Error(res.message || "Đăng nhập Google thất bại!");
      }

      // 5. Báo thành công cho AuthModal (cha) với App Token
      await onAuthSuccess(res.data);
    } catch (err: any) {
      onError(err.message || "Lỗi đăng nhập Google!");
    } finally {
      setIsGoogleLoading(false);
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    onError("Đăng nhập Google thất bại!");
  };

  return (
    <div className="mt-4">
      <div className="relative my-3 text-center text-gray-400 text-xs">
        <span className="bg-white px-2 z-10 relative">hoặc</span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></div>
      </div>

      {/* Chúng ta BẮT BUỘC phải dùng <GoogleLogin> để lấy 'credential' (ID Token)
        mà backend của bạn yêu cầu. 
      */}
      {isGoogleLoading ? (
        <div className="flex justify-center items-center p-2 h-[40px]">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="flex justify-center">
          {/* Component này sẽ render nút "Sign in with Google" của chính Google */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false} // Tắt OneTap để không làm phiền khi modal mở
            width="100%" // Làm cho nút Google co giãn theo container
            theme="outline"
            shape="rectangular"
          />
        </div>
      )}
    </div>
  );
}
