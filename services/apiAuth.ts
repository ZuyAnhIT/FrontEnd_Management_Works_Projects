import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & PAYLOAD TYPES
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
// 1. Core Authentication
// -----------------------------------------------------------------------------

/**
 * Đăng ký tài khoản người dùng mới
 */
export const registerUser = async (payload: RegisterPayload) => {
  const res = await apiClient.post("/auth/register", payload);
  const data = res.data;

  // Kiểm tra trạng thái thành công từ Backend
  if (!data.success) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
};

/**
 * Xác thực địa chỉ email qua mã OTP
 */
export const verifyEmail = async (payload: VerifyEmailPayload) => {
  const res = await apiClient.post("/auth/verify-email", payload);
  const data = res.data;

  if (!data.success) {
    throw new Error(data.message || "Email verification failed");
  }
  return data;
};

/**
 * Đăng nhập hệ thống bằng Email và Password
 */
export const loginUser = async (payload: LoginPayload) => {
  const res = await apiClient.post("/auth/login", payload);
  const data = res.data;

  if (!data.success) {
    throw new Error(data.message || "Login failed");
  }

  // Lưu trữ token xác thực vào bộ nhớ cục bộ
  if (data.data?.accessToken && data.data?.refreshToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }

  return data;
};

/**
 * Đăng nhập thông qua tài khoản Google
 */
export const loginWithGoogle = async (googleToken: string) => {
  const res = await apiClient.post("/auth/google", { googleToken });
  const data = res.data;

  if (!data.success) {
    throw new Error(data.message || "Google login failed");
  }

  if (data.data?.accessToken && data.data?.refreshToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }

  return data;
};

/**
 * Đăng xuất và làm sạch dữ liệu phiên làm việc
 */
export const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  try {
    // Thông báo cho Server hủy bỏ phiên làm việc
    if (refreshToken) {
      await apiClient.post("/auth/logout", { refreshToken });
    }
  } catch (error: any) {
    // Log lỗi phục vụ debug, ưu tiên thông báo từ server
    const msg = error?.response?.data?.message || error.message;
    console.warn(`[Auth Service] Logout warning: ${msg}`);
  } finally {
    // Đảm bảo xóa sạch dữ liệu client trong mọi trường hợp
    localStorage.clear();
  }
};

// -----------------------------------------------------------------------------
// 2. Invitation Logic
// -----------------------------------------------------------------------------

/**
 * Đăng ký tài khoản thông qua lời mời gia nhập công ty
 */
export const registerFromInvite = async (payload: InviteRegisterPayload) => {
  try {
    const res = await apiClient.post("/auth/register-from-invite", payload);
    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Invitation registration failed");
    }
    return data.data;

  } catch (err: any) {
    // Truy xuất thông báo lỗi chi tiết từ Backend
    const serverMessage = err.response?.data?.message;
    throw new Error(serverMessage || "System error during invitation registration");
  }
};

/**
 * Đăng ký tài khoản thông qua lời mời gia nhập dự án
 */
export const registerFromProjectInvite = async (payload: InviteRegisterPayload) => {
  try {
    const res = await apiClient.post("/auth/register-from-project-invite", payload);
    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Project invitation registration failed");
    }
    return data.data; 

  } catch (err: any) {
    const serverMessage = err.response?.data?.message;
    throw new Error(serverMessage || "System error during project invitation registration");
  }
};

// -----------------------------------------------------------------------------
// 3. Password Management
// -----------------------------------------------------------------------------

/**
 * Gửi yêu cầu khôi phục mật khẩu qua Email
 */
export const forgotPassword = async (email: string) => {
  const res = await apiClient.post("/auth/forgot-password", { email });
  const data = res.data;

  if (!data.success) {
    throw new Error(data.message || "Failed to send reset request");
  }
  return data;
};

/**
 * Thiết lập mật khẩu mới bằng mã xác thực (Token)
 */
export const resetPassword = async (payload: ResetPasswordPayload) => {
  const res = await apiClient.post("/auth/reset-password", payload);
  const data = res.data;

  if (!data.success) {
    throw new Error(data.message || "Failed to reset password");
  }
  return data;
};