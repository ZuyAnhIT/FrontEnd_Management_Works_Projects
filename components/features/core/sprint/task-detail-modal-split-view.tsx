"use client"

import React from "react"
import { X, Lock, Eye, Share2, MoreHorizontal, Maximize2, Link as LinkIcon, CheckSquare, ChevronDown, Plus, GitBranch, GitCommit, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface Task {
  key: string
  summary: string
  description?: string
  assignees: { name: string; color?: string }[]
  labels: string[]
  dueDate?: string
  sprint?: string
  reporter?: { name: string; color?: string }
  status: string
}

interface TaskDetailModalProps {
  task: Task | null
  isOpen?: boolean 
  onClose: () => void
  onSwitchToFloating?: () => void
}

export default function TaskDetailModalSplitView({ task, onClose, onSwitchToFloating }: TaskDetailModalProps) {
  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  }

  if (!task) return null

  // Mock Data
  const subtasks = [
      { key: "CPW-69", summary: "BE-Viết hàm getCompanyMembers...", priority: "M", assignee: "DB", status: "DONE" },
      { key: "CPW-70", summary: "BE-JOIN bảng NguoiDung, VaiTro", priority: "M", assignee: "DB", status: "DONE" },
      { key: "CPW-71", summary: "FE-Tạo bảng hiển thị danh sách", priority: "M", assignee: "U", status: "DONE" },
  ]
  const reporter = task.reporter || { name: "Unassigned", color: "bg-slate-500" }

  return (
    // SỬA: Dùng h-full w-full để chiếm trọn pane bên phải, bỏ fixed/shadow
    <div className="h-full w-full bg-white flex flex-col">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-xs text-slate-500 overflow-hidden">
           <CheckSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />
           <span className="truncate hover:underline cursor-pointer hidden sm:inline">Add epic</span>
           <span className="hidden sm:inline">/</span>
           <span className="flex items-center gap-1 hover:underline cursor-pointer text-slate-600 font-medium truncate">
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              {task.key}
           </span>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:bg-slate-100 rounded-md"><Lock className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:bg-slate-100 rounded-md"><Eye className="w-3.5 h-3.5" /> <span className="text-[10px] ml-0.5">1</span></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:bg-slate-100 rounded-md"><Share2 className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:bg-slate-100 rounded-md"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          {onSwitchToFloating && (
             <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:bg-slate-100 rounded-md" onClick={onSwitchToFloating}>
                <Maximize2 className="w-3.5 h-3.5" />
             </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT (Single Column Layout) --- */}
      <ScrollArea className="flex-1 bg-white">
        <div className="p-6 space-y-6">
            
            {/* 1. TITLE & ACTION BUTTONS */}
            <div className="space-y-3">
                <Input
                    value={task.summary}
                    readOnly
                    className="text-xl font-bold border-none px-0 h-auto focus-visible:ring-0 text-slate-900 leading-tight"
                />
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="h-7 text-xs bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"><LinkIcon className="w-3 h-3 mr-1.5"/> Attach</Button>
                    <Button variant="outline" className="h-7 text-xs bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"><Plus className="w-3 h-3 mr-1.5"/> Add child</Button>
                    <Button variant="outline" className="h-7 text-xs bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"><LinkIcon className="w-3 h-3 mr-1.5"/> Link issue</Button>
                </div>
            </div>

            {/* 2. DESCRIPTION */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Description</h3>
                <Textarea placeholder="Add a description..." className="min-h-[80px] resize-none border-transparent hover:border-slate-200 bg-transparent focus:bg-white focus:border-blue-500 transition-all text-sm px-2 py-1" />
            </div>

            {/* 3. META INFO GRID (STATUS & DETAILS) */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                    <Button variant="outline" className="bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-bold uppercase text-[10px] h-7 px-2 shadow-sm">
                        To Do <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                    </Button>
                </div>

                <Separator className="bg-slate-200/50" />

                {/* Details Fields (Compact Grid) */}
                <div className="grid grid-cols-[100px_1fr] gap-y-3 text-xs items-center">
                    
                    {/* Assignee */}
                    <span className="text-slate-500 font-medium">Assignee</span>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 -ml-1 rounded transition-colors w-fit">
                        <Avatar className="w-5 h-5"><AvatarFallback className="bg-blue-600 text-white text-[9px]">ZD</AvatarFallback></Avatar>
                        <span className="text-blue-600 font-medium">{task.assignees[0]?.name || "Unassigned"}</span>
                    </div>

                    {/* Labels */}
                    <span className="text-slate-500 font-medium">Labels</span>
                    <span className="text-slate-400 italic">None</span>

                    {/* Sprint */}
                    <span className="text-slate-500 font-medium">Sprint</span>
                    <div className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">
                        {task.sprint || "None"} 
                        {task.sprint && <span className="text-slate-400 bg-slate-100 px-1 rounded text-[10px] border">+1</span>}
                    </div>

                    {/* Reporter */}
                    <span className="text-slate-500 font-medium">Reporter</span>
                    <div className="flex items-center gap-1.5">
                        <Avatar className="w-5 h-5"><AvatarFallback className="bg-orange-500 text-white text-[9px]">QN</AvatarFallback></Avatar>
                        <span className="text-slate-700">{reporter.name}</span>
                    </div>
                </div>
            </div>

            {/* 4. SUBTASKS */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Subtasks</h3>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-green-600 w-full"></div></div>
                        <span className="text-[10px] text-slate-500">100% Done</span>
                    </div>
                </div>
                <div className="border border-slate-200 rounded-md overflow-hidden">
                    {subtasks.map((sub, idx) => (
                        <div key={idx} className="px-3 py-2 flex items-center hover:bg-slate-50 border-b border-slate-100 last:border-0 text-xs gap-2 group cursor-pointer">
                            <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-slate-500 font-mono shrink-0">{sub.key}</span>
                            <span className="truncate text-slate-700 flex-1">{sub.summary}</span>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 text-[9px] px-1 py-0 border-transparent">{sub.status}</Badge>
                        </div>
                    ))}
                    <div className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-2 text-xs text-slate-500">
                        <Plus className="w-3.5 h-3.5" /> Create subtask
                    </div>
                </div>
            </div>

            {/* 5. LINKED ITEMS */}
            <div className="space-y-2">
                 <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Linked Issues</h3>
                 <div className="flex flex-col gap-1">
                    {/* Mock linked issue */}
                    <div className="flex items-center gap-2 p-2 border border-slate-100 rounded bg-slate-50/50 hover:bg-slate-100 cursor-pointer text-xs">
                        <div className="w-4 h-4 bg-red-500 rounded-[2px] flex items-center justify-center text-white text-[8px] font-bold">B</div>
                        <span className="text-slate-500 line-through">CPW-123</span>
                        <span className="text-slate-700 line-through truncate flex-1">Fix login bug on safari</span>
                        <Badge className="bg-green-100 text-green-700 text-[9px] px-1 py-0 border-transparent">DONE</Badge>
                    </div>
                 </div>
                 <Button variant="ghost" className="h-7 px-1 text-slate-500 text-xs hover:bg-transparent hover:text-blue-600 font-normal justify-start p-0">
                    + Add linked issue
                 </Button>
            </div>

            {/* 6. DEVELOPMENT & AUTOMATION */}
            <div className="space-y-1 py-2 border-t border-slate-100">
                 <div className="flex items-center justify-between group cursor-pointer py-1.5 hover:bg-slate-50 px-2 -mx-2 rounded">
                     <span className="text-xs font-bold text-slate-900">Development</span>
                     <Plus className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                 </div>
                 <div className="space-y-1 pl-2">
                     <div className="text-blue-600 text-xs cursor-pointer hover:underline flex items-center gap-1.5"><GitBranch className="w-3 h-3"/> Create branch</div>
                     <div className="text-blue-600 text-xs cursor-pointer hover:underline flex items-center gap-1.5"><GitCommit className="w-3 h-3"/> Create commit</div>
                 </div>
            </div>

            {/* 7. ACTIVITY */}
            <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Activity</h3>
                
                {/* Activity Tabs */}
                <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                    <div className="flex bg-slate-100 p-0.5 rounded-md shrink-0">
                        <span className="px-2 py-0.5 text-[10px] bg-white shadow-sm text-slate-900 rounded-sm font-medium cursor-default">All</span>
                        <span className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer">Comments</span>
                        <span className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer">History</span>
                        <span className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer">Log</span>
                    </div>
                </div>
                
                {/* Comment Input */}
                <div className="flex gap-3 mb-4">
                    <Avatar className="w-7 h-7 shrink-0"><AvatarFallback className="bg-orange-500 text-white text-[10px]">ME</AvatarFallback></Avatar>
                    <div className="flex-1">
                       <div className="border border-slate-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all bg-white">
                          <input type="text" placeholder="Add a comment..." className="w-full outline-none text-xs placeholder:text-slate-500" />
                          <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                             <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1 text-slate-500 hover:text-slate-900">Save</Button>
                          </div>
                       </div>
                       <p className="text-[9px] text-slate-400 mt-1">Pro tip: press M to comment</p>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="text-[10px] text-slate-400 pt-6 space-y-0.5 pb-10">
                <p>Created Nov 4, 2024</p>
                <p>Updated just now</p>
            </div>

        </div>
      </ScrollArea>
    </div>
  )
}