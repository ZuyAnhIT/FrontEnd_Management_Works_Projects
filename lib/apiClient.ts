"use client";

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ==========================
// 🧩 Request Interceptor
// ==========================
apiClient.interceptors.request.use(
  (config) => {
    // Kiểm tra window để tránh lỗi SSR
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// 🔁 Response Interceptor (refresh token + error handling)
// ==========================
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Đợi token mới được cấp → retry các request đang pending
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Hàm logout & redirect an toàn
const forceLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.clear();
    // Chuyển hướng về trang chủ/login nếu không phải đang ở đó
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ CASE 1: Xử lý lỗi 403 (Forbidden) - Token hỏng hoặc không có quyền
    // "Đá" thẳng ra trang chủ để người dùng đăng nhập lại
    if (error.response?.status === 403) {
      forceLogout();
      return Promise.reject(error);
    }

    // ✅ CASE 2: Xử lý lỗi 401 (Unauthorized) - Token hết hạn -> Thử Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      let refreshToken = null;
      if (typeof window !== "undefined") {
        refreshToken = localStorage.getItem("refreshToken");
      }

      // Nếu không có refresh token -> Logout
      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      // Nếu đang có tiến trình refresh khác chạy -> Xếp hàng đợi
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      // Bắt đầu refresh
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = data.data?.accessToken;

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
        }

        // Gọi lại các request đang chờ
        onRefreshed(newAccessToken);
        isRefreshing = false;

        // Gắn token mới và retry request cũ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        // Refresh token cũng hết hạn hoặc lỗi -> Logout toàn bộ
        isRefreshing = false;
        forceLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
