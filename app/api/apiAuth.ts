"use client";
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
// 🧩 Xác thực email (OTP)
// ===================================================
export const verifyEmail = async (payload: { email: string; otp: string }) => {
  const res = await apiClient.post("/auth/verify-email", payload);
  const data = res.data;
  if (data.code && data.code !== 200) throw new Error(data.message);
  return data;
};

// ===================================================
// 🧩 Đăng nhập tài khoản
// ===================================================
export const loginUser = async (payload: { email: string; password: string }) => {
  const res = await apiClient.post("/auth/login", payload);
  const data = res.data;

  if (!data.success) throw new Error(data.message || "Đăng nhập thất bại!");  

  if (data.data?.accessToken && data.data?.refreshToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }

  return data;
};

// ===================================================
// 🧩 Đăng xuất (clear token)
// ===================================================
export const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    const res = await apiClient.post("/auth/logout", { refreshToken });
    const data = res.data;
    if (data.code && data.code !== 200) throw new Error(data.message);
    localStorage.clear();
    return data;
  } catch (error) {
    localStorage.clear();
    throw error;
  }
};

// ===================================================
// 🧩 Đăng ký từ lời mời
// ===================================================
export const registerFromInvite = async (payload: {
  fullName: string;
  password: string;
  invitationToken: string;
}) => {
  const res = await apiClient.post("/auth/register-from-invite", payload);
  const data = res.data;

  if (data.code && data.code !== 200) throw new Error(data.message);

  if (data.data?.accessToken && data.data?.refreshToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }
  if (data.data?.user) {
    localStorage.setItem("user", JSON.stringify(data.data.user));
  }

  return data;
};

// ===================================================
// 🧩 Quên mật khẩu
// ===================================================
export const forgotPassword = async (email: string) => {
  const res = await apiClient.post("/auth/forgot-password", { email });
  return res.data; // response { success, message, data }
};

// ===================================================
// 🧩 Đặt lại mật khẩu
// ===================================================
export const resetPassword = async (payload: { token: string; newPassword: string }) => {
  const res = await apiClient.post("/auth/reset-password", payload);
  return res.data; // response { success, message, data }
};


