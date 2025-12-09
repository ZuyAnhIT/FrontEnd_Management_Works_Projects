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