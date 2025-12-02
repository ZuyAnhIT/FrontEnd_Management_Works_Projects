"use client";

import apiClient from "@/lib/apiClient";

// ===================================================
// 1. INTERFACES & TYPES
// ===================================================

// Dữ liệu Epic trả về từ Backend (Khớp với Output JSON)
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

// Payload: Tạo Epic mới (Input JSON POST)
export interface CreateEpicPayload {
  name: string;
  description?: string;
  color?: string;
  startDate?: string;
  dueDate?: string;
}

// Payload: Cập nhật Epic (Input JSON PUT - có thêm status)
export interface UpdateEpicPayload {
  name: string;
  description?: string;
  color?: string;
  status?: string;
  startDate?: string;
  dueDate?: string;
}

// Params lọc danh sách Epic (Input GET)
export interface EpicFilterParams {
  keyword?: string;
}

// Wrapper Response chuẩn
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ===================================================
// 2. API SERVICE
// ===================================================

export const apiEpic = {

  /**
   * 🔹 Lấy chi tiết Epic 
   * GET /api/projects/{projectId}/epics/{epicId}
   */
  getEpicDetail: async (
    projectId: number | string,
    epicId: number | string
  ): Promise<Epic> => {
    const res = await apiClient.get<ApiResponse<Epic>>(
      `/projects/${projectId}/epics/${epicId}`
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể lấy chi tiết Epic.");
    }
    return res.data.data;
  },

  /**
   * 🔹 Lấy danh sách Epics trong Project
   * GET /api/projects/{projectId}/epics
   */
  getEpics: async (
    projectId: number | string,
    params?: EpicFilterParams
  ): Promise<Epic[]> => {
    const res = await apiClient.get<ApiResponse<Epic[]>>(
      `/projects/${projectId}/epics`,
      { params }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể tải danh sách Epic.");
    }
    return res.data.data;
  },

  /**
   * 🔹 Tạo Epic mới
   * POST /api/projects/{projectId}/epics
   */
  createEpic: async (
    projectId: number | string,
    payload: CreateEpicPayload
  ): Promise<Epic> => {
    const res = await apiClient.post<ApiResponse<Epic>>(
      `/projects/${projectId}/epics`,
      payload
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể tạo Epic.");
    }
    return res.data.data;
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
    const res = await apiClient.put<ApiResponse<Epic>>(
      `/projects/${projectId}/epics/${epicId}`,
      payload
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể cập nhật Epic.");
    }
    return res.data.data;
  },

  /**
   * 🔹 Xóa Epic
   * DELETE /api/projects/{projectId}/epics/{epicId}
   */
  deleteEpic: async (
    projectId: number | string,
    epicId: number | string
  ): Promise<boolean> => {
    const res = await apiClient.delete<ApiResponse<{}>>(
      `/projects/${projectId}/epics/${epicId}`
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Không thể xóa Epic.");
    }
    return true;
  }
};