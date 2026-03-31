"use client";

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// =============================================================================
// CẤU HÌNH VÀ BIẾN KHỞI TẠO
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082/api";

// Trạng thái phục vụ quá trình làm mới Token (Refresh Token)
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Khởi tạo instance Axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// =============================================================================
// HÀM HỖ TRỢ (HANDLERS)
// =============================================================================

/**
 * Đăng ký yêu cầu vào hàng đợi chờ Token mới
 */
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

/**
 * Thực thi lại các yêu cầu trong hàng đợi sau khi đã có Token mới
 */
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * Thực hiện đăng xuất bắt buộc và điều hướng về trang chủ
 */
const forceLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.clear();
    // Tránh việc lặp điều hướng vô hạn tại trang chủ
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }
};

// =============================================================================
// TRÌNH CAN THIỆP GỬI YÊU CẦU (REQUEST INTERCEPTOR)
// =============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Chỉ truy cập localStorage tại môi trường trình duyệt
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
// TRÌNH CAN THIỆP PHẢN HỒI (RESPONSE INTERCEPTOR)
// =============================================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Trường hợp không nhận được phản hồi từ máy chủ (Lỗi mạng)
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;
    const requestUrl = originalRequest.url || "";

    // -------------------------------------------------------------------------
    // Xử lý lỗi 403: Truy cập bị cấm (Forbidden)
    // -------------------------------------------------------------------------
    if (status === 403) {
      // Chỉ buộc đăng xuất khi lỗi xảy ra tại các luồng xác thực cốt lõi
      if (requestUrl.includes("/users/me") || requestUrl.includes("/auth/")) {
        forceLogout();
      }
      return Promise.reject(error);
    }

    // -------------------------------------------------------------------------
    // Xử lý lỗi 401: Token hết hạn (Unauthorized)
    // -------------------------------------------------------------------------
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      let refreshToken = null;
      if (typeof window !== "undefined") {
        refreshToken = localStorage.getItem("refreshToken");
      }

      // Không có Refresh Token thì không thể làm mới phiên làm việc
      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      // Nếu đang có một tiến trình refresh khác, cho yêu cầu này vào hàng đợi
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

      // Bắt đầu quy trình làm mới Access Token
      isRefreshing = true;
      
      try {
        // Sử dụng instance axios gốc để tránh lặp interceptor
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = data.data?.accessToken;

        if (typeof window !== "undefined" && newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
        }

        // Cấp lại token cho yêu cầu hiện tại
        if (originalRequest.headers && newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        // Giải phóng hàng đợi và kết thúc trạng thái refresh
        onRefreshed(newAccessToken);
        isRefreshing = false;

        return apiClient(originalRequest);

      } catch (refreshError: any) {
        // Nếu làm mới token thất bại (Refresh Token hết hạn), buộc đăng xuất
        isRefreshing = false;
        forceLogout();
        
        const msg = refreshError.response?.data?.message || "Session expired";
        console.warn(`[Auth Service] Token refresh failed: ${msg}`);
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;