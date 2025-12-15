import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & PAYLOAD TYPES (Định nghĩa kiểu dữ liệu đầu vào)
// =============================================================================

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface InviteRegisterPayload {
  fullName: string;
  password: string;
  invitationToken: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

// =============================================================================
// AUTHENTICATION API SERVICES
// =============================================================================

// -----------------------------------------------------------------------------
// 1. Core Authentication (Đăng ký, Đăng nhập, Xác thực)
// -----------------------------------------------------------------------------

/**
 * Đăng ký tài khoản mới
 */
export const registerUser = async (payload: RegisterPayload) => {
  const res = await apiClient.post("/auth/register", payload);
  const data = res.data;

  // Sử dụng field 'success' chuẩn của ApiResponse
  if (!data.success) {
    throw new Error(data.message || "Registration failed.");
  }
  return data;
};

/**
 * Xác thực Email (OTP)
 */
export const verifyEmail = async (payload: VerifyEmailPayload) => {
  const res = await apiClient.post("/auth/verify-email", payload);
  const data = res.data;

  if (!data.success) {
    throw new Error(data.message || "Email verification failed.");
  }
  return data;
};

/**
 * Đăng nhập (Login)
 */
export const loginUser = async (payload: LoginPayload) => {
  const res = await apiClient.post("/auth/login", payload);
  const data = res.data;

  // Kiểm tra thành công dựa trên response chuẩn
  if (!data.success) {
    throw new Error(data.message || "Login failed.");
  }

  // Lưu token ngay khi API trả về thành công
  if (data.data?.accessToken && data.data?.refreshToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }

  return data;
};

/**
 * Đăng nhập bằng Google
 */
export const loginWithGoogle = async (googleToken: string) => {
  const res = await apiClient.post("/auth/google", { googleToken });
  const data = res.data;

  if (!data.success) {
    throw new Error(data.message || "Google login failed.");
  }

  if (data.data?.accessToken && data.data?.refreshToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }

  return data;
};

/**
 * Đăng xuất (Logout)
 */
export const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  try {
    // Gọi API logout để hủy token ở server (nếu có)
    if (refreshToken) {
      await apiClient.post("/auth/logout", { refreshToken });
    }
  } catch (error: any) {
    // Log lỗi tiếng Anh, ưu tiên message từ server
    const msg = error?.response?.data?.message || error.message;
    console.warn(`[AuthAPI] Logout warning: ${msg}`);
  } finally {
    // Luôn luôn xóa data ở client dù API có lỗi hay không
    localStorage.clear();
  }
};

// -----------------------------------------------------------------------------
// 2. Invitation Logic (Đăng ký từ lời mời)
// -----------------------------------------------------------------------------

/**
 * Đăng ký từ lời mời Company (Invitation)
 */
export const registerFromInvite = async (payload: InviteRegisterPayload) => {
  try {
    const res = await apiClient.post("/auth/register-from-invite", payload);
    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Registration from invitation failed.");
    }
    return data.data;

  } catch (err: any) {
    // Ưu tiên message lỗi chi tiết từ API trả về
    const serverMessage = err.response?.data?.message;
    throw new Error(serverMessage || "System error during invitation registration.");
  }
};

/**
 * Đăng ký từ lời mời Project
 */
export const registerFromProjectInvite = async (payload: InviteRegisterPayload) => {
  try {
    const res = await apiClient.post("/auth/register-from-project-invite", payload);
    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Registration from project invitation failed.");
    }
    // Trả về { accessToken, refreshToken, ... }
    return data.data; 

  } catch (err: any) {
    const serverMessage = err.response?.data?.message;
    throw new Error(serverMessage || "System error during project invitation registration.");
  }
};

// -----------------------------------------------------------------------------
// 3. Password Management (Quên & Đổi mật khẩu)
// -----------------------------------------------------------------------------

/**
 * Quên mật khẩu - Gửi yêu cầu reset
 */
export const forgotPassword = async (email: string) => {
  const res = await apiClient.post("/auth/forgot-password", { email });
  // Lưu ý: Nếu cần xử lý lỗi ở đây, nên thêm check !res.data.success
  return res.data;
};

/**
 * Đặt lại mật khẩu mới
 */
export const resetPassword = async (payload: ResetPasswordPayload) => {
  const res = await apiClient.post("/auth/reset-password", payload);
  return res.data;
};