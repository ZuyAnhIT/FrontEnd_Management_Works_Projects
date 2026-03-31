"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Thông tin chi tiết của thẻ phân loại (Tag)
 */
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

/**
 * Dữ liệu yêu cầu khi tạo hoặc cập nhật thông tin thẻ
 */
export interface TagPayload {
  name: string;
  color: string;
  description?: string;
}

/**
 * Các tham số dùng để lọc danh sách thẻ
 */
export interface TagFilterParams {
  keyword?: string;
  names?: string[];
  createdById?: number;
  createdFrom?: string;
  createdTo?: string;
}

/**
 * Cấu trúc phản hồi chuẩn từ hệ thống API
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/**
 * Loại bỏ các tham số lọc không có giá trị để tối ưu hóa đường dẫn truy vấn
 */
const buildCleanParams = (params?: TagFilterParams) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== null && v !== undefined && v !== ""
    )
  );
};

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Truy vấn danh sách các thẻ phân loại trong dự án với bộ lọc nâng cao
 */
export const getTags = async (
  companyId: number | string,
  workspaceId: number | string,
  projectId: number | string,
  params?: TagFilterParams
): Promise<Tag[]> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags`;
    const res = await apiClient.get<ApiResponse<Tag[]>>(url, { 
      params: buildCleanParams(params) 
    });
    
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Unable to load tags");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading tags";
    throw new Error(errorMsg);
  }
};

/**
 * Khởi tạo một thẻ phân loại mới cho dự án
 */
export const createTag = async (
  companyId: number | string,
  workspaceId: number | string,
  projectId: number | string,
  payload: TagPayload
): Promise<Tag> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags`;
    const res = await apiClient.post<ApiResponse<Tag>>(url, payload);

    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Unable to create tag");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while creating tag";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật thông tin chi tiết (tên, màu sắc, mô tả) của thẻ
 */
export const updateTag = async (
  companyId: number | string,
  workspaceId: number | string,
  projectId: number | string,
  tagId: number | string,
  payload: TagPayload
): Promise<Tag> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags/${tagId}`;
    const res = await apiClient.put<ApiResponse<Tag>>(url, payload);

    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Unable to update tag");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while updating tag";
    throw new Error(errorMsg);
  }
};

/**
 * Xóa bỏ hoàn toàn thẻ phân loại khỏi phạm vi dự án
 */
export const deleteTag = async (
  companyId: number | string,
  workspaceId: number | string,
  projectId: number | string,
  tagId: number | string
): Promise<boolean> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tags/${tagId}`;
    const res = await apiClient.delete<ApiResponse<{}>>(url);

    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Unable to delete tag");
    }
    return true;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while deleting tag";
    throw new Error(errorMsg);
  }
};

/**
 * Thực hiện gắn thẻ phân loại vào một công việc cụ thể
 */
export const assignTagToTask = async (
  companyId: number | string,
  workspaceId: number | string,
  projectId: number | string,
  taskId: number | string,
  tagId: number | string
): Promise<boolean> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/tags/${tagId}`;
    const res = await apiClient.post<ApiResponse<{}>>(url);

    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Unable to assign tag to task");
    }
    return true;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while assigning tag";
    throw new Error(errorMsg);
  }
};

/**
 * Thực hiện gỡ bỏ thẻ phân loại khỏi một công việc cụ thể
 */
export const removeTagFromTask = async (
  companyId: number | string,
  workspaceId: number | string,
  projectId: number | string,
  taskId: number | string,
  tagId: number | string
): Promise<boolean> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/tags/${tagId}`;
    const res = await apiClient.delete<ApiResponse<{}>>(url);

    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Unable to remove tag from task");
    }
    return true;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while removing tag";
    throw new Error(errorMsg);
  }
};