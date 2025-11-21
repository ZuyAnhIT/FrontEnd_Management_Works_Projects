"use client";

import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/services/apiUser";

/* ============================================
   INTERFACE CHUẨN THEO API MỚI
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

/* ============================================
   1️⃣ GET PROJECT LIST (API MỚI: CÓ PHÂN TRANG)
============================================ */
export const getProjects = async (
  workspaceId: number,
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    status?: string;
  } = {}
): Promise<PageResponse<Project>> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not logged in");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Company ID not found");

  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects`,
    {
      params,
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================
   2️⃣ GET TRASHED PROJECTS
   (API MỚI: DÙNG status=DELETED)
============================================ */
export const getTrashedProjects = async (
  workspaceId: number
): Promise<Project[]> => {
  const data = await getProjects(workspaceId, {
    page: 0,
    size: 200,
    status: "DELETED",
  });

  return data.content;
};

/* ============================================
   3️⃣ CREATE PROJECT (API MỚI)
============================================ */
export const createProject = async (
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
  const token = localStorage.getItem("accessToken");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;

  const res = await apiClient.post(
    `/companies/${companyId}/workspaces/${workspaceId}/projects`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================
   4️⃣ DELETE PROJECT (API MỚI)
============================================ */
export const deleteProject = async (workspaceId: number, projectId: number) => {
  const token = localStorage.getItem("accessToken");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;

  const res = await apiClient.delete(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data;
};

/* ============================================
   5️⃣ GET PROJECT DETAIL
============================================ */
export const getProjectDetail = async (
  workspaceId: number,
  projectId: number
): Promise<Project> => {
  const token = localStorage.getItem("accessToken");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;

  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================
   6️⃣ UPDATE PROJECT
============================================ */
export const updateProject = async (
  workspaceId: number,
  projectId: number,
  payload: any
): Promise<Project> => {
  const token = localStorage.getItem("accessToken");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;

  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================
   7️⃣ UPDATE PROJECT STATUS
============================================ */
export const updateProjectStatus = async (
  workspaceId: number,
  projectId: number,
  newStatus: string
) => {
  const token = localStorage.getItem("accessToken");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;

  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/status`,
    { newStatus },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================
   8️⃣ GET PROJECT MEMBERS (API MỚI: PAGE)
============================================ */
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

export const getProjectMembers = async (
  workspaceId: number,
  projectId: number,
  params: any = {}
): Promise<PageResponse<ProjectMember>> => {
  const token = localStorage.getItem("accessToken");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;

  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members`,
    {
      params,
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================
   9️⃣ UPDATE PROJECT MEMBER ROLE
============================================ */
export const updateProjectMemberRole = async (
  workspaceId: number,
  projectId: number,
  memberId: number,
  roleCode: string
) => {
  const token = localStorage.getItem("accessToken");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;

  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}/role`,
    { roleCode },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================
   🔟 GET BACKLOG
============================================ */
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

export const getProjectBacklog = async (
  workspaceId: number,
  projectId: number
): Promise<BacklogTask[]> => {
  const token = localStorage.getItem("accessToken");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;

  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/backlog`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ============================================
   1️⃣1️⃣ CREATE TASK
============================================ */
export const createProjectTask = async (
  workspaceId: number,
  projectId: number,
  payload: any
) => {
  const token = localStorage.getItem("accessToken");

  const user = await getCurrentUser();
  const companyId = user.company?.companyId;

  const res = await apiClient.post(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};
