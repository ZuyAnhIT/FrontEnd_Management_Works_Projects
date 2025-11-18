"use client";

import apiClient from "@/lib/apiClient";

//
// =============================
// 🧩 PROJECT STATUS
// =============================
//

// 🔹 Lấy danh sách trạng thái của project
// GET /api/projects/{projectId}/statuses
export const getProjectStatuses = async (projectId: number) => {
  const res = await apiClient.get(`/projects/${projectId}/statuses`);
  return res.data; // { success, message, data: [...] }
};

// 🔹 Tạo trạng thái mới
// POST /api/projects/{projectId}/statuses
export const createProjectStatus = async (
  projectId: number,
  payload: {
    name: string;
    color: string;
    isCompletedStatus: boolean;
  }
) => {
  const res = await apiClient.post(
    `/projects/${projectId}/statuses`,
    payload
  );

  return res.data; // { success, message, data: { ... } }
};

// 🔹 Cập nhật trạng thái
// PUT /api/projects/{projectId}/statuses/{statusId}
export const updateProjectStatus = async (
  projectId: number,
  statusId: number,
  payload: {
    name: string;
    color: string;
    isCompletedStatus: boolean;
  }
) => {
  const res = await apiClient.put(
    `/projects/${projectId}/statuses/${statusId}`,
    payload
  );

  return res.data; // { success, message, data: { ... } }
};

// 🔹 Xóa trạng thái
// DELETE /api/projects/{projectId}/statuses/{statusId}
export const deleteProjectStatus = async (
  projectId: number,
  statusId: number
) => {
  const res = await apiClient.delete(
    `/projects/${projectId}/statuses/${statusId}`
  );

  return res.data; // { success, message, data: {} }
};

// 🔹 Sắp xếp lại thứ tự trạng thái
// PUT /api/projects/{projectId}/statuses/reorder
export const reorderProjectStatuses = async (
  projectId: number,
  payload: {
    orderedStatusIds: number[];
  }
) => {
  const res = await apiClient.put(
    `/projects/${projectId}/statuses/reorder`,
    payload
  );

  return res.data; // { success, message, data: {} }
};
