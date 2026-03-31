"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Thông tin chi tiết của một Subtask (Công việc con)
 */
export interface Subtask {
  id: number;
  parentTaskId: number;
  title: string;
  description: string;
  status: string;
  assigneeId: number | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;
  estimatedHours: number | null;
  sortOrder: number;
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  assignee: any; // Dữ liệu mở rộng về người thực hiện
}

/**
 * Dữ liệu yêu cầu khi khởi tạo một Subtask mới
 */
export interface CreateSubtaskPayload {
  title: string;
  description?: string;
  assigneeId?: number | null;
  estimatedHours?: number | null;
}

/**
 * Dữ liệu yêu cầu khi cập nhật thông tin Subtask
 */
export interface UpdateSubtaskPayload {
  title?: string;
  description?: string;
  status?: string;
  assigneeId?: number | null;
  estimatedHours?: number | null;
}

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/**
 * Xây dựng đường dẫn URL chuẩn cho tài nguyên Subtask
 * Cấu trúc phân cấp: Company -> Workspace -> Project -> Task -> Subtask
 */
const buildUrl = (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId?: number
): string => {
  const base = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks`;
  return subTaskId ? `${base}/${subTaskId}` : base;
};

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Truy vấn danh sách toàn bộ các Subtask thuộc một Task chính
 */
export const getSubtaskList = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number
): Promise<Subtask[]> => {
  try {
    const url = buildUrl(companyId, workspaceId, projectId, taskId);
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Unable to load subtasks");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading subtasks";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn thông tin chi tiết của một Subtask cụ thể
 */
export const getSubtaskDetail = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId: number
): Promise<Subtask> => {
  try {
    const url = buildUrl(companyId, workspaceId, projectId, taskId, subTaskId);
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Unable to fetch subtask details");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while fetching subtask details";
    throw new Error(errorMsg);
  }
};

/**
 * Khởi tạo một Subtask mới gắn liền với Task chính
 */
export const createSubtask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  payload: CreateSubtaskPayload
): Promise<Subtask> => {
  try {
    const url = buildUrl(companyId, workspaceId, projectId, taskId);
    const res = await apiClient.post(url, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Unable to create subtask");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while creating subtask";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật các thông tin thuộc tính hoặc trạng thái của Subtask
 */
export const updateSubtask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId: number,
  payload: UpdateSubtaskPayload
): Promise<Subtask> => {
  try {
    const url = buildUrl(companyId, workspaceId, projectId, taskId, subTaskId);
    const res = await apiClient.put(url, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Unable to update subtask");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while updating subtask";
    throw new Error(errorMsg);
  }
};

/**
 * Xóa bỏ vĩnh viễn một Subtask khỏi hệ thống
 */
export const deleteSubtask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId: number
) => {
  try {
    const url = buildUrl(companyId, workspaceId, projectId, taskId, subTaskId);
    const res = await apiClient.delete(url);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Unable to delete subtask");
    }
    return res.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while deleting subtask";
    throw new Error(errorMsg);
  }
};