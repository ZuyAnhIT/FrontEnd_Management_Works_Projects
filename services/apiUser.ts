"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

// -----------------------------------------------------------------------------
// Quyền hạn hệ thống (Memberships)
// -----------------------------------------------------------------------------

export interface CompanyMembership {
  companyId: number;
  companyName: string;
  roleCode: string;
}

export interface WorkspaceMembership {
  workspaceId: number;
  workspaceName: string;
  companyId: number;
  roleCode: string;
}

export interface ProjectMembership {
  projectId: number;
  projectName: string;
  workspaceId: number;
  roleCode: string;
}

// -----------------------------------------------------------------------------
// Người dùng (User Models)
// -----------------------------------------------------------------------------

/**
 * Thông tin chi tiết hồ sơ người dùng
 */
export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  status: string | null;
  systemRoles: string[];
  
  // Dữ liệu phục vụ cơ chế Multi-Tenant
  companyMemberships: CompanyMembership[];
  workspaceMemberships: WorkspaceMembership[];
  projectMemberships: ProjectMembership[];
}

// -----------------------------------------------------------------------------
// Dữ liệu yêu cầu (Payloads)
// -----------------------------------------------------------------------------

/**
 * Dữ liệu yêu cầu để cập nhật hồ sơ cá nhân
 */
export interface UpdateProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // Định dạng YYYY-MM-DD
  gender?: "MALE" | "FEMALE" | "OTHER" | string;
  avatarFile?: File | null;
}

/**
 * Dữ liệu yêu cầu khi thực hiện đổi mật khẩu
 */
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Truy vấn thông tin hồ sơ của người dùng hiện tại
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const res = await apiClient.get("/users/me");
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch user profile");
    }

    const user = data;

    // Chuyển đổi và chuẩn hóa dữ liệu từ API
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      phoneNumber: user.phoneNumber || null,
      dateOfBirth: user.dateOfBirth || null,
      gender: user.gender || null,
      status: user.status || null,
      systemRoles: user.systemRoles || [],
      
      // Đảm bảo các mảng quyền hạn không bị null
      companyMemberships: user.companyMemberships || [],
      workspaceMemberships: user.workspaceMemberships || [],
      projectMemberships: user.projectMemberships || [],
    };

  } catch (err: any) {
    // Ghi log cảnh báo phục vụ kiểm tra lỗi xác thực
    console.warn("[User Service] Fetch user failed:", err.message);
    return null; 
  }
};

/**
 * Cập nhật thông tin hồ sơ cá nhân (Hỗ trợ tải lên ảnh đại diện)
 */
export const updateUserProfile = async (payload: UpdateProfilePayload) => {
  try {
    const formData = new FormData();

    // Chuẩn bị phần dữ liệu văn bản dưới dạng JSON Blob cho Spring Boot
    const jsonPart = {
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
    };
    
    const jsonBlob = new Blob([JSON.stringify(jsonPart)], {
      type: "application/json",
    });
    formData.append("data", jsonBlob);

    // Đính kèm tệp tin hình ảnh nếu người dùng có thay đổi
    if (payload.avatarFile) {
      formData.append("file", payload.avatarFile);
    }

    const res = await apiClient.put("/users/me", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update profile");
    }

    return data; 
  } catch (err: any) {
    // Ưu tiên sử dụng thông báo lỗi trả về từ phía Backend
    const errorMsg = err.response?.data?.message || "An error occurred while updating profile";
    throw new Error(errorMsg);
  }
};

/**
 * Thay đổi mật khẩu truy cập của người dùng
 */
export const changeUserPassword = async (payload: ChangePasswordPayload) => {
  try {
    const res = await apiClient.post("/users/me/change-password", payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to change password");
    }

    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "An error occurred while changing password";
    throw new Error(errorMsg);
  }
};