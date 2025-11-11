"use client";

import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/services/apiUser";

// ===================================================
// 🔹 Interface kiểu dữ liệu project
// ===================================================
export interface Project {
  id: number;
  workspaceId: number;
  name: string;
  projectCode: string;
  description: string;
  goal: string;
  coverImageUrl: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  completedAt: string | null;
  progress: number;
  managerId: number;
  managerName: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ===================================================
// 1️⃣ GET – Lấy danh sách dự án trong workspace
// ===================================================
export const getProjects = async (workspaceId: number): Promise<Project[]> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId || user.workspaces?.[0].companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");

  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/projects`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể tải danh sách dự án.");

    return data.data as Project[];
  } catch (err: any) {
    console.error("❌ Lỗi lấy danh sách dự án:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải danh sách dự án."
    );
  }
};

// ===================================================
// 2️⃣ POST – Tạo dự án mới trong workspace
// ===================================================
export const createProject = async (
  workspaceId: number,
  payload: {
    name: string;
    projectCode: string;
    description?: string;
    goal?: string;
    coverImageUrl?: string;
    boardConfig?: object;
    projectTypeId?: number;
    managerId?: number;
    priority?: string;
    startDate?: string;
    dueDate?: string;
  }
): Promise<Project> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");

  try {
    const res = await apiClient.post(
      `/companies/${companyId}/workspaces/${workspaceId}/projects`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể tạo dự án mới.");

    return data.data as Project;
  } catch (err: any) {
    console.error(" Lỗi tạo dự án:", err);
    throw new Error(
      err.response?.data?.message || "Lỗi hệ thống, không thể tạo dự án mới."
    );
  }
};

// ===================================================
// 3️⃣ GET – Lấy danh sách dự án trong “Thùng rác”
// ===================================================
export const getTrashedProjects = async (
  workspaceId: number
): Promise<Project[]> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");

  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/trash`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể tải danh sách dự án đã xóa.");

    return data.data as Project[];
  } catch (err: any) {
    console.error(" Lỗi lấy danh sách dự án đã xóa:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải danh sách dự án đã xóa."
    );
  }
};

// ===================================================
// 4️⃣ DELETE – Xóa dự án
// ===================================================
export const deleteProject = async (
  workspaceId: number,
  projectId: number
): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");

  try {
    const res = await apiClient.delete(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success) throw new Error(data.message || "Không thể xóa dự án.");

    return {
      success: true,
      message: data.message || "Đã xóa dự án thành công.",
    };
  } catch (err: any) {
    console.error(" Lỗi xóa dự án:", err);
    throw new Error(
      err.response?.data?.message || "Lỗi hệ thống, không thể xóa dự án."
    );
  }
};
