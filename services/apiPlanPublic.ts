import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Thông tin chi tiết của gói cước hiển thị công khai
 */
export interface PublicPlan {
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
}

/**
 * Cấu trúc phản hồi phân trang dành cho các truy vấn công khai
 */
export interface PublicPageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Lấy danh sách các gói cước mặc định cho trang bảng giá
 */
export const getPublicPlans = async (
  params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }
): Promise<PublicPageResponse<PublicPlan>> => {
  try {
    const res = await apiClient.get("/plans", { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Unable to load pricing plans");
    }

    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while loading pricing plans";
    throw new Error(errorMsg);
  }
};

/**
 * Tìm kiếm gói cước dựa trên tên gói
 */
export const searchPublicPlans = async (
  searchName: string,
  params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }
): Promise<PublicPageResponse<PublicPlan>> => {
  try {
    const url = "/plans/search";
    const res = await apiClient.get(url, { 
      params: { searchName, ...params } 
    });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Unable to search pricing plans");
    }

    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while searching pricing plans";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn thông tin chi tiết của một gói cước cụ thể
 */
export const getPublicPlanDetail = async (planId: number): Promise<PublicPlan> => {
  try {
    const res = await apiClient.get(`/plans/${planId}`);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Unable to load plan details");
    }

    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while loading plan details";
    throw new Error(errorMsg);
  }
};