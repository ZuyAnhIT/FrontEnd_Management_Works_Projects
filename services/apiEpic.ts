"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

// -----------------------------------------------------------------------------
// Dữ liệu phản hồi (Response Models)
// -----------------------------------------------------------------------------

/**
 * Cấu trúc phản hồi chuẩn từ API
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Thông tin chi tiết về Epic và tiến độ liên quan
 */
export interface Epic {
  id: number;
  projectId: number;
  epicCode: string;
  name: string;
  description: string;
  color: string;
  status: string;
  startDate: string;
  dueDate: string;
  createdAt: string;
  
  // Thông tin thống kê công việc thuộc Epic
  totalTasks: number;
  tasksCompleted: number;
  progressPercentage: number;
}

// -----------------------------------------------------------------------------
// Dữ liệu yêu cầu (Payload & Params)
// -----------------------------------------------------------------------------

/**
 * Dữ liệu yêu cầu để tạo một Epic mới
 */
export interface CreateEpicPayload {
  name: string;
  description?: string;
  color?: string;
  startDate?: string;
  dueDate?: string;
}

/**
 * Dữ liệu yêu cầu để cập nhật thông tin Epic
 */
export interface UpdateEpicPayload {
  name: string;
  description?: string;
  color?: string;
  status?: string;
  startDate?: string;
  dueDate?: string;
}

/**
 * Các tham số dùng để lọc danh sách Epic
 */
export interface EpicFilterParams {
  keyword?: string;
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Truy vấn thông tin chi tiết của một Epic cụ thể
 */
export const getEpicDetail = async (
  projectId: number | string,
  epicId: number | string
): Promise<Epic> => {
  try {
    const url = `/projects/${projectId}/epics/${epicId}`;
    const res = await apiClient.get<ApiResponse<Epic>>(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch epic details");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Unable to fetch epic details";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy danh sách các Epic thuộc một dự án
 */
export const getEpics = async (
  projectId: number | string,
  params?: EpicFilterParams
): Promise<Epic[]> => {
  try {
    const url = `/projects/${projectId}/epics`;
    const res = await apiClient.get<ApiResponse<Epic[]>>(url, { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load epics");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Unable to load epics";
    throw new Error(errorMsg);
  }
};

/**
 * Khởi tạo một Epic mới trong dự án
 */
export const createEpic = async (
  projectId: number | string,
  payload: CreateEpicPayload
): Promise<Epic> => {
  try {
    const url = `/projects/${projectId}/epics`;
    const res = await apiClient.post<ApiResponse<Epic>>(url, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to create epic");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Unable to create epic";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật thông tin hoặc trạng thái của một Epic
 */
export const updateEpic = async (
  projectId: number | string,
  epicId: number | string,
  payload: UpdateEpicPayload
): Promise<Epic> => {
  try {
    const url = `/projects/${projectId}/epics/${epicId}`;
    const res = await apiClient.put<ApiResponse<Epic>>(url, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update epic");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Unable to update epic";
    throw new Error(errorMsg);
  }
};

/**
 * Xóa một Epic khỏi dự án
 */
export const deleteEpic = async (
  projectId: number | string,
  epicId: number | string
): Promise<boolean> => {
  try {
    const url = `/projects/${projectId}/epics/${epicId}`;
    const res = await apiClient.delete<ApiResponse<{}>>(url);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to delete epic");
    }
    return true;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Unable to delete epic";
    throw new Error(errorMsg);
  }
};