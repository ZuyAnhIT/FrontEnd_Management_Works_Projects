"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. SHARED INTERFACES & ENUMS (Dùng chung)
// =============================================================================

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

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

// =============================================================================
// 2. PROJECT INTERFACES (Liên quan đến Dự án)
// =============================================================================

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

// =============================================================================
// 3. TASK & BACKLOG INTERFACES (Liên quan đến Công việc)
// =============================================================================

// --- Sub-objects ---
export interface TaskStatusObj { id: number; name: string; color: string; isCompleted: boolean; }
export interface TaskEpicObj { id: number; name: string; color: string; }
export interface TaskAssigneeObj { id: number; name: string; avatarUrl: string; }
export interface TaskTagObj { id: number; name: string; color: string; }
export interface SubtaskSummaryObj { total: number; completed: number; }

// --- Task DTOs ---
export interface CreateTaskPayload {
  title: string; 
  description?: string;
  taskType?: TaskType;      
  priority?: TaskPriority;  
  sprintId?: number | null; 
  statusId?: number | null;
  epicId?: number | null;
  assigneeId?: number | null;
  storyPoints?: number;
  dueDate?: string; 
}

export interface TaskResponse {
  id: number;
  taskCode: string;
  title: string;
  taskType: TaskType;
  priority: TaskPriority;
  sprintId: number;
  storyPoints: number;
  startDate: string | null;
  dueDate: string | null;
  sortOrder: number;
  status: TaskStatusObj;
  epic: TaskEpicObj | null;
  assignee: TaskAssigneeObj | null;
  tags: TaskTagObj[];
  subtaskSummary: SubtaskSummaryObj;
}

export interface TaskSummary {
  id: number;
  taskCode: string;
  title: string;
  taskType: string;
  priority: string;
  storyPoints?: number;
  dueDate?: string;
  sortOrder: number;
  sprintId?: number;
  status: TaskStatusObj;
  assignee: TaskAssigneeObj | null;
  epic: TaskEpicObj | null;
  tags?: TaskTagObj[];
  subtaskSummary?: SubtaskSummaryObj;
}

// --- Grouped & Filter ---
export interface TasksGroupedResponse extends Record<string, TaskResponse[]> {}

export interface ProjectTaskFilterParams {
  sprintId?: number | 0 | null; 
  search?: string;              
  assigneeId?: number;
  priority?: TaskPriority;      
  statusIds?: number[];         
  taskType?: TaskType;          
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ArchivedTaskParams {
  page?: number;
  size?: number;
  keyword?: string;
  assigneeId?: number;
  priority?: string;
  taskType?: string;
}

// --- Sprint & Backlog ---
export interface SprintDetail {
  id: number;
  name: string;
  goal?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  projectId: number;
  totalStoryPoints: number;
  taskCount: number;
  tasks: TaskSummary[]; 
}

export interface ProjectBacklogResponse {
  activeSprints: SprintDetail[]; 
  backlogTasks: TaskSummary[];   
  backlogPageNumber: number;
  backlogPageSize: number;
  backlogTotalElements: number;
  backlogTotalPages: number;
}

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

// =============================================================================
// 4. MEMBER & INVITATION INTERFACES (Thành viên & Lời mời)
// =============================================================================

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

export interface ProjectInvitation {
  id: number;
  email: string;
  roleCode: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
  invitedAt: string;
  inviterName: string;
  inviterAvatar: string;
  invitationLink?: string; 
}

export interface InvitationSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  keyword?: string;
  status?: string;
}

// =============================================================================
// 5. UTILS (Hàm tiện ích)
// =============================================================================

/**
 * Loại bỏ các param null/undefined/rỗng để URL sạch sẽ
 */
const cleanParams = (params: any) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );
};

// =============================================================================
// 6. API METHODS IMPLEMENTATION
// =============================================================================

// -----------------------------------------------------------------------------
// 6.1 Project Management (CRUD)
// -----------------------------------------------------------------------------

export const getProjects = async (
  companyId: number,
  workspaceId: number,
  params: any = {}
): Promise<PageResponse<Project>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects`,
    { params: cleanParams(params) }
  );
  if (!res.data.success) throw new Error(res.data.message || "Failed to fetch projects.");
  return res.data.data;
};

export const searchProjects = async (
  companyId: number,
  workspaceId: number,
  params: any = {}
): Promise<PageResponse<Project>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/search`,
    { params: cleanParams(params) }
  );
  if (!res.data.success) throw new Error(res.data.message || "Failed to search projects.");
  return res.data.data;
};

export const getTrashedProjects = async (
  companyId: number,
  workspaceId: number
): Promise<Project[]> => {
  // Tái sử dụng hàm getProjects với filter status DELETED
  const data = await getProjects(companyId, workspaceId, {
    page: 0,
    size: 200,
    status: "DELETED",
  });
  return data.content;
};

export const createProject = async (
  companyId: number,
  workspaceId: number,
  payload: ProjectRequest,
  file?: File | null
): Promise<Project> => {
  const formData = new FormData();
  
  // Backend Spring Boot: JSON body nằm trong key "data"
  formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  
  if (file) {
    formData.append("file", file);
  }

  const res = await apiClient.post(
    `/companies/${companyId}/workspaces/${workspaceId}/projects`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  if (!res.data?.success) throw new Error(res.data?.message || "Failed to create project.");
  return res.data.data;
};

export const updateProject = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  payload: UpdateProjectPayload
): Promise<Project> => {
  const formData = new FormData();
  
  // Chuẩn bị JSON Payload
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

  if (!res.data.success) throw new Error(res.data.message || "Failed to update project.");
  return res.data.data;
};

export const deleteProject = async (
  companyId: number,
  workspaceId: number,
  projectId: number
) => {
  const res = await apiClient.delete(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`
  );
  if (!res.data.success) throw new Error(res.data.message || "Failed to delete project.");
  return res.data;
};

export const getProjectDetail = async (
  companyId: number,
  workspaceId: number,
  projectId: number
): Promise<Project> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`
  );
  if (!res.data.success) throw new Error(res.data.message || "Failed to fetch project details.");
  return res.data.data;
};

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
  if (!res.data.success) throw new Error(res.data.message || "Failed to update project status.");
  return res.data.data;
};

// -----------------------------------------------------------------------------
// 6.2 Members & Invitations
// -----------------------------------------------------------------------------

export const getProjectMembers = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: string } = {}
): Promise<PageResponse<ProjectMember>> => {
  const defaultParams = { page: 0, size: 10, sortBy: "joinedAt", sortDir: "desc", ...params };
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members`,
    { params: cleanParams(defaultParams) }
  );
  if (!res.data.success) throw new Error(res.data.message || "Failed to fetch members.");
  return res.data.data;
};

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
  if (!res.data.success) throw new Error(res.data.message || "Failed to search members.");
  return res.data.data;
};

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
  if (!res.data.success) throw new Error(res.data.message || "Failed to update role.");
  return res.data.data;
};

export const inviteProjectMember = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  data: { email: string; roleCode: string }
) => {
  try {
    const res = await apiClient.post(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members`,
      data
    );
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to invite member.");
    }
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Could not invite member to project.");
  }
};

export const getProjectInvitations = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: InvitationSearchParams
): Promise<PageResponse<ProjectInvitation>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/invitations`,
    { params }
  );
  if (!res.data.success) throw new Error(res.data.message || "Failed to load invitations.");
  return res.data.data;
};

export const cancelProjectInvitation = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  invitationId: number
) => {
  const res = await apiClient.delete(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/invitations/${invitationId}`
  );
  if (!res.data.success) throw new Error(res.data.message || "Failed to cancel invitation.");
  return res.data;
};

// -----------------------------------------------------------------------------
// 6.3 Task & Backlog Management
// -----------------------------------------------------------------------------

export const getProjectBacklog = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  queryParams?: BacklogQueryParams
): Promise<ProjectBacklogResponse> => {
  const params = cleanParams(queryParams);
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/backlog`,
    { params }
  );
  if (!res.data.success) throw new Error(res.data.message || "Failed to load backlog.");
  return res.data.data; 
};

export const createProjectTask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  payload: CreateTaskPayload
) => {
  // Logic build payload thủ công để đảm bảo đúng format backend yêu cầu
  const cleanPayload: any = {
    title: payload.title,
    taskType: payload.taskType || "TASK",    
    priority: payload.priority || "MEDIUM",   
    description: payload.description || ""
  };

  if (payload.sprintId) cleanPayload.sprintId = payload.sprintId;
  if (payload.assigneeId) cleanPayload.assigneeId = payload.assigneeId;
  if (payload.epicId) cleanPayload.epicId = payload.epicId;
  if (payload.storyPoints) cleanPayload.storyPoints = payload.storyPoints;
  if (payload.dueDate) cleanPayload.dueDate = payload.dueDate;

  const res = await apiClient.post(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    cleanPayload
  );
  
  if (!res.data.success) throw new Error(res.data.message || "Failed to create task.");
  return res.data.data; 
};

export const getProjectTasks = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: ProjectTaskFilterParams
): Promise<PageResponse<TaskResponse>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks`, 
    { params: cleanParams(params) }
  );
  if (!res.data.success) throw new Error(res.data.message || "Failed to load tasks.");
  return res.data.data;
};

export const getTasksGrouped = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  groupBy: string,
  sprintId?: number | 0 | null,
  search?: string
): Promise<TasksGroupedResponse> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/grouped`, 
    {
      params: cleanParams({ groupBy, sprintId, search })
    }
  );
  if (!res.data.success) throw new Error(res.data.message || "Failed to load grouped tasks.");
  return res.data.data;
};

export const getArchivedTasks = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: ArchivedTaskParams
): Promise<PageResponse<TaskResponse>> => {
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/archived-tasks`,
    { params: cleanParams(params) } 
  );
  
  if (!res.data.success) throw new Error(res.data.message || "Failed to load archived tasks.");
  return res.data.data;
};