"use client";
import apiClient from "@/lib/apiClient";

// ===================================================
// 🧩 Interfaces — Match Backend Exactly
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

// ===================================================
// 1️⃣ Get Company by ID
// ===================================================
export const getCompanyById = async (
  companyId: number
): Promise<Company> => {
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
// 2️⃣ Update Company
// ===================================================
export const updateCompany = async (
  companyId: number,
  payload: Partial<Company>
): Promise<Company> => {
  try {
    const res = await apiClient.put(`/companies/${companyId}`, payload);
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to update company.");
    }
    return res.data.data;
  } catch (err: any) {
    console.error("Error updating company:", err);
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
