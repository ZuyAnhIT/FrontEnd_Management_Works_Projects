"use client";
import apiClient from "@/lib/apiClient";

// ===================================================
// 🏢 API COMPANY — Quản lý thông tin & thành viên công ty
// ===================================================

// 🧩 Interface: Thông tin công ty
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

// 🧩 Interface: Thành viên công ty
export interface CompanyMember {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  roleCode?: string;
  roleName?: string;
  jobTitle?: string;
  joinedAt?: string;
}

// ===================================================
// 🔹 1️⃣ Lấy thông tin công ty theo ID
// ===================================================
export const getCompanyById = async (companyId: number): Promise<Company> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.get(`/companies/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể lấy thông tin công ty.");

    return data.data as Company;
  } catch (err: any) {
    console.error(" Lỗi lấy thông tin công ty:", err);
    throw new Error(
      err.response?.data?.message ??
        err.message ??
        "Lỗi hệ thống, vui lòng thử lại."
    );
  }
};

// ===================================================
// 🔹 2️⃣ Cập nhật thông tin công ty
// ===================================================
export const updateCompany = async (
  companyId: number,
  payload: Partial<Company>
): Promise<Company> => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.put(`/companies/${companyId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể cập nhật thông tin công ty.");

    return data.data as Company;
  } catch (err: any) {
    console.error(" Lỗi cập nhật công ty:", err);
    throw new Error(
      err.response?.data?.message ??
        err.message ??
        "Lỗi hệ thống, vui lòng thử lại."
    );
  }
};

// ===================================================
// 🔹 3️⃣ Tạo công ty mới (PHIÊN BẢN SỬA LỖI)
// ===================================================
export const createCompany = async (
  payload: Partial<Company>
): Promise<Company> => {
  // ❌ KHÔNG LẤY TOKEN Ở ĐÂY. apiClient (interceptor) sẽ tự làm.
  // const token = localStorage.getItem("accessToken");

  try {
    // Chỉ cần gọi post. apiClient sẽ tự gắn Header Authorization
    const res = await apiClient.post(`/companies`, payload);

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể tạo công ty mới.");

    return data.data as Company;
  } catch (err: any) {
    console.error(" Lỗi tạo công ty:", err);
    throw new Error(
      err.response?.data?.message ??
        err.message ??
        "Lỗi hệ thống, vui lòng thử lại."
    );
  }
};

// ===================================================
// 🔹 4️⃣ Mời thành viên vào công ty
// ===================================================
export const inviteMemberToCompany = async (
  companyId: number,
  payload: { email: string; roleId: number }
) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");
  const roleCode = payload.roleId === 2 ? "COMPANY_ADMIN" : "COMPANY_MEMBER";
  const body = {
    email: payload.email,
    roleCode,
  };
  try {
    const res = await apiClient.post(
      `/companies/${companyId}/invitations`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể gửi lời mời.");

    return data;
  } catch (err: any) {
    console.error(" Lỗi gửi lời mời:", err);
    throw new Error(
      err.response?.data?.message ??
        err.message ??
        "Lỗi hệ thống, không thể gửi lời mời."
    );
  }
};

// ===================================================
// 🔹 5️⃣ Lấy danh sách thành viên công ty
// ===================================================
export const getCompanyMembers = async (
  companyId: number
): Promise<CompanyMember[]> => {
  if (!companyId || companyId <= 0)
    throw new Error("Thiếu hoặc sai ID công ty.");

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.get(`/companies/${companyId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể lấy danh sách thành viên.");

    return data.data as CompanyMember[];
  } catch (err: any) {
    console.error(" Lỗi lấy danh sách thành viên:", err);
    throw new Error(
      err.response?.data?.message ??
        err.message ??
        "Lỗi hệ thống, không thể tải danh sách thành viên."
    );
  }
};
// ===================================================
// 🔹 5️⃣ Lấy danh chi tiết sách thành viên công ty
// ===================================================
export const getDetailCompanyMembers = async (
  companyId: number,
  memberId: number
): Promise<CompanyMember[]> => {
  if (!companyId || companyId <= 0)
    throw new Error("Thiếu hoặc sai ID công ty.");
  if (!memberId || memberId <= 0)
    throw new Error("Thiếu hoặc sai ID thành viên.");

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.get(
      `/companies/${companyId}/members/${memberId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể lấy danh sách thành viên.");

    return data.data as CompanyMember[];
  } catch (err: any) {
    console.error(" Lỗi lấy danh sách thành viên:", err);
    throw new Error(
      err.response?.data?.message ??
        err.message ??
        "Lỗi hệ thống, không thể tải danh sách thành viên."
    );
  }
};
// ===================================================
// 🔹 6️⃣ Xóa thành viên khỏi công ty
// ===================================================
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
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể xóa thành viên.");

    return data;
  } catch (err: any) {
    console.error(" Lỗi xóa thành viên:", err);
    throw new Error(
      err.response?.data?.message ??
        err.message ??
        "Lỗi hệ thống, không thể xóa thành viên."
    );
  }
};

// ✅ HÀM MỚI: Cập nhật trạng thái thành viên
export const updateCompanyMemberStatus = async (
  companyId: number,
  memberId: number,
  newStatus: string
) => {
  const res = await apiClient.put(
    `/companies/${companyId}/members/${memberId}/status`,
    { newStatus }
  );
  // Giả sử API trả về { success: true, message: "...", data: updatedMember }
  return res.data.data;
};

// ===================================================
// 🔹 Cập nhật Vai trò (Role) thành viên trong Công ty
// ===================================================
export const updateCompanyMemberRole = async (
  companyId: number,
  memberId: number,
  roleCode: string // "COMPANY_ADMIN" hoặc "COMPANY_MEMBER"
) => {
  if (!companyId || !memberId)
    throw new Error("Thiếu thông tin ID công ty hoặc thành viên.");

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Người dùng chưa đăng nhập.");

  try {
    const res = await apiClient.put(
      `/companies/${companyId}/members/${memberId}/role`,
      { roleCode }, // Payload khớp với RoleUpdateRequest của Backend
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    if (!data.success)
      throw new Error(data.message || "Không thể cập nhật vai trò thành viên.");

    return data;
  } catch (err: any) {
    console.error("Lỗi cập nhật vai trò thành viên công ty:", err);
    throw new Error(
      err.response?.data?.message ??
        err.message ??
        "Lỗi hệ thống, không thể cập nhật vai trò."
    );
  }
};
