"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  MessageSquare,
  X,
  Send,
  History,
  Minimize2,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { sendChatMessage, uploadChatFile } from "@/services/apiChat";

// =============================================================================
// 1. INTERFACES & TYPES
// =============================================================================

interface Message {
  id: string;
  role: "user" | "bot" | "system";
  text: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
}

// =============================================================================
// 2. HELPER FUNCTIONS
// =============================================================================

/**
 * Chuẩn hóa phản hồi từ API (xử lý JSON, string, object, null)
 */
const normalizeBotResponse = (data: any): string => {
  if (!data) return "No response received.";

  // Ưu tiên các trường chuẩn
  const rawContent = data.response || data.detail || data.message;

  if (typeof rawContent === "string") return rawContent;

  if (typeof rawContent === "object") {
    if (rawContent.text && typeof rawContent.text === "string")
      return rawContent.text;
    try {
      return JSON.stringify(rawContent);
    } catch {
      return "Unsupported response format.";
    }
  }

  return String(rawContent);
};

// =============================================================================
// 3. CUSTOM HOOK: DRAGGABLE WINDOW
// =============================================================================

const useDraggableWindow = () => {
  const [isDragging, setIsDragging] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
  } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current || !bubbleRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      const newLeft = dragRef.current.initialLeft + deltaX;
      const newTop = dragRef.current.initialTop + deltaY;

      // Di chuyển tự do
      bubbleRef.current.style.left = `${newLeft}px`;
      bubbleRef.current.style.top = `${newTop}px`;
      bubbleRef.current.style.right = "auto";
      bubbleRef.current.style.bottom = "auto";
    };

    const handleMouseUp = () => {
      if (!isDragging || !bubbleRef.current) return;
      setIsDragging(false);

      // Snap to nearest edge logic
      const rect = bubbleRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const distLeft = rect.left;
      const distRight = windowWidth - rect.right;

      // Snap trái/phải
      if (distLeft < distRight) {
        bubbleRef.current.style.left = "20px";
        bubbleRef.current.style.right = "auto";
      } else {
        bubbleRef.current.style.left = "auto";
        bubbleRef.current.style.right = "20px";
      }

      // Giữ trong màn hình (Top/Bottom)
      let newTop = rect.top;
      if (newTop < 20) newTop = 20;
      if (newTop > windowHeight - rect.height - 20)
        newTop = windowHeight - rect.height - 20;

      bubbleRef.current.style.top = `${newTop}px`;
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!bubbleRef.current) return;
    const rect = bubbleRef.current.getBoundingClientRect();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
    };
  };

  return { bubbleRef, isDragging, handleMouseDown };
};

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

export function Chatbot() {
  // --- UI State ---
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Data State ---
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [threadId, setThreadId] = useState<string>("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Chào bạn! Tôi có thể giúp gì hôm nay?",
      timestamp: new Date(),
    },
  ]);

  // Fake session history
  const [sessions] = useState<ChatSession[]>([
    { id: "h1", title: "Phiên mặc định", date: "Hôm nay" },
  ]);

  // --- Refs & Hooks ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { bubbleRef, isDragging, handleMouseDown } = useDraggableWindow();

  // --- Initialization ---
  useEffect(() => {
    const stored = localStorage.getItem("chat_session_id");
    if (stored) {
      setThreadId(stored);
    } else {
      const newId = uuidv4();
      localStorage.setItem("chat_session_id", newId);
      setThreadId(newId);
    }
  }, []);

  // --- Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    if (loading) return;

    const now = new Date();
    const currentInput = input;
    const currentFile = selectedFile;

    // 1. Optimistic Update (Hiển thị tin nhắn user ngay lập tức)
    const optimisticText = currentFile
      ? `File: ${currentFile.name}${currentInput ? `\n${currentInput}` : ""}`
      : currentInput;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: optimisticText,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);

    // 2. Reset Input
    setInput("");
    clearFile();
    setLoading(true);

    // 3. Call API
    try {
      const safeThreadId = threadId || "default_session";
      if (!threadId) setThreadId(safeThreadId); // Sync state if missing

      const payload = { message: currentInput, thread_id: safeThreadId };

      const data = currentFile
        ? await uploadChatFile(payload, currentFile)
        : await sendChatMessage(payload);

      // 4. Handle Response
      const botText = normalizeBotResponse(data);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: botText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat Error:", err);
      const errText =
        err instanceof Error
          ? err.message
          : "Connection error. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "system",
          text: `Error: ${errText}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---
  const getMessageBubbleClass = (role: string) => {
    switch (role) {
      case "user":
        return "bg-blue-600 text-white rounded-br-none";
      case "system":
        return "bg-red-50 text-red-600 border border-red-200 rounded-bl-none";
      default: // bot
        return "bg-white text-slate-800 border border-slate-200 rounded-bl-none";
    }
  };

  // ===========================================================================
  // RENDER
  // ===========================================================================
  return (
    <div
      ref={bubbleRef}
      className={`fixed z-50 flex flex-col items-end transition-all duration-300 ease-out ${
        isDragging ? "cursor-grabbing" : ""
      }`}
      style={{ bottom: "20px", right: "20px" }}
    >
      {/* --- CHAT WINDOW --- */}
      <div
        className={`
          bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 mb-4
          transition-all duration-300 origin-bottom-right flex
          ${
            isOpen
              ? "w-[380px] h-[520px] opacity-100 scale-100"
              : "w-0 h-0 opacity-0 scale-90 pointer-events-none"
          }
        `}
      >
        <div className="flex-1 flex flex-col w-full bg-white relative">
          {/* HEADER */}
          <div
            className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-semibold text-sm">AI Support</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                title="History"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGE LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${getMessageBubbleClass(
                    msg.role
                  )}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-slate-200 rounded-full h-2 w-2 mr-1"></div>
                <div className="bg-slate-200 rounded-full h-2 w-2 mr-1"></div>
                <div className="bg-slate-200 rounded-full h-2 w-2"></div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-3 bg-white border-t border-slate-100 space-y-2">
            {/* Selected File Preview */}
            {selectedFile && (
              <div className="flex items-center justify-between text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded">
                <span className="truncate max-w-[200px]">
                  File: {selectedFile.name}
                </span>
                <button onClick={clearFile} className="hover:text-red-500 p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Input Controls */}
            <div className="flex gap-2 items-center">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                placeholder={
                  selectedFile
                    ? "Add note for the file..."
                    : "Type your request..."
                }
                className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                disabled={loading}
              />

              <Button
                onClick={handleSend}
                size="icon"
                className="rounded-full w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
                disabled={loading || (!input.trim() && !selectedFile)}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* HISTORY SIDEBAR */}
          <div
            className={`absolute inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 z-10 ${
              showHistory ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <span className="font-semibold text-white">History</span>
              <button
                onClick={() => setShowHistory(false)}
                className="hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  className="w-full text-left p-3 rounded hover:bg-slate-800 transition-colors text-sm"
                >
                  <div className="text-white font-medium truncate">
                    {s.title}
                  </div>
                  <div className="text-xs text-slate-500">{s.date}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING TRIGGER BUTTON --- */}
      <button
        onMouseDown={handleMouseDown}
        onClick={() => !isDragging && setIsOpen(true)}
        className={`
          w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full shadow-xl shadow-blue-500/30 
          flex items-center justify-center text-white 
          hover:scale-110 transition-transform duration-200 cursor-move group relative
          ${isOpen ? "hidden" : "flex"}
        `}
      >
        <MessageSquare className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <div className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Drag me!
        </div>
      </button>
    </div>
  );
}
