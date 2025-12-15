// File: lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // 1. Nếu là ảnh preview từ máy (blob:...) hoặc ảnh online (http...) thì giữ nguyên
  if (path.startsWith("blob:") || path.startsWith("http")) {
    return path;
  }

  // 2. Lấy Domain Backend từ biến môi trường (hoặc hardcode tạm thời)
  // Khuyên dùng: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082"
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082"; 

  // 3. Xử lý dấu gạch chéo để tránh bị 2 dấu // (ví dụ: base/ + /uploads)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  return `${baseUrl}/${cleanPath}`;
}