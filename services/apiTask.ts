"use client";

import apiClient from "@/lib/apiClient";
import { TaskType, TaskPriority } from "./apiProject";

// =============================================================================
// 1. INTERFACES & DTOs (Định nghĩa kiểu dữ liệu)
// =============================================================================

// -----------------------------------------------------------------------------
// Filter Params
// -----------------------------------------------------------------------------
export interface ProjectTaskFilterParams {
  search?: string;
  keyword?: string;
  page?: number;
  size?: number;
  assigneeId?: number;
  sprintId?: number | null;
  priority?: TaskPriority;
  taskType?: TaskType;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// -----------------------------------------------------------------------------
// Data Models (Response)
// -----------------------------------------------------------------------------

// ✅ Cập nhật TaskDetail khớp với JSON GET /api/tasks/{taskId}
export interface TaskDetail {
  id: number;
  taskCode: string;
  projectId: number;
  title: string;
  description: string | null;

  // Flat fields
  statusId: number;
  sprintId: number | null;
  epicId: number | null; 
  assigneeId: number | null;
  assignerId: number | null;

  // Objects lồng nhau
  status?: {
    id: number;
    name: string;
    color: string;
    isCompleted?: boolean;
  };

  sprint?: {
    id: number;
    name: string;
  } | null;

  epic?: {
    id: number;
    name: string;
    color?: string;
  } | null;

  assignee?: {
    id: number;
    name: string;
    avatarUrl: string | null;
  } | null;
  
  // ✅ Tags field
  tags?: {
    id: number;
    name: string;
    color: string;
  }[];
  
  // UI Display fields
  statusName: string;
  statusColor: string;
  assignerName: string | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;

  taskType: TaskType; 
  priority: TaskPriority; 
  storyPoints: number | null;
  estimatedHours: number | null;
  loggedHours: number | null;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdById: number;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

// -----------------------------------------------------------------------------
// Payloads (Request Body)
// -----------------------------------------------------------------------------

export interface UpdateTaskData {
  title?: string;
  description?: string;
  taskType?: TaskType; // 'STORY' | 'TASK' | 'BUG' ...
  priority?: TaskPriority; // 'LOW' | 'MEDIUM' | 'HIGH' ...
  statusId?: number;
  sprintId?: number | null;
  epicId?: number | null;
  assigneeId?: number | null;
  storyPoints?: number;
  estimatedHours?: number;
  startDate?: string; 
  dueDate?: string;   
}

export interface MoveTaskPayload {
  sprintId: number | null; 
  newSortOrder?: number;   
}

// =============================================================================
// 2. CORE TASK APIs (CRUD Basic)
// =============================================================================

/**
 * 🔹 GET: Lấy chi tiết Task
 */
export const getTaskDetails = async (taskId: number): Promise<TaskDetail> => {
  try {
    const res = await apiClient.get(`/tasks/${taskId}`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch task details.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error fetching task details.");
  }
};

/**
 * 🔹 PUT: Cập nhật thông tin chung (Title, Desc, Priority...)
 */
export const updateTask = async (taskId: number, data: UpdateTaskData) => {
  try {
    const res = await apiClient.put(`/tasks/${taskId}`, data);
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to update task.");
    return res.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error updating task.");
  }
};

/**
 * 🔹 PATCH: Cập nhật Epic cho Task
 */
export const updateTaskEpic = async (taskId: number, epicId: number | null) => {
  try {
    const res = await apiClient.patch(`/tasks/${taskId}/epic`, { epicId });
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to update task epic.");
    return res.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error updating epic.");
  }
};

// =============================================================================
// 3. MOVE & TRANSITION APIs (Di chuyển Task)
// =============================================================================

/**
 * 🔹 PUT: Di chuyển Task sang Sprint khác
 */
export const moveTaskToSprint = async (
  taskId: number,
  sprintId: number | null,
  newSortOrder?: number
) => {
  try {
    const payload: MoveTaskPayload = { sprintId, newSortOrder };
    const res = await apiClient.put(`/tasks/${taskId}/sprint`, payload);
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to move task to sprint.");
    return res.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error moving task.");
  }
};

/**
 * 🔹 PUT: Di chuyển Task sang Status khác (Kéo thả cột Board)
 */
export const moveTaskToStatus = async (
  taskId: number,
  payload: { newStatusId: number; newSortOrder?: number }
) => {
  try {
    const res = await apiClient.put(`/tasks/${taskId}/move`, payload);
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to move task status.");
    return res.data.data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error moving task status.");
  }
};

// =============================================================================
// 4. COMMENT APIs
// =============================================================================

export const getTaskComments = async (taskId: number) => {
  try {
    const res = await apiClient.get(`/tasks/${taskId}/comments`);
    // Assuming standard response format
    return res.data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to load comments.");
  }
};

export const addTaskComment = async (taskId: number, content: string) => {
  try {
    const res = await apiClient.post(`/tasks/${taskId}/comments`, { content });
    return res.data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to add comment.");
  }
};

// =============================================================================
// 5. ATTACHMENT APIs
// =============================================================================

export const getTaskAttachments = async (taskId: number) => {
  try {
    const res = await apiClient.get(`/tasks/${taskId}/attachments`);
    return res.data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to load attachments.");
  }
};

export const uploadTaskAttachment = async (taskId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post(
      `/tasks/${taskId}/attachments`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload attachment.");
  }
};

// =============================================================================
// 6. ARCHIVE & RESTORE APIs
// =============================================================================

/**
 * 🔹 PATCH: Lưu trữ Task (Chuyển vào thùng rác)
 */
export const archiveTask = async (taskId: number) => {
  try {
    const res = await apiClient.patch(`/tasks/${taskId}/archive`);
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to archive task.");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error archiving task.");
  }
};

/**
 * 🔹 PATCH: Khôi phục Task (Lấy lại từ thùng rác)
 */
export const restoreTask = async (taskId: number) => {
  try {
    const res = await apiClient.patch(`/tasks/${taskId}/restore`);
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to restore task.");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error restoring task.");
  }
};

// =============================================================================
// 7. IMPORT APIs
// =============================================================================

/**
 * 1. Tải file mẫu CSV
 */
export const downloadTemplate = async () => {
  try {
    const response = await apiClient.get("/tasks/import-template", {
      responseType: "blob", 
    });

    // Tạo link ảo để trình duyệt tải xuống
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tasks_import_template.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to download template.");
  }
};

/**
 * 2. Xem trước Import Task (Preview)
 */
export const previewImportTasks = async (projectId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await apiClient.post(`/tasks/${projectId}/import/preview`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to preview import.");
    return data; // Trả về List<TaskImportPreviewResponse>
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error previewing import.");
  }
};

/**
 * 3. Lưu Import Task (Save)
 */
export const saveImportedTasks = async (projectId: number, data: any[]) => {
  try {
    const res = await apiClient.post(`/tasks/${projectId}/import/save`, data);
    const { success, message, data: resData } = res.data;

    if (!success) throw new Error(message || "Failed to save imported tasks.");
    return resData;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error saving import.");
  }
};