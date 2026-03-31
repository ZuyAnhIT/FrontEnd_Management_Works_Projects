"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & ENUMS
// =============================================================================

// -----------------------------------------------------------------------------
// Dữ liệu dùng chung (Shared)
// -----------------------------------------------------------------------------

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

/**
 * Các loại công việc trong hệ thống
 */
export enum TaskType {
  STORY = 'STORY',
  TASK = 'TASK',
  BUG = 'BUG',
  EPIC = 'EPIC',
  SUBTASK = 'SUBTASK'
}

/**
 * Các mức độ ưu tiên của công việc
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// -----------------------------------------------------------------------------
// Dữ liệu Dự án (Project)
// -----------------------------------------------------------------------------

/**
 * Thông tin chi tiết của một dự án
 */
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

/**
 * Dữ liệu yêu cầu để tạo dự án mới
 */
export interface ProjectRequest {
  name: string;
  projectCode: string;
  description?: string | null;
  goal?: string | null;
  coverImageUrl?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  startDate?: string | null;
  dueDate?: string | null;
  managerId?: number | null;
  projectTypeId?: number | null;
  boardConfig?: any;
}

/**
 * Dữ liệu yêu cầu để cập nhật dự án
 */
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

// -----------------------------------------------------------------------------
// Dữ liệu Công việc (Task & Backlog)
// -----------------------------------------------------------------------------

export interface TaskStatusObj { id: number; name: string; color: string; isCompleted: boolean; }
export interface TaskEpicObj { id: number; name: string; color: string; }
export interface TaskAssigneeObj { id: number; name: string; avatarUrl: string; }
export interface TaskTagObj { id: number; name: string; color: string; }
export interface SubtaskSummaryObj { total: number; completed: number; }

/**
 * Dữ liệu yêu cầu để tạo công việc mới
 */
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

/**
 * Thông tin phản hồi chi tiết của một công việc
 */
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

/**
 * Thông tin tóm tắt của công việc
 */
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

export interface TasksGroupedResponse extends Record<string, TaskResponse[]> {}

/**
 * Tham số lọc danh sách công việc của dự án
 */
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

/**
 * Tham số lọc danh sách công việc đã lưu trữ
 */
export interface ArchivedTaskParams {
  page?: number;
  size?: number;
  keyword?: string;
  assigneeId?: number;
  priority?: string;
  taskType?: string;
}

/**
 * Thông tin chi tiết của một Sprint
 */
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

/**
 * Thông tin phản hồi của Backlog dự án
 */
export interface ProjectBacklogResponse {
  activeSprints: SprintDetail[]; 
  backlogTasks: TaskSummary[];   
  backlogPageNumber: number;
  backlogPageSize: number;
  backlogTotalElements: number;
  backlogTotalPages: number;
}

/**
 * Tham số truy vấn danh sách Backlog
 */
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

// -----------------------------------------------------------------------------
// Dữ liệu Thành viên & Lời mời (Member & Invitation)
// -----------------------------------------------------------------------------

/**
 * Thông tin thành viên trong dự án
 */
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

/**
 * Thông tin lời mời gia nhập dự án
 */
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

/**
 * Tham số tìm kiếm danh sách lời mời
 */
export interface InvitationSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  keyword?: string;
  status?: string;
}

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/**
 * Loại bỏ các tham số không có giá trị để làm sạch URL truy vấn
 */
const cleanParams = (params: any) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );
};

// =============================================================================
// API METHODS
// =============================================================================

// -----------------------------------------------------------------------------
// 1. Quản lý Dự án (Project Management)
// -----------------------------------------------------------------------------

/**
 * Lấy danh sách dự án thuộc không gian làm việc
 */
export const getProjects = async (
  companyId: number,
  workspaceId: number,
  params: any = {}
): Promise<PageResponse<Project>> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects`;
    const res = await apiClient.get(url, { params: cleanParams(params) });
    
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to fetch projects");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while fetching projects";
    throw new Error(errorMsg);
  }
};

/**
 * Tìm kiếm dự án theo từ khóa và bộ lọc
 */
export const searchProjects = async (
  companyId: number,
  workspaceId: number,
  params: any = {}
): Promise<PageResponse<Project>> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/search`;
    const res = await apiClient.get(url, { params: cleanParams(params) });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to search projects");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while searching projects";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy danh sách các dự án đã bị xóa (thùng rác)
 */
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

/**
 * Khởi tạo dự án mới (Hỗ trợ tải lên ảnh bìa)
 */
export const createProject = async (
  companyId: number,
  workspaceId: number,
  payload: ProjectRequest,
  file?: File | null
): Promise<Project> => {
  const formData = new FormData();
  
  // Đóng gói JSON payload thành Blob để Backend Spring Boot xử lý @RequestPart
  formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  
  if (file) {
    formData.append("file", file);
  }

  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects`;
    const res = await apiClient.post(url, formData, { 
      headers: { "Content-Type": "multipart/form-data" } 
    });

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to create project");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while creating project";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật thông tin chi tiết của dự án
 */
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

  formData.append("data", new Blob([JSON.stringify(jsonPart)], { type: "application/json" }));
  
  if (payload.file) {
    formData.append("file", payload.file);
  }

  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`;
    const res = await apiClient.put(url, formData, { 
      headers: { "Content-Type": "multipart/form-data" } 
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to update project");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while updating project";
    throw new Error(errorMsg);
  }
};

/**
 * Xóa vĩnh viễn hoặc chuyển dự án vào thùng rác
 */
export const deleteProject = async (
  companyId: number,
  workspaceId: number,
  projectId: number
) => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`;
    const res = await apiClient.delete(url);

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to delete project");
    }
    return res.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while deleting project";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn thông tin chi tiết của một dự án cụ thể
 */
export const getProjectDetail = async (
  companyId: number,
  workspaceId: number,
  projectId: number
): Promise<Project> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`;
    const res = await apiClient.get(url);

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to fetch project details");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while fetching project details";
    throw new Error(errorMsg);
  }
};

/**
 * Thay đổi trạng thái hiện tại của dự án
 */
export const updateProjectStatus = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  newStatus: string
) => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/status`;
    const res = await apiClient.put(url, { newStatus });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to update project status");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while updating project status";
    throw new Error(errorMsg);
  }
};

// -----------------------------------------------------------------------------
// 2. Thành viên & Lời mời (Members & Invitations)
// -----------------------------------------------------------------------------

/**
 * Lấy danh sách các thành viên đang tham gia dự án
 */
export const getProjectMembers = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: string } = {}
): Promise<PageResponse<ProjectMember>> => {
  const defaultParams = { page: 0, size: 10, sortBy: "joinedAt", sortDir: "desc", ...params };
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members`;
    const res = await apiClient.get(url, { params: cleanParams(defaultParams) });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to fetch members");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while fetching members";
    throw new Error(errorMsg);
  }
};

/**
 * Tìm kiếm thành viên dự án theo từ khóa
 */
export const searchProjectMembers = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: any
): Promise<PageResponse<ProjectMember>> => {
  const defaultParams = { page: 0, size: 10, sortBy: "joinedAt", sortDir: "desc", ...params };
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members/search`;
    const res = await apiClient.get(url, { params: cleanParams(defaultParams) });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to search members");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while searching members";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật vai trò của thành viên trong phạm vi dự án
 */
export const updateProjectMemberRole = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  memberId: number,
  roleCode: string
) => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}/role`;
    const res = await apiClient.put(url, { roleCode });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to update role");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while updating member role";
    throw new Error(errorMsg);
  }
};

/**
 * Gửi lời mời tham gia dự án qua Email
 */
export const inviteProjectMember = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  data: { email: string; roleCode: string }
) => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members`;
    const res = await apiClient.post(url, data);

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to invite member");
    }
    return res.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Could not invite member to project";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn danh sách toàn bộ lời mời đã gửi của dự án
 */
export const getProjectInvitations = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: InvitationSearchParams
): Promise<PageResponse<ProjectInvitation>> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/invitations`;
    const res = await apiClient.get(url, { params });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to load invitations");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while loading invitations";
    throw new Error(errorMsg);
  }
};

/**
 * Thu hồi lời mời gia nhập dự án đã gửi
 */
export const cancelProjectInvitation = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  invitationId: number
) => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/invitations/${invitationId}`;
    const res = await apiClient.delete(url);

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to cancel invitation");
    }
    return res.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while canceling invitation";
    throw new Error(errorMsg);
  }
};

// -----------------------------------------------------------------------------
// 3. Quản lý Công việc & Backlog (Task & Backlog Management)
// -----------------------------------------------------------------------------

/**
 * Truy vấn thông tin Backlog và danh sách các Sprint đang hoạt động
 */
export const getProjectBacklog = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  queryParams?: BacklogQueryParams
): Promise<ProjectBacklogResponse> => {
  const params = cleanParams(queryParams);
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/backlog`;
    const res = await apiClient.get(url, { params });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to load backlog");
    }
    return res.data.data; 
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while loading backlog";
    throw new Error(errorMsg);
  }
};

/**
 * Tạo mới một công việc trong dự án
 */
export const createProjectTask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  payload: CreateTaskPayload
) => {
  // Chuẩn hóa dữ liệu yêu cầu trước khi gửi lên server
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

  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks`;
    const res = await apiClient.post(url, cleanPayload);
    
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to create task");
    }
    return res.data.data; 
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while creating task";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy danh sách công việc của dự án theo bộ lọc phân trang
 */
export const getProjectTasks = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: ProjectTaskFilterParams
): Promise<PageResponse<TaskResponse>> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks`;
    const res = await apiClient.get(url, { params: cleanParams(params) });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to load tasks");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while loading tasks";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy danh sách công việc được nhóm theo các tiêu chí (ví dụ: Status, Assignee)
 */
export const getTasksGrouped = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  groupBy: string,
  sprintId?: number | 0 | null,
  search?: string
): Promise<TasksGroupedResponse> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks/grouped`;
    const res = await apiClient.get(url, {
      params: cleanParams({ groupBy, sprintId, search })
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to load grouped tasks");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while loading grouped tasks";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn danh sách các công việc đã được đưa vào kho lưu trữ (Archived)
 */
export const getArchivedTasks = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: ArchivedTaskParams
): Promise<PageResponse<TaskResponse>> => {
  try {
    const url = `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/archived-tasks`;
    const res = await apiClient.get(url, { params: cleanParams(params) });
    
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to load archived tasks");
    }
    return res.data.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while loading archived tasks";
    throw new Error(errorMsg);
  }
};