"use client";
import apiClient from "@/lib/apiClient";

export interface Company {
    companyId: number;
    companyName: string;
    companyCode?: string;
    description?: string;
    logo?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    createdById?: number;
}

// ===================================================
// 🔹 1️⃣ Lấy thông tin công ty theo ID
// ===================================================
export const getCompanyById = async (companyId: number): Promise<Company> => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Người dùng chưa đăng nhập.");

    try {
        const res = await apiClient.get(`/companies/${companyId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = res.data;

        if (!data.success) throw new Error(data.message || "Không thể lấy thông tin công ty.");

        return data.data as Company;
    } catch (err: any) {
        console.error("❌ Lỗi lấy thông tin công ty:", err);
        throw new Error(err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại.");
    }
};

// ===================================================
// 🔹 2️⃣ Cập nhật thông tin công ty
// ===================================================
export const updateCompany = async (
    companyId: number,
    payload: {
        companyName?: string;
        description?: string;
        logo?: string;
        address?: string;
        phoneNumber?: string;
        email?: string;
        website?: string;
    }
): Promise<Company> => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Người dùng chưa đăng nhập.");

    try {
        const res = await apiClient.put(`/companies/${companyId}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = res.data;

        if (!data.success)
            throw new Error(data.message || "Không thể cập nhật thông tin công ty.");

        return data.data as Company;
    } catch (err: any) {
        console.error("❌ Lỗi cập nhật công ty:", err);
        throw new Error(err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại.");
    }
};

// ===================================================
// 🔹 3️⃣ Tạo công ty mới
// ===================================================
export const createCompany = async (payload: {
    companyName: string;
    description?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
}): Promise<Company> => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Người dùng chưa đăng nhập.");

    try {
        const res = await apiClient.post(`/companies`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = res.data;

        if (!data.success)
            throw new Error(data.message || "Không thể tạo công ty mới.");

        return data.data as Company;
    } catch (err: any) {
        console.error("❌ Lỗi tạo công ty:", err);
        throw new Error(err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại.");
    }
};
/**
 * 📨 Gửi lời mời thành viên vào công ty
 * Endpoint: POST /companies/{companyId}/invitations
 * Input: { email, roleId }
 * Output: { success, message, data }
 */
export const inviteMemberToCompany = async (
    companyId: number,
    payload: { email: string; roleId: number }
) => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Người dùng chưa đăng nhập.");

    try {
        const res = await apiClient.post(
            `/companies/${companyId}/invitations`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = res.data;
        if (!data.success) {
            throw new Error(data.message || "Không thể gửi lời mời.");
        }

        return data; //  { success, message, data }
    } catch (err: any) {
        console.error(" Lỗi gửi lời mời:", err.response || err);
        throw new Error(
            err.response?.data?.message || "Lỗi hệ thống, không thể gửi lời mời."
        );
    }
};
/**
 * 🧩 Lấy danh sách thành viên trong công ty
 * Endpoint: GET /companies/{companyId}/members
 * Input: companyId
 * Output: danh sách user
 */
export const getCompanyMembers = async (companyId: number) => {
    if (!companyId || companyId <= 0)
        throw new Error("Thiếu hoặc sai ID công ty.");

    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Người dùng chưa đăng nhập.");

    try {
        const res = await apiClient.get(`/companies/${companyId}/members`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = res.data;
        if (!data.success)
            throw new Error(data.message || "Không thể lấy danh sách thành viên.");

        return data.data; // ✅ Trả về mảng [{ userId, fullName, email, ... }]
    } catch (err: any) {
        console.error(" Lỗi lấy danh sách thành viên:", err.response || err);
        throw new Error(
            err.response?.data?.message ||
            "Lỗi hệ thống, không thể tải danh sách thành viên."
        );
    }
};

/**
 * 🧩 Xóa hoặc thao tác trên 1 thành viên cụ thể
 * Endpoint: DELETE /companies/{companyId}/members/{userId}
 * Input: companyId, userId
 * Output: { success, message }
 */
export const removeCompanyMember = async (
    companyId: number,
    userId: number
) => {
    if (!companyId || !userId)
        throw new Error("Thiếu thông tin công ty hoặc người dùng.");

    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Người dùng chưa đăng nhập.");

    try {
        const res = await apiClient.delete(
            `/companies/${companyId}/members/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = res.data;
        if (!data.success)
            throw new Error(data.message || "Không thể xóa thành viên.");

        return data; // ✅ { success, message }
    } catch (err: any) {
        console.error(" Lỗi xóa thành viên:", err.response || err);
        throw new Error(
            err.response?.data?.message || "Lỗi hệ thống, không thể xóa thành viên."
        );
    }
};
