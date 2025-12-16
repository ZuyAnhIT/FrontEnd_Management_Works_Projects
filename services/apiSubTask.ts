"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES & DTOs (Định nghĩa kiểu dữ liệu)
// =============================================================================

export interface Subtask {
  assignee: any;
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
}

export interface CreateSubtaskPayload {
  title: string;
  description?: string;
  assigneeId?: number | null;
  estimatedHours?: number | null;
}

export interface UpdateSubtaskPayload {
  title?: string;
  description?: string;
  status?: string;
  assigneeId?: number | null;
  estimatedHours?: number | null;
}

// =============================================================================
// 2. HELPER FUNCTIONS
// =============================================================================

/**
 * Tạo URL chuẩn cho Subtask API để tránh lặp code.
 * Cấu trúc: /companies/{cid}/workspaces/{wid}/projects/{pid}/tasks/{tid}/subtasks[/{subId}]
 */
const buildUrl = (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId?: number
) => {
  const base = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks`;
  return subTaskId ? `${base}/${subTaskId}` : base;
};

// =============================================================================
// 3. READ APIs (Lấy dữ liệu)
// =============================================================================

/**
 * 📌 Lấy danh sách Subtask
 */
export const getSubtaskList = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number
): Promise<Subtask[]> => {
  try {
    const res = await apiClient.get(
      buildUrl(companyId, workspaceId, projectId, taskId)
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to load subtasks.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error loading subtasks.");
  }
};

/**
 * 📌 Lấy chi tiết Subtask
 */
export const getSubtaskDetail = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId: number
): Promise<Subtask> => {
  try {
    const res = await apiClient.get(
      buildUrl(companyId, workspaceId, projectId, taskId, subTaskId)
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch subtask details.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error fetching subtask.");
  }
};

// =============================================================================
// 4. WRITE APIs (Tạo, Sửa, Xóa)
// =============================================================================

/**
 * 📌 Tạo Subtask mới
 */
export const createSubtask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  payload: CreateSubtaskPayload
): Promise<Subtask> => {
  try {
    const res = await apiClient.post(
      buildUrl(companyId, workspaceId, projectId, taskId),
      payload
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to create subtask.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error creating subtask.");
  }
};

/**
 * 📌 Cập nhật Subtask
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
    const res = await apiClient.put(
      buildUrl(companyId, workspaceId, projectId, taskId, subTaskId),
      payload
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to update subtask.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error updating subtask.");
  }
};

/**
 * 📌 Xóa Subtask
 */
export const deleteSubtask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId: number
) => {
  try {
    const res = await apiClient.delete(
      buildUrl(companyId, workspaceId, projectId, taskId, subTaskId)
    );
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to delete subtask.");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error deleting subtask.");
  }
};