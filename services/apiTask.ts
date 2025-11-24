// services/apiTask.ts
"use client";

import apiClient from "@/lib/apiClient";

// ------------------------------------------------
// 1. INTERFACES
// ------------------------------------------------

export interface TaskDetail {
  id: number;
  taskCode: string;
  title: string;
  description: string | null;
  
  // Status
  statusId: number;
  statusName: string;
  statusColor: string;

  taskType: string; // 'TASK', 'BUG', 'STORY'
  priority: string; // 'HIGH', 'MEDIUM', 'LOW', 'URGENT'
  
  storyPoints: number | null;
  startDate: string | null;
  dueDate: string | null;
  
  // People
  assigneeId: number | null;
  assigneeName: string | null;
  assigneeAvatar: string | null; // Lưu ý: API trả về assigneeAvatar, không phải assigneeAvatarUrl

  projectId: number;
  sprintId: number | null;
  
  // Tracking (Optional based on response)
  createdByName?: string;
  createdAt?: string;
}
export interface UpdateTaskData {
  title?: string;
  description?: string;
  taskType?: 'STORY' | 'TASK' | 'BUG' | 'EPIC' | 'SUBTASK';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  statusId?: number;
  sprintId?: number | null;
  epicId?: number | null;
  assigneeId?: number | null;
  storyPoints?: number;
  estimatedHours?: number;
  startDate?: string; // ISO String
  dueDate?: string;   // ISO String
}

// ------------------------------------------------
// 2. API METHODS
// ------------------------------------------------

// 🔹 Lấy chi tiết Task
export const getTaskDetails = async (taskId: number): Promise<TaskDetail> => {
  const res = await apiClient.get(`/tasks/${taskId}`);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data; 
};

// Hàm cập nhật
export const updateTask = async (taskId: number, data: UpdateTaskData) => {
  const res = await apiClient.put(`/tasks/${taskId}`, data);
  return res.data; 
};

// 🔹 Gán task vào sprint
export const assignTaskToSprint = async (taskId: number, sprintId: number) => {
  const res = await apiClient.put(`/tasks/${taskId}/sprint`, {
    sprintId,
  });
  return res.data; // { success, message, data }
};


// =============================
// 🧩 COMMENTS
// =============================


// 🔹 Lấy danh sách comment theo task
export const getTaskComments = async (taskId: number) => {
  const res = await apiClient.get(`/tasks/${taskId}/comments`);
  return res.data; // { success, message, data: [...] }
};


// 🔹 Thêm comment cho task
export const addTaskComment = async (taskId: number, content: string) => {
  const res = await apiClient.post(`/tasks/${taskId}/comments`, {
    content,
  });
  return res.data; // { success, message, data }
};


// =============================
// 🧩 ATTACHMENTS
// =============================


// 🔹 Lấy danh sách file đính kèm theo task
export const getTaskAttachments = async (taskId: number) => {
  const res = await apiClient.get(`/tasks/${taskId}/attachments`);
  return res.data; // { success, message, data: [...] }
};


// 🔹 Upload file đính kèm cho task
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


  return res.data; // { success, message, data }
};


  // 🔹 Chuyển task sang status khác
    // PUT /api/tasks/{taskId}/move
    export const moveTaskToStatus = async (
      taskId: number,
      newStatusId: number
    ) => {
      const res = await apiClient.put(`/tasks/${taskId}/move`, {
        newStatusId,
      });


      return res.data; // { success, message, data: {} }
    };
