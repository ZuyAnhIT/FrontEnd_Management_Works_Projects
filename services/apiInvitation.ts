import apiClient from "@/lib/apiClient";

// ===================================================
// ✅ HÀM MỚI: Lấy chi tiết lời mời (Public)
// ===================================================
export const getInvitationDetails = async (token: string) => {
  try {
    const res = await apiClient.get(`/invitations/companies/details?token=${token}`);
    return res.data.data; 
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Lời mời không hợp lệ hoặc đã hết hạn."
    );
  }
};

// ===================================================
// 🧩 Chấp nhận lời mời (Protected - Trường hợp 2: Người dùng cũ)
// ===================================================
export const acceptInvitation = async (invitationToken: string) => {
  try {
    const res = await apiClient.post("/invitations/companies/accept", {
      invitationToken,
    });
    return res.data; 
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Không thể chấp nhận lời mời."
    );
  }
};

// --- ✅ PROJECT INVITATIONS  ---

// 1. Kiểm tra chi tiết lời mời Project (Public)
export const getProjectInvitationDetails = async (token: string) => {
  try {
    const res = await apiClient.get(`/invitations/projects/details?token=${token}`);
    return res.data.data; // { email, projectName, accountExists, ... }
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Project invitation invalid or expired."
    );
  }
};

// 2. Chấp nhận lời mời Project (Protected - Đã có tài khoản)
export const acceptProjectInvitation = async (invitationToken: string) => {
  try {
    const res = await apiClient.post("/invitations/projects/accept", {
      invitationToken,
    });
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Could not accept project invitation."
    );
  }
};