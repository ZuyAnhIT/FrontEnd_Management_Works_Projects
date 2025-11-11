"use client";
import apiClient from "@/lib/apiClient";


// ===================================================
// 🧩 Lấy thông tin người dùng hiện tại (đầy đủ profile + role các cấp)
// ===================================================
export const getCurrentUser = async (): Promise<{
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  status: string | null;
  systemRoles: string | null;
  company: {
    companyId: number | null;
    companyName: string | null;
    roleCode: string | null;
  };
  workspaces: {
    workspaceId: number;
    workspaceName: string;
    companyId: number;
    roleCode: string;
  }[];
  projects: {
    projectId: number;
    projectName: string;
    workspaceId: number;
    roleCode: string;
  }[];
}> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.get("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể lấy thông tin người dùng.");

    const user = data.data;

    // ✅ Chuẩn hóa dữ liệu công ty, workspace, project
    const companyMembership = user.companyMemberships?.[0] || null;
    const workspaces = (user.workspaceMemberships || []).map((w: any) => ({
      workspaceId: w.workspaceId,
      workspaceName: w.workspaceName,
      companyId: w.companyId,
      roleCode: w.roleCode,
    }));
    const projects = (user.projectMemberships || []).map((p: any) => ({
      projectId: p.projectId,
      projectName: p.projectName,
      workspaceId: p.workspaceId,
      roleCode: p.roleCode,
    }));

    return {
      id: user.id,  
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      phoneNumber: user.phoneNumber || null,
      dateOfBirth: user.dateOfBirth || null,
      gender: user.gender || null,
      status: user.status || null,
      systemRoles: user.systemRoles || null,
      company: {
        companyId: companyMembership?.companyId || null,
        companyName: companyMembership?.companyName || null,
        roleCode: companyMembership?.roleCode || null,
      },
      workspaces,
      projects,
    };
  } catch (err: any) {
    console.error(" Lỗi khi lấy thông tin người dùng:", err);
    throw new Error(
      err.response?.data?.message ||
      "Không thể tải thông tin người dùng, vui lòng thử lại."
    );
  }
};

// ===================================================
// 🧩 Cập nhật thông tin cá nhân người dùng
// ===================================================
export const updateUserProfile = async (payload: {
  fullName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.put("/users/me", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Không thể cập nhật thông tin người dùng.");
    }

    return data.data; //  Trả về thông tin người dùng đã cập nhật
  } catch (err: any) {
    console.error(" Lỗi cập nhật thông tin cá nhân:", err);
    throw new Error(err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại.");
  }
};

// ===================================================
// 🔒 Đổi mật khẩu người dùng hiện tại
// ===================================================
export const changeUserPassword = async (payload: {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.post("/users/me/change-password", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Không thể đổi mật khẩu.");
    }

    return data;
  } catch (err: any) {
    console.error(" Lỗi đổi mật khẩu:", err);
    throw new Error(err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại.");
  }
};
