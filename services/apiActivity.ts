import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

// Định nghĩa cấu trúc dữ liệu Activity Log chuẩn
export interface ActivityLog {
  id: number;
  
  // Thông tin người thực hiện
  userName: string;
  userAvatar: string;
  
  // Thông tin hành động
  action: "CREATE" | "UPDATE" | "DELETE" | "MOVE_STATUS" | "START" | "COMPLETE" | "COMMENT" | string;
  
  // Thông tin đối tượng bị tác động
  entityType: "TASK" | "PROJECT" | "WORKSPACE" | "SPRINT" | "USER" | "COMPANY" | string;
  entityName: string;
  entityCode?: string | null; // Ví dụ: "ECOM-12"
  entityId: number;
  
  // Nội dung chi tiết (HTML)
  description: string;
  
  // Thời gian
  timestamp: string;
  timeAgo: string;
  
  // Context để điều hướng (quan trọng cho tính năng click)
  projectId?: number;
  workspaceId?: number;
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Lấy danh sách hoạt động dựa trên phạm vi (Scope)
 * * @param scope Phạm vi: "COMPANY" | "PROJECT" | "USER" | "WORKSPACE"
 * @param id ID của đối tượng scope (ví dụ: companyId, projectId...)
 * @param page Trang hiện tại (mặc định 0)
 * @param size Số lượng item (mặc định 20)
 * @returns Promise<ActivityLog[]> Danh sách hoạt động hoặc mảng rỗng nếu lỗi
 */
export const getActivities = async (
  scope: string, 
  id: number,
  page: number = 0,
  size: number = 20
): Promise<ActivityLog[]> => {
  
  // 1. Validation: Kiểm tra ID hợp lệ
  if (!id || isNaN(id)) {
    // Log cảnh báo nhẹ nhàng cho dev biết
    console.warn(`[ActivityAPI] Invalid ID provided: ${id}`);
    return [];
  }

  try {
    // 2. Prepare Data: Chuẩn hóa dữ liệu đầu vào
    const formattedScope = scope.toUpperCase(); 
    const url = `/activities/${formattedScope}/${id}`;
    
    // 3. API Call
    const response = await apiClient.get(url, {
      params: { page, size }
    });

    // Destructuring dữ liệu từ ApiResponse chuẩn (success, message, data)
    const { success, message, data } = response.data;
    
    // 4. Handle Success: Chỉ trả về data khi success = true
    if (success && data) {
      return data;
    }
    
    // 5. Handle Logical Error: API trả về nhưng báo lỗi (success = false)
    // Sử dụng 'message' từ API để log lý do
    console.warn(`[ActivityAPI] Request failed. Server message: ${message}`);
    return [];

  } catch (error: any) {
    // 6. Handle Network/System Error
    // Ưu tiên lấy message từ response lỗi của API nếu có
    const apiErrorMessage = error.response?.data?.message || error.message || "Unknown error";
    
    console.error(`[ActivityAPI] Exception while fetching logs for ${scope}/${id}: ${apiErrorMessage}`);
    return []; 
  }
};