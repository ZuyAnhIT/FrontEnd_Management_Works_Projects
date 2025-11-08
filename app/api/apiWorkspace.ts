"use client";
import apiClient from "@/lib/apiClient";

// ===================================================
// 🧩 Lấy danh sách workspace của công ty
// ===================================================
export const getCompanyWorkspaces = async (companyId: number) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.get(`/companies/${companyId}/workspaces`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Không thể lấy danh sách không gian làm việc.");
    }

    return data.data; // Trả về mảng workspace
  } catch (err: any) {
    console.error(" Lỗi lấy danh sách workspace:", err);
    throw new Error(err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại.");
  }
};

// ===================================================
// 🧩 Tạo workspace mới cho công ty
// ===================================================
export const createWorkspace = async (
  companyId: number,
  payload: {
    workspaceName: string;
    description?: string;
    coverImage?: string;
    color?: string;
  }
) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.post(`/companies/${companyId}/workspaces`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Không thể tạo không gian làm việc mới.");
    }

    return data.data; // Trả về workspace vừa tạo
  } catch (err: any) {
    console.error(" Lỗi tạo workspace:", err);
    throw new Error(err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại.");
  }
};
