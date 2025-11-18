// services/apiDashboard.ts
"use client";


import apiClient from "@/lib/apiClient";

// ===================================================
// 🔹 Interface: Workspace trong Dashboard
// ===================================================
export interface DashboardWorkspace {
  workspaceId: number;
  workspaceName: string;
  workspaceCode: string;
  memberCount: number; // Thêm trường này nếu cần thống kê
  projectCount: number; // Thêm trường này nếu cần thống kê
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
// ===================================================
export const getDashboardWorkspaces = async (): Promise<DashboardWorkspace[]> => {
  try {
    const res = await apiClient.get('/dashboard/workspaces');
    return res.data.data as DashboardWorkspace[];
  } catch (err: any) {
    console.error("❌ Lỗi tải danh sách workspace:", err.response?.data || err);
    throw new Error(err.response?.data?.message || "Không thể tải danh sách Workspace của bạn.");
  }
};

// ===================================================
// 2️⃣ GET – Lấy danh sách Task của tôi
// ===================================================
export const getDashboardMyTasks = async (): Promise<DashboardMyTask[]> => {
  try {
    const res = await apiClient.get('/dashboard/my-tasks');
    return res.data.data as DashboardMyTask[];
  } catch (err: any) {
    console.error("❌ Lỗi tải công việc của tôi:", err.response?.data || err);
    throw new Error(err.response?.data?.message || "Không thể tải công việc của bạn.");
  }
};

// ===================================================
// 3️⃣ GET – Lấy danh sách Project của tôi
// ===================================================
export const getDashboardMyProjects = async (): Promise<any[]> => { // Dùng any[] cho đơn giản
  try {
    const res = await apiClient.get('/dashboard/my-projects');
    return res.data.data;
  } catch (err: any) {
    console.error("❌ Lỗi tải dự án của tôi:", err.response?.data || err);
    throw new Error(err.response?.data?.message || "Lỗi hệ thống, không thể tải dự án của bạn.");
  }
};

// ===================================================
// 4️⃣ GET – Lấy danh sách Company của tôi
// ===================================================
export const getDashboardCompanies = async (): Promise<DashboardCompany[]> => {
  try {
    const res = await apiClient.get('/dashboard/companies');
    return res.data.data as DashboardCompany[];
  } catch (err: any) {
    console.error("❌ Lỗi tải danh sách công ty:", err.response?.data || err);
    throw new Error(err.response?.data?.message || "Lỗi hệ thống, không thể tải danh sách công ty.");
  }
};

