"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

// -----------------------------------------------------------------------------
// Mô hình dữ liệu (Models)
// -----------------------------------------------------------------------------

/**
 * Thông tin chi tiết của không gian làm việc (Workspace)
 */
export interface Workspace {
  workspaceId: number;
  companyId: number;
  workspaceName: string;
  description: string;
  coverImage: string;
  color: string;
  createdById: number;
  status: string;
  createdAt: string;
  roleCode: any;
}

/**
 * Thông tin thành viên trong không gian làm việc
 */
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

/**
 * Cấu trúc phản hồi phân trang chuẩn
 */
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
// Dữ liệu yêu cầu và tham số (Payloads & Params)
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
// WORKSPACE CORE APIs
// =============================================================================

/**
 * Lấy danh sách toàn bộ không gian làm việc của công ty (Phân trang)
 */
export const getCompanyWorkspaces = async (
  companyId: number,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" }
): Promise<PageResponse<Workspace>> => {
  try {
    const url = `/companies/${companyId}/workspaces`;
    const res = await apiClient.get(url, { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch workspaces");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading workspaces";
    throw new Error(errorMsg);
  }
};

/**
 * Tìm kiếm không gian làm việc theo từ khóa và các tiêu chí lọc
 */
export const searchCompanyWorkspaces = async (
  companyId: number,
  params: WorkspaceSearchParams
): Promise<PageResponse<Workspace>> => {
  try {
    const url = `/companies/${companyId}/workspaces/search`;
    const res = await apiClient.get(url, { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to search workspaces");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while searching workspaces";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn thông tin chi tiết của một không gian làm việc
 */
export const getWorkspaceDetail = async (
  companyId: number,
  workspaceId: number
): Promise<Workspace> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}`;
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch workspace details");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading workspace details";
    throw new Error(errorMsg);
  }
};

/**
 * Khởi tạo không gian làm việc mới (Hỗ trợ tải lên ảnh bìa qua Multipart)
 */
export const createWorkspace = async (
  companyId: number,
  payload: CreateWorkspacePayload
): Promise<Workspace> => {
  try {
    const formData = new FormData();

    // Chuẩn bị phần dữ liệu JSON cho Backend Spring Boot
    const jsonPart = {
      workspaceName: payload.workspaceName,
      description: payload.description,
      color: payload.color,
    };
    const jsonBlob = new Blob([JSON.stringify(jsonPart)], { type: "application/json" });
    formData.append("data", jsonBlob);

    // Đính kèm tệp tin hình ảnh nếu có
    if (payload.file) {
      formData.append("file", payload.file);
    }

    const url = `/companies/${companyId}/workspaces`;
    const res = await apiClient.post(url, formData, { 
      headers: { "Content-Type": "multipart/form-data" } 
    });

    const { success, message, data } = res.data;
    if (!success) {
      throw new Error(message || "Failed to create workspace");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while creating workspace";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật thông tin chi tiết không gian làm việc
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

    const url = `/companies/${companyId}/workspaces/${workspaceId}`;
    const res = await apiClient.put(url, formData, { 
      headers: { "Content-Type": "multipart/form-data" } 
    });

    const { success, message, data } = res.data;
    if (!success) {
      throw new Error(message || "Failed to update workspace");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while updating workspace";
    throw new Error(errorMsg);
  }
};

/**
 * Thay đổi trạng thái hoạt động của không gian làm việc
 */
export const updateWorkspaceStatus = async (
  companyId: number,
  workspaceId: number,
  newStatus: "ACTIVE" | "DELETED"
) => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/status`;
    const res = await apiClient.put(url, { newStatus });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update workspace status");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while changing workspace status";
    throw new Error(errorMsg);
  }
};

/**
 * Loại bỏ vĩnh viễn không gian làm việc khỏi hệ thống
 */
export const deleteWorkspace = async (
  companyId: number,
  workspaceId: number
): Promise<void> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}`;
    const res = await apiClient.delete(url);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to delete workspace");
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while deleting workspace";
    throw new Error(errorMsg);
  }
};

// =============================================================================
// MEMBER MANAGEMENT APIs
// =============================================================================

/**
 * Truy vấn danh sách thành viên thuộc không gian làm việc
 */
export const getWorkspaceMembers = async (
  companyId: number,
  workspaceId: number,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" }
): Promise<PageResponse<WorkspaceMember>> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/members`;
    const res = await apiClient.get(url, { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch members");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading members";
    throw new Error(errorMsg);
  }
};

/**
 * Tìm kiếm thành viên theo từ khóa trong phạm vi không gian làm việc
 */
export const searchWorkspaceMembers = async (
  companyId: number,
  workspaceId: number,
  params: MemberSearchParams
): Promise<PageResponse<WorkspaceMember>> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/members/search`;
    const res = await apiClient.get(url, { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to search members");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while searching members";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy thông tin chi tiết của một thành viên cụ thể
 */
export const getWorkspaceMemberDetail = async (
  companyId: number,
  workspaceId: number,
  memberId: number
): Promise<WorkspaceMember> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}`;
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch member detail");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading member details";
    throw new Error(errorMsg);
  }
};

/**
 * Gửi lời mời tham gia không gian làm việc cho người dùng
 */
export const inviteMemberToWorkspace = async (
  companyId: number,
  workspaceId: number,
  payload: InviteMemberPayload
): Promise<void> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/invite-members`;
    const res = await apiClient.post(url, payload);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to invite member");
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while inviting member";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật trạng thái của thành viên (Active/Inactive)
 */
export const updateWorkspaceMemberStatus = async (
  companyId: number,
  workspaceId: number,
  memberId: number,
  newStatus: string
): Promise<WorkspaceMember> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}/status`;
    const res = await apiClient.put(url, { newStatus });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update member status");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while updating member status";
    throw new Error(errorMsg);
  }
};

/**
 * Thay đổi vai trò quyền hạn của thành viên
 */
export const updateWorkspaceMemberRole = async (
  companyId: number,
  workspaceId: number,
  memberId: number,
  roleCode: string
): Promise<void> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}/role`;
    const res = await apiClient.put(url, { roleCode });
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update member role");
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while updating member role";
    throw new Error(errorMsg);
  }
};

/**
 * Trục xuất/Loại bỏ thành viên khỏi không gian làm việc
 */
export const removeWorkspaceMember = async (
  companyId: number,
  workspaceId: number,
  memberId: number
): Promise<void> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}`;
    const res = await apiClient.delete(url);
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to remove member");
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while removing member";
    throw new Error(errorMsg);
  }
};