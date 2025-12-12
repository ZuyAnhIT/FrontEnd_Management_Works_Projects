"use client";

import apiClient from "@/lib/apiClient";

/* ============================================
   📌 1. INTERFACES CHUNG (Project, Member, Paging)
============================================ */
// Dựa trên Swagger Response
export interface TaskStatusObj {
  id: number;
  name: string;
  color: string;
  isCompleted: boolean;
}

export interface TaskEpicObj {
  id: number;
  name: string;
  color: string;
}

export interface TaskAssigneeObj {
  id: number;
  name: string;
  avatarUrl: string;
}

export interface TaskTagObj {
  id: number;
  name: string;
  color: string;
}

export interface SubtaskSummaryObj {
  total: number;
  completed: number;
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

export interface ArchivedTaskParams {
  page?: number;
  size?: number;
  keyword?: string;     // Tìm kiếm theo tên hoặc mã task
  assigneeId?: number;  // Lọc theo người được giao cũ
  priority?: string;    // 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  taskType?: string;    // 'STORY' | 'TASK' | 'BUG' | ...
}

/* ============================================
   📌 2. INTERFACES CHO TASK, BACKLOG & SPRINT
============================================ */

// --- ENUMS ---
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

// --- DTO TASK DETAIL (Dùng cho List View) ---
export interface TaskResponse {
  id: number;
  taskCode: string;
  title: string;
  
  // Các trường Enum vẫn giữ nguyên
  taskType: TaskType; // STORY, BUG...
  priority: TaskPriority; // LOW, HIGH...
   sprintId: number;
  storyPoints: number;
  startDate: string | null;
  dueDate: string | null;
  sortOrder: number;

  // ✅ Object lồng nhau (Nested Objects)
  status: TaskStatusObj;          // Không bao giờ null theo JSON mẫu
  epic: TaskEpicObj | null;       // Có thể null
  assignee: TaskAssigneeObj | null; // Có thể null
  tags: TaskTagObj[];
  subtaskSummary: SubtaskSummaryObj;
}

// --- GROUPED RESPONSE ---
export interface TasksGroupedResponse extends Record<string, TaskResponse[]> {}

// --- FILTER PARAMS (List View) ---
export interface ProjectTaskFilterParams {
  sprintId?: number | 0 | null; 
  search?: string;              
  assigneeId?: number;
  priority?: TaskPriority;      
  statusIds?: number[];         
  taskType?: TaskType;          
  
  // Pagination
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// --- BACKLOG & SPRINT DTOs ---
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

  // 🔴 SỬA: Khớp với cấu trúc object
  status: TaskStatusObj;
  assignee: TaskAssigneeObj | null;
  epic: TaskEpicObj | null;
  
  // Các trường khác nếu backend backlog trả về
  tags?: TaskTagObj[];
  subtaskSummary?: SubtaskSummaryObj;
}

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

export interface ProjectInvitation {
  id: number;
  email: string;
  roleCode: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
  invitedAt: string;
  inviterName: string;
  inviterAvatar: string;
}

export interface InvitationSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  keyword?: string;
  status?: string;
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

// --- 4.4 CREATE PROJECT (With File Upload) ---
export const createProject = async (
  companyId: number,
  workspaceId: number,
  payload: ProjectRequest,
  file?: File | null
): Promise<Project> => {
  const formData = new FormData();
  
  // Backend Spring Boot thường yêu cầu JSON body nằm trong 1 key (ví dụ "data" hoặc "project")
  // Bạn đã confirm là key "data"
  formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  
  if (file) {
    formData.append("file", file);
  }

  const res = await apiClient.post(
    `/companies/${companyId}/workspaces/${workspaceId}/projects`,
    formData,
    { 
      headers: { "Content-Type": "multipart/form-data" } 
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

// --- 4.7 UPDATE PROJECT ---
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
  if (payload.file) formData.append("file", payload.file);

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
  params: { page?: number; size?: number; sortBy?: string; sortDir?: string } = {}
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
  const params = cleanParams(queryParams);
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/backlog`,
    { params }
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data; 
};

// --- 4.13 CREATE TASK ---
export const createProjectTask = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  payload: CreateTaskPayload
) => {
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
  
  if (!res.data.success) throw new Error(res.data.message || "Lỗi khi tạo công việc");
  return res.data.data; 
};

// -- 4.14 MỜI THÀNH VIÊN VÀO DỰ ÁN.
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
    throw new Error(
      err.response?.data?.message || "Could not invite member to project."
    );
  }
};

// 1. Lấy danh sách lời mời dự án
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
  return res.data.data;
};

// 2. Hủy lời mời dự án
export const cancelProjectInvitation = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  invitationId: number
) => {
  const res = await apiClient.delete(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/invitations/${invitationId}`
  );
  return res.data;
};

/* ========================================================================
   🔥 4.14 CHỨC NĂNG MỚI: TASK LIST VIEW & GROUP VIEW
   ======================================================================== */

// --- 1. LẤY DANH SÁCH TASK (LIST VIEW) ---
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
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// --- 2. LẤY TASK THEO NHÓM (GROUPING VIEW) ---
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
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// LẤY DANH SÁCH TASK ĐÃ LƯU TRỮ (ARCHIVED TASKS)
export const getArchivedTasks = async (
  companyId: number,
  workspaceId: number,
  projectId: number,
  params: ArchivedTaskParams
): Promise<PageResponse<TaskResponse>> => { // Đảm bảo TaskResponse khớp với cấu trúc TaskSummaryResponse từ Backend
  
  // URL phải khớp với: /api/companies/{cid}/workspaces/{wid}/projects/{pid}/archived-tasks
  const res = await apiClient.get(
    `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/archived-tasks`,
    { 
      // cleanParams giúp loại bỏ các key có value là undefined/null/rỗng để URL sạch đẹp
      params: cleanParams(params) 
    } 
  );
  
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};