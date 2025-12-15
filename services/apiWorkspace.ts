"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES & DTOs (Định nghĩa kiểu dữ liệu)
// =============================================================================

// -----------------------------------------------------------------------------
// Data Models (Response)
// -----------------------------------------------------------------------------

export interface Workspace {
  roleCode: any;
  workspaceId: number;
  companyId: number;
  workspaceName: string;
  description: string;
  coverImage: string;
  color: string;
  createdById: number;
  status: string;
  createdAt: string;
}

export interface WorkspaceMember {
  memberId: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  roleName: string;
  phoneNumber: string;
  joinedAt: string;
  status: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// -----------------------------------------------------------------------------
// Payloads (Request Body)
// -----------------------------------------------------------------------------

export interface CreateWorkspacePayload {
  workspaceName: string;
  description?: string;
  color?: string;
  file?: File | null;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
  coverImage?: string;
  color?: string;
  file?: File | null;
}

export interface InviteMemberPayload {
  email: string;
  roleCode: string;
}

export interface WorkspaceSearchParams {
  name?: string;
  code?: string;
  description?: string;
  status?: "ACTIVE" | "ARCHIVED" | "DELETED";
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface MemberSearchParams {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// =============================================================================
// 2. WORKSPACE CORE APIs (Quản lý Workspace)
// =============================================================================

/**
 * 🔹 Lấy danh sách Workspace (Có phân trang)
 */
export const getCompanyWorkspaces = async (
  companyId: number,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" }
): Promise<PageResponse<Workspace>> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/workspaces`, { params });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch workspaces.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error fetching workspaces.");
  }
};

/**
 * 🔹 Tìm kiếm Workspace
 */
export const searchCompanyWorkspaces = async (
  companyId: number,
  params: WorkspaceSearchParams
): Promise<PageResponse<Workspace>> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/workspaces/search`, { params });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to search workspaces.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error searching workspaces.");
  }
};

/**
 * 🔹 Lấy chi tiết Workspace
 */
export const getWorkspaceDetail = async (
  companyId: number,
  workspaceId: number
): Promise<Workspace> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/workspaces/${workspaceId}`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch workspace detail.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error fetching workspace detail.");
  }
};

/**
 * 🔹 Tạo Workspace mới (Multipart)
 */
export const createWorkspace = async (
  companyId: number,
  payload: CreateWorkspacePayload
): Promise<Workspace> => {
  try {
    const formData = new FormData();

    // Chuẩn hóa JSON Part thành Blob để tương thích tốt nhất với Spring Boot
    const jsonPart = {
      workspaceName: payload.workspaceName,
      description: payload.description,
      color: payload.color,
    };
    const jsonBlob = new Blob([JSON.stringify(jsonPart)], { type: "application/json" });
    formData.append("data", jsonBlob);

    if (payload.file) {
      formData.append("file", payload.file);
    }

    const res = await apiClient.post(
      `/companies/${companyId}/workspaces`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Failed to create workspace.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error creating workspace.");
  }
};

/**
 * 🔹 Cập nhật Workspace (Multipart)
 */
export const updateWorkspace = async (
  companyId: number,
  workspaceId: number,
  payload: UpdateWorkspacePayload
): Promise<Workspace> => {
  try {
    const formData = new FormData();

    const jsonPart = {
      name: payload.name,
      description: payload.description,
      color: payload.color,
    };
    
    const jsonBlob = new Blob([JSON.stringify(jsonPart)], { type: "application/json" });
    formData.append("data", jsonBlob);

    if (payload.file) {
      formData.append("file", payload.file);
    }

    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Failed to update workspace.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error updating workspace.");
  }
};

/**
 * 🔹 Cập nhật trạng thái Workspace (Active/Deleted)
 */
export const updateWorkspaceStatus = async (
  companyId: number,
  workspaceId: number,
  newStatus: "ACTIVE" | "DELETED"
) => {
  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}/status`,
      { newStatus }
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to update workspace status.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error updating status.");
  }
};

/**
 * 🔹 Xóa Workspace
 */
export const deleteWorkspace = async (
  companyId: number,
  workspaceId: number
): Promise<void> => {
  try {
    const res = await apiClient.delete(`/companies/${companyId}/workspaces/${workspaceId}`);
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to delete workspace.");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error deleting workspace.");
  }
};

// =============================================================================
// 3. MEMBER MANAGEMENT APIs (Quản lý thành viên Workspace)
// =============================================================================

/**
 * 🔹 Lấy danh sách thành viên
 */
export const getWorkspaceMembers = async (
  companyId: number,
  workspaceId: number,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" }
): Promise<PageResponse<WorkspaceMember>> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/workspaces/${workspaceId}/members`, { params });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch members.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error fetching members.");
  }
};

/**
 * 🔹 Tìm kiếm thành viên
 */
export const searchWorkspaceMembers = async (
  companyId: number,
  workspaceId: number,
  params: MemberSearchParams
): Promise<PageResponse<WorkspaceMember>> => {
  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/members/search`,
      { params }
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to search members.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error searching members.");
  }
};

/**
 * 🔹 Lấy chi tiết thành viên
 */
export const getWorkspaceMemberDetail = async (
  companyId: number,
  workspaceId: number,
  memberId: number
): Promise<WorkspaceMember> => {
  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}`
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch member detail.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error fetching member detail.");
  }
};

/**
 * 🔹 Mời thành viên vào Workspace
 */
export const inviteMemberToWorkspace = async (
  companyId: number,
  workspaceId: number,
  payload: InviteMemberPayload
): Promise<void> => {
  try {
    const res = await apiClient.post(
      `/companies/${companyId}/workspaces/${workspaceId}/invite-members`,
      payload
    );
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to invite member.");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error inviting member.");
  }
};

/**
 * 🔹 Cập nhật trạng thái thành viên
 */
export const updateWorkspaceMemberStatus = async (
  companyId: number,
  workspaceId: number,
  memberId: number,
  newStatus: string
): Promise<WorkspaceMember> => {
  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}/status`,
      { newStatus }
    );
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to update member status.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error updating member status.");
  }
};

/**
 * 🔹 Cập nhật vai trò thành viên
 */
export const updateWorkspaceMemberRole = async (
  companyId: number,
  workspaceId: number,
  memberId: number,
  roleCode: string
): Promise<void> => {
  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}/role`,
      { roleCode }
    );
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to update member role.");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error updating member role.");
  }
};

/**
 * 🔹 Xóa thành viên khỏi Workspace
 */
export const removeWorkspaceMember = async (
  companyId: number,
  workspaceId: number,
  memberId: number
): Promise<void> => {
  try {
    const res = await apiClient.delete(
      `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}`
    );
    const { success, message } = res.data;

    if (!success) throw new Error(message || "Failed to remove member.");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error removing member.");
  }
};