"use client";

import apiClient from "@/lib/apiClient";
import { TaskType, TaskPriority } from "./apiProject";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Tham số lọc danh sách công việc
 */
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

/**
 * Thông tin chi tiết của một công việc (Task)
 */
export interface TaskDetail {
  id: number;
  taskCode: string;
  projectId: number;
  title: string;
  description: string | null;

  // Định danh các đối tượng liên quan
  statusId: number;
  sprintId: number | null;
  epicId: number | null; 
  assigneeId: number | null;
  assignerId: number | null;

  // Thông tin chi tiết các đối tượng lồng nhau
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
  
  tags?: {
    id: number;
    name: string;
    color: string;
  }[];
  
  // Thông tin hiển thị bổ trợ trên giao diện
  statusName: string;
  statusColor: string;
  assignerName: string | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;

  // Thông tin định lượng và thời gian
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

/**
 * Dữ liệu yêu cầu để cập nhật thông tin công việc
 */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  taskType?: TaskType;
  priority?: TaskPriority;
  statusId?: number;
  sprintId?: number | null;
  epicId?: number | null;
  assigneeId?: number | null;
  storyPoints?: number;
  estimatedHours?: number;
  startDate?: string; 
  dueDate?: string;   
}

/**
 * Dữ liệu yêu cầu khi di chuyển công việc giữa các Sprint
 */
export interface MoveTaskPayload {
  sprintId: number | null; 
  newSortOrder?: number;   
}

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/**
 * Xây dựng tham số truy vấn sạch cho API
 * Loại bỏ giá trị rỗng và chuyển đổi mảng thành chuỗi phân cách bởi dấu phẩy
 */
const buildQueryParams = (params: any) => {
  if (!params) return {};
  
  const clean: any = {};
  
  Object.keys(params).forEach((key) => {
    const value = params[key];
    
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          clean[key] = value.join(","); 
        }
      } else {
        clean[key] = value;
      }
    }
  });

  return clean;
};

// =============================================================================
// CORE TASK APIs
// =============================================================================

/**
 * Truy vấn thông tin chi tiết của một công việc cụ thể
 */
export const getTaskDetails = async (taskId: number): Promise<TaskDetail> => {
  try {
    const res = await apiClient.get(`/tasks/${taskId}`);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch task details");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading task details";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật các thông tin cơ bản của công việc
 */
export const updateTask = async (taskId: number, data: UpdateTaskData) => {
  try {
    const res = await apiClient.put(`/tasks/${taskId}`, data);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update task");
    }
    return res.data.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while updating task";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật thuộc tính Epic cho công việc
 */
export const updateTaskEpic = async (taskId: number, epicId: number | null) => {
  try {
    const res = await apiClient.patch(`/tasks/${taskId}/epic`, { epicId });
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update task epic");
    }
    return res.data.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while updating task epic";
    throw new Error(errorMsg);
  }
};

// =============================================================================
// MOVEMENT & TRANSITION APIs
// =============================================================================

/**
 * Di chuyển công việc sang một Sprint khác
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

    if (!success) {
      throw new Error(message || "Failed to move task to sprint");
    }
    return res.data.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while moving task to sprint";
    throw new Error(errorMsg);
  }
};

/**
 * Di chuyển công việc sang một trạng thái mới (Cập nhật cột trên Board)
 */
export const moveTaskToStatus = async (
  taskId: number,
  payload: { newStatusId: number; newSortOrder?: number }
) => {
  try {
    const res = await apiClient.put(`/tasks/${taskId}/move`, payload);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to change task status");
    }
    return res.data.data; 
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while changing task status";
    throw new Error(errorMsg);
  }
};

// =============================================================================
// INTERACTION & ATTACHMENT APIs
// =============================================================================

/**
 * Truy vấn danh sách bình luận của công việc
 */
export const getTaskComments = async (taskId: number) => {
  try {
    const res = await apiClient.get(`/tasks/${taskId}/comments`);
    return res.data; 
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Failed to load task comments";
    throw new Error(errorMsg);
  }
};

/**
 * Thêm bình luận mới vào công việc
 */
export const addTaskComment = async (taskId: number, content: string) => {
  try {
    const res = await apiClient.post(`/tasks/${taskId}/comments`, { content });
    return res.data; 
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Failed to add comment";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn danh sách tệp đính kèm của công việc
 */
export const getTaskAttachments = async (taskId: number) => {
  try {
    const res = await apiClient.get(`/tasks/${taskId}/attachments`);
    return res.data; 
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Failed to load attachments";
    throw new Error(errorMsg);
  }
};

/**
 * Tải lên tệp đính kèm mới cho công việc
 */
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
    const errorMsg = error.response?.data?.message || "Failed to upload attachment";
    throw new Error(errorMsg);
  }
};

// =============================================================================
// LIFECYCLE APIs (Archive & Restore)
// =============================================================================

/**
 * Lưu trữ công việc (Đưa vào trạng thái lưu trữ/thùng rác)
 */
export const archiveTask = async (taskId: number) => {
  try {
    const res = await apiClient.patch(`/tasks/${taskId}/archive`);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to archive task");
    }
    return res.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while archiving task";
    throw new Error(errorMsg);
  }
};

/**
 * Khôi phục công việc từ trạng thái lưu trữ
 */
export const restoreTask = async (taskId: number) => {
  try {
    const res = await apiClient.patch(`/tasks/${taskId}/restore`);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to restore task");
    }
    return res.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while restoring task";
    throw new Error(errorMsg);
  }
};

// =============================================================================
// DATA IMPORT APIs
// =============================================================================

/**
 * Tải xuống tệp tin mẫu định dạng Excel để chuẩn bị dữ liệu nhập khẩu
 */
export const downloadTemplate = async () => {
  try {
    const response = await apiClient.get("/tasks/import-template", {
      responseType: "blob", 
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tasks_import_template.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Failed to download import template";
    throw new Error(errorMsg);
  }
};

/**
 * Xem trước dữ liệu công việc từ tệp tin trước khi nhập chính thức vào dự án
 */
export const previewImportTasks = async (projectId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await apiClient.post(`/tasks/${projectId}/import/preview`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to preview imported data");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while previewing import";
    throw new Error(errorMsg);
  }
};

/**
 * Xác nhận lưu trữ các công việc đã được kiểm duyệt từ bước nhập khẩu dữ liệu
 */
export const saveImportedTasks = async (projectId: number, data: any[]) => {
  try {
    const res = await apiClient.post(`/tasks/${projectId}/import/save`, data);
    const { success, message, data: resData } = res.data;

    if (!success) {
      throw new Error(message || "Failed to save imported tasks");
    }
    return resData;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while saving imported tasks";
    throw new Error(errorMsg);
  }
};