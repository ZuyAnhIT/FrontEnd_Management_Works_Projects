import apiClient from "@/lib/apiClient";

export interface SystemCompany {
  id: number;
  name: string;
  companyCode: string;
  email: string;
  phoneNumber: string | null;
  currentStorageBytes: number;
  isVerifiedTenant: boolean;
  status: string; // ACTIVE, LOCKED
  createdAt: string;
  subscriptionStatus: string;
  currentPeriodEnd: string;
  planCode: string;
  planName: string;
}

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

export interface SystemPageResponse<T> {
  content: T[];
  pageNo: number; 
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Tenant360View {
  companyId: number;
  companyName: string;
  email: string;
  status: string;
  createdAt: string;
  
  // Billing
  planCode: string;
  planName: string;
  monthlyPrice: number;
  subscriptionStatus: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  
  // Quotas
  totalMembers: number;
  maxUsers: number;
  totalProjects: number;
  maxProjects: number;
  currentStorageBytes: number;
  maxStorageBytes: number;
  
  // Flags
  isGracePeriod: boolean;
  isUserLimitExceeded: boolean;
  isProjectLimitExceeded: boolean;
  isStorageLimitExceeded: boolean;
}


/**
 * Tìm kiếm & Lọc nâng cao danh sách Công ty (Dành riêng cho SYSTEM_ADMIN)
 */
export const searchSystemCompanies = async (
  params: SystemCompanySearchParams
): Promise<SystemPageResponse<SystemCompany>> => {
  try {
    const res = await apiClient.get(`/admin/companies/search`, { params });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch companies.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to load companies.");
  }
};

/**
 * Lấy toàn cảnh 360 độ của một Công ty (Tenant 360 View)
 */
export const getCompany360View = async (companyId: number): Promise<Tenant360View> => {
  try {
    // Đảm bảo URL khớp với cấu hình backend của bạn (có thể thêm /v1 nếu backend yêu cầu)
    const res = await apiClient.get(`/admin/companies/${companyId}/detail`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch tenant details.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to load tenant details.");
  }
};

// Thêm 2 hàm này vào cuối file services/apiCompanySystem.ts (Giữ nguyên các code cũ)

/**
 * Khóa (Đình chỉ) hoạt động của Công ty
 */
export const suspendCompany = async (companyId: number): Promise<void> => {
  try {
    const res = await apiClient.put(`/admin/companies/${companyId}/suspend`);
    const { success, message } = res.data;
    if (!success) throw new Error(message || "Failed to suspend company.");
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to suspend company.");
  }
};

/**
 * Mở khóa (Kích hoạt lại) Công ty
 */
export const activateCompany = async (companyId: number): Promise<void> => {
  try {
    const res = await apiClient.put(`/admin/companies/${companyId}/activate`);
    const { success, message } = res.data;
    if (!success) throw new Error(message || "Failed to activate company.");
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to activate company.");
  }
};

// LƯU Ý: Trong Interface SystemCompany và Tenant360View ở file này, 
// hãy nhẩm hiểu status bây giờ là "ACTIVE" | "SUSPENDED" nhé!