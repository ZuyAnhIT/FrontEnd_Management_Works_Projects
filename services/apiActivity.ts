import apiClient from "@/lib/apiClient";

export interface ActivityLog {
  id: number;
  userName: string;
  userAvatar: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "OTHER";
  entityType: string;
  entityId: number;
  description: string;
  timestamp: string;
  timeAgo: string;
}

export const getActivities = async (
  scope: string, // "COMPANY", "PROJECT", "USER"
  id: number,
  page: number = 0,
  size: number = 20
): Promise<ActivityLog[]> => {
  // 1️⃣ LOG ĐẦU VÀO
  console.group("🚀 [API Debug] getActivities Called");
  console.log("   ▶ Params:", { scope, id, page, size });
  console.log("   ▶ ID Type:", typeof id); // Kiểm tra xem id có phải là number không hay là string/NaN

  // Kiểm tra nhanh đầu vào trước khi gọi
  if (!id || isNaN(id)) {
    console.error("   ❌ Error: ID is invalid (NaN or Null). Aborting request.");
    console.groupEnd();
    return [];
  }

  try {
    // 2️⃣ LOG URL SẮP GỌI
    // Lưu ý: Đảm bảo scope đúng chuẩn (Ví dụ backend cần "COMPANY" chứ không phải "Company")
    // Tôi sẽ thử uppercase scope lên để an toàn nếu backend dùng Enum
    const safeScope = scope.toUpperCase(); 
    const url = `/activities/${safeScope}/${id}`;
    
    console.log("   ▶ Request URL:", url);

    const res = await apiClient.get(url, {
      params: { page, size }
    });
    
    // 3️⃣ LOG KẾT QUẢ THÀNH CÔNG
    console.log("   ✅ API Response Status:", res.status);
    console.log("   ✅ API Data:", res.data);
    
    if (!res.data.success) {
      throw new Error(res.data.message);
    }
    
    console.groupEnd();
    return res.data.data;

  } catch (error: any) {
    // 4️⃣ LOG LỖI CHI TIẾT (QUAN TRỌNG NHẤT)
    console.error("   ❌ API Failed!");
    
    if (error.response) {
      // Server trả về response lỗi (500, 400, 403...)
      console.error("   🔻 Status Code:", error.response.status);
      console.error("   🔻 Server Message:", error.response.data); // Xem server báo lỗi gì cụ thể
    } else if (error.request) {
      // Không nhận được phản hồi
      console.error("   🔻 No response received from server.");
    } else {
      // Lỗi khi setup request
      console.error("   🔻 Request Setup Error:", error.message);
    }
    
    console.groupEnd();
    return []; // Trả về mảng rỗng để không crash UI
  }
};