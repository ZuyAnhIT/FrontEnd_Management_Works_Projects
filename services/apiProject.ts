"use client";


import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/services/apiUser";


// ===================================================
// 🔹 Interface kiểu dữ liệu project
// ===================================================
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


// ===================================================
// 1️⃣ GET – Lấy danh sách dự án trong workspace
// ===================================================
export const getProjects = async (workspaceId: number): Promise<Project[]> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId || user.workspaces?.[0].companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/projects`,
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể tải danh sách dự án.");


    return data.data as Project[];
  } catch (err: any) {
    console.error("❌ Lỗi lấy danh sách dự án:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải danh sách dự án."
    );
  }
};


// ===================================================
// 2️⃣ POST – Tạo dự án mới trong workspace
// ===================================================
export const createProject = async (
  workspaceId: number,
  payload: {
    name: string;
    projectCode: string;
    description?: string;
    goal?: string;
    coverImageUrl?: string;
    boardConfig?: object;
    projectTypeId?: number;
    managerId?: number;
    priority?: string;
    startDate?: string;
    dueDate?: string;
  }
): Promise<Project> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.post(
      `/companies/${companyId}/workspaces/${workspaceId}/projects`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể tạo dự án mới.");


    return data.data as Project;
  } catch (err: any) {
    console.error(" Lỗi tạo dự án:", err);
    throw new Error(
      err.response?.data?.message || "Lỗi hệ thống, không thể tạo dự án mới."
    );
  }
};


// ===================================================
// 3️⃣ GET – Lấy danh sách dự án trong “Thùng rác”
// ===================================================
export const getTrashedProjects = async (
  workspaceId: number
): Promise<Project[]> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/trash`,
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể tải danh sách dự án đã xóa.");


    return data.data as Project[];
  } catch (err: any) {
    console.error(" Lỗi lấy danh sách dự án đã xóa:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải danh sách dự án đã xóa."
    );
  }
};


// ===================================================
// 4️⃣ DELETE – Xóa dự án
// ===================================================
export const deleteProject = async (
  workspaceId: number,
  projectId: number
): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.delete(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;
    if (!data.success) throw new Error(data.message || "Không thể xóa dự án.");


    return {
      success: true,
      message: data.message || "Đã xóa dự án thành công.",
    };
  } catch (err: any) {
    console.error(" Lỗi xóa dự án:", err);
    throw new Error(
      err.response?.data?.message || "Lỗi hệ thống, không thể xóa dự án."
    );
  }
};
//chi tiết dự án
export const getProjectDetail = async (
  workspaceId: number,
  projectId: number
): Promise<Project> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể lấy chi tiết dự án.");


    return data.data as Project;
  } catch (err: any) {
    console.error("❌ Lỗi lấy chi tiết dự án:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể lấy chi tiết dự án."
    );
  }
};




//Cập nhật dự án
export const updateProject = async (
  workspaceId: number,
  projectId: number,
  payload: {
    name?: string;
    projectCode?: string;
    description?: string;
    goal?: string;
    coverImageUrl?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
    completedAt?: string;
    managerId?: number;
    projectTypeId?: number;
    boardConfig?: any;
  }
): Promise<Project> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể cập nhật dự án.");


    return data.data as Project;
  } catch (err: any) {
    console.error("❌ Lỗi cập nhật dự án:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể cập nhật dự án."
    );
  }
};


//Cập nhật trạng thái dự án
export const updateProjectStatus = async (
  workspaceId: number,
  projectId: number,
  newStatus: string
): Promise<Project> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/status`,
      { newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể thay đổi trạng thái dự án.");


    return data.data as Project;
  } catch (err: any) {
    console.error("❌ Lỗi cập nhật trạng thái dự án:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể cập nhật trạng thái dự án."
    );
  }
};
 
// Cập nhật vai trò thành viên trong dự án
export const updateProjectMemberRole = async (
  workspaceId: number,
  projectId: number,
  memberId: number,
  roleCode: string
): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}/role`,
      { roleCode },
      { headers: { Authorization: `Bearer ${token}` } }
    );


    if (!res.data.success)
      throw new Error(res.data.message || "Không thể cập nhật vai trò thành viên.");


    return { success: true, message: res.data.message };
  } catch (err: any) {
    console.error("❌ Lỗi cập nhật vai trò thành viên:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể cập nhật vai trò."
    );
  }
};




//Lấy danh sách thành viên trong dự án
// Lấy danh sách thành viên trong dự án
export interface ProjectMember {
  memberId: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  roleName: string;
  joinedAt: string;
  status: string;
}


export const getProjectMembers = async (
  workspaceId: number,
  projectId: number
): Promise<ProjectMember[]> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.get(
  `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/members`,
  { headers: { Authorization: `Bearer ${token}` } }
);




    if (!res.data.success)
      throw new Error(res.data.message || "Không thể tải danh sách thành viên.");


    return res.data.data as ProjectMember[];
  } catch (err: any) {
    console.error("❌ Lỗi tải thành viên dự án:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải danh sách thành viên."
    );
  }
};


 //Lấy backlog của dự án
 export interface BacklogTask {
  id: number;
  taskCode: string;
  title: string;
  taskType: string;
  statusName: string;
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
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/backlog`,
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể tải backlog.");


    return data.data as BacklogTask[];
  } catch (err: any) {
    console.error("❌ Lỗi lấy backlog:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải backlog dự án."
    );
  }
};


//Tạo task trong project
export const createProjectTask = async (
  workspaceId: number,
  projectId: number,
  payload: {
    title: string;
    description: string;
    sprintId?: number;
    epicId?: number;
    assigneeId?: number;
    statusName: string;
    taskType: string;
    priority: string;
    storyPoints?: number;
    estimatedHours?: number;
    startDate?: string;
    dueDate?: string;
  }
) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");


  const user = await getCurrentUser();
  const companyId = user.company?.companyId;
  if (!companyId) throw new Error("Không tìm thấy ID công ty.");


  try {
    const res = await apiClient.post(
      `/companies/${companyId}/workspaces/${workspaceId}/projects/${projectId}/tasks`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );


    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể tạo task.");


    return data.data;
  } catch (err: any) {
    console.error("❌ Lỗi tạo task:", err);
    throw new Error(
      err.response?.data?.message || "Lỗi hệ thống, không thể tạo task."
    );
  }
};



