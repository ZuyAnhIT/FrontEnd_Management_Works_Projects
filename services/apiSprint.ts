"use client";


import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/services/apiUser";


// ===================================================
// 🔹 Interface Task trong Sprint
// ===================================================
export interface SprintTask {
  id: number;
  taskCode: string;
  title: string;
  description: string;
  taskType: string;
  status: string;
  priority: string;
  storyPoints: number;
  dueDate: string;
  projectId: number;
  sprintId: number;
  epicId: number;
  assignerId: number;
  assignerName: string;
  assigneeId: number;
  assigneeName: string;
  assigneeAvatar: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
}


// ===================================================
// 🔹 Interface Sprint
// ===================================================
export interface Sprint {
  id: number;
  name: string;
  goal: string;
  status: string;
  startDate: string;
  endDate: string;
  projectId: number;
  tasks: SprintTask[];
}


// ===================================================
// 1️⃣ GET – Lấy danh sách Sprint của dự án
//     /api/projects/{projectId}/sprints
// ===================================================
export const getSprints = async (
  projectId: number,
  status?: string
): Promise<Sprint[]> => {


  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  try {
    const res = await apiClient.get(`/projects/${projectId}/sprints`, {
      params: status ? { status } : {},
      headers: { Authorization: `Bearer ${token}` },
    });


    const data = res.data;


    if (!data.success)
      throw new Error(data.message || "Không thể tải danh sách Sprint.");


    return data.data as Sprint[];
  } catch (err: any) {
    console.error(" Lỗi lấy danh sách Sprint:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể lấy danh sách Sprint."
    );
  }
};


// ===================================================
// 2️⃣ POST – Tạo Sprint mới
//     /api/projects/{projectId}/sprints
// ===================================================
export const createSprint = async (
  projectId: number,
  payload: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    taskIds: number[];
  }
): Promise<Sprint> => {


  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  try {
    const res = await apiClient.post(
      `/projects/${projectId}/sprints`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;


    if (!data.success)
      throw new Error(data.message || "Không thể tạo Sprint.");


    return data.data as Sprint;
  } catch (err: any) {
    console.error(" Lỗi tạo Sprint:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tạo Sprint."
    );
  }
};


// ===================================================
// 3️⃣ POST – Start Sprint
//     /api/projects/{projectId}/sprints/{sprintId}/start
// ===================================================
export const startSprint = async (
  projectId: number,
  sprintId: number
): Promise<Sprint> => {


  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  try {
    const res = await apiClient.post(
      `/projects/${projectId}/sprints/${sprintId}/start`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;


    if (!data.success)
      throw new Error(data.message || "Không thể bắt đầu Sprint.");


    return data.data as Sprint;
  } catch (err: any) {
    console.error(" Lỗi start Sprint:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể bắt đầu Sprint."
    );
  }
};


// ===================================================
// 4️⃣ POST – Complete Sprint
//     /api/projects/{projectId}/sprints/{sprintId}/complete
// ===================================================
export const completeSprint = async (
  projectId: number,
  sprintId: number
): Promise<Sprint> => {


  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  try {
    const res = await apiClient.post(
      `/projects/${projectId}/sprints/${sprintId}/complete`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;


    if (!data.success)
      throw new Error(data.message || "Không thể hoàn thành Sprint.");


    return data.data as Sprint;
  } catch (err: any) {
    console.error(" Lỗi complete Sprint:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể hoàn thành Sprint."
    );
  }
};


// ===================================================
// 5️⃣ POST – Cancel Sprint
//     /api/projects/{projectId}/sprints/{sprintId}/cancel
// ===================================================
export const cancelSprint = async (
  projectId: number,
  sprintId: number
): Promise<Sprint> => {


  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  try {
    const res = await apiClient.post(
      `/projects/${projectId}/sprints/${sprintId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;


    if (!data.success)
      throw new Error(data.message || "Không thể hủy Sprint.");


    return data.data as Sprint;
  } catch (err: any) {
    console.error(" Lỗi cancel Sprint:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể hủy Sprint."
    );
  }
};



