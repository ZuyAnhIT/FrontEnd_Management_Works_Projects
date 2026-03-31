import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

// -----------------------------------------------------------------------------
// Data Models
// -----------------------------------------------------------------------------

/**
 * Thông tin chi tiết về công ty
 */
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

/**
 * Thông tin thành viên trong công ty
 */
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

/**
 * Thông tin lời mời tham gia công ty
 */
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

/**
 * Cấu trúc phản hồi phân trang chuẩn
 */
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
// Payload & Params
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
  logoFile?: File | null;
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
// COMPANY MANAGEMENT APIs
// =============================================================================

/**
 * Lấy thông tin chi tiết của một công ty
 */
export const getCompanyById = async (companyId: number): Promise<Company> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}`);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch company details");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to fetch company information";
    throw new Error(errorMsg);
  }
};

/**
 * Khởi tạo một công ty mới
 */
export const createCompany = async (payload: CreateCompanyPayload): Promise<Company> => {
  try {
    const res = await apiClient.post(`/companies`, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to create company");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to create company";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật thông tin công ty (Hỗ trợ tải lên logo qua Multipart Form Data)
 */
export const updateCompany = async (
  companyId: number,
  payload: UpdateCompanyPayload
): Promise<Company> => {
  try {
    const formData = new FormData();

    // Chuẩn bị phần dữ liệu JSON để gửi kèm file
    const jsonPart = {
      companyName: payload.companyName,
      description: payload.description,
      address: payload.address,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      website: payload.website,
    };

    // Đóng gói JSON thành Blob với content-type chuẩn để Backend xử lý
    const jsonBlob = new Blob([JSON.stringify(jsonPart)], {
      type: "application/json",
    });
    formData.append("data", jsonBlob);

    // Đính kèm tệp tin logo nếu có
    if (payload.logoFile) {
      formData.append("file", payload.logoFile);
    }

    const res = await apiClient.put(`/companies/${companyId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update company");
    }
    return data;

  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to update company";
    console.error(`[Company Service] Update error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
};

// =============================================================================
// MEMBER MANAGEMENT APIs
// =============================================================================

/**
 * Lấy danh sách thành viên thuộc công ty
 */
export const getCompanyMembers = async (
  companyId: number,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" }
): Promise<PageResponse<CompanyMember>> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/members`, { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load members");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to load company members";
    throw new Error(errorMsg);
  }
};

/**
 * Tìm kiếm thành viên với các tiêu chí lọc nâng cao
 */
export const searchCompanyMembers = async (
  companyId: number,
  params: MemberSearchParams
): Promise<PageResponse<CompanyMember>> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/members/search`, { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to search members");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to search company members";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn thông tin chi tiết của một thành viên cụ thể
 */
export const getCompanyMemberDetail = async (
  companyId: number,
  memberId: number
): Promise<CompanyMember> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/members/${memberId}`);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to fetch member detail");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to fetch member detail";
    throw new Error(errorMsg);
  }
};

/**
 * Cập nhật trạng thái hoạt động của thành viên
 */
export const updateCompanyMemberStatus = async (
  companyId: number,
  memberId: number,
  newStatus: string
): Promise<CompanyMember> => {
  try {
    const res = await apiClient.put(`/companies/${companyId}/members/${memberId}/status`, { newStatus });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update member status");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to update member status";
    throw new Error(errorMsg);
  }
};

/**
 * Thay đổi vai trò (Role) của thành viên trong công ty
 */
export const updateCompanyMemberRole = async (
  companyId: number,
  memberId: number,
  roleCode: string
) => {
  try {
    const res = await apiClient.put(`/companies/${companyId}/members/${memberId}/role`, { roleCode });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to update member role");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to update member role";
    throw new Error(errorMsg);
  }
};

/**
 * Loại bỏ thành viên ra khỏi công ty
 */
export const removeCompanyMember = async (
  companyId: number,
  userId: number
) => {
  try {
    const res = await apiClient.delete(`/companies/${companyId}/members/${userId}`);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to remove member");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to remove company member";
    throw new Error(errorMsg);
  }
};

// =============================================================================
// INVITATION MANAGEMENT APIs
// =============================================================================

/**
 * Gửi lời mời gia nhập công ty qua Email
 */
export const inviteMemberToCompany = async (
  companyId: number,
  payload: InviteMemberPayload
) => {
  try {
    const res = await apiClient.post(`/companies/${companyId}/invitations`, payload);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to send invitation");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to send invitation";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy danh sách toàn bộ lời mời đã gửi
 */
export const getCompanyInvitations = async (
  companyId: number,
  params: InvitationSearchParams
): Promise<PageResponse<CompanyInvitation>> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/invitations`, { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load invitations");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to load invitations";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy danh sách các lời mời đang ở trạng thái chờ xác nhận
 */
export const getPendingInvitations = async (
  companyId: number,
  params: { page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" }
) => {
  try {
    const res = await apiClient.get(`/companies/${companyId}/invitations/pending`, { params });
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load pending invitations");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to load pending invitations";
    throw new Error(errorMsg);
  }
};

/**
 * Thu hồi/Hủy lời mời đã gửi trước đó
 */
export const cancelCompanyInvitation = async (
  companyId: number,
  invitationId: number
) => {
  try {
    const res = await apiClient.delete(`/companies/${companyId}/invitations/${invitationId}`);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to cancel invitation");
    }
    return data;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Unable to cancel invitation";
    throw new Error(errorMsg);
  }
};