"use client";

import apiClient from "@/lib/apiClient";
import { TaskSummary } from "./apiProject"; // Import TaskSummary từ apiProject để tái sử dụng

// ===================================================
// 🔹 1. INTERFACES (Đã cập nhật để khớp JSON thực tế)
// ===================================================

// Dữ liệu thô từ API Board (GET /board)
export interface RawBoardColumn {
  statusId: number;
  statusName: string;
  color?: string; // Có thể null/undefined từ backend
  order?: number;
  isCompleted?: boolean;
  tasks?: TaskSummary[]; // Danh sách task lồng bên trong
}

// Dữ liệu thô từ API Status List (GET /statuses)
export interface RawStatusColumn {
  id: number;
  name: string;
  color: string;
  sortOrder: number;
  isCompletedStatus: boolean;
  projectId?: number;
}

// Dữ liệu CHUẨN HÓA dùng cho UI (Thống nhất tên trường để dễ dùng)
export interface BoardColumnResponse {
  id: number;
  name: string;
  color: string; 
  position: number;
  isCompletedStatus: boolean;
  tasks: TaskSummary[]; // Luôn đảm bảo là mảng (kể cả rỗng)
}

// Bộ lọc cho Board
export interface BoardFilterParams {
  // 0 = Backlog, > 0 = Sprint cụ thể, null = Tự động lấy Active Sprint
  sprintId?: number | null; 
  
  keyword?: string;             // Tìm kiếm theo tên/code
  assigneeId?: number;          // Lọc theo người được gán
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; 
  taskType?: 'TASK' | 'BUG' | 'STORY';
}

// Payload tạo/sửa cột
export interface StatusPayload {
  name: string;
  color: string;
  isCompletedStatus: boolean;
}

// Payload di chuyển Task
export interface MoveTaskInBoardPayload {
  newStatusId: number;
  newSortOrder?: number | null; // Index mới trong cột (nếu null thì xuống cuối)
}

// ===================================================
// 🔹 2. API: LẤY DỮ LIỆU BOARD (QUAN TRỌNG NHẤT)
// ===================================================

/**
 * 🔹 Lấy dữ liệu Board (Tasks grouped by Status)
 * API này dùng cho màn hình Board chính.
 * GET /companies/{companyId}/workspaces/{workspaceId}/projects/{projectId}/board
 */
export const getProjectBoardData = async (
  companyId: number,    
  workspaceId: number,  
  projectId: number,
  params: BoardFilterParams
): Promise<RawBoardColumn[]> => { // Trả về Raw Data trước
  
  // Clean params: Xóa các key có value undefined/null/rỗng
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );

  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/board`, 
    { params: cleanParams }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Không thể tải dữ liệu Board.");
  }

  return res.data.data as RawBoardColumn[]; 
};

// ===================================================
// 🔹 3. API: THAO TÁC TASK TRÊN BOARD
// ===================================================

/**
 * 🔹 Di chuyển Task giữa các cột (Kéo thả ngang & dọc)
 * PUT /api/tasks/{taskId}/move
 */
export const moveTaskToStatus = async (
  taskId: number,
  payload: MoveTaskInBoardPayload
) => {
  const res = await apiClient.put(
    `/tasks/${taskId}/move`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Không thể di chuyển task.");
  }

  return res.data; // { success, message }
};

// ===================================================
// 🔹 4. API: QUẢN LÝ CỘT (STATUS CRUD)
// ===================================================

/**
 * 🔹 Lấy danh sách trạng thái (cột) đơn thuần (không kèm task)
 * Thường dùng cho trang cài đặt hoặc dropdown chọn trạng thái.
 * GET /api/projects/{projectId}/statuses
 */
export const getProjectStatuses = async (projectId: number): Promise<RawStatusColumn[]> => {
  const res = await apiClient.get(`/projects/${projectId}/statuses`);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data as RawStatusColumn[]; 
};

/**
 * 🔹 Tạo trạng thái mới
 * POST /api/projects/{projectId}/statuses
 */
export const createProjectStatus = async (
  projectId: number,
  payload: StatusPayload
) => {
  const res = await apiClient.post(
    `/projects/${projectId}/statuses`,
    payload
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data; // Trả về cột mới tạo
};

/**
 * 🔹 Cập nhật thông tin trạng thái (tên/màu sắc/flag)
 * PUT /api/projects/{projectId}/statuses/{statusId}
 */
export const updateProjectStatus = async (
  projectId: number,
  statusId: number,
  payload: Partial<StatusPayload> // Cho phép update từng phần
) => {
  const res = await apiClient.put(
    `/projects/${projectId}/statuses/${statusId}`,
    payload
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/**
 * 🔹 Xóa trạng thái (Chỉ khi không có Task)
 * DELETE /api/projects/{projectId}/statuses/{statusId}
 */
export const deleteProjectStatus = async (
  projectId: number,
  statusId: number
) => {
  const res = await apiClient.delete(
    `/projects/${projectId}/statuses/${statusId}`
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data;
};

/**
 * 🔹 Sắp xếp lại thứ tự trạng thái (Kéo thả cột)
 * PUT /api/projects/{projectId}/statuses/reorder
 */
export const reorderProjectStatuses = async (
  projectId: number,
  orderedStatusIds: number[]
) => {
  const res = await apiClient.put(
    `/projects/${projectId}/statuses/reorder`,
    { orderedStatusIds }
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data;
};