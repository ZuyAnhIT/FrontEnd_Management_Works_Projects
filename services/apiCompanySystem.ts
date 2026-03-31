import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Thông tin công ty trong hệ thống quản trị
 */
export interface SystemCompany {
  id: number;
  name: string;
  companyCode: string;
  email: string;
  phoneNumber: string | null;
  currentStorageBytes: number;
  isVerifiedTenant: boolean;
  status: "ACTIVE" | "SUSPENDED" | string;
  createdAt: string;
  subscriptionStatus: string;
  currentPeriodEnd: string;
  planCode: string;
  planName: string;
}

/**
 * Tham số tìm kiếm và lọc danh sách công ty
 */
export interface SystemCompanySearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  searchName?: string;
  searchCode?: string;
  searchEmail?: string;
  searchStatus?: string;
  searchPlanCode?: string;
}

/**
 * Cấu trúc phản hồi phân trang dành riêng cho hệ thống quản trị
 */
export interface SystemPageResponse<T> {
  content: T[];
  pageNo: number; 
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * Dữ liệu chi tiết toàn cảnh (360 View) của một công ty/tenant
 */
export interface Tenant360View {
  companyId: number;
  companyName: string;
  email: string;
  status: string;
  createdAt: string;
  
  // Thông tin thanh toán (Billing)
  planCode: string;
  planName: string;
  monthlyPrice: number;
  subscriptionStatus: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  
  // Thông tin hạn mức (Quotas)
  totalMembers: number;
  maxUsers: number;
  totalProjects: number;
  maxProjects: number;
  currentStorageBytes: number;
  maxStorageBytes: number;
  
  // Các cờ cảnh báo giới hạn (Flags)
  isGracePeriod: boolean;
  isUserLimitExceeded: boolean;
  isProjectLimitExceeded: boolean;
  isStorageLimitExceeded: boolean;
}

// =============================================================================
// SYSTEM ADMINISTRATION APIs
// =============================================================================

/**
 * Tìm kiếm và lọc nâng cao danh sách công ty (Dành cho System Admin)
 */
export const searchSystemCompanies = async (
  params: SystemCompanySearchParams
): Promise<SystemPageResponse<SystemCompany>> => {
  try {
    const res = await apiClient.get(`/admin/companies/search`, { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load company list");
    }
    return data;
  } catch (err: any) {
    // Ưu tiên thông báo lỗi từ phía backend
    const errorMsg = err.response?.data?.message || "An error occurred while fetching companies";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn thông tin chi tiết toàn diện (360 View) của một công ty
 */
export const getCompany360View = async (companyId: number): Promise<Tenant360View> => {
  try {
    const url = `/admin/companies/${companyId}/detail`;
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch tenant details");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to load tenant information";
    throw new Error(errorMsg);
  }
};

/**
 * Thực hiện khóa hoặc đình chỉ hoạt động của một công ty
 */
export const suspendCompany = async (companyId: number): Promise<void> => {
  try {
    const url = `/admin/companies/${companyId}/suspend`;
    const res = await apiClient.put(url);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to suspend company");
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to suspend company";
    throw new Error(errorMsg);
  }
};

/**
 * Mở khóa hoặc kích hoạt lại hoạt động cho một công ty
 */
export const activateCompany = async (companyId: number): Promise<void> => {
  try {
    const url = `/admin/companies/${companyId}/activate`;
    const res = await apiClient.put(url);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to activate company");
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to activate company";
    throw new Error(errorMsg);
  }
};