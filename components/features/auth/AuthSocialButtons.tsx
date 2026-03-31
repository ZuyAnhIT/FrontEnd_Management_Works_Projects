"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

// Thư viện bên ngoài
import React, { useState, useCallback } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

// Internal Services
import { loginWithGoogle } from "@/services/apiAuth";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface AuthSocialButtonsProps {
  onAuthSuccess: (data: { accessToken: string; refreshToken: string }) => Promise<void>;
  onError: (message: string) => void;
  setLoading: (isLoading: boolean) => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần các nút đăng nhập mạng xã hội (Social Authentication).
 * Hiện tại hỗ trợ Google OAuth 2.0 với quy trình trao đổi ID Token lấy App Token.
 */
export default function AuthSocialButtons({
  onAuthSuccess,
  onError,
  setLoading,
}: AuthSocialButtonsProps) {
  
  // ---------------------------------------------------------------------------
  // 4. STATE
  // ---------------------------------------------------------------------------
  
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------------------------------------------------------------------------
  // 5. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý khi xác thực thành công phía Google Client
   * ID Token sẽ được gửi về Backend để định danh và khởi tạo phiên làm việc
   */
  const handleGoogleSuccess = useCallback(async (credentialResponse: CredentialResponse) => {
    const googleToken = credentialResponse.credential;
    
    if (!googleToken) {
      onError("Google identity token was not found");
      return;
    }

    setIsProcessing(true);
    setLoading(true);

    try {
      // Gọi API trao đổi token với Backend
      const response = await loginWithGoogle(googleToken);

      if (!response?.data?.accessToken) {
        throw new Error(response.message || "Server authentication failed");
      }

      // Thông báo thành công cho thành phần cha
      await onAuthSuccess(response.data);

    } catch (error: any) {
      // Ưu tiên message lỗi từ API backend
      const errorMessage = error.response?.data?.message || error.message || "Social login failed";
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  }, [onAuthSuccess, onError, setLoading]);

  /**
   * Xử lý các lỗi phát sinh từ cửa sổ Popup của Google
   */
  const handleGoogleError = useCallback(() => {
    onError("Google login process was interrupted or failed");
  }, [onError]);

  // ---------------------------------------------------------------------------
  // 6. RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-1 duration-500">
      <div className="flex justify-center w-full min-h-[44px]">
        {isProcessing ? (
          // Trạng thái đang xử lý (Loading)
          <div className="flex items-center justify-center w-full h-11 bg-slate-50 border border-slate-200 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          // Nút Google Login tiêu chuẩn
          <div className="w-full overflow-hidden rounded-lg border border-slate-200 hover:border-slate-300 transition-all shadow-sm">
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
    </div>
  );
}