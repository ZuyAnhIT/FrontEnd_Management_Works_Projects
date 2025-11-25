"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  X,
  Lock,
  Eye,
  Share2,
  MoreHorizontal,
  Minimize2,
  CheckSquare,
  ChevronDown,
  Plus,
  GitBranch,
  GitCommit,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
  isOpen: boolean
  onClose: () => void
  onSwitchToSplitView: () => void
}

export default function TaskDetailModalFloating({ task, isOpen, onClose, onSwitchToSplitView }: TaskDetailModalProps) {
  const [position, setPosition] = useState({ x: 100, y: 50 })
  const [size, setSize] = useState({ width: 1100, height: 700 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  const subtasks = [
    {
      key: "CPW-69",
      summary: "BE-Viết hàm getCompanyMembers(companyId)...",
      priority: "M",
      assignee: "DB",
      status: "DONE",
    },
    { key: "CPW-70", summary: "BE-JOIN bảng NguoiDung, VaiTro", priority: "M", assignee: "DB", status: "DONE" },
    {
      key: "CPW-71",
      summary: "FE-Tạo bảng hiển thị danh sách thành viên",
      priority: "M",
      assignee: "U",
      status: "DONE",
    },
    { key: "CPW-72", summary: "FE-Gọi API lấy danh sách", priority: "M", assignee: "U", status: "DONE" },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".resize-handle")) return
    if (!(e.target as HTMLElement).closest(".modal-header")) return
    setIsDragging(true)
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
    }
    if (isResizing) {
      const newWidth = Math.max(800, e.clientX - position.x)
      const newHeight = Math.max(500, e.clientY - position.y)
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
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={onClose} />

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
        {/* HEADER */}
        <div
          className="modal-header bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
            <span className="hover:underline cursor-pointer">Add epic</span>
            <span>/</span>
            <span className="flex items-center gap-1 hover:underline cursor-pointer text-slate-600 font-medium">
              <CheckSquare className="w-3.5 h-3.5" /> {task.key}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md">
              <Lock className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md">
              <Eye className="w-4 h-4" /> <span className="text-xs ml-1">1</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md"
              onClick={onSwitchToSplitView}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-md"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 overflow-hidden bg-white">
          {/* LEFT PANEL */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-8 space-y-8">
              {/* Summary */}
              <Input
                value={task.summary}
                readOnly
                className="text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0 text-slate-900 leading-tight"
              />

              {/* Action Buttons (Attach, Add child) */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="h-8 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Description</h3>
                <Textarea
                  placeholder="Add a description..."
                  className="min-h-[80px] resize-none border-transparent hover:border-slate-200 bg-transparent focus:bg-white focus:border-blue-500 transition-all text-sm px-2 py-1"
                />
              </div>

              {/* Subtasks (Work) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ChevronDown className="w-4 h-4" /> Subtasks
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 w-full"></div>
                    </div>
                    <span className="text-xs text-slate-500">100% Done</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Subtask Table */}
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 flex text-xs font-semibold text-slate-500 border-b border-slate-200">
                    <div className="flex-1">Work</div>
                    <div className="w-10 text-center">Pri</div>
                    <div className="w-10 text-center">As...</div>
                    <div className="w-20 text-center">Status</div>
                  </div>
                  {subtasks.map((sub, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 flex items-center hover:bg-slate-50 border-b border-slate-100 last:border-0 text-sm group"
                    >
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-slate-500 text-xs font-mono shrink-0">{sub.key}</span>
                        <span className="truncate text-slate-700">{sub.summary}</span>
                      </div>
                      <div className="w-10 text-center text-orange-500 font-bold text-xs">=</div>
                      <div className="w-10 flex justify-center">
                        <Avatar className="w-5 h-5 text-[9px]">
                          <AvatarFallback className="bg-red-500 text-white">{sub.assignee}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="w-20 flex justify-end">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 text-[10px] px-1 py-0 rounded-sm border-transparent">
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Issues */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Linked work items</h3>
                <Button variant="ghost" className="h-8 px-2 text-slate-500 text-sm hover:bg-slate-100 font-normal">
                  + Add linked work item
                </Button>
              </div>

              {/* Activity */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Activity</h3>
                <div className="flex gap-2 mb-4">
                  <div className="flex bg-slate-100 p-0.5 rounded-md">
                    <Button variant="ghost" size="sm" className="h-7 text-xs bg-white shadow-sm text-slate-900">
                      All
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-900">
                      Comments
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-900">
                      History
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-900">
                      Work log
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-orange-500 text-white text-xs">ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="border border-slate-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all bg-white">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="w-full outline-none text-sm placeholder:text-slate-500"
                      />
                      <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          Can I get more info?
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          Status update
                        </Button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Pro tip: press M to comment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: DETAILS */}
          <div className="w-[340px] border-l border-slate-200 flex flex-col overflow-y-auto custom-scrollbar bg-white">
            <div className="p-6 space-y-6">
              {/* Action Buttons Top */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="h-8 bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Done <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
                <Button variant="ghost" className="h-8 text-slate-600 text-xs hover:bg-slate-100">
                  <CheckSquare className="w-3 h-3 mr-1 text-green-600" /> Done
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 bg-transparent">
                  <Zap className="w-4 h-4 text-slate-500" />
                </Button>
              </div>

              {/* Details Accordion (Always Open) */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-slate-900">Details</h3>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-4 text-sm">
                  {/* Assignee */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-slate-500">Assignee</span>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 -ml-1 rounded">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-blue-600 text-white text-[10px]">ZD</AvatarFallback>
                      </Avatar>
                      <span className="text-blue-600 hover:underline">{task.assignees[0]?.name || "Unassigned"}</span>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-slate-500">Labels</span>
                    <span className="text-slate-700">None</span>
                  </div>

                  {/* Parent */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-slate-500">Parent</span>
                    <span className="text-slate-700">None</span>
                  </div>

                  {/* Due Date */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-slate-500">Due date</span>
                    <span className="text-slate-700">None</span>
                  </div>

                  {/* Team */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-slate-500">Team</span>
                    <span className="text-slate-700">None</span>
                  </div>

                  {/* Start Date */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-slate-500">Start date</span>
                    <span className="text-slate-700">None</span>
                  </div>

                  {/* Sprint */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-slate-500">Sprint</span>
                    <div className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">
                      {task.sprint || "None"}
                      {task.sprint && (
                        <span className="text-slate-400 bg-slate-100 px-1 rounded text-xs border">+1</span>
                      )}
                    </div>
                  </div>

                  {/* Story Points */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-slate-500">Story points</span>
                    <span className="text-slate-700">None</span>
                  </div>

                  {/* Development */}
                  <div className="grid grid-cols-[100px_1fr] items-start gap-2 pt-2 border-t border-slate-100">
                    <span className="text-slate-500 pt-1">Development</span>
                    <div className="space-y-1">
                      <div className="text-blue-600 text-xs cursor-pointer hover:underline flex items-center gap-1">
                        <GitBranch className="w-3 h-3" /> Create branch
                      </div>
                      <div className="text-blue-600 text-xs cursor-pointer hover:underline flex items-center gap-1">
                        <GitCommit className="w-3 h-3" /> Create commit
                      </div>
                    </div>
                  </div>

                  {/* Reporter */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2 pt-2">
                    <span className="text-slate-500">Reporter</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-orange-500 text-white text-[10px]">QN</AvatarFallback>
                      </Avatar>
                      <span className="text-slate-700">{reporter.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automation Section */}
              <div className="border border-slate-200 rounded-lg px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Automation</span>
                  <Zap className="w-3 h-3 text-slate-400 fill-current" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  Rule executions <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              {/* Footer Info */}
              <div className="text-xs text-slate-400 space-y-1 pt-4">
                <p>Created November 4, 2024 at 9:55 AM</p>
                <p>Updated last week</p>
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

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
