import apiClient from "@/lib/apiClient";

// ===================================================
// 🧩 Đăng ký tài khoản mới
// ===================================================
export const registerUser = async (payload: {
  fullName: string;
  email: string;
  password: string;
}) => {
  const res = await apiClient.post("/auth/register", payload);
  const data = res.data;
  if (data.code && data.code !== 200) throw new Error(data.message);
  return data;
};

// ===================================================
// 🧩 Xác thực Email (OTP)
// ===================================================
export const verifyEmail = async (payload: { email: string; otp: string }) => {
  const res = await apiClient.post("/auth/verify-email", payload);
  const data = res.data;
  if (data.code && data.code !== 200) throw new Error(data.message);
  return data;
};

// ===================================================
// 🧩 Đăng nhập (Login)
// ===================================================
export const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  const res = await apiClient.post("/auth/login", payload);
  const data = res.data;

  if (!data.success) throw new Error(data.message || "Login failed!");

  // Lưu token ngay khi API trả về thành công
  if (data.data?.accessToken && data.data?.refreshToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }

  return data;
};

// ===================================================
// 🧩 Đăng xuất (Logout)
// ===================================================
export const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    // Gọi API logout để hủy token ở server (nếu có)
    if (refreshToken) {
      await apiClient.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    console.error("Logout API error (ignoring):", error);
  } finally {
    // Luôn luôn xóa data ở client dù API có lỗi hay không
    localStorage.clear();
  }
};

// ===================================================
// 🧩 Đăng ký từ lời mời Company (Invitation)
// ===================================================
export const registerFromInvite = async (payload: {
  fullName: string;
  password: string;
  invitationToken: string;
}) => {
  try {
    const res = await apiClient.post("/auth/register-from-invite", payload);
    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Cannot register from invitation.");
    }
    return data.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "System error, cannot register from invitation."
    );
  }
};

// ✅ Đăng ký từ lời mời Project
export const registerFromProjectInvite = async (payload: {
  fullName: string;
  password: string;
  invitationToken: string;
}) => {
  try {
    const res = await apiClient.post("/auth/register-from-project-invite", payload);
    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Cannot register from project invitation.");
    }
    return data.data; // { accessToken, refreshToken, ... }
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "System error during project registration."
    );
  }
};

// ===================================================
// 🧩 Quên mật khẩu
// ===================================================
export const forgotPassword = async (email: string) => {
  const res = await apiClient.post("/auth/forgot-password", { email });
  return res.data;
};

// ===================================================
// 🧩 Đặt lại mật khẩu mới
// ===================================================
export const resetPassword = async (payload: {
  token: string;
  newPassword: string;
}) => {
  const res = await apiClient.post("/auth/reset-password", payload);
  return res.data;
};

// ===================================================
// 🧩 Đăng nhập bằng Google
// ===================================================
export const loginWithGoogle = async (googleToken: string) => {
  const res = await apiClient.post("/auth/google", { googleToken });
  const data = res.data;

  if (!data.success) throw new Error(data.message || "Google login failed!");

  if (data.data?.accessToken && data.data?.refreshToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }

  return data;
};