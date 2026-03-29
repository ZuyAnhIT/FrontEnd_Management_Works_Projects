import apiClient from "@/lib/apiClient";

// ============================================================================
// 1. INTERFACES & TYPES
// ============================================================================

export interface PlanFeatures {
  api_access: boolean;
  custom_domain: boolean;
  advanced_reports: boolean;
  dedicated_support: boolean;
}

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

export interface SystemPlanSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  searchName?: string;
  searchPlanCode?: string;
  searchStatus?: boolean; 
}

export interface SystemPageResponse<T> {
  content: T[];
  pageNumber: number; 
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

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

// ============================================================================
// HELPER: XỬ LÝ LỖI VALIDATION TỪ BACKEND
// ============================================================================

/**
 * Hàm hỗ trợ "bóc tách" lỗi. 
 * CẬP NHẬT: Trả về một đối tượng Error thay vì throw trực tiếp
 */
const handleApiError = (err: any, defaultMessage: string): Error => {
  if (err.response && err.response.data) {
    const { message, data } = err.response.data;
    let finalErrorMessage = message || defaultMessage;

    // Bóc tách lỗi Validation
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const validationErrors = Object.values(data)
        .filter(val => typeof val === 'string')
        .join(" | ");
        
      if (validationErrors) {
        finalErrorMessage = `${finalErrorMessage}: ${validationErrors}`;
      }
    }
    return new Error(finalErrorMessage); // Return Error
  }
  return new Error(err.message || defaultMessage); // Return Error
};

// ============================================================================
// 🚀 API METHODS
// ============================================================================

/**
 * Lấy danh sách / Tìm kiếm gói cước
 */
export const searchSystemPlans = async (
  params: SystemPlanSearchParams
): Promise<SystemPageResponse<SystemPlan>> => {
  try {
    const res = await apiClient.get(`/admin/plans/search`, { params });
    const { success, message, data } = res.data;
    
    if (!success) throw new Error(message || "Failed to fetch plans.");
    return data;
  } catch (err: any) {
    throw handleApiError(err, "Unable to load plans.");
  }
};

/**
 * Lấy chi tiết cấu hình của một gói cước
 */
export const getPlanById = async (planId: number): Promise<PlanDetail> => {
  try {
    const res = await apiClient.get(`/admin/plans/${planId}`);
    const { success, message, data } = res.data;
    
    if (!success) throw new Error(message || "Failed to fetch plan details.");
    return data;
  } catch (err: any) {
    throw handleApiError(err, "Unable to load plan details.");
  }
};

/**
 * Tạo mới gói cước
 */
export const createSystemPlan = async (payload: CreatePlanPayload): Promise<PlanDetail> => {
  try {
    const res = await apiClient.post(`/admin/plans`, payload);
    const { success, message, data } = res.data;
    
    if (!success) throw new Error(message || "Failed to create plan.");
    return data;
  } catch (err: any) {

    throw handleApiError(err, "Unable to create plan."); 
  }
};

/**
 * Cập nhật cấu hình gói cước
 */
export const updateSystemPlan = async (planId: number, payload: UpdatePlanPayload): Promise<PlanDetail> => {
  try {
    const res = await apiClient.put(`/admin/plans/${planId}`, payload);
    const { success, message, data } = res.data;
    
    if (!success) throw new Error(message || "Failed to update plan.");
    return data;
  } catch (err: any) {
    throw handleApiError(err, "Unable to update plan."); 
  }
};