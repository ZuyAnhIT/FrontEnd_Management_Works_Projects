"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Link as LinkIcon, 
  CheckSquare, 
  ChevronDown, 
  GitBranch, 
  Clock, 
  Calendar,
  MoreHorizontal,
  Paperclip,
  History
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Types
import { TaskResponse } from "@/services/apiTask";

// --- HELPER FUNCTIONS ---
const getInitials = (name?: string) => {
  return name 
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) 
    : "U";
};

const formatDate = (d?: string) => {
    if (!d) return "None";
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface TaskDetailContentProps {
  task: TaskResponse;
}

export default function TaskDetailContent({ task }: TaskDetailContentProps) {
  // State cục bộ để xử lý việc edit text (Title/Description)
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(""); // Giả lập description vì API TaskResponse hiện tại chưa có trường này (bạn có thể map thêm)

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-white">
      
      {/* =========================================================
          LEFT COLUMN: MAIN CONTENT (Title, Desc, Subtasks, Activity)
      ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            
            {/* 1. Breadcrumb & Actions */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hover:underline cursor-pointer">Projects</span>
                  <span>/</span>
                  <span className="font-medium text-slate-700">{task.taskCode}</span>
               </div>
            </div>

            {/* 2. Title Input */}
            <div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-900 placeholder:text-slate-300 bg-transparent hover:bg-slate-50/50 rounded-sm transition-colors"
                />
            </div>
            
            {/* 3. Quick Action Toolbar */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs bg-slate-50 border-slate-200 text-slate-600">
                <Paperclip className="w-3 h-3 mr-1.5" /> Attach
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs bg-slate-50 border-slate-200 text-slate-600">
                <Plus className="w-3 h-3 mr-1.5" /> Add child issue
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs bg-slate-50 border-slate-200 text-slate-600">
                <LinkIcon className="w-3 h-3 mr-1.5" /> Link issue
              </Button>
            </div>

            {/* 4. Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Description</h3>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..." 
                className="min-h-[120px] resize-none border border-transparent hover:border-slate-200 focus:border-blue-500 bg-slate-50/30 focus:bg-white text-sm transition-all" 
              />
            </div>

            {/* 5. Subtasks (Mock UI) */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Subtasks</h3>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-1/3"></div>
                        </div>
                        <span className="text-[10px] text-slate-500">1 of 3 done</span>
                    </div>
                </div>
                
                {/* Subtask Items */}
                <div className="space-y-1">
                    <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 cursor-pointer group transition-colors">
                        <CheckSquare className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-mono text-slate-500">TSK-12</span>
                        <span className="text-sm text-slate-700 flex-1 line-through decoration-slate-400">Design Database Schema</span>
                        <Badge variant="secondary" className="text-[10px] h-5 bg-green-100 text-green-700 hover:bg-green-200">DONE</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 cursor-pointer group transition-colors">
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-mono text-slate-500">TSK-13</span>
                        <span className="text-sm text-slate-700 flex-1">Implement API Endpoints</span>
                        <Badge variant="secondary" className="text-[10px] h-5 bg-blue-100 text-blue-700 hover:bg-blue-200">IN PROGRESS</Badge>
                    </div>
                </div>
                
                <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-blue-600 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Create subtask
                </Button>
            </div>
            
            {/* 6. Activity / Comments */}
            <div className="pt-6 border-t border-slate-200">
               <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-slate-900">Activity</h3>
                   <div className="flex gap-1">
                       <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 bg-slate-100 text-slate-700">Comments</Button>
                       <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-slate-500">History</Button>
                   </div>
               </div>
               
               <div className="flex gap-3">
                  <Avatar className="w-8 h-8 border border-slate-200">
                      <AvatarFallback className="bg-orange-500 text-white text-xs">ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                      <div className="border border-slate-200 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all">
                          <input className="w-full outline-none text-sm px-3 py-2.5 placeholder:text-slate-400" placeholder="Add a comment..." />
                          <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border-t border-slate-100 rounded-b-md">
                              <div className="text-[10px] text-slate-400">Pro tip: press <span className="font-bold text-slate-500">M</span> to comment</div>
                              <Button size="sm" className="h-6 text-xs bg-blue-600 text-white hover:bg-blue-700">Save</Button>
                          </div>
                      </div>
                  </div>
               </div>
            </div>

          </div>
        </ScrollArea>
      </div>

      {/* =========================================================
          RIGHT COLUMN: SIDEBAR (Status, Details, Dates)
      ========================================================= */}
      <div className="w-[320px] hidden md:flex flex-col border-l border-slate-200 bg-slate-50/40">
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-6 text-sm">
            
            {/* 1. Status Dropdown */}
            <div>
               <label className="text-[11px] font-bold text-slate-500 uppercase mb-2 block tracking-wider">Status</label>
               <Button 
                  variant="outline" 
                  className="w-full justify-between bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold h-9 shadow-sm"
                  style={{ borderLeftColor: task.statusColor, borderLeftWidth: "4px" }}
               >
                  <span className="uppercase text-xs">{task.statusName}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
               </Button>
            </div>

            <Separator className="bg-slate-200" />

            {/* 2. Details Group */}
            <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Details</h4>
                
                <div className="border rounded-lg bg-white shadow-sm p-3 space-y-3 border-slate-200/60">
                    
                    {/* Assignee */}
                    <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                        <span className="text-slate-500 text-xs font-medium">Assignee</span>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 -ml-1 rounded transition-colors">
                            <Avatar className="w-5 h-5 border border-white shadow-sm">
                                <AvatarImage src={task.assigneeAvatarUrl} />
                                <AvatarFallback className="bg-blue-600 text-white text-[9px]">
                                    {getInitials(task.assigneeName)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-blue-600 hover:underline text-xs font-medium truncate">
                                {task.assigneeName || "Unassigned"}
                            </span>
                        </div>
                    </div>

                    {/* Reporter */}
                    <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                        <span className="text-slate-500 text-xs font-medium">Reporter</span>
                        <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5 border border-white shadow-sm">
                                <AvatarFallback className="bg-slate-500 text-white text-[9px]">
                                    {getInitials(task.reporterName)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-slate-700 text-xs truncate">{task.reporterName || "Unknown"}</span>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                        <span className="text-slate-500 text-xs font-medium">Priority</span>
                        <span className={`
                            text-[10px] font-bold px-2 py-0.5 rounded border w-fit
                            ${task.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100' :
                              task.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              'bg-slate-100 text-slate-500 border-slate-200'}
                        `}>
                            {task.priority}
                        </span>
                    </div>

                    {/* Story Points */}
                    <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                        <span className="text-slate-500 text-xs font-medium">Story Pts</span>
                        <div className="flex items-center">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-700 border border-slate-200">
                                {task.storyPoints}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Development Info */}
            <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Development</h4>
                <div className="space-y-1 pl-1">
                    <div className="text-blue-600 text-xs cursor-pointer hover:underline flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5"/> Create branch
                    </div>
                </div>
            </div>
            
            <Separator className="bg-slate-200" />

            {/* 4. Dates */}
            <div className="space-y-3 text-xs text-slate-500">
                <div className="flex justify-between">
                    <span>Created</span>
                    <span className="text-slate-700 font-medium">Oct 12, 2024</span>
                </div>
                <div className="flex justify-between">
                    <span>Updated</span>
                    <span className="text-slate-700 font-medium">Just now</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Due Date</span>
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                    </div>
                </div>
            </div>

          </div>
        </ScrollArea>
      </div>
    </div>
  );
}