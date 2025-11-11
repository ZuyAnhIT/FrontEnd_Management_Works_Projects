// ⛔️ Sửa đường dẫn nếu cần
import apiClient from "@/lib/apiClient";

// ===================================================
// ✅ HÀM MỚI: Lấy chi tiết lời mời (Public)
// (Backend sẽ kiểm tra token VÀ user.exists)
// ===================================================
export const getInvitationDetails = async (token: string) => {
  try {
    // API này là public, không cần token
    const res = await apiClient.get(`/invitations/details?token=${token}`);
    // Trả về { email, companyName, accountExists }
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
    // API này là protected, apiClient sẽ tự động gắn Bearer token
    const res = await apiClient.post("/invitations/accept", {
      invitationToken,
    });
    return res.data; // Trả về { success, message, data: companyMember }
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Không thể chấp nhận lời mời."
    );
  }
};
