import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES & TYPES (Định nghĩa kiểu dữ liệu)
// =============================================================================

// -----------------------------------------------------------------------------
// Data Models (Dữ liệu trả về)
// -----------------------------------------------------------------------------

export interface Company {
  companyId: number;
  companyName: string;
  companyCode: string;
  description: string;
  logo: string | null;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  website: string | null;
}

export interface CompanyMember {
  memberId: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  roleName: string | null;
  jobTitle: string | null;
  phoneNumber: string | null;
  status: string;
  joinedAt: string | null;
}

export interface CompanyInvitation {
  id: number;
  email: string;
  roleName: string;
  invitedByName: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
  invitationLink: string;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// -----------------------------------------------------------------------------
// Payload & Params (Dữ liệu gửi đi)
// -----------------------------------------------------------------------------

export interface CreateCompanyPayload {
  companyName: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
}

export interface UpdateCompanyPayload {
  companyName?: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  logoFile?: File | null; // ✨ File ảnh thực tế từ máy
}

export interface InviteMemberPayload {
  email: string;
  roleCode: string;
}

export interface InvitationSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  keyword?: string;
  status?: string;
}

export interface MemberSearchParams {
  name?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  roleName?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// =============================================================================
// 2. COMPANY MANAGEMENT APIs (Quản lý thông tin công ty)
// =============================================================================

/**
 * Lấy thông tin chi tiết công ty theo ID
 */
export const getCompanyById = async (companyId: number): Promise<Company> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}`);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch company details.");
    }
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to fetch company information.");
  }
};

/**
 * Tạo công ty mới
 */
export const createCompany = async (payload: CreateCompanyPayload): Promise<Company> => {
  try {
    const res = await apiClient.post(`/companies`, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to create company.");
    }
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to create company.");
  }
};

/**
 * Cập nhật thông tin công ty (Hỗ trợ Multipart/Form-data để upload logo)
 */
export const updateCompany = async (
  companyId: number,
  payload: UpdateCompanyPayload
): Promise<Company> => {
  try {
    const formData = new FormData();

    // --- BƯỚC 1: Đóng gói dữ liệu JSON (Key: "data") ---
    // Gom tất cả các trường text vào một object để gửi kèm file
    const jsonPart = {
      companyName: payload.companyName,
      description: payload.description,
      address: payload.address,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      website: payload.website,
    };

    // Ép kiểu JSON thành Blob với content-type application/json
    // Đây là mấu chốt để Backend Spring Boot hiểu được @RequestPart("data")
    const jsonBlob = new Blob([JSON.stringify(jsonPart)], {
      type: "application/json",
    });
    formData.append("data", jsonBlob);

    // --- BƯỚC 2: Đóng gói File Ảnh (Key: "file") ---
    if (payload.logoFile) {
      formData.append("file", payload.logoFile);
    }

    // --- BƯỚC 3: Gửi Request ---
    // Axios sẽ tự động thêm boundary vào Content-Type multipart/form-data
    const res = await apiClient.put(`/companies/${companyId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Đảm bảo header chính xác
      },
    });

    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update company.");
    }
    return data;

  } catch (err: any) {
    console.error("Error updating company:", err); // Log để debug
    throw new Error(err.response?.data?.message || "Unable to update company.");
  }
};

// =============================================================================
// 3. MEMBER MANAGEMENT APIs (Quản lý thành viên)
// =============================================================================

/**
 * Lấy danh sách thành viên (Có phân trang)
 */
export const getCompanyMembers = async (
  companyId: number,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" }
): Promise<PageResponse<CompanyMember>> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/members`, { params });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to load members.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to load company members.");
  }
};

/**
 * Tìm kiếm thành viên nâng cao
 */
export const searchCompanyMembers = async (
  companyId: number,
  params: MemberSearchParams
): Promise<PageResponse<CompanyMember>> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/members/search`, { params });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to search members.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to search company members.");
  }
};

/**
 * Lấy chi tiết một thành viên
 */
export const getCompanyMemberDetail = async (
  companyId: number,
  memberId: number
): Promise<CompanyMember> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/members/${memberId}`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to fetch member detail.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to fetch member detail.");
  }
};

/**
 * Cập nhật trạng thái thành viên (Active/Inactive)
 */
export const updateCompanyMemberStatus = async (
  companyId: number,
  memberId: number,
  newStatus: string
): Promise<CompanyMember> => {
  try {
    const res = await apiClient.put(`/companies/${companyId}/members/${memberId}/status`, { newStatus });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to update member status.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to update member status.");
  }
};

/**
 * Cập nhật vai trò (Role) của thành viên
 */
export const updateCompanyMemberRole = async (
  companyId: number,
  memberId: number,
  roleCode: string
) => {
  try {
    const res = await apiClient.put(`/companies/${companyId}/members/${memberId}/role`, { roleCode });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to update member role.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to update member role.");
  }
};

/**
 * Xóa thành viên khỏi công ty
 */
export const removeCompanyMember = async (
  companyId: number,
  userId: number
) => {
  try {
    const res = await apiClient.delete(`/companies/${companyId}/members/${userId}`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to remove member.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to remove company member.");
  }
};

// =============================================================================
// 4. INVITATION MANAGEMENT APIs (Quản lý lời mời)
// =============================================================================

/**
 * Gửi lời mời tham gia công ty qua email
 */
export const inviteMemberToCompany = async (
  companyId: number,
  payload: InviteMemberPayload
) => {
  try {
    const res = await apiClient.post(`/companies/${companyId}/invitations`, payload);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to send invitation.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to send invitation.");
  }
};

/**
 * Lấy danh sách lời mời (Có search & filter)
 */
export const getCompanyInvitations = async (
  companyId: number,
  params: InvitationSearchParams
): Promise<PageResponse<CompanyInvitation>> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/invitations`, { params });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to load invitations.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to load invitations.");
  }
};

/**
 * Lấy danh sách lời mời đang chờ (Pending) - API rút gọn
 */
export const getPendingInvitations = async (
  companyId: number,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" }
) => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/invitations/pending`, { params });
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to load pending invitations.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to load pending invitations.");
  }
};

/**
 * Hủy lời mời đã gửi
 */
export const cancelCompanyInvitation = async (
  companyId: number,
  invitationId: number
) => {
  try {
    const res = await apiClient.delete(`/companies/${companyId}/invitations/${invitationId}`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to cancel invitation.");
    return data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Unable to cancel invitation.");
  }
};