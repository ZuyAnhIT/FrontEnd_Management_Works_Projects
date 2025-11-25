"use client";

import apiClient from "@/lib/apiClient";

// ===================================================
// 🔹 1. INTERFACES & DTOs
// ===================================================

// Payload tạo mới Sprint (Create)
export interface SprintPayload {
  name?: string;      
  goal?: string;
  startDate?: string; // ISO String
  endDate?: string;   // ISO String
  taskIds?: number[]; // Mảng ID task
}

// Payload cập nhật Sprint (Update) - Tách riêng cho rõ ràng
export interface UpdateSprintPayload {
  name?: string;
  goal?: string;
  startDate?: string; 
  endDate?: string;
}

// Object Task rút gọn hiển thị trong Sprint Detail
export interface TaskSummary {
  id: number;
  taskCode: string;
  title: string;
  taskType: string; // 'TASK', 'BUG', 'STORY'...
  statusId: number;
  statusName: string;
  statusColor: string;
  priority: string;
  assigneeAvatarUrl?: string;
  storyPoints?: number;
  // Các trường khác nếu cần
}

// Object Sprint cơ bản (cho danh sách bên ngoài)
export interface Sprint {
  id: number;
  name: string;
  goal?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate?: string;
  endDate?: string;
  projectId: number;
  taskCount?: number;
}

// Object Sprint Chi Tiết (cho Panel/Modal) - Bao gồm thống kê và list Task
export interface SprintDetails extends Sprint {
  totalStoryPoints: number; // Tổng điểm
  taskCount: number;        // Tổng số task
  tasks: TaskSummary[];     // Danh sách task chi tiết
}

// ===================================================
// 🔹 2. API METHODS
// ===================================================

// 1️⃣ GET – Lấy danh sách Sprint (List View)
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

// 2️⃣ POST – Tạo Sprint
// URL: /api/projects/{projectId}/sprints
export const createSprint = async (
  projectId: number,
  payload: SprintPayload = {} 
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
  payload: UpdateSprintPayload
): Promise<SprintDetails> => { // Trả về chi tiết để update UI
    try {
        const res = await apiClient.put(
            `/projects/${projectId}/sprints/${sprintId}`,
            payload
        );

        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi cập nhật Sprint.");
    }
};

// 4️⃣ GET – Xem chi tiết Sprint (MỚI)
// URL: /api/projects/{projectId}/sprints/{sprintId}
export const getSprintDetails = async (
  projectId: number,
  sprintId: number
): Promise<SprintDetails> => {
    try {
        const res = await apiClient.get(
            `/projects/${projectId}/sprints/${sprintId}`
        );

        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data; 
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Lỗi lấy thông tin Sprint.");
    }
};

// 5️⃣ POST – Start Sprint
// URL: /api/projects/{projectId}/sprints/{sprintId}/start
export const startSprint = async (
  projectId: number, 
  sprintId: number
): Promise<Sprint> => {
  const res = await apiClient.post(
    `/projects/${projectId}/sprints/${sprintId}/start`
  );
  
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// 6️⃣ POST – Complete Sprint
// URL: /api/projects/{projectId}/sprints/{sprintId}/complete
export const completeSprint = async (
    projectId: number, 
    sprintId: number
): Promise<Sprint> => {
    const res = await apiClient.post(
      `/projects/${projectId}/sprints/${sprintId}/complete`
    );
    
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data;
};

// 7️⃣ DELETE – Xóa Sprint
// URL: /api/projects/{projectId}/sprints/{sprintId}
export const deleteSprint = async (
    projectId: number, 
    sprintId: number
) => {
    const res = await apiClient.delete(
      `/projects/${projectId}/sprints/${sprintId}`
    );
    
    if (!res.data.success) throw new Error(res.data.message);
    return res.data;
};