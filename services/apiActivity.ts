import apiClient from "@/lib/apiClient";

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

/**
 * Lấy danh sách hoạt động dựa trên phạm vi (Scope)
 * @param scope "COMPANY" | "PROJECT" | "USER" | "WORKSPACE"
 * @param id ID của đối tượng scope (ví dụ: companyId, projectId...)
 * @param page Trang hiện tại (mặc định 0)
 * @param size Số lượng item (mặc định 20)
 */
export const getActivities = async (
  scope: string, 
  id: number,
  page: number = 0,
  size: number = 20
): Promise<ActivityLog[]> => {
  // Kiểm tra ID hợp lệ để tránh lỗi 400 không đáng có
  if (!id || isNaN(id)) {
    return [];
  }

  try {
    // Đảm bảo scope luôn viết hoa theo chuẩn Enum backend
    const safeScope = scope.toUpperCase(); 
    const url = `/activities/${safeScope}/${id}`;
    
    const res = await apiClient.get(url, {
      params: { page, size }
    });
    
    if (res.data && res.data.success) {
      return res.data.data;
    }
    
    return [];

  } catch (error: any) {
    // Chỉ log lỗi gọn gàng để dev dễ trace, không làm phiền console production
    console.error(`[ActivityAPI] Failed to fetch logs for ${scope}/${id}:`, error?.message || error);
    return []; 
  }
};