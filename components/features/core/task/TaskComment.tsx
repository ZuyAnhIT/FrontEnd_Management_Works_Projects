"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bold, Italic, List, ListOrdered, Image as ImageIcon,
  AtSign, Smile, Link as LinkIcon, Loader2,
  Paperclip, FileText, Download, Trash2,
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getTaskComments,
  addTaskComment,
  getTaskAttachments,
  uploadTaskAttachment
} from "@/services/apiTask";
import { useToast } from "@/components/ui/ToastProvider";

// --- TYPES ---
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

// Khớp với Swagger Response
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

export default function TaskComment({ taskId }: TaskCommentProps) {
  const { showToast } = useToast();

  // --- STATE DATA ---
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // --- STATE UI ---
  const [commentHtml, setCommentHtml] = useState(""); // Lưu HTML thay vì plain text
  const [loadingData, setLoadingData] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCommentInputFocused, setIsCommentInputFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<"COMMENTS" | "ATTACHMENTS">("COMMENTS");

  // --- REFS ---
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    if (taskId) {
      fetchData(taskId);
    }
  }, [taskId]);

  const fetchData = async (id: number) => {
    setLoadingData(true);
    try {
      // Gọi song song cả comment và attachment
      const [resComments, resAttachments] = await Promise.all([
        getTaskComments(id),
        getTaskAttachments(id)
      ]);

      if (resComments.success && Array.isArray(resComments.data)) {
        setComments(resComments.data);
      }
      if (resAttachments.success && Array.isArray(resAttachments.data)) {
        setAttachments(resAttachments.data);
      }
    } catch (error) {
      console.error("Failed to load task data", error);
    } finally {
      setLoadingData(false);
    }
  };

  // --- RICH TEXT HANDLERS ---
  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    // Focus lại vào editor để người dùng gõ tiếp được ngay
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleEditorChange = (e: React.FormEvent<HTMLDivElement>) => {
    setCommentHtml(e.currentTarget.innerHTML);
  };

  // --- COMMENT HANDLERS ---
  const handleSendComment = async () => {
    // Kiểm tra nếu chỉ có tag rỗng
    const strippedContent = commentHtml.replace(/<[^>]+>/g, '').trim();
    if (!strippedContent && !commentHtml.includes('<img')) return;

    setSendingComment(true);
    try {
      // Gửi nguyên HTML lên server
      const res = await addTaskComment(taskId, commentHtml);
      if (res.success) {
        if (editorRef.current) editorRef.current.innerHTML = ""; // Clear visual
        setCommentHtml("");
        setIsCommentInputFocused(false);

        // Refresh comments only
        const resNew = await getTaskComments(taskId);
        if (resNew.success) setComments(resNew.data);

        showToast("Comment added", "success");
      }
    } catch (error) {
      console.error("Failed to add comment", error);
      showToast("Failed to add comment", "error");
    } finally {
      setSendingComment(false);
    }
  };

  // --- ATTACHMENT HANDLERS ---
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadTaskAttachment(taskId, file);
      if (res.success) {
        showToast("File uploaded successfully", "success");
        // Refresh attachments
        const resAtt = await getTaskAttachments(taskId);
        if (resAtt.success) setAttachments(resAtt.data);
        // Switch tab to show the file
        setActiveTab("ATTACHMENTS");
      } else {
        showToast(res.message || "Upload failed", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error uploading file", "error");
    } finally {
      setIsUploading(false);
      // Reset input để chọn lại file cũ được
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Helper để format dung lượng file
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="pt-6 border-t border-slate-200 mt-6">
      {/* 1. Header Section & Tabs */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          Activity
        </h3>
        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-md">
          <button
            onClick={() => setActiveTab("COMMENTS")}
            className={`px-3 py-1 text-[11px] rounded font-medium transition-all ${activeTab === "COMMENTS"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Comments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab("ATTACHMENTS")}
            className={`px-3 py-1 text-[11px] rounded font-medium transition-all ${activeTab === "ATTACHMENTS"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Attachments ({attachments.length})
          </button>
        </div>
      </div>

      {/* 2. INPUT AREA (Chỉ hiện khi ở tab Comments) */}
      {activeTab === "COMMENTS" && (
        <div className="flex gap-3 mb-8">
          <Avatar className="w-8 h-8 mt-1">
            <AvatarFallback className="bg-orange-500 text-white text-xs">ME</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {isCommentInputFocused ? (
              // RICH EDITOR STATE
              <div className="border border-slate-300 rounded-md bg-white shadow-sm transition-all ring-1 ring-blue-100 animate-in fade-in duration-200">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-slate-100 bg-slate-50/50 rounded-t-md">
                  {/* Font Size */}
                  <Button variant="ghost" size="icon" onClick={() => execCommand('formatBlock', 'H3')} className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded" title="Large Text"><Heading1 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => execCommand('formatBlock', 'P')} className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded" title="Normal Text"><Heading2 className="w-3.5 h-3.5" /></Button>

                  <div className="w-px h-3 bg-slate-300 mx-1"></div>

                  {/* Style */}
                  <Button variant="ghost" size="icon" onClick={() => execCommand('bold')} className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><Bold className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => execCommand('italic')} className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><Italic className="w-3.5 h-3.5" /></Button>

                  <div className="w-px h-3 bg-slate-300 mx-1"></div>

                  {/* Alignment */}
                  <Button variant="ghost" size="icon" onClick={() => execCommand('justifyLeft')} className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><AlignLeft className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => execCommand('justifyCenter')} className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><AlignCenter className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => execCommand('justifyRight')} className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><AlignRight className="w-3.5 h-3.5" /></Button>

                  <div className="w-px h-3 bg-slate-300 mx-1"></div>

                  {/* Lists & Extras */}
                  <Button variant="ghost" size="icon" onClick={() => execCommand('insertUnorderedList')} className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><List className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => execCommand('insertOrderedList')} className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><ListOrdered className="w-3.5 h-3.5" /></Button>

                  {/* Upload Button */}
                  <div className="ml-auto flex items-center gap-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded"
                      title="Attach File"
                      onClick={handleUploadClick}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Editable Area */}
                <div
                  ref={editorRef}
                  contentEditable
                  // 1. Đổi 'placeholder' thành 'data-placeholder'
                  data-placeholder="Add a comment..."

                  // 2. Sửa CSS: content-[attr(placeholder)] -> content-[attr(data-placeholder)]
                  className="w-full min-h-[80px] max-h-[300px] overflow-y-auto p-3 text-sm text-slate-700 outline-none bg-transparent empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 cursor-text"

                  onInput={handleEditorChange}
                  style={{ whiteSpace: "pre-wrap" }}
                />

                <div className="flex justify-between items-center px-2 py-2 bg-white rounded-b-md border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 pl-1">Supports HTML rich text</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-slate-600 font-medium hover:bg-slate-100"
                      onClick={() => { setIsCommentInputFocused(false); setCommentHtml(""); if (editorRef.current) editorRef.current.innerHTML = ""; }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 font-medium"
                      disabled={!commentHtml.trim() || sendingComment}
                      onClick={handleSendComment}
                    >
                      {sendingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // COLLAPSED STATE
              <div
                className="border border-slate-300 rounded-md bg-white p-1 flex items-center gap-2 cursor-text hover:border-slate-400 transition-colors group"
                onClick={() => { setIsCommentInputFocused(true); setTimeout(() => editorRef.current?.focus(), 0); }}
              >
                <div className="flex-1 px-3 py-2 text-sm text-slate-500 group-hover:text-slate-600 transition-colors">Add a comment...</div>
                <div className="flex items-center gap-1 pr-2 opacity-60 hover:opacity-100 transition-opacity">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CONTENT DISPLAY AREA */}
      <div className="pl-0 md:pl-11 min-h-[200px]">
        {loadingData ? (
          <div className="text-xs text-slate-400 flex items-center gap-2 justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" /> Loading data...</div>
        ) : (
          <>
            {/* --- TAB: COMMENTS --- */}
            {activeTab === "COMMENTS" && (
              <div className="space-y-6">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={`${comment.commentId || 'c'}-${index}`} className="flex gap-3 group items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Avatar className="w-8 h-8 mt-0.5 cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-transparent hover:ring-slate-100">
                        <AvatarImage src={comment.user?.avatarUrl} />
                        <AvatarFallback className="bg-slate-600 text-white text-xs font-bold">
                          {comment.user?.fullName ? comment.user.fullName.substring(0, 2).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm text-slate-800 hover:underline cursor-pointer transition-colors hover:text-blue-700">
                            {comment.user?.fullName || "Unknown User"}
                          </span>
                          <span className="text-[11px] text-slate-500 cursor-pointer hover:underline" title={new Date(comment.createdAt).toLocaleString()}>
                            {new Date(comment.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        {/* Render HTML Content */}
                        <div
                          className="text-sm text-slate-800 leading-relaxed bg-slate-50/50 p-2.5 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: comment.content }}
                        />

                        <div className="flex gap-4 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
                          <button className="text-[11px] font-medium text-slate-500 hover:underline hover:text-slate-800">Reply</button>
                          <button className="text-[11px] font-medium text-slate-500 hover:underline hover:text-slate-800">Edit</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 rounded-md p-6 text-center border border-slate-100 border-dashed">
                    <p className="text-xs text-slate-400 italic">No comments yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* --- TAB: ATTACHMENTS --- */}
            {activeTab === "ATTACHMENTS" && (
              <div className="space-y-2">
                {/* Nút Upload phụ cho Tab Attachments */}
                <div className="flex justify-end mb-2">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  <Button
                    variant="outline" size="sm"
                    className="h-8 text-xs gap-2"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Paperclip className="w-3 h-3" />}
                    Upload New File
                  </Button>
                </div>

                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((file) => (
                      <div key={file.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:shadow-sm hover:border-blue-300 transition-all group">
                        <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                          {file.fileType.includes("image") ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate" title={file.fileName}>{file.fileName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{formatFileSize(file.fileSize)}</span>
                            <span>•</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            by {file.uploadedByName}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600"
                            title="Download/View"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          {/* Chỉ hiện nút xóa nếu cần */}
                          {/* <button className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500">
                                            <Trash2 className="w-3.5 h-3.5"/>
                                        </button> */}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-md p-8 text-center border border-slate-100 border-dashed flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300" />
                    <p className="text-xs text-slate-400 italic">No files attached to this task.</p>
                    <Button variant="link" size="sm" className="text-blue-600 h-auto p-0 text-xs" onClick={handleUploadClick}>Upload a file</Button>
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