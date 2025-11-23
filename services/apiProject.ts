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

// Interface payload cho update
export interface UpdateProjectPayload {
  name?: string;
  projectCode?: string;
  description?: string;
  goal?: string;
  coverImageUrl?: string; // URL cũ nếu có
  priority?: string;
  startDate?: string;
  dueDate?: string;
  projectTypeId?: number;
  managerId?: number;
  boardConfig?: object;
  file?: File | null; // ✨ Thêm file ảnh mới
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

/* ============================================
   6️⃣ UPDATE PROJECT (Multipart/Form-data) 🛠️
============================================ */
export const updateProject = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  payload: UpdateProjectPayload
): Promise<Project> => {
  const formData = new FormData();

  // 1. Đóng gói JSON (Key: "data")
  const jsonPart = {
    name: payload.name,
    projectCode: payload.projectCode,
    description: payload.description,
    goal: payload.goal,
    priority: payload.priority,
    startDate: payload.startDate,
    dueDate: payload.dueDate,
    projectTypeId: payload.projectTypeId || 0,
    managerId: payload.managerId || 0,
    boardConfig: JSON.stringify(payload.boardConfig || {}),
    // coverImageUrl không cần gửi ở đây nếu backend tự xử lý file
  };

  const jsonBlob = new Blob([JSON.stringify(jsonPart)], {
    type: "application/json",
  });
  formData.append("data", jsonBlob);

  // 2. Đóng gói File (Key: "file")
  if (payload.file) {
    formData.append("file", payload.file);
  }

  // 3. Gửi Request
  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
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

/* ============================================
   8️⃣ GET PROJECT MEMBERS (LIST THƯỜNG)
============================================ */
export const getProjectMembers = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  } = {}
): Promise<PageResponse<ProjectMember>> => {
  
  const defaultParams = {
    page: 0,
    size: 10,
    sortBy: "joinedAt",
    sortDir: "desc",
    ...params
  };

  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members`,
    { params: cleanParams(defaultParams) }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};
/* ============================================
   🌟 8.1 SEARCH PROJECT MEMBERS (TÌM KIẾM)
   URL: .../members/search?name=...
============================================ */
export const searchProjectMembers = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }
): Promise<PageResponse<ProjectMember>> => {

  const defaultParams = {
    page: 0,
    size: 10,
    sortBy: "joinedAt",
    sortDir: "desc",
    ...params
  };

  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members/search`,
    { params: cleanParams(defaultParams) }
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