"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Cấu trúc yêu cầu gửi tin nhắn chat
 */
export interface ChatRequest {
  message: string;
  thread_id: string;
}

/**
 * Cấu trúc phản hồi từ AI Service
 */
export interface ChatResponse {
  success?: boolean;
  response?: string; // Nội dung phản hồi từ AI
  detail?: string;   // Chi tiết lỗi từ backend Python/FastAPI
  message?: string;  // Thông báo lỗi từ backend Java/NodeJS
}

// =============================================================================
// CONFIGURATION & CONSTANTS
// =============================================================================

// Địa chỉ gốc của AI Service (ưu tiên từ biến môi trường)
const AI_BASE = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8001/api";

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/**
 * Xử lý và chuẩn hóa thông báo lỗi từ AI Service
 * Ưu tiên sử dụng thông tin lỗi trả về trực tiếp từ phía Backend
 */
const handleServiceError = (error: any): never => {
  const responseData = error?.response?.data;
  
  // Trích xuất thông báo lỗi từ server (hỗ trợ cả định dạng detail và message)
  const serverMessage = responseData?.detail || responseData?.message;

  if (serverMessage && typeof serverMessage === "string") {
    throw new Error(serverMessage);
  }

  // Trả về lỗi mặc định bằng tiếng Anh nếu không có phản hồi từ server
  throw new Error(error.message || "AI service is unavailable");
};

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Gửi tin nhắn văn bản đến hệ thống AI
 */
export const sendChatMessage = async (payload: ChatRequest): Promise<ChatResponse> => {
  try {
    const url = `${AI_BASE}/chat`;
    const res = await apiClient.post(url, payload);
    
    return res.data as ChatResponse;
  } catch (error) {
    return handleServiceError(error);
  }
};

/**
 * Gửi tệp đính kèm kèm theo tin nhắn đến hệ thống AI (Upload File)
 */
export const uploadChatFile = async (
  payload: ChatRequest,
  file: File
): Promise<ChatResponse> => {
  // Khởi tạo FormData để truyền tải dữ liệu tệp tin và tin nhắn
  const formData = new FormData();
  formData.append("file", file);
  formData.append("message", payload.message);
  formData.append("thread_id", payload.thread_id);

  try {
    const url = `${AI_BASE}/chat/upload`;
    const res = await apiClient.post(url, formData);
    
    return res.data as ChatResponse;
  } catch (error) {
    return handleServiceError(error);
  }
};