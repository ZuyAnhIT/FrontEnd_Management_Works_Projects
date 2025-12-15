"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// CONFIGURATION & CONSTANTS
// =============================================================================

// Base URL cho AI service (có thể override bằng env)
const AI_BASE = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8001/api";

// =============================================================================
// INTERFACES
// =============================================================================

export interface ChatRequest {
  message: string;
  thread_id: string;
}

export interface ChatResponse {
  success?: boolean;
  response?: string; // Nội dung trả lời từ AI
  detail?: string;   // Thường dùng cho lỗi từ FastAPI/Python
  message?: string;  // Thường dùng cho lỗi từ Java/Node
}

// =============================================================================
// ERROR HANDLING HELPER
// =============================================================================

/**
 * Chuẩn hóa lỗi từ AI Service.
 * Ưu tiên lấy 'detail' hoặc 'message' từ response của Backend.
 */
const handleServiceError = (error: any): never => {
  const responseData = error?.response?.data;
  
  // Lấy message lỗi cụ thể từ server (hỗ trợ cả format Python 'detail' và chuẩn 'message')
  const serverMessage = responseData?.detail || responseData?.message;

  if (serverMessage && typeof serverMessage === "string") {
    throw new Error(serverMessage);
  }

  // Nếu không có message từ server, ném lỗi gốc hoặc lỗi mặc định tiếng Anh
  throw new Error(error.message || "AI Service is currently unavailable.");
};

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Gửi tin nhắn chat dạng Text (JSON)
 * POST /api/chat
 */
export const sendChatMessage = async (payload: ChatRequest): Promise<ChatResponse> => {
  try {
    // Axios tự động set Content-Type: application/json cho object
    const res = await apiClient.post(`${AI_BASE}/chat`, payload);
    return res.data as ChatResponse;
  } catch (error) {
    return handleServiceError(error);
  }
};

/**
 * Gửi file kèm tin nhắn (Upload File)
 * POST /api/chat/upload
 */
export const uploadChatFile = async (
  payload: ChatRequest,
  file: File
): Promise<ChatResponse> => {
  // Tạo FormData để gửi file
  const formData = new FormData();
  formData.append("file", file);
  formData.append("message", payload.message);
  formData.append("thread_id", payload.thread_id);

  try {
    // Không cần set thủ công Content-Type, trình duyệt và Axios sẽ tự xử lý boundary
    const res = await apiClient.post(`${AI_BASE}/chat/upload`, formData);
    return res.data as ChatResponse;
  } catch (error) {
    return handleServiceError(error);
  }
};