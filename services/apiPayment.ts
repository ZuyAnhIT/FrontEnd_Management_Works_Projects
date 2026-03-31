import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Thông tin yêu cầu thanh toán gói cước
 */
export interface CheckoutRequest {
  companyId: number;
  planId: number;
  billingCycle: "MONTHLY" | "YEARLY";
  returnUrl: string;
  cancelUrl: string;
}

/**
 * Thông tin phản hồi khi khởi tạo phiên thanh toán
 */
export interface CheckoutResponse {
  transactionCode: string;
  checkoutUrl: string;
}

/**
 * Thông tin gói dịch vụ hiện tại và hạn mức tài nguyên của công ty
 */
export interface MySubscriptionResponse {
  planName: string;
  planCode: string;
  monthlyPrice: number;
  yearlyPrice: number;
  subscriptionStatus: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  currentMembers: number;
  maxMembers: number;
  currentProjects: number;
  maxProjects: number;
  currentStorageBytes: number;
  maxStorageBytes: number;
}

/**
 * Thông tin tóm tắt giao dịch trong danh sách lịch sử
 */
export interface TransactionListResponse {
  transactionCode: string;
  planName: string;
  amount: number;
  status: string; // SUCCESS, PENDING, CANCELLED
  createdAt: string;
}

/**
 * Thông tin chi tiết của một giao dịch (Hóa đơn/Biên lai)
 */
export interface TransactionDetailResponse {
  transactionCode: string;
  createdAt: string;
  paidAt: string | null;
  status: string;
  paymentMethod: string;
  gatewayReferenceCode: string | null;
  originalPrice: number;
  deductedAmount: number;
  finalPaidAmount: number;
  currentPlanName: string;
  subscriptionStatus: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  isPendingCancel: boolean;
}

/**
 * Các tham số dùng để lọc và phân trang lịch sử giao dịch
 */
export interface TransactionHistoryParams {
  companyId: number;
  page?: number;
  size?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Dữ liệu yêu cầu khi thực hiện hủy giao dịch
 */
export interface CancelTransactionPayload {
  companyId: number;
  cancellationReason?: string;
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Truy vấn danh sách lịch sử giao dịch của công ty
 */
export const getTransactionHistory = async (params: TransactionHistoryParams) => {
  try {
    const res = await apiClient.get("/payments/checkout/history", { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch transaction history");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while loading transaction history";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn thông tin chi tiết của một giao dịch cụ thể dựa trên mã giao dịch
 */
export const getTransactionDetail = async (
  transactionCode: string, 
  companyId: number
): Promise<TransactionDetailResponse> => {
  try {
    const res = await apiClient.get(`/payments/checkout/history/${transactionCode}`, {
      params: { companyId }
    });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch transaction details");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while loading transaction details";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn thông tin gói dịch vụ và tình trạng sử dụng tài nguyên hiện tại
 */
export const getMySubscription = async (companyId: number): Promise<MySubscriptionResponse> => {
  try {
    const res = await apiClient.get("/plans/my-subscription", { 
      params: { companyId } 
    });
    const { success, message, data } = res.data;
    
    if (!success) {
      throw new Error(message || "Failed to fetch subscription information");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while loading subscription data";
    throw new Error(errorMsg);
  }
};

/**
 * Khởi tạo phiên thanh toán mới với cổng thanh toán trực tuyến
 */
export const createCheckoutSession = async (payload: CheckoutRequest): Promise<CheckoutResponse> => {
  try {
    const res = await apiClient.post("/payments/checkout", payload);
    const { success, message, data } = res.data;
    
    if (!success) {
      throw new Error(message || "Failed to create checkout session");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while connecting to the payment gateway";
    throw new Error(errorMsg);
  }
};

/**
 * Thực hiện hủy bỏ một giao dịch đang ở trạng thái chờ thanh toán
 */
export const cancelTransaction = async (
  transactionCode: string, 
  payload: CancelTransactionPayload
): Promise<void> => {
  try {
    const url = `/payments/checkout/${transactionCode}/cancel`;
    const res = await apiClient.post(url, payload);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to cancel transaction");
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while canceling transaction";
    throw new Error(errorMsg);
  }
};