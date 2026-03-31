"use client";

import apiClient from "@/lib/apiClient";
import { TaskSummary } from "./apiProject";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

// -----------------------------------------------------------------------------
// Dữ liệu phản hồi từ API (Response Types)
// -----------------------------------------------------------------------------

/**
 * Cấu trúc cột Board lấy từ API /board (bao gồm danh sách task)
 */
export interface RawBoardColumn {
  statusId: number;
  statusName: string;
  color?: string;
  order?: number;
  isCompleted?: boolean;
  tasks?: TaskSummary[];
}

/**
 * Cấu trúc trạng thái đơn thuần từ API /statuses
 */
export interface RawStatusColumn {
  id: number;
  name: string;
  color: string;
  sortOrder: number;
  isCompletedStatus: boolean;
  projectId?: number;
}

/**
 * Dữ liệu đã chuẩn hóa để sử dụng đồng nhất trong UI
 */
export interface BoardColumnResponse {
  id: number;
  name: string;
  color: string;
  position: number;
  isCompletedStatus: boolean;
  tasks: TaskSummary[];
}

// -----------------------------------------------------------------------------
// Dữ liệu yêu cầu gửi đi (Payload & Params)
// -----------------------------------------------------------------------------

/**
 * Các tham số lọc dữ liệu cho bảng Board
 */
export interface BoardFilterParams {
  sprintId?: number | null; // null: Active Sprint, 0: Backlog
  keyword?: string;
  assigneeId?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  taskType?: "TASK" | "BUG" | "STORY";
}

/**
 * Dữ liệu để tạo hoặc cập nhật trạng thái
 */
export interface StatusPayload {
  name: string;
  color: string;
  isCompletedStatus: boolean;
}

/**
 * Dữ liệu yêu cầu khi di chuyển Task trên Board
 */
export interface MoveTaskInBoardPayload {
  newStatusId: number;
  newSortOrder?: number | null;
}

// =============================================================================
// BOARD VIEW APIs
// =============================================================================

/**
 * Lấy toàn bộ dữ liệu bảng Board (Tasks được nhóm theo Status)
 */
export const getProjectBoardData = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: BoardFilterParams
): Promise<RawBoardColumn[]> => {
  // Loại bỏ các tham số lọc không có giá trị để tối ưu URL
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== null && v !== undefined && v !== ""
    )
  );

  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/board`;
    const res = await apiClient.get(url, { params: cleanParams });

    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load board data");
    }

    return data as RawBoardColumn[];
  } catch (error: any) {
    // Ưu tiên trả về lỗi từ hệ thống backend
    const errorMessage = error.response?.data?.message || error.message || "An error occurred while loading board data";
    throw new Error(errorMessage);
  }
};

// =============================================================================
// TASK ACTION APIs
// =============================================================================

/**
 * Di chuyển Task sang một trạng thái khác hoặc thay đổi vị trí sắp xếp
 */
export const moveTaskToStatus = async (
  taskId: number,
  payload: MoveTaskInBoardPayload
) => {
  try {
    const res = await apiClient.put(`/tasks/${taskId}/move`, payload);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to move task");
    }

    return res.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "An error occurred while moving task";
    throw new Error(errorMessage);
  }
};

// =============================================================================
// STATUS MANAGEMENT APIs
// =============================================================================

/**
 * Lấy danh sách các trạng thái hiện có của dự án
 */
export const getProjectStatuses = async (
  projectId: number
): Promise<RawStatusColumn[]> => {
  try {
    const res = await apiClient.get(`/projects/${projectId}/statuses`);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch project statuses");
    }

    return data as RawStatusColumn[];
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "An error occurred while fetching statuses";
    throw new Error(errorMessage);
  }
};

/**
 * Tạo mới một trạng thái (cột) trong dự án
 */
export const createProjectStatus = async (
  projectId: number,
  payload: StatusPayload
) => {
  try {
    const res = await apiClient.post(`/projects/${projectId}/statuses`, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to create new status");
    }

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "An error occurred while creating status";
    throw new Error(errorMessage);
  }
};

/**
 * Cập nhật thông tin chi tiết của một trạng thái
 */
export const updateProjectStatus = async (
  projectId: number,
  statusId: number,
  payload: Partial<StatusPayload>
) => {
  try {
    const url = `/projects/${projectId}/statuses/${statusId}`;
    const res = await apiClient.put(url, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update status");
    }

    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "An error occurred while updating status";
    throw new Error(errorMessage);
  }
};

/**
 * Xóa một trạng thái khỏi dự án
 */
export const deleteProjectStatus = async (
  projectId: number,
  statusId: number
) => {
  try {
    const url = `/projects/${projectId}/statuses/${statusId}`;
    const res = await apiClient.delete(url);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to delete status");
    }

    return res.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "An error occurred while deleting status";
    throw new Error(errorMessage);
  }
};

/**
 * Thay đổi thứ tự hiển thị của các cột trạng thái trên Board
 */
export const reorderProjectStatuses = async (
  projectId: number,
  orderedStatusIds: number[]
) => {
  try {
    const res = await apiClient.put(`/projects/${projectId}/statuses/reorder`, {
      orderedStatusIds,
    });
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to reorder statuses");
    }

    return res.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "An error occurred while reordering statuses";
    throw new Error(errorMessage);
  }
};