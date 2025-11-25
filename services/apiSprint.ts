"use client";

import apiClient from "@/lib/apiClient";

// ===================================================
// 🔹 INTERFACES
// ===================================================

export interface SprintTask {
  id: number;
  title: string;
  statusName: string;
  priority: string;
  assigneeAvatarUrl?: string | null;
  storyPoints?: number;
}

export interface Sprint {
  id: number;
  name: string;
  goal?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate?: string;
  endDate?: string;
  projectId: number;
  tasks?: SprintTask[];
  taskCount?: number;
}

// Interface Payload cập nhật theo mẫu JSON backend yêu cầu
export interface SprintPayload {
  name?: string;      
  goal?: string;
  startDate?: string; // ISO String (YYYY-MM-DDTHH:mm:ss.sssZ)
  endDate?: string;   // ISO String
  taskIds?: number[]; // Mảng ID task muốn gán vào sprint
}

// ===================================================
// 🔹 API METHODS
// ===================================================

// 1️⃣ GET – Lấy danh sách Sprint
// URL: /api/projects/{projectId}/sprints
export const getSprints = async (
  projectId: number,
  status?: string
): Promise<Sprint[]> => {
  const res = await apiClient.get(
    `/projects/${projectId}/sprints`, 
    { params: status ? { status } : {} }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// 2️⃣ POST – Tạo Sprint (Hỗ trợ Tạo nhanh & Tạo đầy đủ)
// URL: /api/projects/{projectId}/sprints
export const createSprint = async (
  projectId: number,
  payload: SprintPayload = {} // Mặc định rỗng {} để hỗ trợ tạo nhanh (Backend tự sinh tên)
): Promise<Sprint> => {
  const res = await apiClient.post(
    `/projects/${projectId}/sprints`,
    payload
  );

  if (!res.data.success) throw new Error(res.data.message || "Không thể tạo Sprint.");
  return res.data.data;
};

// 3️⃣ PUT – Cập nhật Sprint
// URL: /api/projects/{projectId}/sprints/{sprintId}
export const updateSprint = async (
  projectId: number,
  sprintId: number,
  payload: SprintPayload
): Promise<Sprint> => {
    const res = await apiClient.put(
        `/projects/${projectId}/sprints/${sprintId}`,
        payload
    );
    if (!res.data.success) throw new Error(res.data.message || "Không thể cập nhật Sprint.");
    return res.data.data;
};

// 4️⃣ POST – Start Sprint
// URL: /api/projects/{projectId}/sprints/{sprintId}/start
export const startSprint = async (
  projectId: number, 
  sprintId: number
): Promise<Sprint> => {
  const res = await apiClient.post(
    `/projects/${projectId}/sprints/${sprintId}/start`
  );
  
  if (!res.data.success) throw new Error(res.data.message || "Không thể bắt đầu Sprint.");
  return res.data.data;
};

// 5️⃣ POST – Complete Sprint
// URL: /api/projects/{projectId}/sprints/{sprintId}/complete
export const completeSprint = async (
    projectId: number, 
    sprintId: number
): Promise<Sprint> => {
    const res = await apiClient.post(
      `/projects/${projectId}/sprints/${sprintId}/complete`
    );
    
    if (!res.data.success) throw new Error(res.data.message || "Không thể hoàn thành Sprint.");
    return res.data.data;
};

// 6️⃣ DELETE – Xóa Sprint
// URL: /api/projects/{projectId}/sprints/{sprintId}
export const deleteSprint = async (
    projectId: number, 
    sprintId: number
) => {
    const res = await apiClient.delete(
      `/projects/${projectId}/sprints/${sprintId}`
    );
    
    if (!res.data.success) throw new Error(res.data.message || "Không thể xóa Sprint.");
    return res.data;
};

// 7️⃣ GET – Lấy chi tiết Sprint (Nếu cần)
// URL: /api/projects/{projectId}/sprints/{sprintId}
export const getSprintDetail = async (
  projectId: number,
  sprintId: number
): Promise<Sprint> => {
  const res = await apiClient.get(
    `/projects/${projectId}/sprints/${sprintId}`
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};