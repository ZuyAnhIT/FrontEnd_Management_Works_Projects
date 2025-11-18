"use client";


import apiClient from "@/lib/apiClient";


// =============================
// 🧩 SPRINT ASSIGNMENT
// =============================


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
