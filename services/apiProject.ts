"use client";

import apiClient from "@/lib/apiClient";

/* ============================================
   📌 1. INTERFACES (Khớp với Backend)
============================================ */

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

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

export interface ProjectMember {
  memberId: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  roleName: string;
  joinedAt: string;
  phoneNumber: string;
  status: string;
}

export interface BacklogTask {
  id: number;
  taskCode: string;
  title: string;
  taskType: string;
  statusId: number;
  statusName: string;
  statusColor: string;
  priority: string;
  sprintId: number;
  assigneeId: number;
  assigneeName: string;
  assigneeAvatarUrl: string;
  epicId: number;
  epicName: string;
  epicColor: string;
  storyPoints: number;
  dueDate: string;
  sortOrder: number;
}

/* ============================================
   🛠️ 2. HELPER: LÀM SẠCH PARAMS
   (Loại bỏ null/undefined/rỗng trước khi gửi)
============================================ */
const cleanParams = (params: any) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );
};

/* ============================================
   3️⃣ API METHODS
============================================ */

// --- 3.1 GET PROJECT LIST (Lấy danh sách thường, lọc status) ---
export const getProjects = async (
  companyId: number,
  workspaceId: number,
  params: any = {}
): Promise<PageResponse<Project>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects`,
    { params: cleanParams(params) }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 3.2 SEARCH PROJECTS (Tìm kiếm nâng cao: name, code, manager) ---
export const searchProjects = async (
  companyId: number,
  workspaceId: number,
  params: any = {}
): Promise<PageResponse<Project>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/search`,
    { params: cleanParams(params) }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 3.3 GET TRASHED PROJECTS ---
export const getTrashedProjects = async (
  companyId: number,
  workspaceId: number
): Promise<Project[]> => {
  // Tái sử dụng getProjects với status DELETED
  const data = await getProjects(companyId, workspaceId, {
    page: 0,
    size: 200,
    status: "DELETED",
  });
  return data.content;
};

// --- 3.4 CREATE PROJECT ---
export const createProject = async (
  companyId: number,
  workspaceId: number,
  payload: {
    name: string;
    projectCode: string;
    description?: string;
    goal?: string;
    coverImageUrl?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
    projectTypeId?: number;
    managerId?: number;
    boardConfig?: object;
  }
): Promise<Project> => {
  const res = await apiClient.post(
    `/companies/${companyId}/workspaces/${workspaceId}/projects`,
    payload
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 3.5 DELETE PROJECT (Soft Delete) ---
export const deleteProject = async (
  companyId: number,
  workspaceId: number,
  projectId: number
) => {
  const res = await apiClient.delete(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data;
};

// --- 3.6 GET PROJECT DETAIL ---
export const getProjectDetail = async (
  companyId: number,
  workspaceId: number,
  projectId: number
): Promise<Project> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 3.7 UPDATE PROJECT ---
export const updateProject = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  payload: any
): Promise<Project> => {
  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`,
    payload
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 3.8 UPDATE PROJECT STATUS (Restore/Archive) ---
export const updateProjectStatus = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  newStatus: string
) => {
  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/status`,
    { newStatus }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 3.9 GET PROJECT MEMBERS ---
export const getProjectMembers = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: any = {}
): Promise<PageResponse<ProjectMember>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members`,
    { params: cleanParams(params) }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 3.10 UPDATE PROJECT MEMBER ROLE ---
export const updateProjectMemberRole = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  memberId: number,
  roleCode: string
) => {
  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}/role`,
    { roleCode }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 3.11 GET BACKLOG ---
export const getProjectBacklog = async (
  companyId: number,
  workspaceId: number,
  projectId: number
): Promise<BacklogTask[]> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/backlog`
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 3.12 CREATE TASK ---
export const createProjectTask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  payload: any
) => {
  const res = await apiClient.post(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    payload
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};