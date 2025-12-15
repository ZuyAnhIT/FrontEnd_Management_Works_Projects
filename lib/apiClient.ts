"use client";

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// =============================================================================
// 1. CONFIGURATION
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// =============================================================================
// 2. STATE & HELPERS (Quản lý Refresh Token)
// =============================================================================

// Cờ đánh dấu đang trong quá trình lấy token mới
let isRefreshing = false;

// Hàng đợi các request bị lỗi 401 chờ token mới
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Thêm request vào hàng đợi chờ refresh
 */
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

/**
 * Khi có token mới, chạy lại tất cả request đang chờ
 */
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * Hàm logout bắt buộc & điều hướng an toàn
 */
const forceLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.clear();
    // Chỉ redirect nếu không phải đang ở trang login/home để tránh loop
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }
};

// =============================================================================
// 3. REQUEST INTERCEPTOR (Gắn Token vào Header)
// =============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Kiểm tra môi trường Client (Browser) để tránh lỗi SSR
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =============================================================================
// 4. RESPONSE INTERCEPTOR (Xử lý lỗi & Refresh Token)
// =============================================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu không có response (Lỗi mạng, Server sập), trả về lỗi ngay
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;
    const requestUrl = originalRequest.url || "";

    // ---------------------------------------------------------
    // CASE 1: Xử lý lỗi 403 (Forbidden)
    // ---------------------------------------------------------
    if (status === 403) {
      // 🚨 LOGIC NGHIỆP VỤ:
      // Chỉ Logout khi lỗi đến từ API xác thực danh tính (User Info, Auth)
      // Nếu /users/me mà bị 403 -> Token hỏng/User bị khóa -> Cần đăng nhập lại
      if (requestUrl.includes("/users/me") || requestUrl.includes("/auth/")) {
        forceLogout();
      }

      // Nếu là API nghiệp vụ khác (VD: Sửa dự án, Xóa task...) bị 403
      // -> Nghĩa là User thiếu quyền (Permission Denied) -> KHÔNG LOGOUT.
      // -> Trả về lỗi để UI hiển thị thông báo "Bạn không có quyền...".
      return Promise.reject(error);
    }

    // ---------------------------------------------------------
    // CASE 2: Xử lý lỗi 401 (Unauthorized) - Token hết hạn
    // ---------------------------------------------------------
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu để không loop vô hạn

      let refreshToken = null;
      if (typeof window !== "undefined") {
        refreshToken = localStorage.getItem("refreshToken");
      }

      // Nếu không có refresh token -> Logout ngay
      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      // Nếu đang có tiến trình refresh khác chạy -> Xếp hàng đợi
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      // Bắt đầu quy trình Refresh Token
      isRefreshing = true;
      
      try {
        // Gọi API Refresh (Dùng instance axios thường để tránh interceptor lặp)
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        // Giả sử API trả về: { success: true, data: { accessToken: "..." } }
        const newAccessToken = data.data?.accessToken;

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
        }

        // 1. Cấp lại token cho request hiện tại
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        // 2. Chạy lại các request đang xếp hàng
        onRefreshed(newAccessToken);
        
        // 3. Kết thúc quá trình refresh
        isRefreshing = false;

        // 4. Gọi lại request ban đầu
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh token cũng hết hạn hoặc lỗi -> Logout toàn bộ
        isRefreshing = false;
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    // Các lỗi khác (400, 404, 500...) trả về để UI xử lý
    return Promise.reject(error);
  }
);

export default apiClient;