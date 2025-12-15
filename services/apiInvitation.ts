import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. COMPANY INVITATIONS (Lời mời tham gia công ty)
// =============================================================================

/**
 * ✅ Lấy chi tiết lời mời Company (Public)
 * API này dùng để hiển thị thông tin khi người dùng click vào link trong email.
 * GET /invitations/companies/details?token={token}
 */
export const getInvitationDetails = async (token: string) => {
  try {
    const res = await apiClient.get(`/invitations/companies/details?token=${token}`);
    const { success, message, data } = res.data;

    // Kiểm tra logic success từ backend
    if (success === false) {
      throw new Error(message || "Invalid or expired company invitation.");
    }
    
    return data; 
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Invalid or expired company invitation."
    );
  }
};

/**
 * 🧩 Chấp nhận lời mời Company (Protected)
 * Dành cho người dùng ĐÃ có tài khoản (đăng nhập rồi mới accept).
 * POST /invitations/companies/accept
 */
export const acceptInvitation = async (invitationToken: string) => {
  try {
    const res = await apiClient.post("/invitations/companies/accept", {
      invitationToken,
    });
    const { success, message, data } = res.data;

    if (success === false) {
      throw new Error(message || "Failed to accept company invitation.");
    }

    return res.data; 
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Failed to accept company invitation."
    );
  }
};

// =============================================================================
// 2. PROJECT INVITATIONS (Lời mời tham gia dự án)
// =============================================================================

/**
 * ✅ Kiểm tra chi tiết lời mời Project (Public)
 * GET /invitations/projects/details?token={token}
 */
export const getProjectInvitationDetails = async (token: string) => {
  try {
    const res = await apiClient.get(`/invitations/projects/details?token=${token}`);
    const { success, message, data } = res.data;

    if (success === false) {
      throw new Error(message || "Invalid or expired project invitation.");
    }

    return data; // Trả về object: { email, projectName, accountExists, ... }
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Invalid or expired project invitation."
    );
  }
};

/**
 * 🧩 Chấp nhận lời mời Project (Protected)
 * Dành cho người dùng ĐÃ có tài khoản.
 * POST /invitations/projects/accept
 */
export const acceptProjectInvitation = async (invitationToken: string) => {
  try {
    const res = await apiClient.post("/invitations/projects/accept", {
      invitationToken,
    });
    const { success, message, data } = res.data;

    if (success === false) {
      throw new Error(message || "Failed to accept project invitation.");
    }

    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Failed to accept project invitation."
    );
  }
};