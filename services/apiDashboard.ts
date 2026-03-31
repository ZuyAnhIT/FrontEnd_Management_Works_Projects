"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Thông tin không gian làm việc (Workspace) hiển thị tại Dashboard
 */
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

/**
 * Thông tin công việc cá nhân (My Task) hiển thị tại Dashboard
 */
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

/**
 * Thông tin dự án cá nhân (My Project) hiển thị tại Dashboard
 */
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

/**
 * Thông tin công ty (Company) mà người dùng là thành viên
 */
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
// API METHODS
// =============================================================================

/**
 * Truy vấn danh sách các không gian làm việc (Workspaces) người dùng tham gia
 */
export const getDashboardWorkspaces = async (): Promise<DashboardWorkspace[]> => {
  try {
    const res = await apiClient.get("/dashboard/workspaces");
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch workspaces");
    }
    return data as DashboardWorkspace[];
  } catch (err: any) {
    // Ưu tiên sử dụng thông báo lỗi từ phía backend
    const errorMessage = err.response?.data?.message || "An error occurred while fetching workspaces";
    throw new Error(errorMessage);
  }
};

/**
 * Truy vấn danh sách các công việc (Tasks) được giao cho người dùng
 */
export const getDashboardMyTasks = async (): Promise<DashboardMyTask[]> => {
  try {
    const res = await apiClient.get("/dashboard/my-tasks");
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch tasks");
    }
    return data as DashboardMyTask[];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || "An error occurred while fetching tasks";
    throw new Error(errorMessage);
  }
};

/**
 * Truy vấn danh sách các dự án (Projects) người dùng đang tham gia
 */
export const getDashboardMyProjects = async (): Promise<DashboardMyProject[]> => {
  try {
    const res = await apiClient.get("/dashboard/my-projects");
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch projects");
    }
    return data as DashboardMyProject[];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || "An error occurred while fetching projects";
    throw new Error(errorMessage);
  }
};

/**
 * Truy vấn danh sách các công ty (Companies) liên kết với người dùng
 */
export const getDashboardCompanies = async (): Promise<DashboardCompany[]> => {
  try {
    const res = await apiClient.get("/dashboard/companies");
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch companies");
    }
    return data as DashboardCompany[];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || "An error occurred while fetching companies";
    throw new Error(errorMessage);
  }
};