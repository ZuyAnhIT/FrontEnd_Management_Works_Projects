import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES
// =============================================================================

export interface GlobalUser {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  status: "ACTIVE" | "LOCKED" | "DELETED";
  avatarUrl: string | null;
  roles: string[];
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserSearchParams {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface UserPageResponse {
  content: GlobalUser[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// =============================================================================
// 2. API METHODS
// =============================================================================

/**
 * Lấy danh sách người dùng toàn hệ thống (Dành cho Super Admin)
 */
export const getGlobalUsers = async (params: UserSearchParams): Promise<UserPageResponse> => {
  try {
    const res = await apiClient.get(`/admin/users`, { params });
    // Trả về data theo cấu trúc bọc { success: true, data: { content: ... } }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Không thể tải danh sách người dùng";
    throw new Error(errorMsg);
  }
};