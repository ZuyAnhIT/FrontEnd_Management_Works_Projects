"use client"

import { useState, useMemo } from "react"
import { Search, Filter, MoreHorizontal, ChevronDown, Plus, ListFilter, Layers, LayoutList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import TaskRow from "@/components/features/core/sprint/task-row"
import TaskDetailWrapper from "@/components/features/core/sprint/task-detail-wrapper"
import { mockTasks, type Task } from "@/lib/mock-projects"

export default function TaskListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [groupBy, setGroupBy] = useState<"none" | "sprint" | "status">("none")
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "done">("all")
  
  // Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // --- Logic Filter & Group ---
  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      const matchesSearch =
        task.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.summary.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || task.status.toLowerCase() === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const groupedTasks = useMemo(() => {
    if (groupBy === "none") {
      return { all: filteredTasks }
    }

    const groups: Record<string, typeof mockTasks> = {}
    filteredTasks.forEach((task) => {
      const key = groupBy === "sprint" ? task.sprint || "Backlog" : task.status
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(task)
    })
    return groups
  }, [filteredTasks, groupBy])

  // --- Handlers ---
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      
      {/* 1. Toolbar Section */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shrink-0">
        
        {/* Left: Search & Filter Inputs */}
        <div className="flex items-center gap-3 flex-1">
           <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                 type="text" 
                 placeholder="Search issues..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-9 pr-4 h-8 bg-slate-50 border border-slate-200 rounded-[3px] text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-400"
              />
           </div>
           
           {/* Quick Filters (Avatars) */}
           <div className="flex items-center -space-x-1.5 ml-2">
              {[
                { name: "JD", bg: "bg-blue-600" },
                { name: "KM", bg: "bg-emerald-600" },
                { name: "AS", bg: "bg-amber-600" }
              ].map((user, i) => (
                 <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold border-2 border-white ${user.bg} cursor-pointer hover:z-10 hover:scale-110 transition-transform`} title={user.name}>
                    {user.name}
                 </div>
              ))}
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-slate-600 font-bold border-2 border-white bg-slate-100 cursor-pointer hover:bg-slate-200">
                 +2
              </div>
           </div>

           <div className="h-4 w-px bg-slate-300 mx-2"></div>

           {/* Dropdown Filters */}
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-slate-100 h-8 text-xs font-medium px-2">
                    <ListFilter className="w-3.5 h-3.5 mr-1.5" /> Filter
                    <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                 <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Issues</DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => setStatusFilter("todo")}>To Do</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setStatusFilter("done")}>Done</DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>

           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-slate-100 h-8 text-xs font-medium px-2">
                    <Layers className="w-3.5 h-3.5 mr-1.5" /> Group by
                    <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                 <DropdownMenuItem onClick={() => setGroupBy("none")}>None</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setGroupBy("sprint")}>Sprint</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setGroupBy("status")}>Status</DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>

        {/* Right: View Options */}
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="sm" className="text-slate-500 hover:bg-slate-100 h-8 px-2">
              <LayoutList className="w-4 h-4" />
           </Button>
           <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 rounded-md h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* 2. List Content */}
      <div className="flex-1 overflow-hidden flex relative">
        
        {/* Task Table Container */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-white w-full">
           <table className="w-full text-left border-collapse min-w-[1200px]"> {/* min-w để tránh co cột quá mức */}
              
              {/* Table Header */}
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-20 text-[11px] font-bold text-slate-500 uppercase tracking-wider shadow-sm">
                 <tr>
                    <th className="w-10 px-4 py-2 text-center bg-slate-50 sticky left-0 z-30 border-r border-transparent">
                        {/* Checkbox header nếu cần */}
                    </th>
                    <th className="px-4 py-2 w-12 text-center">Type</th>
                    <th className="px-4 py-2 w-24">Key</th>
                    <th className="px-4 py-2 min-w-[300px]">Summary</th>
                    <th className="px-4 py-2 w-32">Status</th>
                    <th className="px-4 py-2 w-24">Comments</th>
                    <th className="px-4 py-2 w-32">Sprint</th>
                    <th className="px-4 py-2 w-32">Assignee</th>
                    <th className="px-4 py-2 w-32">Due Date</th>
                    <th className="px-4 py-2 w-40">Labels</th>
                    <th className="px-4 py-2 w-32">Created</th>
                    <th className="px-4 py-2 w-32">Updated</th>
                    <th className="px-4 py-2 w-32">Reporter</th>
                    <th className="px-4 py-2 w-10"></th>
                 </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100">
                 {Object.entries(groupedTasks).flatMap(([groupKey, tasks]) => {
                    const groupRows = []

                    // Render Group Header Row
                    if (groupBy !== "none") {
                       groupRows.push(
                          <tr key={`group-${groupKey}`} className="bg-slate-50/50 border-b border-slate-200">
                             <td colSpan={14} className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                   <ChevronDown className="w-3 h-3 text-slate-400" />
                                   <span className="text-xs font-bold text-slate-700 uppercase">{groupKey}</span>
                                   <span className="text-xs text-slate-400 font-medium">({tasks.length} issues)</span>
                                </div>
                             </td>
                          </tr>
                       )
                    }
                    
                    // Render Task Rows
                    groupRows.push(
                       ...tasks.map((task) => (
                          <TaskRow 
                             key={task.id} 
                             task={task} 
                             onTaskSelect={() => handleTaskSelect(task)} 
                          />
                       ))
                    )

                    return groupRows
                 })}
                 
                 {/* Create Button Row */}
                 <tr className="hover:bg-slate-50 cursor-pointer group border-b border-transparent">
                    <td colSpan={14} className="px-4 py-2">
                       <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-800 transition-colors pl-1 h-8">
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-medium">Create issue</span>
                       </div>
                    </td>
                 </tr>

              </tbody>
           </table>
        </div>

        {/* 3. Task Detail Wrapper (Split View or Floating) */}
        {isModalOpen && selectedTask && (
           <div className="absolute inset-0 z-50 pointer-events-none flex justify-end">
               {/* Wrapper này giúp modal hiển thị đè lên bảng mà không làm layout bảng bị co lại */}
               <div className="pointer-events-auto h-full">
                   <TaskDetailWrapper 
                      task={selectedTask} 
                      isOpen={isModalOpen} 
                      onClose={handleCloseModal} 
                   />
               </div>
           </div>
        )}

      </div>
    </div>
  )
}