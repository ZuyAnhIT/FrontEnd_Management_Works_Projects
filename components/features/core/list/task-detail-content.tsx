"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Link as LinkIcon, 
  CheckSquare, 
  ChevronDown, 
  GitBranch, 
  Calendar,
  MoreHorizontal,
  Paperclip,
  Share2,
  X
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// ✅ FIX: Import đúng từ apiProject (nơi chứa DTO TaskResponse)
import { TaskResponse } from "@/services/apiProject";

// --- HELPER FUNCTIONS ---
const getInitials = (name?: string) => {
  return name 
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) 
    : "U";
};

const formatDate = (d?: string | null) => {
    if (!d) return "None";
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface TaskDetailContentProps {
  task: TaskResponse;
  onClose?: () => void;
}

export default function TaskDetailContent({ task, onClose }: TaskDetailContentProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(""); 

  // ✅ Helper lấy dữ liệu an toàn từ Nested Objects
  const statusName = task.status?.name || "Unknown";
  const statusColor = task.status?.color || "#64748b";
  const assigneeName = task.assignee?.name;
  const assigneeAvatar = task.assignee?.avatarUrl;
  // DTO hiện tại chưa có reporter, dùng tạm assignee hoặc để trống
  const reporterName = "Unknown"; 

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-white">
      
      {/* LEFT COLUMN */}
      <div className="flex-1 flex flex-col min-w-0">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            
            {/* 1. Header */}
            <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-2">
               <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="bg-blue-600 p-0.5 rounded-[2px]">
                    <CheckSquare className="w-3 h-3 text-white" />
                  </div>
                  <span className="hover:underline cursor-pointer font-medium text-slate-600">Projects</span>
                  <span className="text-slate-300">/</span>
                  <span className="hover:underline cursor-pointer text-slate-600">{task.taskCode}</span>
               </div>
               
               <div className="flex items-center gap-1">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100">
                       <Share2 className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100">
                       <MoreHorizontal className="w-4 h-4" />
                   </Button>
                   {onClose && (
                       <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 ml-2">
                           <X className="w-5 h-5" />
                       </Button>
                   )}
               </div>
            </div>

            {/* 2. Title */}
            <div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-semibold border-none px-2 -ml-2 h-auto focus-visible:ring-2 focus-visible:ring-blue-600 text-slate-900 placeholder:text-slate-300 bg-transparent hover:bg-slate-100 rounded-[3px] transition-colors leading-tight py-1"
                />
            </div>
            
            {/* 3. Toolbar */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="h-8 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm border border-slate-200/50">
                <Paperclip className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Attach
              </Button>
              <Button variant="secondary" size="sm" className="h-8 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm border border-slate-200/50">
                <Plus className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Child issue
              </Button>
              <Button variant="secondary" size="sm" className="h-8 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm border border-slate-200/50">
                <LinkIcon className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Link issue
              </Button>
            </div>

            {/* 4. Description */}
            <div className="space-y-2 group">
              <h3 className="text-sm font-semibold text-slate-900">Description</h3>
              <div className="relative">
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..." 
                    className="min-h-[120px] resize-none border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all px-3 py-2 rounded-[3px]" 
                  />
                  {!description && (
                      <div className="absolute top-2 left-3 text-sm text-slate-400 pointer-events-none italic">
                          Click to add description...
                      </div>
                  )}
              </div>
            </div>

            {/* 5. Subtasks (Mock UI) */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Subtasks</h3>
                    <div className="flex items-center gap-3">
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-1/3 rounded-full"></div>
                        </div>
                        <span className="text-xs font-medium text-slate-500">1 of 3 done</span>
                    </div>
                </div>
                
                <div className="space-y-[1px] border border-slate-200 rounded-[3px] overflow-hidden">
                    <div className="flex items-center gap-3 p-2.5 bg-white hover:bg-slate-50 cursor-pointer group transition-colors border-b border-slate-100 last:border-0">
                        <div className="bg-green-100 p-0.5 rounded-[2px]">
                            <CheckSquare className="w-3.5 h-3.5 text-green-700" />
                        </div>
                        <span className="text-xs font-mono text-slate-500 group-hover:underline">TSK-12</span>
                        <span className="text-sm text-slate-500 flex-1 line-through">Design Database Schema</span>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider rounded-[3px]">DONE</Badge>
                    </div>
                </div>
                
                <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 text-xs font-medium -ml-2">
                    <Plus className="w-4 h-4 mr-1.5" /> Create subtask
                </Button>
            </div>
            
            {/* 6. Activity */}
            <div className="pt-6">
               <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-2 z-10">
                   <h3 className="text-sm font-semibold text-slate-900">Activity</h3>
                   <div className="flex gap-1 p-0.5 bg-slate-100 rounded-[3px]">
                       <Button variant="ghost" size="sm" className="h-6 text-[11px] px-3 bg-white text-slate-700 shadow-sm font-medium rounded-[2px]">Comments</Button>
                       <Button variant="ghost" size="sm" className="h-6 text-[11px] px-3 text-slate-500 hover:text-slate-700 font-medium rounded-[2px]">History</Button>
                   </div>
               </div>
               
               <div className="flex gap-3">
                  <Avatar className="w-8 h-8 border border-white shadow-sm mt-1">
                      <AvatarFallback className="bg-orange-600 text-white text-xs font-bold">ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                      <div className="border border-slate-200 rounded-[3px] shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all overflow-hidden">
                          <input className="w-full outline-none text-sm px-3 py-3 placeholder:text-slate-400" placeholder="Add a comment..." />
                          <div className="flex items-center justify-between px-2 py-1.5 bg-white border-t border-slate-100">
                              <div className="text-[10px] text-slate-400 font-medium">Pro tip: press <span className="font-bold text-slate-600 bg-slate-100 px-1 rounded">M</span> to comment</div>
                              <Button size="sm" className="h-7 text-xs bg-blue-600 text-white hover:bg-blue-700 font-medium px-3 rounded-[3px]">Save</Button>
                          </div>
                      </div>
                  </div>
               </div>
            </div>

          </div>
        </ScrollArea>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-[340px] hidden lg:flex flex-col border-l border-slate-200 bg-white">
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-6 text-sm">
            
            {/* 1. Status */}
            <div>
               <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block tracking-wide">Status</label>
               <Button 
                  variant="outline" 
                  className="w-full justify-between bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 font-bold h-9 shadow-sm rounded-[3px] transition-all"
                  style={{ borderLeftColor: statusColor, borderLeftWidth: "4px" }}
               >
                  <span className="uppercase text-xs tracking-wide">{statusName}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
               </Button>
            </div>

            <Separator className="bg-slate-200" />

            {/* 2. Details */}
            <div className="space-y-4">
                <div className="flex items-center justify-between group">
                    <h4 className="text-sm font-semibold text-slate-900">Details</h4>
                    <ChevronDown className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 cursor-pointer" />
                </div>
                
                <div className="space-y-4 pl-1">
                    
                    {/* Assignee */}
                    <div className="grid grid-cols-[100px_1fr] gap-2 items-center group">
                        <span className="text-slate-500 text-xs font-medium">Assignee</span>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1.5 -ml-1.5 rounded-[3px] transition-colors">
                            <Avatar className="w-6 h-6 border border-white shadow-sm">
                                <AvatarImage src={assigneeAvatar} />
                                <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
                                    {getInitials(assigneeName)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-slate-700 text-sm truncate group-hover:text-blue-600">
                                {assigneeName || "Unassigned"}
                            </span>
                        </div>
                    </div>

                    {/* Reporter */}
                    <div className="grid grid-cols-[100px_1fr] gap-2 items-center group">
                        <span className="text-slate-500 text-xs font-medium">Reporter</span>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1.5 -ml-1.5 rounded-[3px] transition-colors">
                            <Avatar className="w-6 h-6 border border-white shadow-sm">
                                <AvatarFallback className="bg-slate-500 text-white text-[10px] font-bold">
                                    {getInitials(reporterName)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-slate-700 text-sm truncate group-hover:text-blue-600">{reporterName}</span>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                        <span className="text-slate-500 text-xs font-medium">Priority</span>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 -ml-1 rounded-[3px] w-fit pr-2">
                            <div className={`w-4 h-4 flex items-center justify-center rounded-[2px] ${
                                task.priority === 'URGENT' ? 'bg-red-100' : 
                                task.priority === 'HIGH' ? 'bg-orange-100' : 'bg-green-100'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                    task.priority === 'URGENT' ? 'bg-red-600' : 
                                    task.priority === 'HIGH' ? 'bg-orange-500' : 'bg-green-500'
                                }`} />
                            </div>
                            <span className="text-sm text-slate-700 capitalize">{task.priority?.toLowerCase()}</span>
                        </div>
                    </div>

                    {/* Story Points */}
                    <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                        <span className="text-slate-500 text-xs font-medium">Story Points</span>
                        <div className="cursor-pointer hover:bg-slate-100 p-1 -ml-1 rounded-[3px] w-fit">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold border border-slate-200">
                                {task.storyPoints || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* 3. Development Info */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">Development</h4>
                <div className="pl-1">
                    <button className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1.5 transition-colors">
                        <GitBranch className="w-3.5 h-3.5"/> Create branch
                    </button>
                </div>
            </div>
            
            <Separator className="bg-slate-200" />

            {/* 4. Dates */}
            <div className="space-y-3 text-xs text-slate-500">
                <div className="flex justify-between items-center group">
                    <span className="font-medium">Due Date</span>
                    <span className="text-slate-700 group-hover:text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(task.dueDate)}
                    </span>
                </div>
            </div>

          </div>
        </ScrollArea>
      </div>
    </div>
  );
}