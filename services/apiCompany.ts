import apiClient from "@/lib/apiClient";

// ===================================================
// 🧩 Interfaces & Types
// ===================================================

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

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Interface Payload cho Update Company (Hỗ trợ File)
export interface UpdateCompanyPayload {
  companyName?: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  logoFile?: File | null; // ✨ File ảnh thực tế từ máy
}

// --- INTERFACES CHO INVITATION ---
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

export interface InvitationSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  keyword?: string;
  status?: string;
}

// ===================================================
// 1️⃣ Get Company by ID
// ===================================================
export const getCompanyById = async (companyId: number): Promise<Company> => {
  try {
    const res = await apiClient.get(`/companies/${companyId}`);
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to fetch company details.");
    }
    return res.data.data;
  } catch (err: any) {
    console.error("Error fetching company info:", err);
    throw new Error(
      err.response?.data?.message || "Unable to fetch company information."
    );
  }
};

// ===================================================
// 2️⃣ Update Company (Multipart/Form-data) - FIX LỖI
// ===================================================
export const updateCompany = async (
  companyId: number,
  payload: UpdateCompanyPayload
): Promise<Company> => {
  try {
    const formData = new FormData();

    // --- BƯỚC 1: Đóng gói dữ liệu JSON (Key: "data") ---
    // Gom tất cả các trường text vào một object
    const jsonPart = {
      companyName: payload.companyName,
      description: payload.description,
      address: payload.address,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      website: payload.website,
      // Lưu ý: Không gửi logo dạng string ở đây nếu backend tự xử lý khi có file
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
        // Đè header để đảm bảo không bị nhận nhầm là application/json thường
        "Content-Type": "multipart/form-data", 
      },
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to update company.");
    }
    return res.data.data;
  } catch (err: any) {
    // Log lỗi chi tiết ra console để debug (F12)
    console.error("Error updating company:", err.response?.data || err);
    
    throw new Error(
      err.response?.data?.message || "Unable to update company."
    );
  }
};

// ===================================================
// 3️⃣ Create Company
// ===================================================
export const createCompany = async (
  payload: {
    companyName: string;
    description?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
  }
): Promise<any> => {
  try {
    const res = await apiClient.post(`/companies`, payload);

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to create company.");
    }

    return res.data.data;
  } catch (err: any) {
    console.error("Error creating company:", err);
    throw new Error(
      err.response?.data?.message || "Unable to create company."
    );
  }
};

// ===================================================
// 4️⃣ Invite Member to Company
// ===================================================
export const inviteMemberToCompany = async (
  companyId: number,
  payload: { email: string; roleCode: string }
) => {
  try {
    const res = await apiClient.post(
      `/companies/${companyId}/invitations`,
      payload
    );
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to send invitation.");
    }
    return res.data.data;
  } catch (err: any) {
    console.error("Error sending invitation:", err);
    throw new Error(
      err.response?.data?.message || "Unable to send invitation."
    );
  }
};

// Lấy danh sách lời mời (Có search & filter)
export const getCompanyInvitations = async (
  companyId: number, 
  params: InvitationSearchParams
): Promise<PageResponse<CompanyInvitation>> => {
  const res = await apiClient.get(`/companies/${companyId}/invitations`, { params });
  return res.data.data;
};

// Hủy lời mời
export const cancelCompanyInvitation = async (
  companyId: number, 
  invitationId: number
) => {
  const res = await apiClient.delete(`/companies/${companyId}/invitations/${invitationId}`);
  return res.data;
};

// ===================================================
// 5️⃣ Get Company Members (Pagination)
// ===================================================
export const getCompanyMembers = async (
  companyId: number,
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }
): Promise<PageResponse<CompanyMember>> => {
  try {
    const res = await apiClient.get(
      `/companies/${companyId}/members`,
      { params }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to load members.");
    }

    return res.data.data;
  } catch (err: any) {
    console.error("Error loading members:", err);
    throw new Error(
      err.response?.data?.message || "Unable to load company members."
    );
  }
};

// ===================================================
// 5.1️⃣ Get Company Member Detail
// ===================================================
export const getCompanyMemberDetail = async (
  companyId: number,
  memberId: number
): Promise<CompanyMember> => {
  try {
    const res = await apiClient.get(
      `/companies/${companyId}/members/${memberId}`
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to fetch member detail.");
    }

    return res.data.data;
  } catch (err: any) {
    console.error("Error fetching member detail:", err);
    throw new Error(
      err.response?.data?.message || "Unable to fetch member detail."
    );
  }
};

// ===================================================
// 6️⃣ Remove Company Member
// ===================================================
export const removeCompanyMember = async (
  companyId: number,
  userId: number
) => {
  try {
    const res = await apiClient.delete(
      `/companies/${companyId}/members/${userId}`
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to remove member.");
    }

    return res.data.data;
  } catch (err: any) {
    console.error("Error removing member:", err);
    throw new Error(
      err.response?.data?.message || "Unable to remove company member."
    );
  }
};

// ===================================================
// 7️⃣ Update Member Status
// ===================================================
export const updateCompanyMemberStatus = async (
  companyId: number,
  memberId: number,
  newStatus: string
): Promise<CompanyMember> => {
  try {
    const res = await apiClient.put(
      `/companies/${companyId}/members/${memberId}/status`,
      { newStatus }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to update member status.");
    }

    return res.data.data;
  } catch (err: any) {
    console.error("Error updating member status:", err);
    throw new Error(
      err.response?.data?.message || "Unable to update member status."
    );
  }
};

// ===================================================
// 8️⃣ Update Member Role
// ===================================================
export const updateCompanyMemberRole = async (
  companyId: number,
  memberId: number,
  roleCode: string
) => {
  try {
    const res = await apiClient.put(
      `/companies/${companyId}/members/${memberId}/role`,
      { roleCode }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to update member role.");
    }

    return res.data.data;
  } catch (err: any) {
    console.error("Error updating role:", err);
    throw new Error(
      err.response?.data?.message || "Unable to update member role."
    );
  }
};

// ===================================================
// 9️⃣ Search Company Members
// ===================================================
export const searchCompanyMembers = async (
  companyId: number,
  params: {
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
): Promise<PageResponse<CompanyMember>> => {
  try {
    const res = await apiClient.get(
      `/companies/${companyId}/members/search`,
      { params }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to search members.");
    }

    return res.data.data;
  } catch (err: any) {
    console.error("Error searching members:", err);
    throw new Error(
      err.response?.data?.message || "Unable to search company members."
    );
  }
};

// ===================================================
// 🔟 Get Pending Invitations
// ===================================================
export const getPendingInvitations = async (
  companyId: number,
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }
) => {
  try {
    const res = await apiClient.get(
      `/companies/${companyId}/invitations/pending`,
      { params }
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to load pending invitations.");
    }

    return res.data.data;
  } catch (err: any) {
    console.error("Error loading pending invitations:", err);
    throw new Error(
      err.response?.data?.message || "Unable to load pending invitations."
    );
  }
};