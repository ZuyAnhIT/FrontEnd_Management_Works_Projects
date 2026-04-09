import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES & TYPES (MODELS)
// =============================================================================

/**
 * Thông tin công ty tóm tắt hiển thị trên bảng danh sách quản trị
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
 * Cấu trúc phản hồi phân trang dùng chung cho hệ thống quản trị
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

/**
 * Dữ liệu lịch sử giao dịch thanh toán của công ty
 */
export interface TransactionDTO {
    id: number;
    transactionCode: string;
    gatewayTransactionId: string | null;
    planName: string;
    amount: number;
    currency: string;
    billingCycle: string;
    paymentMethod: string;
    status: "SUCCESS" | "FAILED" | "PENDING";
    paidAt: string | null;
    createdAt: string;
}

/**
 * Tham số lọc lịch sử giao dịch
 */
export interface TransactionFilterParams {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

// =============================================================================
// 2. SYSTEM ADMINISTRATION APIs
// =============================================================================

/**
 * Tìm kiếm và lọc nâng cao danh sách công ty
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
    const errorMsg = err.response?.data?.message || "An error occurred while fetching companies";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn thông tin chi tiết toàn diện (360 View) của một công ty
 */
export const getCompany360View = async (companyId: number): Promise<Tenant360View> => {
  try {
    const res = await apiClient.get(`/admin/companies/${companyId}/detail`);
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
    const res = await apiClient.put(`/admin/companies/${companyId}/suspend`);
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
    const res = await apiClient.put(`/admin/companies/${companyId}/activate`);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to activate company");
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to activate company";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy danh sách lịch sử giao dịch (thanh toán gói cước) của công ty
 */
export const getCompanyTransactions = async (
    companyId: number, 
    params: TransactionFilterParams
): Promise<SystemPageResponse<TransactionDTO>> => {
    try {
        const res = await apiClient.get(`/admin/companies/${companyId}/transactions`, { params });
        
        // Hỗ trợ linh hoạt cho cả 2 chuẩn trả về từ Backend: { data: ... } hoặc trả thẳng { content: ... }
        const data = res.data?.data || res.data;
        
        // Bắt lỗi nếu Backend trả về success: false
        if (res.data?.success === false) {
            throw new Error(res.data?.message || "Failed to retrieve transaction history.");
        }
        
        return data as SystemPageResponse<TransactionDTO>;
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Failed to retrieve transaction history.";
        throw new Error(errorMessage);
    }
};