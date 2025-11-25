"use client";

import apiClient from "@/lib/apiClient";

/* ============================================
   📌 1. INTERFACES CHUNG (Project, Member)
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

export interface ProjectRequest {
  name: string;
  projectCode: string;
  description?: string | null;
  goal?: string | null;
  coverImageUrl?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  startDate?: string | null; // YYYY-MM-DD
  dueDate?: string | null;   // YYYY-MM-DD
  managerId?: number | null;
  projectTypeId?: number | null;
  boardConfig?: any;         // object -> sẽ stringify ở backend
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

// Interface payload cho update Project
export interface UpdateProjectPayload {
  name?: string;
  projectCode?: string;
  description?: string;
  goal?: string;
  coverImageUrl?: string;
  priority?: string;
  startDate?: string;
  dueDate?: string;
  projectTypeId?: number;
  managerId?: number;
  boardConfig?: object;
  file?: File | null;
}

/* ============================================
   📌 2. INTERFACES CHO TASK, BACKLOG & SPRINT
============================================ */

// --- ENUMS CHO TASK ---
export enum TaskType {
  STORY = 'STORY',
  TASK = 'TASK',
  BUG = 'BUG',
  EPIC = 'EPIC',
  SUBTASK = 'SUBTASK'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// --- PAYLOAD TẠO TASK ---
export interface CreateTaskPayload {
  // Bắt buộc
  title: string; 

  // Tùy chọn
  description?: string;
  taskType?: TaskType;      // Mặc định: TASK
  priority?: TaskPriority;  // Mặc định: MEDIUM
  
  sprintId?: number | null; // 0 hoặc null -> Backlog
  epicId?: number | null;
  assigneeId?: number | null;
  
  storyPoints?: number;
  dueDate?: string; // ISO String (YYYY-MM-DDTHH:mm:ss.sssZ)
}

// 1. Task trong Sprint/Backlog
export interface TaskSummary {
  id: number;
  taskCode: string;
  title: string;
  taskType: string; 
  statusId: number;
  statusName: string;
  statusColor: string;
  priority: string;
  sprintId?: number;
  assigneeId?: number;
  assigneeName?: string;
  assigneeAvatarUrl?: string;
  epicId?: number;
  epicName?: string;
  epicColor?: string;
  storyPoints?: number;
  dueDate?: string;
  sortOrder: number;
}

// 2. Sprint Detail
export interface SprintDetail {
  id: number;
  name: string;
  goal?: string;
  status: string; // 'IN_PROGRESS' | 'NOT_STARTED'
  startDate?: string;
  endDate?: string;
  projectId: number;
  totalStoryPoints: number;
  taskCount: number;
  tasks: TaskSummary[]; // Danh sách task con trong sprint
}

// 3. Response tổng của API /backlog
export interface ProjectBacklogResponse {
  activeSprints: SprintDetail[]; // CHỈ chứa Sprint đang chạy hoặc chưa chạy
  backlogTasks: TaskSummary[];   // Các task chưa vào sprint
  
  backlogPageNumber: number;
  backlogPageSize: number;
  backlogTotalElements: number;
  backlogTotalPages: number;
}

// 4. Param Filter
export interface BacklogQueryParams {
  keyword?: string;
  priority?: string;
  taskType?: string;
  assigneeId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/* ============================================
   🛠️ 3. HELPER: LÀM SẠCH PARAMS
============================================ */
const cleanParams = (params: any) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );
};

/* ============================================
   4️⃣ API METHODS
============================================ */

// --- 4.1 GET PROJECT LIST ---
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

// --- 4.2 SEARCH PROJECTS ---
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

// --- 4.3 GET TRASHED PROJECTS ---
export const getTrashedProjects = async (
  companyId: number,
  workspaceId: number
): Promise<Project[]> => {
  const data = await getProjects(companyId, workspaceId, {
    page: 0,
    size: 200,
    status: "DELETED",
  });
  return data.content;
};

// --- 4.4 CREATE PROJECT ---

export const createProject = async (
  companyId: number,
  workspaceId: number,
  payload: ProjectRequest,
  file?: File | null
): Promise<Project> => {
  const formData = new FormData();

  // backend yêu cầu @RequestPart("data") là JSON string
  formData.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );

  if (file) {
    formData.append("file", file);
  }

  const res = await apiClient.post(
    `/companies/${Number(companyId)}/workspaces/${Number(workspaceId)}/projects`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!res.data?.success) throw new Error(res.data?.message || "Tạo dự án thất bại");
  return res.data.data as Project;

};

// --- 4.5 DELETE PROJECT ---
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

// --- 4.6 GET PROJECT DETAIL ---
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

// --- 4.7 UPDATE PROJECT (Multipart) ---
export const updateProject = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  payload: UpdateProjectPayload
): Promise<Project> => {
  const formData = new FormData();

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
  };

  const jsonBlob = new Blob([JSON.stringify(jsonPart)], { type: "application/json" });
  formData.append("data", jsonBlob);

  if (payload.file) {
    formData.append("file", payload.file);
  }

  const res = await apiClient.put(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 4.8 UPDATE PROJECT STATUS ---
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

// --- 4.9 GET PROJECT MEMBERS ---
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
  const defaultParams = { page: 0, size: 10, sortBy: "joinedAt", sortDir: "desc", ...params };
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members`,
    { params: cleanParams(defaultParams) }
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 4.10 SEARCH PROJECT MEMBERS ---
export const searchProjectMembers = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: any
): Promise<PageResponse<ProjectMember>> => {
  const defaultParams = { page: 0, size: 10, sortBy: "joinedAt", sortDir: "desc", ...params };
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members/search`,
    { params: cleanParams(defaultParams) }
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 4.11 UPDATE MEMBER ROLE ---
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

// --- 4.12 GET BACKLOG ---
export const getProjectBacklog = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  queryParams?: BacklogQueryParams
): Promise<ProjectBacklogResponse> => {
  
  const params = queryParams ? Object.fromEntries(
    Object.entries(queryParams).filter(([_, v]) => v != null && v !== "")
  ) : {};

  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/backlog`,
    { params }
  );

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data; 
};

// --- 4.13 CREATE TASK (NEW) ---
export const createProjectTask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  payload: CreateTaskPayload
) => {
  // 1. Tạo object cơ bản bắt buộc
  const cleanPayload: any = {
    title: payload.title,
    taskType: payload.taskType || "TASK",    
    priority: payload.priority || "MEDIUM",   
    description: payload.description || ""
  };

  // 2. Chỉ append các trường ID nếu có giá trị (truthy)
  // Loại bỏ hoàn toàn việc gửi số 0 nếu user dặn là backend sẽ lỗi
  if (payload.sprintId) {
    cleanPayload.sprintId = payload.sprintId;
  }

  // Tạm thời comment lại hoặc chỉ gửi nếu bạn thực sự cần sau này
  if (payload.assigneeId) cleanPayload.assigneeId = payload.assigneeId;
  if (payload.epicId) cleanPayload.epicId = payload.epicId;
  if (payload.storyPoints) cleanPayload.storyPoints = payload.storyPoints;
  if (payload.dueDate) cleanPayload.dueDate = payload.dueDate;

  const res = await apiClient.post(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    cleanPayload
  );
  
  if (!res.data.success) throw new Error(res.data.message || "Lỗi khi tạo công việc");
  return res.data.data; 
};