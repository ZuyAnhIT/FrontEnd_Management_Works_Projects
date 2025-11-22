import apiClient from "@/lib/apiClient";

// =================================================================
// 🟢 ĐỊNH NGHĨA TYPE & INTERFACE
// =================================================================

export interface CompanyMembership {
  companyId: number;
  companyName: string;
  roleCode: string;
}

export interface WorkspaceMembership {
  workspaceId: number;
  workspaceName: string;
  companyId: number;
  roleCode: string;
}

export interface ProjectMembership {
  projectId: number;
  projectName: string;
  workspaceId: number;
  roleCode: string;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  status: string | null;
  systemRoles: string[];
  
  // ✅ QUAN TRỌNG: Giữ nguyên mảng để AuthContext xử lý logic Multi-Tenant
  companyMemberships: CompanyMembership[];
  workspaceMemberships: WorkspaceMembership[];
  projectMemberships: ProjectMembership[];
}

// Payload cho hàm update (Hỗ trợ file ảnh)
interface UpdateProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: "MALE" | "FEMALE" | "OTHER" | string; // string để linh hoạt
  avatarFile?: File | null; // ✨ File ảnh thực tế từ máy tính
}

// ===================================================
// 🧩 1. LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI (GET ME)
// ===================================================
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    // apiClient đã có interceptor tự động gắn Token vào Header
    const res = await apiClient.get("/users/me");
    const data = res.data;

    // Kiểm tra cấu trúc phản hồi chuẩn { success: true, data: { ... } }
    if (!data.success) {
      throw new Error(data.message || "Không thể lấy thông tin người dùng.");
    }

    const user = data.data;

    // ✅ TRẢ VỀ NGUYÊN BẢN DỮ LIỆU (Raw Data)
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      phoneNumber: user.phoneNumber || null,
      dateOfBirth: user.dateOfBirth || null,
      gender: user.gender || null,
      status: user.status || null,
      systemRoles: user.systemRoles || [],
      
      // Nếu API trả về null thì gán mảng rỗng [] để tránh lỗi khi map()
      companyMemberships: user.companyMemberships || [],
      workspaceMemberships: user.workspaceMemberships || [],
      projectMemberships: user.projectMemberships || [],
    };

  } catch (err: any) {
    console.error("❌ [API] Lỗi lấy thông tin user:", err);
    return null; 
  }
};

// ===================================================
// 🧩 2. CẬP NHẬT THÔNG TIN CÁ NHÂN (MULTIPART/FORM-DATA)
// ===================================================
export const updateUserProfile = async (payload: UpdateProfilePayload) => {
  try {
    const formData = new FormData();

    // // --- CÁCH 1: GỬI DỮ LIỆU DẠNG PHẲNG (KHUYÊN DÙNG) ---
    // // Thay vì gói vào Blob "data", ta gửi từng key riêng.
    // // Hầu hết Backend đều đọc được kiểu này dễ dàng hơn.
    
    // if (payload.fullName) formData.append("fullName", payload.fullName);
    // if (payload.phoneNumber) formData.append("phoneNumber", payload.phoneNumber);
    
    // // Xử lý ngày tháng: Đảm bảo không gửi "undefined" hoặc "null" dạng chuỗi
    // if (payload.dateOfBirth) formData.append("dateOfBirth", payload.dateOfBirth);
    
    // if (payload.gender) formData.append("gender", payload.gender);

    // --- CÁCH 2: NẾU BACKEND CỦA BẠN BẮT BUỘC PHẢI DÙNG JSON BLOB (SPRING BOOT @RequestPart) ---
    // Nếu Cách 1 không chạy, hãy mở comment đoạn dưới đây và đóng comment phần Cách 1 lại
    
    const jsonPart = {
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
    };
    const jsonBlob = new Blob([JSON.stringify(jsonPart)], {
      type: "application/json",
    });
    formData.append("data", jsonBlob);

    // --- XỬ LÝ FILE ---
    if (payload.avatarFile) {
      // Key ở đây là "file" (phải khớp với @RequestParam("file") bên Java)
      formData.append("file", payload.avatarFile);
    }

    // --- GỬI REQUEST ---
    // ⚠️ QUAN TRỌNG: 
    // 1. Ta truyền headers: { "Content-Type": "multipart/form-data" } để đè lên application/json mặc định.
    // 2. Tuy nhiên, Axios thông minh sẽ tự động thêm boundary vào sau multipart/form-data.
    const res = await apiClient.put("/users/me", formData, {
      headers: {
        "Content-Type": "multipart/form-data", 
      },
    });

    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Không thể cập nhật thông tin.");
    }

    return data.data; 
  } catch (err: any) {
    // Log chi tiết lỗi ra console để debug
    console.error("❌ [API] Lỗi cập nhật profile:", err.response?.data || err.message);
    
    // Trả về lỗi cụ thể từ Backend nếu có
    const serverMessage = err.response?.data?.message;
    throw new Error(serverMessage || "Lỗi hệ thống khi cập nhật.");
  }
};

// ===================================================
// 🔒 3. ĐỔI MẬT KHẨU
// ===================================================
export const changeUserPassword = async (payload: {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) => {
  try {
    const res = await apiClient.post("/users/me/change-password", payload);
    const data = res.data;

    if (!data.success) {
      throw new Error(data.message || "Không thể đổi mật khẩu.");
    }

    return data;
  } catch (err: any) {
    console.error("❌ [API] Lỗi đổi mật khẩu:", err);
    throw new Error(err.response?.data?.message || "Lỗi hệ thống khi đổi mật khẩu.");
  }
};