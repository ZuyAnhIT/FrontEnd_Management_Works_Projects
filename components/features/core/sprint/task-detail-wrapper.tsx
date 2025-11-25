"use client"

import { useState } from "react"
import TaskDetailModalSplitView from "@/components/features/core/sprint/task-detail-modal-split-view"
import TaskDetailModalFloating from "@/components/features/core/sprint/task-detail-modal-floating"
// Đảm bảo import đúng Type Task từ nơi bạn định nghĩa
interface Task {
  id: string;
  title: string;
  // ... các trường khác
}

interface TaskDetailWrapperProps {
  task: any | null // Thay any bằng Task type chuẩn của bạn
  isOpen: boolean
  onClose: () => void
}

export default function TaskDetailWrapper({ task, isOpen, onClose }: TaskDetailWrapperProps) {
  // State để quản lý chế độ xem: 'split' (mặc định) hoặc 'floating' (cửa sổ nổi)
  const [viewMode, setViewMode] = useState<"split" | "floating">("split")

  if (!isOpen || !task) return null

  return (
    <>
      {viewMode === "split" ? (
        <TaskDetailModalSplitView
          task={task}
          isOpen={isOpen}
          onClose={onClose}
          onSwitchToFloating={() => setViewMode("floating")}
        />
      ) : (
        <TaskDetailModalFloating
          task={task}
          isOpen={isOpen}
          onClose={onClose}
          onSwitchToSplitView={() => setViewMode("split")}
        />
      )}
    </>
  )
}