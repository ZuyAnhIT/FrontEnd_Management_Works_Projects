"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES & DTOs (Định nghĩa kiểu dữ liệu)
// =============================================================================

// -----------------------------------------------------------------------------
// Payloads (Dữ liệu gửi đi)
// -----------------------------------------------------------------------------

// Payload tạo mới Sprint (Create)
export interface SprintPayload {
  name?: string;      
  goal?: string;
  startDate?: string; // ISO String
  endDate?: string;   // ISO String
  taskIds?: number[]; // Mảng ID task
}

// Payload cập nhật Sprint (Update)
export interface UpdateSprintPayload {
  name?: string;
  goal?: string;
  startDate?: string; 
  endDate?: string;
}

// -----------------------------------------------------------------------------
// Responses (Dữ liệu trả về)
// -----------------------------------------------------------------------------

// Object Task rút gọn hiển thị trong Sprint Detail
export interface TaskSummary {
  id: number;
  taskCode: string;
  title: string;
  taskType: string; // 'TASK', 'BUG', 'STORY'...
  statusId: number;
  statusName: string;
  statusColor: string;
  priority: string;
  assigneeAvatarUrl?: string;
  storyPoints?: number;
  sortOrder: number; 
  // Các trường khác nếu cần
}

// Object Sprint cơ bản (cho danh sách bên ngoài)
export interface Sprint {
  id: number;
  name: string;
  goal?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate?: string;
  endDate?: string;
  projectId: number;
  taskCount?: number;
  tasks: TaskSummary[];
}

// Object Sprint Chi Tiết (cho Panel/Modal) - Bao gồm thống kê và list Task
export interface SprintDetails extends Sprint {
  totalStoryPoints: number; // Tổng điểm
  taskCount: number;        // Tổng số task
  tasks: TaskSummary[];     // Danh sách task chi tiết
}

// =============================================================================
// 2. API METHODS (Các hàm gọi API)
// =============================================================================

/**
 * 1️⃣ GET – Lấy danh sách Sprint (List View)
 * URL: /api/projects/{projectId}/sprints
 */
export const getSprints = async (
  projectId: number,
  status?: string
): Promise<Sprint[]> => {
  try {
    const res = await apiClient.get(
      `/projects/${projectId}/sprints`, 
      { params: status ? { status } : {} }
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch sprints.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error loading sprints.");
  }
};

/**
 * 2️⃣ POST – Tạo Sprint
 * URL: /api/projects/{projectId}/sprints
 */
export const createSprint = async (
  projectId: number,
  payload: SprintPayload = {} 
): Promise<Sprint> => {
  try {
    const res = await apiClient.post(
      `/projects/${projectId}/sprints`,
      payload
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to create sprint.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error creating sprint.");
  }
};

/**
 * 3️⃣ PUT – Cập nhật Sprint
 * URL: /api/projects/{projectId}/sprints/{sprintId}
 */
export const updateSprint = async (
  projectId: number,
  sprintId: number,
  payload: UpdateSprintPayload
): Promise<SprintDetails> => { 
  try {
    const res = await apiClient.put(
      `/projects/${projectId}/sprints/${sprintId}`,
      payload
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to update sprint.");
    return data; // Trả về chi tiết để update UI
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error updating sprint.");
  }
};

/**
 * 4️⃣ GET – Xem chi tiết Sprint 
 * URL: /api/projects/{projectId}/sprints/{sprintId}
 */
export const getSprintDetails = async (
  projectId: number,
  sprintId: number
): Promise<SprintDetails> => {
  try {
    const res = await apiClient.get(
      `/projects/${projectId}/sprints/${sprintId}`
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch sprint details.");
    return data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error fetching sprint details.");
  }
};

/**
 * 5️⃣ POST – Start Sprint (Bắt đầu Sprint)
 */
export const startSprint = async (projectId: number, sprintId: number) => {
  try {
    const res = await apiClient.post(`/projects/${projectId}/sprints/${sprintId}/start`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to start sprint.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error starting sprint.");
  }
};

/**
 * 6️⃣ POST – Complete Sprint (Hoàn thành Sprint)
 */
export const completeSprint = async (projectId: number, sprintId: number) => {
  try {
    const res = await apiClient.post(`/projects/${projectId}/sprints/${sprintId}/complete`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to complete sprint.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error completing sprint.");
  }
};

/**
 * 7️⃣ DELETE – Xóa/Hủy Sprint
 */
export const deleteSprint = async (projectId: number, sprintId: number) => {
  try {
    const res = await apiClient.delete(`/projects/${projectId}/sprints/${sprintId}`);
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to delete sprint.");
    return res.data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error deleting sprint.");
  }
};