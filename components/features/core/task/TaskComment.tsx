"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useEffect, useRef } from "react";
import {
  Bold, Italic, List, ListOrdered, Image as ImageIcon,
  Loader2, Paperclip, FileText, Download,
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, File,
  Activity
} from "lucide-react";

// Internal Components & Utils
import { Button } from "@/components/ui/Buttons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// Internal Services
import {
  getTaskComments,
  addTaskComment,
  getTaskAttachments,
  uploadTaskAttachment,
} from "@/services/apiTask";

// =============================================================================
// 2. INTERFACES & HELPERS
// =============================================================================

interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
  user: {
    userId: number;
    fullName: string;
    avatarUrl: string;
  };
}

interface Attachment {
  id: number;
  taskId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedById: number;
  uploadedByName: string;
  uploadedAt: string;
}

interface TaskCommentProps {
  taskId: number;
}

/**
 * Định dạng dung lượng file (B, KB, MB, GB)
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Định dạng ngày giờ hiển thị (VD: Oct 24, 2023 at 10:30 AM)
 */
const formatDateTime = (isoString: string): string => {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
  });
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần quản lý Bình luận và File đính kèm của một Công việc (Issue Activity).
 */
export default function TaskComment({ taskId }: TaskCommentProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & REFS
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // 5. STATE
  // ---------------------------------------------------------------------------
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [commentHtml, setCommentHtml] = useState("");
  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"COMMENTS" | "ATTACHMENTS">("COMMENTS");

  // ---------------------------------------------------------------------------
  // 6. EFFECTS: DATA FETCHING
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!taskId) return;

    const fetchActivityData = async () => {
      setIsLoadingData(true);
      try {
        const [resComments, resAttachments] = await Promise.all([
          getTaskComments(taskId),
          getTaskAttachments(taskId),
        ]);

        if (resComments.success && Array.isArray(resComments.data)) {
          setComments(resComments.data);
        }
        if (resAttachments.success && Array.isArray(resAttachments.data)) {
          setAttachments(resAttachments.data);
        }
      } catch (error) {
        console.error("Failed to load task activity:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchActivityData();
  }, [taskId]);

  // ---------------------------------------------------------------------------
  // 7. HANDLERS: RICH TEXT EDITOR
  // ---------------------------------------------------------------------------

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setCommentHtml(e.currentTarget.innerHTML);
  };

  // ---------------------------------------------------------------------------
  // 8. HANDLERS: API ACTIONS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý gửi bình luận lên server.
   */
  const handleSubmitComment = async () => {
    const strippedContent = commentHtml.replace(/<[^>]+>/g, "").trim();
    if (!strippedContent && !commentHtml.includes("<img")) return;

    setIsSending(true);
    try {
      const res = await addTaskComment(taskId, commentHtml);

      if (res.success) {
        // Reset Editor
        if (editorRef.current) editorRef.current.innerHTML = ""; 
        setCommentHtml("");
        setIsEditorActive(false);

        // Fetch lại dữ liệu mới nhất
        const resNew = await getTaskComments(taskId);
        if (resNew.success) setComments(resNew.data);

        showToast("Comment posted successfully", "success");
      } else {
        const message = res.message || "Failed to post comment.";
        showToast(message, "error");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to post comment.";
      showToast(message, "error");
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Xử lý tải lên file đính kèm.
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadTaskAttachment(taskId, file);
      
      if (res.success) {
        showToast("Attachment uploaded successfully", "success");
        
        const resAtt = await getTaskAttachments(taskId);
        if (resAtt.success) setAttachments(resAtt.data);
        
        setActiveTab("ATTACHMENTS");
      } else {
        const message = res.message || "Failed to upload attachment.";
        showToast(message, "error");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to upload attachment.";
      showToast(message, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ---------------------------------------------------------------------------
  // 9. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <div className="pt-8 mt-8 border-t border-slate-200">
      
      {/* ==================== HEADER & TABS ==================== */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[13px] font-bold text-[#172B4D] flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" /> Activity
        </h3>
        
        {/* Toggle Tabs */}
        <div className="flex p-0.5 bg-[#091E420A] rounded-lg">
          <button
            onClick={() => setActiveTab("COMMENTS")}
            className={cn(
              "px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-md transition-all",
              activeTab === "COMMENTS" 
                ? "bg-white text-[#0052CC] shadow-sm" 
                : "text-[#42526E] hover:text-[#172B4D] hover:bg-[#091E420A]"
            )}
          >
            Comments <span className="opacity-70 ml-1">({comments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("ATTACHMENTS")}
            className={cn(
              "px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-md transition-all",
              activeTab === "ATTACHMENTS" 
                ? "bg-white text-[#0052CC] shadow-sm" 
                : "text-[#42526E] hover:text-[#172B4D] hover:bg-[#091E420A]"
            )}
          >
            Attachments <span className="opacity-70 ml-1">({attachments.length})</span>
          </button>
        </div>
      </div>

      {/* ==================== COMMENT INPUT AREA ==================== */}
      {activeTab === "COMMENTS" && (
        <div className="flex gap-4 mb-10">
          <Avatar className="w-8 h-8 mt-0.5 shrink-0 border border-white shadow-sm">
            <AvatarFallback className="bg-[#0052CC] text-white text-[10px] font-bold">ME</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {isEditorActive ? (
              /* --- TRẠNG THÁI: ĐANG SOẠN THẢO (ACTIVE EDITOR) --- */
              <div className="border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-[#2684FF] transition-all animate-in fade-in zoom-in-95 duration-200">
                
                {/* Thanh công cụ định dạng (Toolbar) */}
                <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-slate-100 bg-[#F4F5F7]">
                  
                  <Button variant="ghost" size="icon" onClick={() => executeCommand("formatBlock", "H3")} className="h-7 w-7 text-slate-500 hover:bg-[#091E4214] hover:text-slate-800" title="Heading 1">
                    <Heading1 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => executeCommand("formatBlock", "P")} className="h-7 w-7 text-slate-500 hover:bg-[#091E4214] hover:text-slate-800" title="Normal Text">
                    <Heading2 className="w-3.5 h-3.5" />
                  </Button>
                  <div className="w-px h-4 bg-slate-300 mx-1" />
                  <Button variant="ghost" size="icon" onClick={() => executeCommand("bold")} className="h-7 w-7 text-slate-500 hover:bg-[#091E4214] hover:text-slate-800" title="Bold">
                    <Bold className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => executeCommand("italic")} className="h-7 w-7 text-slate-500 hover:bg-[#091E4214] hover:text-slate-800" title="Italic">
                    <Italic className="w-3.5 h-3.5" />
                  </Button>
                  <div className="w-px h-4 bg-slate-300 mx-1" />
                  <Button variant="ghost" size="icon" onClick={() => executeCommand("justifyLeft")} className="h-7 w-7 text-slate-500 hover:bg-[#091E4214] hover:text-slate-800" title="Align Left">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => executeCommand("justifyCenter")} className="h-7 w-7 text-slate-500 hover:bg-[#091E4214] hover:text-slate-800" title="Align Center">
                    <AlignCenter className="w-3.5 h-3.5" />
                  </Button>
                  <div className="w-px h-4 bg-slate-300 mx-1" />
                  <Button variant="ghost" size="icon" onClick={() => executeCommand("insertUnorderedList")} className="h-7 w-7 text-slate-500 hover:bg-[#091E4214] hover:text-slate-800" title="Bullet List">
                    <List className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => executeCommand("insertOrderedList")} className="h-7 w-7 text-slate-500 hover:bg-[#091E4214] hover:text-slate-800" title="Numbered List">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </Button>
                  
                  {/* Upload Phụ */}
                  <div className="ml-auto flex items-center gap-1">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isUploading || isSending}
                      className="h-7 w-7 text-[#0052CC] bg-[#E3F2FD] hover:bg-blue-100 transition-colors" 
                      title="Attach File"
                    >
                      {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Vùng nhập liệu HTML (Editable Div) */}
                <div
                  ref={editorRef}
                  contentEditable
                  data-placeholder="Add a comment..."
                  className={cn(
                    "w-full min-h-[100px] max-h-[400px] overflow-y-auto p-4 text-[14px] text-[#172B4D] leading-relaxed outline-none bg-white cursor-text",
                    "empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none prose prose-sm max-w-none"
                  )}
                  onInput={handleEditorInput}
                  style={{ whiteSpace: "pre-wrap" }}
                />

                {/* Footer Editor */}
                <div className="flex justify-between items-center px-3 py-2 bg-white border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Supports rich text formatting
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100"
                      onClick={() => {
                        setIsEditorActive(false);
                        setCommentHtml("");
                        if (editorRef.current) editorRef.current.innerHTML = "";
                      }}
                      disabled={isSending}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-5 bg-[#0052CC] hover:bg-[#0047B3] text-white font-bold text-[11px] uppercase tracking-widest shadow-sm transition-all active:scale-95"
                      disabled={!commentHtml.trim() || isSending || isUploading}
                      onClick={handleSubmitComment}
                    >
                      {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* --- TRẠNG THÁI: CHỜ (IDLE) --- */
              <div
                className="border border-slate-300 rounded-xl bg-white p-3 flex items-center justify-between cursor-text hover:bg-slate-50 transition-colors group shadow-sm"
                onClick={() => {
                  setIsEditorActive(true);
                  setTimeout(() => editorRef.current?.focus(), 0);
                }}
              >
                <span className="text-[13px] text-slate-500 group-hover:text-slate-600 pl-1">
                  Add a comment...
                </span>
                <div className="p-1.5 rounded-md bg-slate-100 text-slate-400 group-hover:text-slate-600 transition-colors">
                   <Paperclip className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== LIST DISPLAY AREA ==================== */}
      <div className="min-h-[200px]">
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-60">
            <Loader2 className="w-6 h-6 animate-spin text-[#0052CC]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading history...</span>
          </div>
        ) : (
          <>
            {/* -------------------- TAB: COMMENTS LIST -------------------- */}
            {activeTab === "COMMENTS" && (
              <div className="space-y-8 pl-1">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.commentId} className="flex gap-4 group items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Avatar className="w-8 h-8 mt-1 shrink-0 border border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarImage src={comment.user?.avatarUrl} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {comment.user?.fullName ? comment.user.fullName.substring(0, 2).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-[13px] text-[#172B4D] hover:underline cursor-pointer transition-colors hover:text-[#0052CC]">
                            {comment.user?.fullName || "Unknown User"}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-default" title={comment.createdAt}>
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>

                        {/* Render HTML Content an toàn bằng Tailwind Typography (Prose) */}
                        <div
                          className="text-[14px] text-[#172B4D] leading-relaxed bg-white border border-slate-200 shadow-sm p-4 rounded-xl prose prose-sm max-w-none mt-1"
                          dangerouslySetInnerHTML={{ __html: comment.content }}
                        />

                        <div className="flex gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                          <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#0052CC] transition-colors">Edit</button>
                          <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50/50 rounded-xl p-8 text-center border border-slate-200 border-dashed">
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                      No comments yet
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* -------------------- TAB: ATTACHMENTS LIST -------------------- */}
            {activeTab === "ATTACHMENTS" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Attached Files
                  </span>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 text-[11px] font-bold uppercase tracking-widest text-[#0052CC] border-[#2684FF]/30 hover:bg-[#E3F2FD] gap-2 transition-all active:scale-95"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Paperclip className="w-3 h-3" />}
                    Upload File
                  </Button>
                </div>

                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attachments.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-[#2684FF] hover:shadow-md transition-all group">
                        <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center shrink-0 text-[#0052CC] shadow-sm">
                          {file.fileType.includes("image") ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#172B4D] truncate group-hover:text-[#0052CC] transition-colors" title={file.fileName}>
                            {file.fileName}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            <span>{formatFileSize(file.fileSize)}</span>
                            <span className="text-slate-300">•</span>
                            <span>{formatDateTime(file.uploadedAt)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-50 hover:bg-[#0052CC] rounded-lg text-slate-500 hover:text-white transition-all active:scale-95"
                            title="Download File"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50/50 rounded-xl p-10 text-center border border-slate-200 border-dashed flex flex-col items-center gap-3">
                    <File className="w-10 h-10 text-slate-300" />
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                      No files attached
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}