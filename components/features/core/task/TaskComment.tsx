"use client";

import React, { useState, useEffect } from "react";
import { 
  Bold, Italic, List, ListOrdered, Image as ImageIcon, 
  AtSign, Smile, Link as LinkIcon, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTaskComments, addTaskComment } from "@/services/apiTask";
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

interface TaskCommentProps {
  taskId: number;
}

export default function TaskComment({ taskId }: TaskCommentProps) {
  const { showToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [isCommentInputFocused, setIsCommentInputFocused] = useState(false);

  // Fetch Comments on Load
  useEffect(() => {
    if (taskId) fetchComments(taskId);
  }, [taskId]);

  const fetchComments = async (id: number) => {
    setLoadingComments(true);
    try {
      const res = await getTaskComments(id);
      if (res.success && Array.isArray(res.data)) {
         setComments(res.data);
      } else {
         setComments([]);
      }
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !taskId) return;
    setSendingComment(true);
    try {
      const res = await addTaskComment(taskId, commentText);
      if (res.success) {
          setCommentText("");
          setIsCommentInputFocused(false);
          fetchComments(taskId);
          showToast("Comment added", "success");
      }
    } catch (error) {
      console.error("Failed to add comment", error);
      showToast("Failed to add comment", "error");
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <div className="pt-6 border-t border-slate-200 mt-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Activity 
        </h3>
        <div className="flex gap-1">
            <div className="flex bg-slate-100 p-0.5 rounded-md">
                <span className="px-3 py-1 text-[11px] text-slate-500 hover:text-slate-900 cursor-pointer rounded font-medium">All</span>
                <span className="px-3 py-1 text-[11px] bg-white text-blue-700 shadow-sm rounded font-medium cursor-default">Comments</span>
                <span className="px-3 py-1 text-[11px] text-slate-500 hover:text-slate-900 cursor-pointer rounded font-medium">History</span>
            </div>
        </div>
      </div>
      
      {/* A. INPUT COMMENT */}
      <div className="flex gap-3 mb-8">
        <Avatar className="w-8 h-8 mt-1">
            <AvatarFallback className="bg-orange-500 text-white text-xs">ME</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            {isCommentInputFocused ? (
                // FOCUSED STATE: RICH EDITOR
                <div className="border border-slate-300 rounded-md bg-white shadow-sm transition-all ring-1 ring-blue-100 animate-in fade-in duration-200">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-100 bg-slate-50/50 rounded-t-md overflow-x-auto no-scrollbar">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><span className="font-bold text-xs">B</span></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><span className="italic text-xs">I</span></Button>
                        <div className="w-px h-3 bg-slate-300 mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><List className="w-3.5 h-3.5"/></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><ListOrdered className="w-3.5 h-3.5"/></Button>
                        <div className="w-px h-3 bg-slate-300 mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><LinkIcon className="w-3.5 h-3.5"/></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><ImageIcon className="w-3.5 h-3.5"/></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><AtSign className="w-3.5 h-3.5"/></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded"><Smile className="w-3.5 h-3.5"/></Button>
                    </div>
                    
                    <textarea 
                        className="w-full min-h-[80px] p-3 text-sm text-slate-700 outline-none bg-transparent resize-none placeholder:text-slate-400"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        autoFocus
                    />
                    
                    <div className="flex justify-between items-center px-2 py-2 bg-white rounded-b-md">
                        <p className="text-[10px] text-slate-400 pl-1">Pro tip: press <span className="font-bold bg-slate-100 px-1 rounded">M</span> to comment</p>
                        <div className="flex gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-slate-600 font-medium hover:bg-slate-100"
                                onClick={() => { setIsCommentInputFocused(false); setCommentText(""); }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                size="sm" 
                                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 font-medium"
                                disabled={!commentText.trim() || sendingComment}
                                onClick={handleSendComment}
                            >
                                {sendingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                // COLLAPSED STATE: PLACEHOLDER
                <div 
                    className="border border-slate-300 rounded-md bg-white p-1 flex items-center gap-2 cursor-text hover:border-slate-400 transition-colors group"
                    onClick={() => setIsCommentInputFocused(true)}
                >
                    <div className="flex-1 px-3 py-2 text-sm text-slate-500 group-hover:text-slate-600 transition-colors">Add a comment...</div>
                    <div className="flex items-center gap-1 pr-2 opacity-60 hover:opacity-100 transition-opacity">
                        <span className="text-[12px] cursor-pointer hover:bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 border border-transparent hover:border-slate-200 transition-all" title="Looks good">
                            <span>🎉</span> <span className="text-slate-600 text-[10px] font-medium hidden sm:inline">Looks good!</span>
                        </span>
                        <span className="text-[12px] cursor-pointer hover:bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 border border-transparent hover:border-slate-200 transition-all" title="Need help">
                            <span>👋</span> <span className="text-slate-600 text-[10px] font-medium hidden sm:inline">Need help?</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* B. LIST COMMENTS */}
      <div className="space-y-6 pl-11">
        {loadingComments ? (
            <div className="text-xs text-slate-400 flex items-center gap-2 justify-center py-4"><Loader2 className="w-4 h-4 animate-spin"/> Loading comments...</div>
        ) : comments.length > 0 ? (
            comments.map((comment, index) => (
                <div key={`${comment.commentId || 'c'}-${index}`} className="flex gap-3 group items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Avatar className="w-8 h-8 mt-0.5 cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-transparent hover:ring-slate-100">
                        {comment.user?.avatarUrl ? (
                        <AvatarImage src={comment.user.avatarUrl} />
                        ) : (
                        <AvatarFallback className="bg-slate-600 text-white text-xs font-bold">
                            {comment.user?.fullName ? comment.user.fullName.substring(0,2).toUpperCase() : "U"}
                        </AvatarFallback>
                        )}
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
                        
                        <div className="text-sm text-slate-800 leading-relaxed bg-slate-50/50 p-2.5 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                            {comment.content}
                        </div>
                        
                        <div className="flex gap-4 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
                            <button className="text-[11px] font-medium text-slate-500 hover:underline hover:text-slate-800 transition-colors">Reply</button>
                            <button className="text-[11px] font-medium text-slate-500 hover:underline hover:text-slate-800 transition-colors">Edit</button>
                            <button className="text-[11px] font-medium text-slate-500 hover:underline hover:text-slate-800 transition-colors">Delete</button>
                            <button className="text-[11px] font-medium text-slate-500 hover:bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors -ml-1">
                                <span className="text-[12px]">👍</span> <span className="text-[10px]">Like</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="bg-slate-50 rounded-md p-6 text-center border border-slate-100 border-dashed">
                <p className="text-xs text-slate-400 italic">No comments yet. Be the first to say something!</p>
            </div>
        )}
      </div>
    </div>
  );
}