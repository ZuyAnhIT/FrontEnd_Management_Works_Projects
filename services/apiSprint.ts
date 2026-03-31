"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

// -----------------------------------------------------------------------------
// Dữ liệu yêu cầu (Payloads)
// -----------------------------------------------------------------------------

/**
 * Dữ liệu để khởi tạo một Sprint mới
 */
export interface SprintPayload {
  name?: string;      
  goal?: string;
  startDate?: string;
  endDate?: string;
  taskIds?: number[];
}

/**
 * Dữ liệu để cập nhật thông tin Sprint hiện có
 */
export interface UpdateSprintPayload {
  name?: string;
  goal?: string;
  startDate?: string; 
  endDate?: string;
}

// -----------------------------------------------------------------------------
// Dữ liệu phản hồi (Responses)
// -----------------------------------------------------------------------------

/**
 * Thông tin tóm tắt của công việc hiển thị trong Sprint
 */
export interface TaskSummary {
  id: number;
  taskCode: string;
  title: string;
  taskType: string;
  statusId: number;
  statusName: string;
  statusColor: string;
  priority: string;
  assigneeAvatarUrl?: string;
  storyPoints?: number;
  sortOrder: number; 
}

/**
 * Cấu trúc dữ liệu Sprint cơ bản
 */
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

/**
 * Thông tin chi tiết đầy đủ của Sprint bao gồm thống kê và danh sách công việc
 */
export interface SprintDetails extends Sprint {
  totalStoryPoints: number;
  taskCount: number;
  tasks: TaskSummary[];
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Truy vấn danh sách các Sprint thuộc dự án
 */
export const getSprints = async (
  projectId: number,
  status?: string
): Promise<Sprint[]> => {
  try {
    const url = `/projects/${projectId}/sprints`;
    const res = await apiClient.get(url, { 
      params: status ? { status } : {} 
    });
    
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch sprints");
    }
    
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading sprints";
    throw new Error(errorMsg);
  }
};

/**
 * Khởi tạo một Sprint mới trong dự án
 */
export const createSprint = async (
  projectId: number,
  payload: SprintPayload = {} 
): Promise<Sprint> => {
  try {
    const url = `/projects/${projectId}/sprints`;
    const res = await apiClient.post(url, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to create sprint");
    }
    
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while creating sprint";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật thông tin chi tiết của một Sprint
 */
export const updateSprint = async (
  projectId: number,
  sprintId: number,
  payload: UpdateSprintPayload
): Promise<SprintDetails> => { 
  try {
    const url = `/projects/${projectId}/sprints/${sprintId}`;
    const res = await apiClient.put(url, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update sprint");
    }
    
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while updating sprint";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn thông tin chi tiết của một Sprint cụ thể
 */
export const getSprintDetails = async (
  projectId: number,
  sprintId: number
): Promise<SprintDetails> => {
  try {
    const url = `/projects/${projectId}/sprints/${sprintId}`;
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch sprint details");
    }
    
    return data; 
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while fetching sprint details";
    throw new Error(errorMsg);
  }
};

/**
 * Kích hoạt trạng thái bắt đầu cho một Sprint
 */
export const startSprint = async (projectId: number, sprintId: number) => {
  try {
    const url = `/projects/${projectId}/sprints/${sprintId}/start`;
    const res = await apiClient.post(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to start sprint");
    }
    
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while starting sprint";
    throw new Error(errorMsg);
  }
};

/**
 * Đánh dấu Sprint đã hoàn thành
 */
export const completeSprint = async (projectId: number, sprintId: number) => {
  try {
    const url = `/projects/${projectId}/sprints/${sprintId}/complete`;
    const res = await apiClient.post(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to complete sprint");
    }
    
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while completing sprint";
    throw new Error(errorMsg);
  }
};

/**
 * Xóa bỏ hoặc hủy bỏ một Sprint khỏi dự án
 */
export const deleteSprint = async (projectId: number, sprintId: number) => {
  try {
    const url = `/projects/${projectId}/sprints/${sprintId}`;
    const res = await apiClient.delete(url);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to delete sprint");
    }
    
    return res.data; 
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while deleting sprint";
    throw new Error(errorMsg);
  }
};