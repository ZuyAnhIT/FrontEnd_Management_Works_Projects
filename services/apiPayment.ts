// services/apiPayment.ts
import apiClient from "@/lib/apiClient";

export interface CheckoutRequest {
  companyId: number;
  planId: number;
  billingCycle: "MONTHLY" | "YEARLY";
  returnUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  transactionCode: string;
  checkoutUrl: string;
}

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

export interface TransactionListResponse {
  transactionCode: string;
  planName: string;
  amount: number;
  status: string; // "SUCCESS", "PENDING", "CANCELLED"
  createdAt: string;
}

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

export interface TransactionHistoryParams {
  companyId: number;
  page?: number;
  size?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CancelTransactionPayload {
  companyId: number;
  cancellationReason?: string;
}

/**
 * Lấy danh sách lịch sử giao dịch của công ty
 */
export const getTransactionHistory = async (params: TransactionHistoryParams) => {
  try {
    const res = await apiClient.get(`/payments/checkout/history`, { params });
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Không thể lấy lịch sử giao dịch.");
    return data; // Trả về PageResponseDTO
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Lỗi khi tải lịch sử giao dịch.");
  }
};

/**
 * Lấy chi tiết một giao dịch (Biên lai)
 */
export const getTransactionDetail = async (transactionCode: string, companyId: number): Promise<TransactionDetailResponse> => {
  try {
    const res = await apiClient.get(`/payments/checkout/history/${transactionCode}`, {
      params: { companyId }
    });
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Không thể lấy chi tiết giao dịch.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Lỗi khi tải chi tiết giao dịch.");
  }
};

/**
 * Lấy thông tin Gói cước và Sức khỏe tài nguyên của Công ty hiện tại
 */
export const getMySubscription = async (companyId: number): Promise<MySubscriptionResponse> => {
  try {
    const res = await apiClient.get(`/plans/my-subscription`, { 
        params: { companyId } 
    });
    const { success, message, data } = res.data;
    
    if (!success) throw new Error(message || "Không thể lấy thông tin gói cước.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Lỗi kết nối khi lấy dữ liệu gói cước.");
  }
};

/**
 * Gọi API tạo phiên thanh toán (Checkout Session) với PayOS
 */
export const createCheckoutSession = async (payload: CheckoutRequest): Promise<CheckoutResponse> => {
  try {
    const res = await apiClient.post(`/payments/checkout`, payload);
    const { success, message, data } = res.data;
    
    if (!success) throw new Error(message || "Failed to create checkout session.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Lỗi khi kết nối đến cổng thanh toán.");
  }
};

/**
 * Hủy một giao dịch đang ở trạng thái PENDING
 */
export const cancelTransaction = async (transactionCode: string, payload: CancelTransactionPayload): Promise<void> => {
  try {
    // Lưu ý: Đảm bảo đường dẫn khớp với config backend của bạn
    const res = await apiClient.post(`/payments/checkout/${transactionCode}/cancel`, payload);
    const { success, message } = res.data;
    if (!success) throw new Error(message || "Không thể hủy giao dịch.");
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Lỗi khi thực hiện hủy giao dịch.");
  }
};