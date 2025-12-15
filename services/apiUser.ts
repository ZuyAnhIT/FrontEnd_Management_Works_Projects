"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES & TYPES (Định nghĩa kiểu dữ liệu)
// =============================================================================

// -----------------------------------------------------------------------------
// Memberships (Quyền hạn trong hệ thống)
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
// User Models (Dữ liệu người dùng)
// -----------------------------------------------------------------------------

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
  
  // ✅ QUAN TRỌNG: Giữ nguyên mảng để AuthContext xử lý logic Multi-Tenant
  companyMemberships: CompanyMembership[];
  workspaceMemberships: WorkspaceMembership[];
  projectMemberships: ProjectMembership[];
}

// -----------------------------------------------------------------------------
// Payloads (Dữ liệu gửi đi)
// -----------------------------------------------------------------------------

export interface UpdateProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: "MALE" | "FEMALE" | "OTHER" | string;
  avatarFile?: File | null; // ✨ File ảnh thực tế từ máy tính
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// =============================================================================
// 2. API METHODS (Các hàm gọi API)
// =============================================================================

/**
 * 🧩 1. LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI (GET ME)
 * GET /api/users/me
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    // apiClient đã có interceptor tự động gắn Token vào Header
    const res = await apiClient.get("/users/me");
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch user profile.");
    }

    const user = data;

    // ✅ TRẢ VỀ NGUYÊN BẢN DỮ LIỆU (Raw Data)
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
      
      // Nếu API trả về null thì gán mảng rỗng [] để tránh lỗi khi map()
      companyMemberships: user.companyMemberships || [],
      workspaceMemberships: user.workspaceMemberships || [],
      projectMemberships: user.projectMemberships || [],
    };

  } catch (err: any) {
    // Chỉ log lỗi và trả về null để AuthContext biết user chưa login hoặc token hết hạn
    console.warn("[UserAPI] Fetch user failed:", err.message);
    return null; 
  }
};

/**
 * 🧩 2. CẬP NHẬT THÔNG TIN CÁ NHÂN (MULTIPART/FORM-DATA)
 * PUT /api/users/me
 */
export const updateUserProfile = async (payload: UpdateProfilePayload) => {
  try {
    const formData = new FormData();

    // --- XỬ LÝ DỮ LIỆU JSON (SPRING BOOT @RequestPart) ---
    // Gom các trường text vào một object JSON và ép kiểu thành Blob
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

    // --- XỬ LÝ FILE ẢNH ---
    if (payload.avatarFile) {
      // Key "file" phải khớp với @RequestParam("file") bên Java
      formData.append("file", payload.avatarFile);
    }

    // --- GỬI REQUEST ---
    const res = await apiClient.put("/users/me", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Ghi đè header mặc định
      },
    });

    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update profile.");
    }

    return data; 
  } catch (err: any) {
    // Ưu tiên message lỗi từ server trả về
    throw new Error(err.response?.data?.message || "System error updating profile.");
  }
};

/**
 * 🔒 3. ĐỔI MẬT KHẨU
 * POST /api/users/me/change-password
 */
export const changeUserPassword = async (payload: ChangePasswordPayload) => {
  try {
    const res = await apiClient.post("/users/me/change-password", payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to change password.");
    }

    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "System error changing password.");
  }
};