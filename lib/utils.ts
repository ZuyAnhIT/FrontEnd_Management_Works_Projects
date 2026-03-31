import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Hỗ trợ gộp các class Tailwind CSS có điều kiện.
 * Kết hợp 'clsx' để xử lý logic và 'tailwind-merge' để tối ưu hóa, tránh xung đột class.
 * * @param inputs - Danh sách các giá trị class (string, object, array, boolean)
 * @returns Chuỗi class đã được gộp và xử lý xung đột
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Chuyển đổi đường dẫn tương đối thành URL đầy đủ để hiển thị hình ảnh.
 * Xử lý linh hoạt các loại đường dẫn: local preview (blob), URL ngoại vi (http), và path từ backend.
 * * @param path - Đường dẫn ảnh tương đối hoặc tuyệt đối
 * @returns URL đầy đủ hoặc null nếu đầu vào không hợp lệ
 */
export function getImageUrl(path: string | null | undefined): string | null {
  // Kiểm tra tính hợp lệ của tham số đầu vào
  if (!path) return null;

  // Trường hợp 1: Nếu là đường dẫn cục bộ (blob) hoặc link trực tiếp từ bên ngoài
  if (path.startsWith("blob:") || path.startsWith("http")) {
    return path;
  }

  // Trường hợp 2: Xử lý đường dẫn từ Backend hệ thống
  // Lấy địa chỉ Backend từ biến môi trường hoặc fallback về localhost
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

  // Thông thường Spring Boot phục vụ file tĩnh tại root (ví dụ: /uploads), không phải qua /api.
  // Do đó, nếu URL kết thúc bằng "/api", chúng ta cần loại bỏ hậu tố này để lấy domain gốc.
  if (baseUrl.endsWith("/api")) {
    baseUrl = baseUrl.replace(/\/api$/, "");
  }

  // Chuẩn hóa đường dẫn để tránh lỗi trùng lặp dấu gạch chéo (//)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Trả về URL hoàn chỉnh dẫn đến tài nguyên trên server
  return `${baseUrl}/${cleanPath}`;
}