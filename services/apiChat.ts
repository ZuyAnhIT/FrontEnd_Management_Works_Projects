"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface ChatContext {
  company_id: number | null;
  workspace_id: number | null;
  project_id: number | null;
}

/**
 * Cấu trúc yêu cầu gửi tin nhắn chat chuẩn mới
 */
export interface ChatRequest {
  message: string;
  thread_id: string;
  context: ChatContext; // Bắt buộc truyền ngữ cảnh để AI định tuyến
}

/**
 * Cấu trúc phản hồi từ AI Supervisor
 */
export interface ChatResponse {
  success?: boolean;
  response?: string; // Chuỗi Markdown trả về từ AI
  thread_id?: string;
  tool_calls?: any;
  detail?: string;   // Chi tiết lỗi từ FastAPI
  message?: string;  // Thông báo lỗi chung
}

// =============================================================================
// CONFIGURATION & CONSTANTS
// =============================================================================

// AI Base kết nối thẳng vào FastAPI
const AI_BASE = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8005/api";

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

const handleServiceError = (error: any): never => {
  const responseData = error?.response?.data;
  const serverMessage = responseData?.detail || responseData?.message;

  if (serverMessage && typeof serverMessage === "string") {
    throw new Error(serverMessage);
  }
  throw new Error(error.message || "AI Supervisor is unavailable");
};

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Gửi tin nhắn văn bản đến hệ thống AI (Text-based)
 */
export const sendChatMessage = async (payload: ChatRequest): Promise<ChatResponse> => {
  try {
    const url = `${AI_BASE}/chat`;
    // Axios tự động set Content-Type: application/json
    const res = await apiClient.post(url, payload);
    return res.data as ChatResponse;
  } catch (error) {
    return handleServiceError(error);
  }
};

/**
 * Gửi tệp đính kèm (Excel, CSV...) đến hệ thống AI
 */
export const uploadChatFile = async (payload: ChatRequest, file: File): Promise<ChatResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("message", payload.message);
  formData.append("thread_id", payload.thread_id);
  
  // ÉP KIỂU STRINGIFY CONTEXT THEO ĐÚNG YÊU CẦU CỦA BACKEND
  formData.append("context", JSON.stringify(payload.context));

  try {
    const url = `${AI_BASE}/chat/upload`;
    // apiClient sẽ tự động gắn header multipart/form-data khi nhận FormData
    const res = await apiClient.post(url, formData);
    return res.data as ChatResponse;
  } catch (error) {
    return handleServiceError(error);
  }
};