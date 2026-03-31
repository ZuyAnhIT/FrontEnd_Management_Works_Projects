import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Các tính năng chi tiết của gói cước
 */
export interface PlanFeatures {
  api_access: boolean;
  custom_domain: boolean;
  advanced_reports: boolean;
  dedicated_support: boolean;
}

/**
 * Thông tin gói cước trong hệ thống quản trị
 */
export interface SystemPlan {
  id: number;
  planCode: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxWorkspaces: number;
  maxProjects: number;
  maxStorageGb: number;
  features: PlanFeatures;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tham số tìm kiếm và lọc danh sách gói cước
 */
export interface SystemPlanSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  searchName?: string;
  searchPlanCode?: string;
  searchStatus?: boolean; 
}

/**
 * Cấu trúc phản hồi phân trang hệ thống
 */
export interface SystemPageResponse<T> {
  content: T[];
  pageNumber: number; 
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

/**
 * Chi tiết cấu hình một gói cước
 */
export interface PlanDetail {
  id: number;
  planCode: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxWorkspaces: number;
  maxProjects: number;
  maxStorageGb: number;
  features: string[]; 
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dữ liệu yêu cầu để tạo gói cước mới
 */
export interface CreatePlanPayload {
  planCode: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxWorkspaces: number;
  maxProjects: number;
  maxStorageGb: number;
  features: string[];
  isActive: boolean;
}

/**
 * Dữ liệu yêu cầu để cập nhật gói cước
 */
export interface UpdatePlanPayload {
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxWorkspaces: number;
  maxProjects: number;
  maxStorageGb: number;
  features: string[];
  isActive: boolean;
}

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/**
 * Xử lý và chuẩn hóa lỗi trả về từ API
 * Trích xuất các lỗi kiểm tra dữ liệu (Validation) từ Backend nếu có
 */
const handleApiError = (err: any, defaultMessage: string): Error => {
  if (err.response && err.response.data) {
    const { message, data } = err.response.data;
    let finalErrorMessage = message || defaultMessage;

    // Bóc tách lỗi Validation chi tiết từ phía Server
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const validationErrors = Object.values(data)
        .filter((val) => typeof val === "string")
        .join(" | ");
        
      if (validationErrors) {
        finalErrorMessage = `${finalErrorMessage}: ${validationErrors}`;
      }
    }
    return new Error(finalErrorMessage);
  }
  return new Error(err.message || defaultMessage);
};

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Tìm kiếm và liệt kê danh sách các gói cước hệ thống
 */
export const searchSystemPlans = async (
  params: SystemPlanSearchParams
): Promise<SystemPageResponse<SystemPlan>> => {
  try {
    const res = await apiClient.get("/admin/plans/search", { params });
    const { success, message, data } = res.data;
    
    if (!success) {
      throw new Error(message || "Failed to fetch plans");
    }
    return data;
  } catch (err: any) {
    throw handleApiError(err, "Unable to load plans");
  }
};

/**
 * Truy vấn thông tin chi tiết của một gói cước theo định danh
 */
export const getPlanById = async (planId: number): Promise<PlanDetail> => {
  try {
    const res = await apiClient.get(`/admin/plans/${planId}`);
    const { success, message, data } = res.data;
    
    if (!success) {
      throw new Error(message || "Failed to fetch plan details");
    }
    return data;
  } catch (err: any) {
    throw handleApiError(err, "Unable to load plan details");
  }
};

/**
 * Khởi tạo một gói cước dịch vụ mới trong hệ thống
 */
export const createSystemPlan = async (payload: CreatePlanPayload): Promise<PlanDetail> => {
  try {
    const res = await apiClient.post("/admin/plans", payload);
    const { success, message, data } = res.data;
    
    if (!success) {
      throw new Error(message || "Failed to create plan");
    }
    return data;
  } catch (err: any) {
    throw handleApiError(err, "Unable to create plan"); 
  }
};

/**
 * Cập nhật các thông số cấu hình cho gói cước hiện có
 */
export const updateSystemPlan = async (
  planId: number, 
  payload: UpdatePlanPayload
): Promise<PlanDetail> => {
  try {
    const res = await apiClient.put(`/admin/plans/${planId}`, payload);
    const { success, message, data } = res.data;
    
    if (!success) {
      throw new Error(message || "Failed to update plan");
    }
    return data;
  } catch (err: any) {
    throw handleApiError(err, "Unable to update plan"); 
  }
};