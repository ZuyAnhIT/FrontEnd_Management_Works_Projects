"use client";
import apiClient from "@/lib/apiClient";

/* ============================================================
   📌 Shared Interfaces
============================================================ */

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

/* ============================================================
   1️⃣ Get Workspace Detail
============================================================ */
export const getWorkspaceDetail = async (
  companyId: number,
  workspaceId: number
): Promise<Workspace> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}`
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================================
   2️⃣ Update Workspace
============================================================ */
export const updateWorkspace = async (
  companyId: number,
  workspaceId: number,
  payload: {
    name?: string;
    description?: string;
    coverImage?: string;
    color?: string;
  }
): Promise<Workspace> => {
  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}`,
    payload
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================================
   3️⃣ Delete Workspace
============================================================ */
export const deleteWorkspace = async (
  companyId: number,
  workspaceId: number
): Promise<void> => {
  const res = await apiClient.delete(
    `/companies/${companyId}/workspaces/${workspaceId}`
  );

  if (!res.data.success) throw new Error(res.data.message);
};

/* ============================================================
   4️⃣ Update Workspace Status
============================================================ */
export const updateWorkspaceStatus = async (
  companyId: number,
  workspaceId: number,
  newStatus: "ACTIVE" | "DELETED"
) => {
  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/status`,
     { newStatus }
  );

  if (!res.data.success) {
    throw new Error(res.data.message);
  }

  return res.data.data;
};

/* ============================================================
   5️⃣ Update Workspace Member Status
============================================================ */
export const updateWorkspaceMemberStatus = async (
  companyId: number,
  workspaceId: number,
  memberId: number,
  newStatus: string
): Promise<WorkspaceMember> => {
  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}/status`,
    { newStatus }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================================
   6️⃣ Update Workspace Member Role
============================================================ */
export const updateWorkspaceMemberRole = async (
  companyId: number,
  workspaceId: number,
  memberId: number,
  roleCode: string
): Promise<void> => {
  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}/role`,
    { roleCode }
  );

  if (!res.data.success) throw new Error(res.data.message);
};

/* ============================================================
   7️⃣ Get Workspaces (Pagination)
============================================================ */
export const getCompanyWorkspaces = async (
  companyId: number,
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }
): Promise<PageResponse<Workspace>> => {

  const res = await apiClient.get(
    `/companies/${companyId}/workspaces`,
    { params }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to fetch workspaces.");
  }

  return res.data.data; // PageResponse<Workspace>
};


/* ============================================================
   8️⃣ Create Workspace (Multipart Upload)
============================================================ */
export const createWorkspace = async (
  companyId: number,
  payload: {
    workspaceName: string;
    description?: string;
    color?: string;
    file?: File | null;
  }
): Promise<Workspace> => {
  const formData = new FormData();

  formData.append(
    "data",
    JSON.stringify({
      workspaceName: payload.workspaceName,
      description: payload.description,
      color: payload.color,
    })
  );

  if (payload.file) {
    formData.append("file", payload.file);
  }

  const res = await apiClient.post(
    `/companies/${companyId}/workspaces`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================================
   9️⃣ Invite Member to Workspace
============================================================ */
export const inviteMemberToWorkspace = async (
  companyId: number,
  workspaceId: number,
  payload: {
    email: string;
    roleCode: string;
  }
): Promise<void> => {
  const res = await apiClient.post(
    `/companies/${companyId}/workspaces/${workspaceId}/invite-members`,
    payload
  );

  if (!res.data.success) throw new Error(res.data.message);
};

/* ============================================================
   🔟 Get Workspace Members (Pagination)
============================================================ */
export const getWorkspaceMembers = async (
  companyId: number,
  workspaceId: number,
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }
): Promise<PageResponse<WorkspaceMember>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/members`,
    { params }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================================
   1️⃣1️⃣ Get Workspace Member Detail
============================================================ */
export const getWorkspaceMemberDetail = async (
  companyId: number,
  workspaceId: number,
  memberId: number
): Promise<WorkspaceMember> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}`
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================================
   1️⃣2️⃣ Remove Workspace Member
============================================================ */
export const removeWorkspaceMember = async (
  companyId: number,
  workspaceId: number,
  memberId: number
): Promise<void> => {
  const res = await apiClient.delete(
    `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}`
  );

  if (!res.data.success) throw new Error(res.data.message);
};

/* ============================================================
   1️⃣3️⃣ Search Workspace Members
============================================================ */
export const searchWorkspaceMembers = async (
  companyId: number,
  workspaceId: number,
  params: {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }
): Promise<PageResponse<WorkspaceMember>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/members/search`,
    { params }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================================
   1️⃣4️⃣ Search Workspaces
============================================================ */
export const searchCompanyWorkspaces = async (
  companyId: number,
  params: {
    name?: string;
    code?: string;
    description?: string;
    status?: "ACTIVE" | "ARCHIVED" | "DELETED";
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }
): Promise<PageResponse<Workspace>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/search`,
    { params }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};
