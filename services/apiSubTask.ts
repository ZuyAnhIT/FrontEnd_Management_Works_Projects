"use client";
import apiClient from "@/lib/apiClient";

// =================================================================
// 🟢 INTERFACES
// =================================================================

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

// =================================================================
// 🧩 Build URL Helper (SỬA LẠI URL DÀI CHUẨN BACKEND)
// =================================================================

const buildUrl = (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId?: number
) => {
  // ⚠️ Lưu ý: Nếu apiClient của bạn đã có baseURL là '.../api' thì bỏ chữ '/api' ở đầu dòng dưới đi.
  // Nếu vẫn lỗi 404, hãy thử thêm '/api' vào đầu: `/api/companies/...`
  const base = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks`;
  return subTaskId ? `${base}/${subTaskId}` : base;
};

// =================================================================
// 📌 GET Subtask Detail
// =================================================================

export const getSubtaskDetail = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId: number
) => {
  const res = await apiClient.get(
    buildUrl(companyId, workspaceId, projectId, taskId, subTaskId)
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data as Subtask;
};

// =================================================================
// 📌 GET Subtask List
// =================================================================

export const getSubtaskList = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number
) => {
  const res = await apiClient.get(
    buildUrl(companyId, workspaceId, projectId, taskId)
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data as Subtask[];
};

// =================================================================
// 📌 POST Create Subtask
// =================================================================

export const createSubtask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  payload: CreateSubtaskPayload
) => {
  const res = await apiClient.post(
    buildUrl(companyId, workspaceId, projectId, taskId),
    payload
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data as Subtask;
};

// =================================================================
// 📌 PUT Update Subtask
// =================================================================

export const updateSubtask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId: number,
  payload: UpdateSubtaskPayload
) => {
  const res = await apiClient.put(
    buildUrl(companyId, workspaceId, projectId, taskId, subTaskId),
    payload
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data as Subtask;
};

// =================================================================
// 📌 DELETE Subtask
// =================================================================

export const deleteSubtask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  taskId: number,
  subTaskId: number
) => {
  const res = await apiClient.delete(
    buildUrl(companyId, workspaceId, projectId, taskId, subTaskId)
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data;
};