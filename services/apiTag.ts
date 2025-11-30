"use client";

import apiClient from "@/lib/apiClient";

// ===================================================
// 1. INTERFACES & TYPES
// ===================================================

// Dữ liệu Tag trả về từ Backend
export interface Tag {
  id: number;
  projectId: number;
  name: string;
  color: string;
  description?: string;
  createdById: number;
  createdByName: string;
  createdByAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Payload khi Tạo hoặc Cập nhật Tag
export interface TagPayload {
  name: string;
  color: string;
  description?: string;
}

// Tham số lọc cho API Get Tags
export interface TagFilterParams {
  keyword?: string;
  names?: string[]; // array[string]
  createdById?: number;
  createdFrom?: string; // ISO Date string
  createdTo?: string;   // ISO Date string
}

// Response Wrapper chuẩn (để tái sử dụng type)
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ===================================================
// 2. API SERVICE
// ===================================================

export const apiTag = {
  /**
   * 🔹 Lấy danh sách tags với bộ lọc nâng cao
   * GET /api/companies/{cId}/workspaces/{wId}/projects/{pId}/tags
   */
  getTags: async (
    companyId: number | string,
    workspaceId: number | string,
    projectId: number | string,
    params?: TagFilterParams
  ): Promise<Tag[]> => {
    // Clean params: loại bỏ các giá trị null/undefined/rỗng
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
        )
      : {};

    const res = await apiClient.get<ApiResponse<Tag[]>>(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags`,
      { params: cleanParams }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể tải danh sách tags.");
    }
    return res.data.data;
  },

  /**
   * 🔹 Tạo tag mới
   * POST /api/companies/{cId}/workspaces/{wId}/projects/{pId}/tags
   */
  createTag: async (
    companyId: number | string,
    workspaceId: number | string,
    projectId: number | string,
    payload: TagPayload
  ): Promise<Tag> => {
    const res = await apiClient.post<ApiResponse<Tag>>(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags`,
      payload
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể tạo tag.");
    }
    return res.data.data;
  },

  /**
   * 🔹 Cập nhật tag
   * PUT /api/companies/{cId}/workspaces/{wId}/projects/{pId}/tags/{tagId}
   */
  updateTag: async (
    companyId: number | string,
    workspaceId: number | string,
    projectId: number | string,
    tagId: number | string,
    payload: TagPayload
  ): Promise<Tag> => {
    const res = await apiClient.put<ApiResponse<Tag>>(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags/${tagId}`,
      payload
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể cập nhật tag.");
    }
    return res.data.data;
  },

  /**
   * 🔹 Xóa tag (Xóa hoàn toàn khỏi project)
   * DELETE /api/companies/{cId}/workspaces/{wId}/projects/{pId}/tags/{tagId}
   */
  deleteTag: async (
    companyId: number | string,
    workspaceId: number | string,
    projectId: number | string,
    tagId: number | string
  ): Promise<boolean> => {
    const res = await apiClient.delete<ApiResponse<{}>>(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags/${tagId}`
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể xóa tag.");
    }
    return true;
  },

  /**
   * 🔹 Gán tag vào một Task cụ thể
   * POST .../tasks/{taskId}/tags/{tagId}
   */
  assignTagToTask: async (
    companyId: number | string,
    workspaceId: number | string,
    projectId: number | string,
    taskId: number | string,
    tagId: number | string
  ): Promise<boolean> => {
    const res = await apiClient.post<ApiResponse<{}>>(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/tags/${tagId}`
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể gán tag vào task.");
    }
    return true;
  },

  /**
   * 🔹 Gỡ tag khỏi một Task cụ thể
   * DELETE .../tasks/{taskId}/tags/{tagId}
   */
  removeTagFromTask: async (
    companyId: number | string,
    workspaceId: number | string,
    projectId: number | string,
    taskId: number | string,
    tagId: number | string
  ): Promise<boolean> => {
    const res = await apiClient.delete<ApiResponse<{}>>(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/tags/${tagId}`
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể gỡ tag khỏi task.");
    }
    return true;
  },
};