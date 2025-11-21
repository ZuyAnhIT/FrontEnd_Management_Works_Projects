"use client";
import apiClient from "@/lib/apiClient";

// ===================================================
// 🧩 Register new account
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
// 🧩 Verify email (OTP)
// ===================================================
export const verifyEmail = async (payload: { email: string; otp: string }) => {
  const res = await apiClient.post("/auth/verify-email", payload);
  const data = res.data;
  if (data.code && data.code !== 200) throw new Error(data.message);
  return data;
};

// ===================================================
// 🧩 Login account
// ===================================================
export const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  const res = await apiClient.post("/auth/login", payload);
  const data = res.data;

  if (!data.success) throw new Error(data.message || "Login failed!");

  if (data.data?.accessToken && data.data?.refreshToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }

  return data;
};

// ===================================================
// 🧩 Logout (clear token)
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
// 🧩 Register from Invitation (Case 1)
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

    // API returns tokens for auto-login
    return data.data; // { accessToken, refreshToken, tokenType }
  } catch (err: any) {
    console.error("Error registering from invitation:", err.response || err);
    throw new Error(
      err.response?.data?.message ||
        "System error, cannot register from invitation."
    );
  }
};

// ===================================================
// 🧩 Forgot password
// ===================================================
export const forgotPassword = async (email: string) => {
  const res = await apiClient.post("/auth/forgot-password", { email });
  return res.data; // response { success, message, data }
};

// ===================================================
// 🧩 Reset password
// ===================================================
export const resetPassword = async (payload: {
  token: string;
  newPassword: string;
}) => {
  const res = await apiClient.post("/auth/reset-password", payload);
  return res.data; // response { success, message, data }
};

// 🧩 Login with Google
// ===================================================
export const loginWithGoogle = async (googleToken: string) => {
  const res = await apiClient.post("/auth/google", { googleToken });
  const data = res.data;

  if (!data.success)
    throw new Error(data.message || "Google login failed!");

  if (data.data?.accessToken && data.data?.refreshToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }

  return data;
};