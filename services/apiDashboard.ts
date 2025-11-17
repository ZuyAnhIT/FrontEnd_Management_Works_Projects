"use client";


import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/services/apiUser";


// ===================================================
// 🔹 Interface: Workspace trong Dashboard
// ===================================================
export interface DashboardWorkspace {
  workspaceId: number;
  workspaceName: string;
  workspaceCode: string;
  workspaceDescription: string;
  workspaceCoverImage: string;
  workspaceColor: string;
  workspaceStatus: string;
  companyId: number;
  companyName: string;
  companyLogoUrl: string;
  roleCode: string;
  roleName: string;
  membershipStatus: string;
  joinedAt: string;
}


// ===================================================
// 🔹 Interface: Task của tôi
// ===================================================
export interface DashboardMyTask {
  taskId: number;
  taskCode: string;
  taskTitle: string;
  taskStatus: string;
  taskPriority: string;
  taskDueDate: string;
  projectId: number;
  projectName: string;
  workspaceId: number;
  workspaceName: string;
}


// ===================================================
// 🔹 Interface: Project của tôi
// ===================================================
export interface DashboardMyProject {
  projectId: number;
  projectName: string;
  description: string;
  coverImage: string;
  color: string;
  workspaceId: number;
  workspaceName: string;
  companyId: number;
  companyName: string;
  myRoleName: string;
}


// ===================================================
// 🔹 Interface: Company của tôi
// ===================================================
export interface DashboardCompany {
  companyId: number;
  companyName: string;
  companyCode: string;
  description: string;
  logoUrl: string;
  roleCode: string;
  memberStatus: string;
  jobTitle: string;
  department: string;
  joinedAt: string;
}


// ===================================================
// 1️⃣ GET – Lấy danh sách Workspace tôi tham gia
//     /api/dashboard/workspaces
// ===================================================
export const getDashboardWorkspaces = async (): Promise<
  DashboardWorkspace[]
> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  try {
    const res = await apiClient.get(`/dashboard/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    });


    const data = res.data;


    if (!data.success)
      throw new Error(data.message || "Không thể tải danh sách workspace.");


    return data.data as DashboardWorkspace[];
  } catch (err: any) {
    console.error("❌ Lỗi tải danh sách dashboard workspace:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải danh sách workspace."
    );
  }
};


// ===================================================
// 2️⃣ GET – Lấy danh sách Task của tôi
//     /api/dashboard/my-tasks
// ===================================================
export const getDashboardMyTasks = async (): Promise<DashboardMyTask[]> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  try {
    const res = await apiClient.get(`/dashboard/my-tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });


    const data = res.data;


    if (!data.success)
      throw new Error(data.message || "Không thể tải danh sách công việc.");


    return data.data as DashboardMyTask[];
  } catch (err: any) {
    console.error("❌ Lỗi tải công việc của tôi:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải công việc của bạn."
    );
  }
};


// ===================================================
// 3️⃣ GET – Lấy danh sách Project của tôi
//     /api/dashboard/my-projects
// ===================================================
export const getDashboardMyProjects = async (): Promise<
  DashboardMyProject[]
> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  try {
    const res = await apiClient.get(`/dashboard/my-projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });


    const data = res.data;


    if (!data.success)
      throw new Error(data.message || "Không thể tải danh sách dự án.");


    return data.data as DashboardMyProject[];
  } catch (err: any) {
    console.error("❌ Lỗi tải dự án của tôi:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải dự án của bạn."
    );
  }
};


// ===================================================
// 4️⃣ GET – Lấy danh sách Company của tôi
//     /api/dashboard/companies
// ===================================================
export const getDashboardCompanies = async (): Promise<
  DashboardCompany[]
> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  try {
    const res = await apiClient.get(`/dashboard/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });


    const data = res.data;


    if (!data.success)
      throw new Error(data.message || "Không thể tải danh sách công ty.");


    return data.data as DashboardCompany[];
  } catch (err: any) {
    console.error("❌ Lỗi tải danh sách công ty:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải danh sách công ty."
    );
  }
};



