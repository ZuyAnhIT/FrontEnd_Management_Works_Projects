"use client";

import apiClient from "@/lib/apiClient";

// ✅ 1. IMPORT TYPES TỪ API PROJECT ĐỂ ĐỒNG BỘ
import { TaskType, TaskPriority } from "./apiProject"; 

// ------------------------------------------------
// 1. INTERFACES
// ------------------------------------------------

export interface ProjectTaskFilterParams {
  search?: string;
  keyword?: string;
  page?: number;
  size?: number;
  assigneeId?: number;
  sprintId?: number | null;
  
  // ✅ 2. SỬA TỪ 'string' THÀNH TYPE CHUẨN
  priority?: TaskPriority; 
  taskType?: TaskType;
  
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface TaskDetail {
  id: number;
  taskCode: string;
  title: string;
  description: string | null;

  statusId: number;
  statusName: string;
  statusColor: string;

  taskType: string; 
  priority: string; 

  storyPoints: number | null;
  startDate: string | null;
  dueDate: string | null;

  assigneeId: number | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;

  projectId: number;
  sprintId: number | null;

  createdByName?: string;
  createdAt?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  // ✅ Dùng string literal hoặc import type đều được, nhưng nên thống nhất
  taskType?: 'STORY' | 'TASK' | 'BUG' | 'EPIC' | 'SUBTASK';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
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
// 2. API METHODS
// ------------------------------------------------

export const getTaskDetails = async (taskId: number): Promise<TaskDetail> => {
  const res = await apiClient.get(`/tasks/${taskId}`);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

export const updateTask = async (taskId: number, data: UpdateTaskData) => {
  const res = await apiClient.put(`/tasks/${taskId}`, data);
  return res.data;
};

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

// 🔹 Chuyển task sang status khác (Kéo thả cột Board)
export const moveTaskToStatus = async (
  taskId: number,
  payload: { newStatusId: number; newSortOrder?: number }
) => {
  const res = await apiClient.put(`/tasks/${taskId}/move`, payload);
  return res.data; 
};