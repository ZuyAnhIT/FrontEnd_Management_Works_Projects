"use client";

import apiClient from "@/lib/apiClient";

// Base URL cho AI service (có thể override bằng env)
const AI_BASE = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8001/api";

export interface ChatRequest {
  message: string;
  thread_id: string;
}

export interface ChatResponse {
  success?: boolean;
  response?: string;
  detail?: string;
  message?: string;
}

const normalizeError = (error: any) => {
  const detail = error?.response?.data?.detail || error?.response?.data?.message;
  if (detail && typeof detail === "string") {
    throw new Error(detail);
  }
  throw error;
};

// Gửi chat text (JSON)
export const sendChatMessage = async (payload: ChatRequest): Promise<ChatResponse> => {
  try {
    const res = await apiClient.post(`${AI_BASE}/chat`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data as ChatResponse;
  } catch (error) {
    return normalizeError(error);
  }
};

// Upload file + text (FormData, không set Content-Type thủ công)
export const uploadChatFile = async (
  payload: ChatRequest,
  file: File
): Promise<ChatResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("message", payload.message);
  formData.append("thread_id", payload.thread_id);

  try {
    const res = await apiClient.post(`${AI_BASE}/chat/upload`, formData, {
      headers: {},
    });
    return res.data as ChatResponse;
  } catch (error) {
    return normalizeError(error);
  }
};
