"use client";
import apiClient from "@/lib/apiClient";

// ===================================================
// 🧩 Lấy danh sách workspace của công ty
// ===================================================
export const getCompanyWorkspaces = async (companyId: number) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.get(`/companies/${companyId}/workspaces`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res.data;

    if (!data.success) {
      throw new Error(
        data.message || "Không thể lấy danh sách không gian làm việc."
      );
    }

    return data.data; // Trả về mảng workspace
  } catch (err: any) {
    console.error(" Lỗi lấy danh sách workspace:", err);
    throw new Error(
      err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại."
    );
  }
};

// ===================================================
// 🧩 Tạo workspace mới cho công ty
// ===================================================
export const createWorkspace = async (
  companyId: number,
  payload: {
    workspaceName: string;
    description?: string;
    coverImage?: string;
    color?: string;
  }
) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.post(
      `/companies/${companyId}/workspaces`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Không thể tạo không gian làm việc mới.");
    }

    return data.data; // Trả về workspace vừa tạo
  } catch (err: any) {
    console.error(" Lỗi tạo workspace:", err);
    throw new Error(
      err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại."
    );
  }
};

// ===================================================
// 🔹 Lấy chi tiết 1 workspace trong công ty
// ===================================================
export const getWorkspaceDetail = async (
  companyId: number,
  workspaceId: number
): Promise<{
  workspaceId: number;
  companyId: number;
  workspaceName: string;
  description: string | null;
  coverImage: string | null;
  color: string;
  createdById: number;
  status: string;
  createdAt: string;
}> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = res.data;
    if (!data.success) {
      throw new Error(data.message || "Không thể lấy thông tin workspace.");
    }

    return data.data;
  } catch (err: any) {
    console.error(" Lỗi lấy chi tiết workspace:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể lấy chi tiết workspace."
    );
  }
};

// ===================================================
// 🔹 Cập nhật thông tin Workspace trong công ty
// ===================================================
export const updateWorkspace = async (
  companyId: number,
  workspaceId: number,
  payload: {
    name?: string;
    description?: string;
    coverImage?: string;
    color?: string;
  }
): Promise<{
  workspaceId: number;
  companyId: number;
  workspaceName: string;
  description: string;
  coverImage: string;
  color: string;
  createdById: number;
  status: string;
  createdAt: string;
}> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể cập nhật workspace.");

    return data.data;
  } catch (err: any) {
    console.error(" Lỗi cập nhật workspace:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể cập nhật thông tin workspace."
    );
  }
};

// ===================================================
// 🔹 Xóa 1 Workspace trong công ty
// ===================================================
export const deleteWorkspace = async (
  companyId: number,
  workspaceId: number
): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.delete(
      `/companies/${companyId}/workspaces/${workspaceId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể xóa workspace.");

    return {
      success: true,
      message: data.message || "Đã xóa workspace thành công.",
    };
  } catch (err: any) {
    console.error(" Lỗi xóa workspace:", err);
    throw new Error(
      err.response?.data?.message || "Lỗi hệ thống, không thể xóa workspace."
    );
  }
};

export const inviteMemberToWorkspace = async (
  companyId: number,
  workspaceId: number,
  payload: { email: string; roleCode: string } // <-- Sửa từ roleId sang roleCode
) => {
  try {
    const res = await apiClient.post(
      `/companies/${companyId}/workspaces/${workspaceId}/invite-members`,
      payload // Gửi payload { email, roleCode }
    );
    return res.data;
  } catch (err: any) {
    console.error("LỖI API:", err.response?.data || err.message);
    throw err;
  }
};

// ===================================================
// 🔹 Cập nhật trạng thái workspace (ACTIVE / INACTIVE / ARCHIVED)
// ===================================================
export const updateWorkspaceStatus = async (
  companyId: number,
  workspaceId: number,
  payload: { newStatus: string }
): Promise<{
  success: boolean;
  message: string;
  data: {
    workspaceId: number;
    companyId: number;
    workspaceName: string;
    description: string;
    coverImage: string;
    color: string;
    createdById: number;
    status: string;
    createdAt: string;
  };
}> => {
  if (!companyId || !workspaceId)
    throw new Error("Thiếu companyId hoặc workspaceId.");

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}/status`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = res.data;

    if (!data.success)
      throw new Error(
        data.message || "Không thể cập nhật trạng thái workspace."
      );

    return data;
  } catch (err: any) {
    console.error(" Lỗi cập nhật trạng thái workspace:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể cập nhật trạng thái workspace."
    );
  }
};
// ===================================================
// 🔹 Interface dùng chung cho thành viên workspace
// ===================================================
export interface WorkspaceMember {
  memberId: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  roleName: string;
  roleCode: string;
  joinedAt: string;
  status: string;
}

// ===================================================
// 🔹 1️⃣ Cập nhật trạng thái Workspace (ACTIVE / INACTIVE / ARCHIVED)
// ===================================================
export const updatMembereWorkspaceStatus = async (
  companyId: number,
  workspaceId: number,
  payload: { newStatus: string }
): Promise<{
  success: boolean;
  message: string;
  data: {
    workspaceId: number;
    companyId: number;
    workspaceName: string;
    description: string;
    coverImage: string;
    color: string;
    createdById: number;
    status: string;
    createdAt: string;
  };
}> => {
  if (!companyId || !workspaceId)
    throw new Error("Thiếu companyId hoặc workspaceId.");

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}/status`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(
        data.message || "Không thể cập nhật trạng thái workspace."
      );

    return data;
  } catch (err: any) {
    console.error(" Lỗi cập nhật trạng thái workspace:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể cập nhật trạng thái workspace."
    );
  }
};

// ===================================================
// 🔹 2️⃣ Cập nhật trạng thái thành viên trong Workspace
// ===================================================
export const updateWorkspaceMemberStatus = async (
  companyId: number,
  workspaceId: number,
  memberId: number,
  payload: { newStatus: string }
): Promise<{
  success: boolean;
  message: string;
  data: WorkspaceMember;
}> => {
  if (!companyId || !workspaceId || !memberId)
    throw new Error("Thiếu ID công ty, workspace hoặc thành viên.");

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}/status`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(
        data.message || "Không thể cập nhật trạng thái thành viên."
      );

    return data;
  } catch (err: any) {
    console.error(" Lỗi cập nhật trạng thái thành viên:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể cập nhật trạng thái thành viên."
    );
  }
};
// ===================================================
// 🔹 3️⃣ Xóa thành viên khỏi Workspace (Dùng memberId)
// ===================================================
export const removeWorkspaceMember = async (
  companyId: number,
  workspaceId: number,
  memberId: number // ✅ Đã đổi từ userId sang memberId
) => {
  if (!companyId || !workspaceId || !memberId)
    throw new Error("Thiếu thông tin ID.");

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    // ✅ API path đã đổi: .../members/{memberId}
    const res = await apiClient.delete(
      `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể xóa thành viên.");

    return data;
  } catch (err: any) {
    console.error("Lỗi xóa thành viên workspace:", err);
    throw new Error(
      err.response?.data?.message ??
        err.message ??
        "Lỗi hệ thống, không thể xóa thành viên."
    );
  }
};
// ===================================================
// 🔹 3️⃣ Lấy danh sách thành viên trong Workspace
// ===================================================
export const getWorkspaceMembers = async (
  companyId: number,
  workspaceId: number
): Promise<WorkspaceMember[]> => {
  if (!companyId || !workspaceId)
    throw new Error("Thiếu companyId hoặc workspaceId.");

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/members`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(
        data.message || "Không thể lấy danh sách thành viên workspace."
      );

    return data.data as WorkspaceMember[];
  } catch (err: any) {
    console.error(" Lỗi lấy danh sách thành viên workspace:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể tải danh sách thành viên workspace."
    );
  }
};

// ===================================================
// 🔹 4️⃣ Lấy chi tiết một thành viên trong Workspace
// ===================================================
export const getWorkspaceMemberDetail = async (
  companyId: number,
  workspaceId: number,
  memberId: number
): Promise<WorkspaceMember> => {
  if (!companyId || !workspaceId || !memberId)
    throw new Error("Thiếu companyId, workspaceId hoặc memberId.");

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.get(
      `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể lấy thông tin thành viên.");

    return data.data as WorkspaceMember;
  } catch (err: any) {
    console.error(" Lỗi lấy chi tiết thành viên workspace:", err);
    throw new Error(
      err.response?.data?.message ||
        "Lỗi hệ thống, không thể lấy chi tiết thành viên workspace."
    );
  }
};
// ===================================================
// 🔹 5️⃣ Cập nhật Vai trò (Role) thành viên trong Workspace
// ===================================================
export const updateWorkspaceMemberRole = async (
  companyId: number,
  workspaceId: number,
  memberId: number,
  roleCode: string // "WORKSPACE_ADMIN" hoặc "WORKSPACE_MEMBER"
) => {
  if (!companyId || !workspaceId || !memberId)
    throw new Error("Thiếu thông tin ID.");

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.put(
      `/companies/${companyId}/workspaces/${workspaceId}/members/${memberId}/role`,
      { roleCode }, // Payload
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể cập nhật vai trò thành viên.");

    return data;
  } catch (err: any) {
    console.error("Lỗi cập nhật vai trò thành viên:", err);
    throw new Error(
      err.response?.data?.message ??
        err.message ??
        "Lỗi hệ thống, không thể cập nhật vai trò."
    );
  }
};