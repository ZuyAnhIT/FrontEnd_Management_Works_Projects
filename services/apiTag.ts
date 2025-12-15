"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES & TYPES (Định nghĩa kiểu dữ liệu)
// =============================================================================

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

// Wrapper Response chuẩn (để tái sử dụng type nội bộ)
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =============================================================================
// 2. HELPER FUNCTIONS
// =============================================================================

/**
 * Loại bỏ các param null/undefined/rỗng để URL sạch sẽ
 */
const buildCleanParams = (params?: TagFilterParams) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );
};

// =============================================================================
// 3. API SERVICE IMPLEMENTATION
// =============================================================================

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
    try {
      const res = await apiClient.get<ApiResponse<Tag[]>>(
        `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags`,
        { params: buildCleanParams(params) }
      );
      
      const { success, message, data } = res.data;

      if (!success) {
        throw new Error(message || "Failed to load tags.");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error loading tags.");
    }
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
    try {
      const res = await apiClient.post<ApiResponse<Tag>>(
        `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags`,
        payload
      );

      const { success, message, data } = res.data;

      if (!success) {
        throw new Error(message || "Failed to create tag.");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error creating tag.");
    }
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
    try {
      const res = await apiClient.put<ApiResponse<Tag>>(
        `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags/${tagId}`,
        payload
      );

      const { success, message, data } = res.data;

      if (!success) {
        throw new Error(message || "Failed to update tag.");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error updating tag.");
    }
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
    try {
      const res = await apiClient.delete<ApiResponse<{}>>(
        `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags/${tagId}`
      );

      const { success, message } = res.data;

      if (!success) {
        throw new Error(message || "Failed to delete tag.");
      }
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error deleting tag.");
    }
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
    try {
      const res = await apiClient.post<ApiResponse<{}>>(
        `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/tags/${tagId}`
      );

      const { success, message } = res.data;

      if (!success) {
        throw new Error(message || "Failed to assign tag to task.");
      }
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error assigning tag.");
    }
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
    try {
      const res = await apiClient.delete<ApiResponse<{}>>(
        `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/tags/${tagId}`
      );

      const { success, message } = res.data;

      if (!success) {
        throw new Error(message || "Failed to remove tag from task.");
      }
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error removing tag.");
    }
  },
};