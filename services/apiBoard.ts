"use client";

import apiClient from "@/lib/apiClient";
import { TaskSummary } from "./apiProject";

// =============================================================================
// 1. INTERFACES & TYPES (Định nghĩa kiểu dữ liệu)
// =============================================================================

// -----------------------------------------------------------------------------
// Response Types (Dữ liệu trả về từ API)
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Filter & Payload Types (Dữ liệu gửi đi)
// -----------------------------------------------------------------------------

// Bộ lọc cho Board
export interface BoardFilterParams {
  // 0 = Backlog, > 0 = Sprint cụ thể, null = Tự động lấy Active Sprint
  sprintId?: number | null;
  
  keyword?: string;           // Tìm kiếm theo tên/code
  assigneeId?: number;        // Lọc theo người được gán
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

// =============================================================================
// 2. BOARD VIEW APIs (Hiển thị dữ liệu Board)
// =============================================================================

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
): Promise<RawBoardColumn[]> => {
  
  // Clean params: Xóa các key có value undefined/null/rỗng
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );

  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/board`,
      { params: cleanParams }
    );

    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load board data.");
    }

    return data as RawBoardColumn[];

  } catch (error: any) {
    // Re-throw lỗi với message chuẩn để UI hiển thị
    throw new Error(error.response?.data?.message || error.message || "System error loading board.");
  }
};

// =============================================================================
// 3. TASK ACTION APIs (Thao tác Task trên Board)
// =============================================================================

/**
 * 🔹 Di chuyển Task giữa các cột (Kéo thả ngang & dọc)
 * PUT /api/tasks/{taskId}/move
 */
export const moveTaskToStatus = async (
  taskId: number,
  payload: MoveTaskInBoardPayload
) => {
  try {
    const res = await apiClient.put(`/tasks/${taskId}/move`, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to move task.");
    }

    return res.data; // Trả về { success, message }

  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error moving task.");
  }
};

// =============================================================================
// 4. STATUS MANAGEMENT APIs (Quản lý Cột/Trạng thái)
// =============================================================================

/**
 * 🔹 Lấy danh sách trạng thái (cột) đơn thuần (không kèm task)
 * Thường dùng cho trang cài đặt hoặc dropdown chọn trạng thái.
 * GET /api/projects/{projectId}/statuses
 */
export const getProjectStatuses = async (projectId: number): Promise<RawStatusColumn[]> => {
  const res = await apiClient.get(`/projects/${projectId}/statuses`);
  const { success, message, data } = res.data;

  if (!success) throw new Error(message || "Failed to fetch statuses.");
  return data as RawStatusColumn[];
};

/**
 * 🔹 Tạo trạng thái mới
 * POST /api/projects/{projectId}/statuses
 */
export const createProjectStatus = async (
  projectId: number,
  payload: StatusPayload
) => {
  const res = await apiClient.post(`/projects/${projectId}/statuses`, payload);
  const { success, message, data } = res.data;

  if (!success) throw new Error(message || "Failed to create status.");
  return data; // Trả về cột mới tạo
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
  const res = await apiClient.put(`/projects/${projectId}/statuses/${statusId}`, payload);
  const { success, message, data } = res.data;

  if (!success) throw new Error(message || "Failed to update status.");
  return data;
};

/**
 * 🔹 Xóa trạng thái (Chỉ khi không có Task)
 * DELETE /api/projects/{projectId}/statuses/{statusId}
 */
export const deleteProjectStatus = async (
  projectId: number,
  statusId: number
) => {
  const res = await apiClient.delete(`/projects/${projectId}/statuses/${statusId}`);
  const { success, message } = res.data;

  if (!success) throw new Error(message || "Failed to delete status.");
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
  const { success, message } = res.data;

  if (!success) throw new Error(message || "Failed to reorder statuses.");
  return res.data;
};