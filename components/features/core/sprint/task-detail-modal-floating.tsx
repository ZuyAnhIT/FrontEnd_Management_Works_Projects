"use client"

import React, { useState, useRef, useEffect } from "react"
import { X, Lock, Eye, Share2, MoreHorizontal, Minimize2, Link as LinkIcon, History, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar" // Giả sử có
import { ScrollArea } from "@/components/ui/scroll-area" // Giả sử có
import { Separator } from "@/components/ui/separator" // Giả sử có

// Mock Task Type (hoặc import từ types)
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
  onSwitchToSplitView: () => void
}

export default function TaskDetailModalFloating({ task, isOpen, onClose, onSwitchToSplitView }: TaskDetailModalProps) {
  const [position, setPosition] = useState({ x: 100, y: 50 })
  const [size, setSize] = useState({ width: 1000, height: 650 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  // --- Logic Drag & Resize (Giữ nguyên logic, chỉ tối ưu code style nếu cần) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".resize-handle")) return
    // Chỉ drag khi click vào header
    if (!(e.target as HTMLElement).closest(".modal-header")) return; 
    
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }

    if (isResizing) {
      const newWidth = Math.max(600, e.clientX - position.x)
      const newHeight = Math.max(400, e.clientY - position.y)
      setSize({ width: newWidth, height: newHeight })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, position, dragOffset])

  if (!isOpen || !task) return null

  const reporter = task.reporter || { name: "Unassigned", color: "bg-slate-500" }

  return (
    <>
      {/* Backdrop (Optional - thường modal floating có thể click xuyên qua, nhưng ở đây mình để backdrop mờ nhẹ để tập trung) */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={onClose} />
      
      {/* Modal Container */}
      <div
        ref={modalRef}
        className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col transition-shadow"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
      >
        {/* 1. Header: Draggable Area */}
        <div
          className="modal-header bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
          onMouseDown={handleMouseDown}
        >
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 hover:underline cursor-pointer text-slate-600">
               <CheckSquare className="w-3.5 h-3.5" />
               {task.key}
            </span>
            <span>/</span>
            <span className="truncate max-w-[200px]">{task.summary}</span>
          </div>

          {/* Actions Toolbar */}
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
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md" onClick={onSwitchToSplitView}>
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-md" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 2. Body Content: Flex Row */}
        <div className="flex flex-1 overflow-hidden bg-white">
          
          {/* Left Section: Main Task Info (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-8 space-y-8">
              
              {/* Title Input */}
              <Input
                value={task.summary}
                readOnly // Hoặc onChange nếu muốn edit
                className="text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0 text-slate-900 placeholder:text-slate-300"
              />

              {/* Buttons Row */}
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
                    className="min-h-[120px] resize-none border-slate-200 bg-slate-50/30 focus:bg-white hover:bg-slate-50 transition-colors text-sm" 
                />
              </div>

              {/* Activity / Comments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                   <h3 className="text-sm font-bold text-slate-900">Activity</h3>
                   <div className="flex gap-2">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded cursor-pointer">Comments</span>
                      <span className="text-xs font-medium text-slate-400 px-2 py-1 rounded cursor-pointer hover:bg-slate-50">History</span>
                   </div>
                </div>

                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs font-bold bg-blue-600 text-white">ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="border border-slate-200 rounded-md focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Input 
                            placeholder="Add a comment..." 
                            className="border-none focus-visible:ring-0 h-10" 
                        />
                        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-md">
                           <span className="text-[10px] text-slate-400">Pro tip: press M to comment</span>
                           <Button size="sm" className="h-7 text-xs bg-slate-200 text-slate-500 hover:bg-blue-600 hover:text-white">Save</Button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Meta Info (Fixed Width) */}
          <div className="w-[320px] border-l border-slate-200 bg-slate-50/30 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              
              {/* Status Button */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
                <Button variant="outline" className="w-full justify-between bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                  To Do
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </div>

              <Separator className="bg-slate-200" />

              {/* Fields Group */}
              <div className="space-y-4">
                
                {/* Assignee */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500">Assignee</p>
                  <div className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-md cursor-pointer transition-colors">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[10px] bg-slate-600 text-white">
                         {task.assignees.length > 0 ? getInitials(task.assignees[0].name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-700">
                      {task.assignees.length > 0 ? task.assignees[0].name : "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Reporter */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500">Reporter</p>
                  <div className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-md cursor-pointer transition-colors">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className={`text-[10px] text-white ${reporter.color || "bg-slate-500"}`}>
                        {getInitials(reporter.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-700">{reporter.name}</span>
                  </div>
                </div>

                {/* Labels */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500">Labels</p>
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels.length > 0 ? (
                      task.labels.map((label) => (
                        <Badge key={label} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal px-2">
                          {label}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic px-1.5">None</span>
                    )}
                    <Button variant="ghost" size="icon" className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
                        <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <Separator className="bg-slate-200" />

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500">Created</p>
                        <span className="text-xs text-slate-700">Mar 12, 2024</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500">Updated</p>
                        <span className="text-xs text-slate-700">Just now</span>
                    </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
          onMouseDown={() => setIsResizing(true)}
        >
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-slate-300 rounded-sm"></div>
        </div>
        
      </div>
    </>
  )
}

// Icon component (nếu chưa có)
function ChevronDown({ className }: { className?: string }) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
}
function Plus({ className }: { className?: string }) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
}