"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================
import React, { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useParams, usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown"; // THƯ VIỆN RENDER MARKDOWN
import { MessageSquare, X, Send, History, Minimize2, Paperclip } from "lucide-react";

// Internal
import { Button } from "@/components/ui/Buttons";
import { sendChatMessage, uploadChatFile, ChatContext } from "@/services/apiChat";
import { useAuth } from "@/context/AuthContext"; // DÙNG ĐỂ LẤY CONTEXT

// =============================================================================
// 2. INTERFACES
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
// 3. HELPERS
// =============================================================================
const normalizeBotResponse = (data: any): string => {
  if (!data) return "No response received";
  const rawContent = data.response || data.detail || data.message;
  
  if (typeof rawContent === "string") return rawContent;
  if (typeof rawContent === "object") {
    return rawContent.text && typeof rawContent.text === "string" ? rawContent.text : JSON.stringify(rawContent);
  }
  return String(rawContent);
};

const useDraggableWindow = () => {
  const [isDragging, setIsDragging] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; initialLeft: number; initialTop: number; } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current || !bubbleRef.current) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      bubbleRef.current.style.left = `${dragRef.current.initialLeft + deltaX}px`;
      bubbleRef.current.style.top = `${dragRef.current.initialTop + deltaY}px`;
      bubbleRef.current.style.right = "auto";
      bubbleRef.current.style.bottom = "auto";
    };

    const handleMouseUp = () => {
      if (!isDragging || !bubbleRef.current) return;
      setIsDragging(false);
      const rect = bubbleRef.current.getBoundingClientRect();
      if (rect.left < (window.innerWidth - rect.right)) {
        bubbleRef.current.style.left = "20px"; bubbleRef.current.style.right = "auto";
      } else {
        bubbleRef.current.style.left = "auto"; bubbleRef.current.style.right = "20px";
      }
      let newTop = rect.top;
      if (newTop < 20) newTop = 20;
      if (newTop > window.innerHeight - rect.height - 20) newTop = window.innerHeight - rect.height - 20;
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
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialLeft: rect.left, initialTop: rect.top };
  };

  return { bubbleRef, isDragging, handleMouseDown };
};

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

export function Chatbot() {
  const params = useParams();
  const pathname = usePathname();
  const { bubbleRef, isDragging, handleMouseDown } = useDraggableWindow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // TÍCH HỢP AUTH CONTEXT ĐỂ LẤY COMPANY ID CHUẨN XÁC
  const { activeCompany } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [threadId, setThreadId] = useState<string>("");

  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "bot", text: "Hello! I am your AI Assistant. How can I help you today?", timestamp: new Date() }
  ]);

  const [sessions] = useState<ChatSession[]>([{ id: "h1", title: "Current Session", date: "Today" }]);

  // Khởi tạo Thread ID
  useEffect(() => {
    const storedThread = localStorage.getItem("chat_session_id");
    if (storedThread) {
      setThreadId(storedThread);
    } else {
      const newId = uuidv4();
      localStorage.setItem("chat_session_id", newId);
      setThreadId(newId);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    if (loading) return;

    const currentInput = input;
    const currentFile = selectedFile;

    // Optimistic Update
    const optimisticText = currentFile ? `**Attached File:** ${currentFile.name}\n\n${currentInput}` : currentInput;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: optimisticText, timestamp: new Date() };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    clearFile();
    setLoading(true);

    try {
      // THIẾT LẬP NGỮ CẢNH (CONTEXT) ĐỂ GỬI LÊN BACKEND
      const contextData: ChatContext = {
        company_id: activeCompany?.companyId || null,
        workspace_id: params?.workspaceId ? Number(params.workspaceId) : null,
        project_id: params?.projectId ? Number(params.projectId) : null,
      };

      const payload = {
        message: currentInput,
        thread_id: threadId || "default_session",
        context: contextData,
      };

      const data = currentFile
        ? await uploadChatFile(payload, currentFile)
        : await sendChatMessage(payload);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: normalizeBotResponse(data),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMsg]);

    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 2).toString(), role: "system", text: `**System Error:** ${err.message}`, timestamp: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={bubbleRef} className={`fixed z-50 flex flex-col items-end transition-all duration-300 ease-out ${isDragging ? "cursor-grabbing" : ""}`} style={{ bottom: "20px", right: "20px" }}>
      
      {/* Cửa sổ chat */}
      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 mb-4 transition-all duration-300 origin-bottom-right flex ${isOpen ? "w-[420px] h-[600px] opacity-100 scale-100" : "w-0 h-0 opacity-0 scale-90 pointer-events-none"}`}>
        <div className="flex-1 flex flex-col w-full bg-white relative">
          
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center cursor-move select-none" onMouseDown={handleMouseDown}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-semibold text-sm">WorkNet Intelligence</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowHistory(!showHistory)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><History className="w-4 h-4" /></button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><Minimize2 className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] shadow-sm ${
                    msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : 
                    msg.role === "system" ? "bg-[#FFEBE6] text-[#BF2600] border border-[#FFBDAD] rounded-bl-none" : 
                    "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                }`}>
                  
                  {/* BỌC THẺ DIV Ở ĐÂY ĐỂ TRÁNH LỖI CLASSNAME CỦA REACT-MARKDOWN */}
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:m-0">
                    <ReactMarkdown 
                      components={{
                          p: ({node, ...props}) => <p className="m-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 m-0" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 m-0" {...props} />,
                          li: ({node, ...props}) => <li className="mt-1" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 shadow-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Khu vực nhập liệu */}
          <div className="p-3 bg-white border-t border-slate-200">
            {selectedFile && (
              <div className="flex items-center justify-between text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-2 rounded-lg mb-2">
                <span className="truncate font-medium">📎 {selectedFile.name}</span>
                <button onClick={clearFile} className="hover:bg-indigo-200 p-1 rounded-full transition-colors"><X className="w-3 h-3" /></button>
              </div>
            )}
            
            <div className="flex items-end gap-2 bg-[#F4F5F7] p-1.5 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
              
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-colors shrink-0">
                <Paperclip className="w-4 h-4" />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading) handleSend();
                  }
                }}
                placeholder={selectedFile ? "Add a message about this file..." : "Ask me to create tasks, assign work..."}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-700 resize-none max-h-32 py-2.5 custom-scrollbar"
                rows={input.split("\n").length > 1 ? Math.min(input.split("\n").length, 4) : 1}
                disabled={loading}
              />

              <Button onClick={handleSend} disabled={loading || (!input.trim() && !selectedFile)} className="shrink-0 w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 p-0 flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
          
          {/* Sidebar Lịch sử */}
          <div className={`absolute inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 z-10 ${showHistory ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <span className="font-semibold text-white">History</span>
              <button onClick={() => setShowHistory(false)} className="hover:bg-slate-700 p-1.5 rounded-full transition-colors"><X className="w-4 h-4 text-white" /></button>
            </div>
            <div className="p-2 space-y-1">
              {sessions.map((s) => (
                <button key={s.id} className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors text-sm group">
                  <div className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">{s.title}</div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">{s.date}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onMouseDown={handleMouseDown} onClick={() => !isDragging && setIsOpen(true)} className={`w-14 h-14 bg-[#0052CC] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 cursor-move group relative ${isOpen ? "hidden" : "flex"}`}>
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}