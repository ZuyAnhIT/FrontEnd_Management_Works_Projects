"use client"

import { MessageCircle, Calendar, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/lib/mock-projects"

interface TaskRowProps {
  task: Task
  onTaskSelect?: (task: Task) => void
}

export default function TaskRow({ task, onTaskSelect }: TaskRowProps) {
  const statusColor =
    task.status === "DONE"
      ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const reporter = task.reporter || { name: "Qwan NG", color: "bg-orange-500" }

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="w-12 px-6 py-4">
        <input type="checkbox" className="rounded" defaultChecked={task.checked} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-xs font-bold text-white">
            ✓
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-blue-600 whitespace-nowrap min-w-fit">
        <button onClick={() => onTaskSelect?.(task)} className="hover:underline cursor-pointer">
          {task.key}
        </button>
      </td>
      <td className="px-6 py-4 text-sm text-foreground text-balance max-w-sm">
        <div className="line-clamp-2">{task.summary}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap min-w-fit">
        <Badge variant="outline" className={statusColor}>
          {task.status}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap min-w-fit">
        <button
          onClick={() => onTaskSelect?.(task)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {task.comments > 0 ? task.comments : "Add comment"}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap min-w-fit">
        <Badge variant="secondary" className="text-xs">
          {task.sprint}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap min-w-fit">
        <div className="flex items-center gap-2">
          {task.assignees.length > 0 ? (
            task.assignees.map((assignee) => (
              <Avatar key={assignee.name} className="w-6 h-6">
                <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                <AvatarFallback className={`text-xs font-semibold text-white ${assignee.color || "bg-gray-500"}`}>
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap min-w-fit">
        {task.dueDate ? (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {task.dueDate}
          </div>
        ) : (
          "-"
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap min-w-fit">
        {task.labels.length > 0 ? (
          <div className="flex gap-1">
            {task.labels.map((label) => (
              <Badge key={label} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">+ Add label</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap min-w-fit">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {task.created}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap min-w-fit">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {task.updated}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap min-w-fit">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={reporter.avatar || "/placeholder.svg"} />
            <AvatarFallback className={`text-xs font-semibold text-white ${reporter.color}`}>
              {getInitials(reporter.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground line-clamp-1">{reporter.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap min-w-fit">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-md hover:bg-muted transition-colors">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => onTaskSelect?.(task)}>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Move to</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
