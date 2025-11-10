"use client";

import apiClient from "@/lib/apiClient";

// =============================
// 🧩 COMMENT APIs
// =============================

// 🔹 Lấy danh sách comment theo taskId
export const getTaskComments = async (taskId: number) => {
  const res = await apiClient.get(`/api/tasks/${taskId}/comments`);
  return res.data; // => { success, message, data: Comment[] }
};

// 🔹 Thêm comment mới vào task
export const addTaskComment = async (taskId: number, content: string) => {
  const res = await apiClient.post(`/api/tasks/${taskId}/comments`, { content });
  return res.data; // => { success, message, data: Comment }
};

// =============================
// 🧩 ATTACHMENT APIs
// =============================

// 🔹 Lấy danh sách file đính kèm theo task
export const getTaskAttachments = async (taskId: number) => {
  const res = await apiClient.get(`/api/tasks/${taskId}/attachments`);
  return res.data; // => { success, message, data: Attachment[] }
};

// 🔹 Upload file đính kèm cho task
export const uploadTaskAttachment = async (taskId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post(`/api/tasks/${taskId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // => { success, message, data: Attachment }
};
