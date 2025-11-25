"use client"

import React from "react"
import { X, Lock, Eye, Share2, MoreHorizontal, Maximize2, Link as LinkIcon, CheckSquare, ChevronDown } from "lucide-react"
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
}

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSwitchToFloating: () => void
}

export default function TaskDetailModalSplitView({ task, isOpen, onClose, onSwitchToFloating }: TaskDetailModalProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  if (!isOpen || !task) return null

  const reporter = task.reporter || { name: "Unassigned", color: "bg-slate-500" }

  return (
    // Container: Fixed Right, Full Height
    <div
      className="fixed top-0 right-0 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out w-full md:w-[500px] lg:w-[600px] h-screen"
    >
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
           {/* Breadcrumbs */}
           <span className="flex items-center gap-1 text-xs text-slate-500 hover:underline cursor-pointer">
              <CheckSquare className="w-3.5 h-3.5" />
              {task.key}
           </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md">
            <Lock className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-slate-200 mx-1"></div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md" onClick={onSwitchToFloating}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-md" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 bg-white">
        <div className="p-6 space-y-6">
          
          {/* Title */}
          <div>
             <Input
                value={task.summary}
                readOnly
                className="text-xl font-bold border-none px-0 h-auto focus-visible:ring-0 text-slate-900 placeholder:text-slate-300"
             />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
              <Button variant="outline" className="h-8 text-xs font-medium bg-slate-50 border-slate-200 text-slate-700">
                <LinkIcon className="w-3 h-3 mr-1.5" /> Attach
              </Button>
              <Button variant="outline" className="h-8 text-xs font-medium bg-slate-50 border-slate-200 text-slate-700">
                <CheckSquare className="w-3 h-3 mr-1.5" /> Add child issue
              </Button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Description</h3>
            <Textarea 
                placeholder="Add a description..." 
                className="min-h-[100px] resize-none border-slate-200 bg-slate-50/30 focus:bg-white hover:bg-slate-50 transition-colors text-sm" 
            />
          </div>

          <Separator className="bg-slate-100" />

          {/* Status & Details Grid */}
          <div className="grid grid-cols-1 gap-6">
             
             {/* Status */}
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
                <Button variant="outline" className="w-full justify-between bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                  To Do
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
             </div>

             {/* Details Group */}
             <div className="space-y-4 border rounded-lg p-4 border-slate-100 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Details</h4>

                {/* Assignee */}
                <div className="flex items-center justify-between">
                   <span className="text-xs text-slate-500 font-medium">Assignee</span>
                   <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-md transition-colors">
                      <Avatar className="w-5 h-5">
                         <AvatarFallback className="text-[9px] bg-slate-600 text-white">
                            {task.assignees.length > 0 ? getInitials(task.assignees[0].name) : "U"}
                         </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-slate-700 font-medium">
                         {task.assignees.length > 0 ? task.assignees[0].name : "Unassigned"}
                      </span>
                   </div>
                </div>

                {/* Reporter */}
                <div className="flex items-center justify-between">
                   <span className="text-xs text-slate-500 font-medium">Reporter</span>
                   <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-md transition-colors">
                      <Avatar className="w-5 h-5">
                         <AvatarFallback className={`text-[9px] text-white ${reporter.color || "bg-slate-500"}`}>
                            {getInitials(reporter.name)}
                         </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-slate-700 font-medium">{reporter.name}</span>
                   </div>
                </div>

                {/* Labels */}
                <div className="flex items-center justify-between">
                   <span className="text-xs text-slate-500 font-medium">Labels</span>
                   <div className="flex flex-wrap gap-1 justify-end">
                      {task.labels.length > 0 ? (
                         task.labels.map((label) => (
                            <Badge key={label} variant="secondary" className="bg-slate-200 text-slate-600 hover:bg-slate-300 font-normal px-1.5 text-[10px]">
                               {label}
                            </Badge>
                         ))
                      ) : (
                         <span className="text-xs text-slate-400 italic">None</span>
                      )}
                   </div>
                </div>

                {/* Sprint */}
                <div className="flex items-center justify-between">
                   <span className="text-xs text-slate-500 font-medium">Sprint</span>
                   <Badge variant="outline" className="text-xs font-normal text-slate-700 border-slate-300">
                      {task.sprint}
                   </Badge>
                </div>
             </div>

             {/* Dates Group */}
             <div className="space-y-3 border rounded-lg p-4 border-slate-100 bg-slate-50/30">
                 <div className="flex justify-between">
                    <span className="text-xs text-slate-500 font-medium">Created</span>
                    <span className="text-xs text-slate-700">Mar 12, 2024</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-xs text-slate-500 font-medium">Updated</span>
                    <span className="text-xs text-slate-700">Just now</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-xs text-slate-500 font-medium">Due Date</span>
                    <span className="text-xs text-slate-700">{task.dueDate || "None"}</span>
                 </div>
             </div>

          </div>
        </div>
      </ScrollArea>
    </div>
  )
}