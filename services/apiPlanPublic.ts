import apiClient from "@/lib/apiClient";

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
  features: string[]; // Trả về mảng các tính năng
}

export interface PublicPageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

/**
 * API 1: Lấy danh sách gói cước mặc định (Public)
 */
export const getPublicPlans = async (
  params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }
): Promise<PublicPageResponse<PublicPlan>> => {
  try {
    const res = await apiClient.get(`/plans`, { params });
    return res.data.data; // Trả về thẳng object PageResponse
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to load pricing plans.");
  }
};

/**
 * API 2: Tìm kiếm gói cước (Public)
 */
export const searchPublicPlans = async (
  searchName: string,
  params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }
): Promise<PublicPageResponse<PublicPlan>> => {
  try {
    const res = await apiClient.get(`/plans/search`, { params: { searchName, ...params } });
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to search pricing plans.");
  }
};

/**
 * API 3: Xem chi tiết một gói cước (Public)
 */
export const getPublicPlanDetail = async (planId: number): Promise<PublicPlan> => {
  try {
    const res = await apiClient.get(`/plans/${planId}`);
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to load plan details.");
  }
};