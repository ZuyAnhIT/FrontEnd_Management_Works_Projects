import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Thông tin chi tiết của lời mời gia nhập công ty
 */
export interface CompanyInvitationDetails {
  email: string;
  companyName: string;
  inviterName: string;
  accountExists: boolean;
}

/**
 * Thông tin chi tiết của lời mời gia nhập dự án
 */
export interface ProjectInvitationDetails {
  email: string;
  projectName: string;
  inviterName: string;
  accountExists: boolean;
}

// =============================================================================
// COMPANY INVITATIONS
// =============================================================================

/**
 * Lấy thông tin chi tiết của lời mời gia nhập công ty (Công khai)
 * Thường dùng khi người dùng truy cập từ liên kết trong email
 */
export const getInvitationDetails = async (token: string): Promise<CompanyInvitationDetails> => {
  try {
    const url = `/invitations/companies/details?token=${token}`;
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Invalid or expired company invitation");
    }
    
    return data; 
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Invalid or expired company invitation";
    throw new Error(errorMsg);
  }
};

/**
 * Chấp nhận lời mời gia nhập công ty (Yêu cầu xác thực)
 * Dành cho người dùng đã đăng nhập vào hệ thống
 */
export const acceptInvitation = async (invitationToken: string) => {
  try {
    const res = await apiClient.post("/invitations/companies/accept", {
      invitationToken,
    });
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to accept company invitation");
    }

    return res.data; 
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Failed to accept company invitation";
    throw new Error(errorMsg);
  }
};

// =============================================================================
// PROJECT INVITATIONS
// =============================================================================

/**
 * Lấy thông tin chi tiết của lời mời gia nhập dự án (Công khai)
 */
export const getProjectInvitationDetails = async (token: string): Promise<ProjectInvitationDetails> => {
  try {
    const url = `/invitations/projects/details?token=${token}`;
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Invalid or expired project invitation");
    }

    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Invalid or expired project invitation";
    throw new Error(errorMsg);
  }
};

/**
 * Chấp nhận lời mời gia nhập dự án (Yêu cầu xác thực)
 */
export const acceptProjectInvitation = async (invitationToken: string) => {
  try {
    const res = await apiClient.post("/invitations/projects/accept", {
      invitationToken,
    });
    const { success, message } = res.data;

    if (!success) {
      throw new Error(message || "Failed to accept project invitation");
    }

    return res.data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Failed to accept project invitation";
    throw new Error(errorMsg);
  }
};