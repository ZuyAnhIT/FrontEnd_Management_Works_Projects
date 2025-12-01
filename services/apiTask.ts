"use client";

import apiClient from "@/lib/apiClient";
// ✅ Import Types chuẩn từ apiProject
import { TaskType, TaskPriority } from "./apiProject"; 

// ------------------------------------------------
// 1. INTERFACES (Cập nhật đầy đủ fields)
// ------------------------------------------------

export interface ProjectTaskFilterParams {
  search?: string;
  keyword?: string;
  page?: number;
  size?: number;
  assigneeId?: number;
  sprintId?: number | null;
  
  // ✅ Type chuẩn
  priority?: TaskPriority; 
  taskType?: TaskType;
  
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ✅ Cập nhật TaskDetail khớp với JSON GET /api/tasks/{taskId}
export interface TaskDetail {
  id: number;
  taskCode: string;
  projectId: number;
  title: string;
  description: string | null;

  statusId: number;
  statusName: string;
  statusColor: string;

  taskType: TaskType; 
  priority: TaskPriority; 

  // ✅ Các trường bổ sung từ JSON mới
  sprintId: number | null;
  epicId: number | null; 
  epic?: {
    id: number;
    name: string;
    color?: string;
  } | null;
  
  storyPoints: number | null;
  estimatedHours: number | null;
  loggedHours: number | null;

  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null; // ✅ Thêm ngày hoàn thành

  // Người gán (Assigner)
  assignerId: number | null;
  assignerName: string | null;

  // Người được gán (Assignee)
  assigneeId: number | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;

  createdById: number;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string | null; // ✅ Thêm ngày update
}

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

// ------------------------------------------------
// 2. API METHODS CORE
// ------------------------------------------------

// 🔹 GET: Lấy chi tiết Task
export const getTaskDetails = async (taskId: number): Promise<TaskDetail> => {
  const res = await apiClient.get(`/tasks/${taskId}`);
  // Kiểm tra success dựa trên JSON mẫu
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// 🔹 PUT: Cập nhật thông tin chung (Title, Desc, Priority...)
export const updateTask = async (taskId: number, data: UpdateTaskData) => {
  const res = await apiClient.put(`/tasks/${taskId}`, data);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// 🔹 PATCH: Cập nhật Epic cho Task (✅ Mới thêm)
export const updateTaskEpic = async (taskId: number, epicId: number | null) => {
  const res = await apiClient.patch(`/tasks/${taskId}/epic`, { epicId });
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// 🔹 PUT: Di chuyển Task sang Sprint khác
export const moveTaskToSprint = async (
  taskId: number,
  sprintId: number | null,
  newSortOrder?: number
) => {
  const payload: MoveTaskPayload = {
    sprintId,
    newSortOrder
  };

  const res = await apiClient.put(`/tasks/${taskId}/sprint`, payload);

  if (!res.data.success) {
    throw new Error(res.data.message || "Không thể di chuyển công việc.");
  }

  return res.data.data;
};

// 🔹 PUT: Di chuyển Task sang Status khác (Kéo thả cột Board)
export const moveTaskToStatus = async (
  taskId: number,
  payload: { newStatusId: number; newSortOrder?: number }
) => {
  const res = await apiClient.put(`/tasks/${taskId}/move`, payload);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data; 
};

// =============================
// 🧩 COMMENTS
// =============================

export const getTaskComments = async (taskId: number) => {
  const res = await apiClient.get(`/tasks/${taskId}/comments`);
  return res.data; 
};

export const addTaskComment = async (taskId: number, content: string) => {
  const res = await apiClient.post(`/tasks/${taskId}/comments`, {
    content,
  });
  return res.data; 
};

// =============================
// 🧩 ATTACHMENTS
// =============================

export const getTaskAttachments = async (taskId: number) => {
  const res = await apiClient.get(`/tasks/${taskId}/attachments`);
  return res.data; 
};

export const uploadTaskAttachment = async (taskId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post(
    `/tasks/${taskId}/attachments`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data; 
};