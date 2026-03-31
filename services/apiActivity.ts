import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Định nghĩa cấu trúc dữ liệu nhật ký hoạt động (Activity Log)
 */
export interface ActivityLog {
  id: number;
  
  // Thông tin người thực hiện
  userName: string;
  userAvatar: string;
  
  // Loại hành động thực hiện
  action: "CREATE" | "UPDATE" | "DELETE" | "MOVE_STATUS" | "START" | "COMPLETE" | "COMMENT" | string;
  
  // Thông tin đối tượng chịu tác động
  entityType: "TASK" | "PROJECT" | "WORKSPACE" | "SPRINT" | "USER" | "COMPANY" | string;
  entityName: string;
  entityCode?: string | null; // Ví dụ: ECOM-12
  entityId: number;
  
  // Nội dung chi tiết định dạng HTML
  description: string;
  
  // Thông tin thời gian
  timestamp: string;
  timeAgo: string;
  
  // Định danh ngữ cảnh để điều hướng UI
  projectId?: number;
  workspaceId?: number;
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Lấy danh sách lịch sử hoạt động dựa trên phạm vi (Scope)
 * @param scope Phạm vi truy vấn: COMPANY, PROJECT, USER, WORKSPACE
 * @param id ID của đối tượng tương ứng với phạm vi
 * @param page Số thứ tự trang (mặc định 0)
 * @param size Số lượng bản ghi mỗi trang (mặc định 20)
 * @returns Promise danh sách ActivityLog hoặc mảng rỗng nếu có lỗi
 */
export const getActivities = async (
  scope: string, 
  id: number,
  page: number = 0,
  size: number = 20
): Promise<ActivityLog[]> => {
  
  // Kiểm tra tính hợp lệ của ID đầu vào
  if (!id || isNaN(id)) {
    console.warn(`[Activity Service] Invalid ID provided: ${id}`);
    return [];
  }

  try {
    // Chuẩn hóa tham số phạm vi và xây dựng URL
    const formattedScope = scope.toUpperCase(); 
    const url = `/activities/${formattedScope}/${id}`;
    
    // Thực hiện gọi API với tham số phân trang
    const response = await apiClient.get(url, {
      params: { page, size }
    });

    // Trích xuất dữ liệu từ cấu trúc ApiResponse chuẩn
    const { success, message, data } = response.data;
    
    // Trả về dữ liệu nếu yêu cầu thành công và có dữ liệu
    if (success && data) {
      return data;
    }
    
    // Ghi log cảnh báo nếu API phản hồi thất bại từ phía server
    console.warn(`[Activity Service] Fetch failed: ${message}`);
    return [];

  } catch (error: any) {
    // Xử lý lỗi hệ thống hoặc lỗi kết nối mạng
    // Ưu tiên sử dụng thông báo lỗi từ phía Backend
    const apiErrorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";
    
    console.error(`[Activity Service] Exception for ${scope}/${id}: ${apiErrorMessage}`);
    return []; 
  }
};