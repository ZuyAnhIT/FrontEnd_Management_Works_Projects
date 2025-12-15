"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES & TYPES (Định nghĩa kiểu dữ liệu)
// =============================================================================

// -----------------------------------------------------------------------------
// Response Models (Dữ liệu trả về)
// -----------------------------------------------------------------------------

// Wrapper Response chuẩn
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Dữ liệu Epic trả về từ Backend
export interface Epic {
  id: number;
  projectId: number;
  epicCode: string;
  name: string;
  description: string;
  color: string;
  status: string;
  startDate: string; // YYYY-MM-DD or ISO
  dueDate: string;   // YYYY-MM-DD or ISO
  createdAt: string;
  
  // Thông tin thống kê tiến độ
  totalTasks: number;
  tasksCompleted: number;
  progressPercentage: number;
}

// -----------------------------------------------------------------------------
// Payload & Params (Dữ liệu gửi đi)
// -----------------------------------------------------------------------------

// Payload: Tạo Epic mới
export interface CreateEpicPayload {
  name: string;
  description?: string;
  color?: string;
  startDate?: string;
  dueDate?: string;
}

// Payload: Cập nhật Epic
export interface UpdateEpicPayload {
  name: string;
  description?: string;
  color?: string;
  status?: string;
  startDate?: string;
  dueDate?: string;
}

// Params lọc danh sách Epic
export interface EpicFilterParams {
  keyword?: string;
}

// =============================================================================
// 2. API SERVICE IMPLEMENTATION
// =============================================================================

export const apiEpic = {

  /**
   * 🔹 Lấy chi tiết Epic 
   * GET /api/projects/{projectId}/epics/{epicId}
   */
  getEpicDetail: async (
    projectId: number | string,
    epicId: number | string
  ): Promise<Epic> => {
    try {
      const res = await apiClient.get<ApiResponse<Epic>>(
        `/projects/${projectId}/epics/${epicId}`
      );
      const { success, message, data } = res.data;

      if (!success) {
        throw new Error(message || "Failed to fetch epic details.");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error fetching epic details.");
    }
  },

  /**
   * 🔹 Lấy danh sách Epics trong Project
   * GET /api/projects/{projectId}/epics
   */
  getEpics: async (
    projectId: number | string,
    params?: EpicFilterParams
  ): Promise<Epic[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Epic[]>>(
        `/projects/${projectId}/epics`,
        { params }
      );
      const { success, message, data } = res.data;

      if (!success) {
        throw new Error(message || "Failed to load epics.");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error loading epics.");
    }
  },

  /**
   * 🔹 Tạo Epic mới
   * POST /api/projects/{projectId}/epics
   */
  createEpic: async (
    projectId: number | string,
    payload: CreateEpicPayload
  ): Promise<Epic> => {
    try {
      const res = await apiClient.post<ApiResponse<Epic>>(
        `/projects/${projectId}/epics`,
        payload
      );
      const { success, message, data } = res.data;

      if (!success) {
        throw new Error(message || "Failed to create epic.");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error creating epic.");
    }
  },

  /**
   * 🔹 Cập nhật Epic
   * PUT /api/projects/{projectId}/epics/{epicId}
   */
  updateEpic: async (
    projectId: number | string,
    epicId: number | string,
    payload: UpdateEpicPayload
  ): Promise<Epic> => {
    try {
      const res = await apiClient.put<ApiResponse<Epic>>(
        `/projects/${projectId}/epics/${epicId}`,
        payload
      );
      const { success, message, data } = res.data;

      if (!success) {
        throw new Error(message || "Failed to update epic.");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error updating epic.");
    }
  },

  /**
   * 🔹 Xóa Epic
   * DELETE /api/projects/{projectId}/epics/{epicId}
   */
  deleteEpic: async (
    projectId: number | string,
    epicId: number | string
  ): Promise<boolean> => {
    try {
      const res = await apiClient.delete<ApiResponse<{}>>(
        `/projects/${projectId}/epics/${epicId}`
      );
      const { success, message } = res.data;

      if (!success) {
        throw new Error(message || "Failed to delete epic.");
      }
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "System error deleting epic.");
    }
  }
};