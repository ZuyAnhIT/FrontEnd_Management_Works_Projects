"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES (Định nghĩa kiểu dữ liệu)
// =============================================================================

// Interface: Workspace trong Dashboard
export interface DashboardWorkspace {
  workspaceId: number;
  workspaceName: string;
  workspaceCode: string;
  memberCount: number;
  projectCount: number;
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

// Interface: Task của tôi
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

// Interface: Project của tôi
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

// Interface: Company của tôi
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

// =============================================================================
// 2. API METHODS (Các hàm gọi API)
// =============================================================================

/**
 * 1️⃣ GET – Lấy danh sách Workspace tôi tham gia
 */
export const getDashboardWorkspaces = async (): Promise<DashboardWorkspace[]> => {
  try {
    const res = await apiClient.get('/dashboard/workspaces');
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load workspaces.");
    }
    return data as DashboardWorkspace[];
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to fetch your workspaces.");
  }
};

/**
 * 2️⃣ GET – Lấy danh sách Task của tôi
 */
export const getDashboardMyTasks = async (): Promise<DashboardMyTask[]> => {
  try {
    const res = await apiClient.get('/dashboard/my-tasks');
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load tasks.");
    }
    return data as DashboardMyTask[];
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to fetch your tasks.");
  }
};

/**
 * 3️⃣ GET – Lấy danh sách Project của tôi
 */
export const getDashboardMyProjects = async (): Promise<DashboardMyProject[]> => {
  try {
    const res = await apiClient.get('/dashboard/my-projects');
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load projects.");
    }
    return data as DashboardMyProject[];
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to fetch your projects.");
  }
};

/**
 * 4️⃣ GET – Lấy danh sách Company của tôi
 */
export const getDashboardCompanies = async (): Promise<DashboardCompany[]> => {
  try {
    const res = await apiClient.get('/dashboard/companies');
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load companies.");
    }
    return data as DashboardCompany[];
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to fetch your companies.");
  }
};