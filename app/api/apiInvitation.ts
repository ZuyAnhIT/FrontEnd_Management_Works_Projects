"use client";
import apiClient from "@/lib/apiClient";

/**
 * ✅ Thành viên chấp nhận lời mời
 * Endpoint: POST /invitations/accept
 * Input: { invitationToken }
 * Output: { success, message, data }
 */
export const acceptInvitation = async (payload: {
    invitationToken: string;
}) => {
    try {
        const res = await apiClient.post(`/invitations/accept`, payload);
        const data = res.data;

        if (!data.success) {
            throw new Error(data.message || "Không thể chấp nhận lời mời.");
        }

        return data;
    } catch (err: any) {
        console.error(" Lỗi chấp nhận lời mời:", err.response || err);
        throw new Error(
            err.response?.data?.message ||
            "Lỗi hệ thống, không thể chấp nhận lời mời."
        );
    }
};
