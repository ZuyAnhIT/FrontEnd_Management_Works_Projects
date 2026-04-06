"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================
import apiClient from "@/lib/apiClient";

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

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

export interface MyTaskSummary {
    taskId: number;
    taskTitle: string;
    projectName: string;
    taskDueDate: string | null;
    taskStatusColor: string;
}

export interface MyTaskBoardData {
    overdue: MyTaskSummary[];
    today: MyTaskSummary[];
    upcoming: MyTaskSummary[];
    noDueDate: MyTaskSummary[];
    other: MyTaskSummary[];
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface MyTaskSummary {
    taskId: number;
    taskCode: string;
    taskTitle: string;
    taskStatusId: number;
    taskStatusName: string;
    taskStatusColor: string;
    taskPriority: string;
    taskDueDate: string | null;
    projectId: number;
    projectName: string;
    workspaceId: number;
    workspaceName: string;
}

export interface MyTaskBoardData {
    overdue: MyTaskSummary[];
    today: MyTaskSummary[];
    upcoming: MyTaskSummary[];
    noDueDate: MyTaskSummary[];
    other: MyTaskSummary[];
}

// =============================================================================
// 3. API METHODS
// =============================================================================

/**
 * Truy van danh sach cac khong gian lam viec (Workspaces) ma nguoi dung tham gia
 */
export const getDashboardWorkspaces = async (): Promise<DashboardWorkspace[]> => {
    try {
        const res = await apiClient.get("/dashboard/workspaces");
        const { success, message, data } = res.data;

        if (!success && res.data.status !== 200) {
            throw new Error(message || "Failed to fetch workspaces");
        }
        return data as DashboardWorkspace[];
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || "An error occurred while fetching workspaces";
        throw new Error(errorMessage);
    }
};

/**
 * Truy van danh sach cac cong viec (Tasks) duoc giao cho nguoi dung tren toan he thong
 */
export const getDashboardMyTasks = async (): Promise<DashboardMyTask[]> => {
    try {
        const res = await apiClient.get("/dashboard/my-tasks");
        const { success, message, data } = res.data;

        if (!success && res.data.status !== 200) {
            throw new Error(message || "Failed to fetch tasks");
        }
        return data as DashboardMyTask[];
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || "An error occurred while fetching tasks";
        throw new Error(errorMessage);
    }
};

/**
 * Truy van danh sach cac du an (Projects) ma nguoi dung dang tham gia
 */
export const getDashboardMyProjects = async (): Promise<DashboardMyProject[]> => {
    try {
        const res = await apiClient.get("/dashboard/my-projects");
        const { success, message, data } = res.data;

        if (!success && res.data.status !== 200) {
            throw new Error(message || "Failed to fetch projects");
        }
        return data as DashboardMyProject[];
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || "An error occurred while fetching projects";
        throw new Error(errorMessage);
    }
};

/**
 * Truy van danh sach cac cong ty (Companies) lien ket voi nguoi dung
 */
export const getDashboardCompanies = async (): Promise<DashboardCompany[]> => {
    try {
        const res = await apiClient.get("/dashboard/companies");
        const { success, message, data } = res.data;

        if (!success && res.data.status !== 200) {
            throw new Error(message || "Failed to fetch companies");
        }
        return data as DashboardCompany[];
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || "An error occurred while fetching companies";
        throw new Error(errorMessage);
    }
};

/**
 * Truy van danh sach cong viec ca nhan duoc phan nhom thanh 5 cot thoi gian de hien thi tren Kanban Board
 */
export const getMyTaskBoard = async (): Promise<MyTaskBoardData> => {
    try {
        // Su dung apiClient thay vi axiosClient de dong bo voi he thong
        const res = await apiClient.get("/dashboard/my-task-board");
        
        // Ho tro linh hoat ca format { success, data } hoac { status, data } tu backend
        const { success, status, message, data } = res.data;

        if (success === false || (status && status !== 200)) {
            throw new Error(message || "Failed to fetch personal task board");
        }
        
        return data as MyTaskBoardData;
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || "An error occurred while fetching task board";
        throw new Error(errorMessage);
    }
};