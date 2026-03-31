"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bookmark,
  Bug,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  User as UserIcon,
  Check,
  Search,
} from "lucide-react";

// Internal Services & Contexts
import { TaskSummary } from "@/services/apiProject";
import { updateTask } from "@/services/apiTask";
import { useToast } from "@/components/ui/ToastProvider";

// Internal Components & Utils
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & HELPERS
// =============================================================================

export interface BoardUser {
  id?: number | string;
  userId?: number | string;
  memberId?: number | string;
  name?: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface BoardTaskCardProps {
  task: TaskSummary & { subtasks?: Subtask[] };
  index: number;
  users?: BoardUser[];
  onClick?: (task: TaskSummary) => void;
  onUpdateSuccess?: () => void;
}

/**
 * Trích xuất 2 chữ cái đầu từ tên đầy đủ để làm Avatar Fallback
 */
const getInitials = (name: string) => {
  if (!name) return "UN";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// -----------------------------------------------------------------------------
// ICON HELPERS
// -----------------------------------------------------------------------------

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG":
      return <Bug className="w-3.5 h-3.5 text-red-500 fill-red-50" />;
    case "STORY":
      return <Bookmark className="w-3.5 h-3.5 text-green-600 fill-green-50" />;
    default:
      return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />;
  }
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  switch (priority) {
    case "URGENT":
      return <ArrowUp className="w-3.5 h-3.5 text-red-600" />;
    case "HIGH":
      return <ArrowUp className="w-3.5 h-3.5 text-orange-500" />;
    case "LOW":
      return <ArrowDown className="w-3.5 h-3.5 text-slate-400" />;
    default:
      return <Minus className="w-3.5 h-3.5 text-yellow-500 rotate-90" />;
  }
};

// =============================================================================
// 3. SUB-COMPONENT: ASSIGNEE DROPDOWN
// =============================================================================

/**
 * Nút dropdown mini cho phép gán/đổi người thực hiện (Assignee) trực tiếp trên thẻ.
 */
const AssigneeDropdown = ({
  currentAssigneeId,
  users = [],
  onUpdate,
}: {
  currentAssigneeId: number | null;
  users: BoardUser[];
  onUpdate: (id: number | null) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Xác định user hiện tại đang được gán
  const currentUser = useMemo(() => 
    users.find((u) => (u.userId || u.memberId || u.id) === currentAssigneeId),
  [users, currentAssigneeId]);

  // Lọc danh sách user theo từ khóa tìm kiếm
  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return users.filter((user) => {
      const name = (user.fullName || user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      return name.includes(search) || email.includes(search);
    });
  }, [users, searchTerm]);

  // Xử lý đóng Dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Tự động focus vào ô tìm kiếm khi mở menu
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (userId: number | null) => {
    onUpdate(userId);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onPointerDown={(e) => e.stopPropagation()} // Ngăn chặn dnd-kit bắt sự kiện kéo thả tại đây
      onClick={(e) => e.stopPropagation()}
    >
      {/* Nút Avatar/Icon */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full transition-all border border-transparent hover:ring-2 hover:ring-blue-200 focus:outline-none relative z-10",
          !currentUser && "bg-slate-100 text-slate-400 hover:bg-slate-200"
        )}
        title={currentUser ? `Assigned to ${currentUser.fullName || currentUser.name}` : "Assign to user"}
      >
        {currentUser ? (
          <Avatar className="w-6 h-6 border-2 border-white shadow-sm">
            <AvatarImage
              src={currentUser.avatarUrl || currentUser.avatar}
              className="object-cover"
            />
            <AvatarFallback className="text-[8px] bg-blue-600 text-white font-bold">
              {getInitials(currentUser.fullName || currentUser.name || "")}
            </AvatarFallback>
          </Avatar>
        ) : (
          <UserIcon className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Menu thả xuống */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-[240px] bg-white rounded-lg shadow-xl z-[9999] border border-slate-200 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col overflow-hidden">
          
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search team..."
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-[220px] overflow-y-auto py-1 custom-scrollbar">
            {/* Tùy chọn Hủy gán (Unassigned) */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-slate-50 flex items-center gap-2 group"
            >
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600 transition-colors">
                <UserIcon className="w-3 h-3" />
              </div>
              <span className="text-slate-600 font-medium">Unassigned</span>
              {currentAssigneeId === null && <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />}
            </button>

            {filteredUsers.length > 0 && <div className="h-px bg-slate-100 my-1 mx-2" />}

            {filteredUsers.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-400 text-center font-medium">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => {
                const userId = (user.userId || user.memberId || user.id) as number;
                const isSelected = currentAssigneeId === userId;
                
                return (
                  <button
                    key={userId}
                    type="button"
                    onClick={() => handleSelect(userId)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2.5",
                      isSelected ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Avatar className="w-5 h-5 shadow-sm">
                      <AvatarImage src={user.avatarUrl || user.avatar} />
                      <AvatarFallback className="text-[8px] bg-blue-100 text-blue-700 font-bold">
                        {getInitials(user.fullName || user.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.fullName || user.name}</div>
                    </div>
                    {isSelected && <Check className="w-3 h-3 ml-auto text-blue-600 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Thẻ công việc (Task Card) hiển thị trên Bảng Kanban.
 * Hỗ trợ kéo thả (Dnd-kit) và thay đổi nhanh Assignee trực tiếp trên thẻ.
 */
export default function BoardTaskCard({
  task,
  users = [],
  onClick,
  onUpdateSuccess,
}: BoardTaskCardProps) {
  
  // ---------------------------------------------------------------------------
  // 5. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const router = useRouter();

  // Đồng bộ ID người thực hiện hiện tại
  const initialAssigneeId = task.assignee ? task.assignee.id : null;
  const [currentAssigneeId, setCurrentAssigneeId] = useState<number | null>(initialAssigneeId);

  useEffect(() => {
    setCurrentAssigneeId(task.assignee ? task.assignee.id : null);
  }, [task.assignee]);

  // ---------------------------------------------------------------------------
  // 6. DND-KIT SETUP
  // ---------------------------------------------------------------------------
  
  const sortableId = useMemo(() => task.id.toString(), [task.id]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    data: { type: "Task", task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1, // Ẩn hoàn toàn thẻ gốc khi đang kéo (để hiện thẻ Overlay)
  };

  // ---------------------------------------------------------------------------
  // 7. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý gán người thực hiện mới. 
   * Áp dụng kỹ thuật "Optimistic Update" (Cập nhật giao diện trước khi API trả về).
   */
  const handleAssigneeUpdate = useCallback(async (newAssigneeId: number | null) => {
    setCurrentAssigneeId(newAssigneeId);

    try {
      await updateTask(task.id, { assigneeId: newAssigneeId });
      showToast("Assignee updated successfully", "success");

      if (onUpdateSuccess) {
        onUpdateSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      showToast("Failed to update assignee", "error");
      // Hoàn tác (Revert) giao diện nếu API gọi thất bại
      setCurrentAssigneeId(task.assignee ? task.assignee.id : null);
    }
  }, [onUpdateSuccess, router, showToast, task.assignee, task.id]);

  // ---------------------------------------------------------------------------
  // 8. RENDER LOGIC
  // ---------------------------------------------------------------------------

  // Đổi màu viền thẻ dựa trên loại công việc
  const borderClass = useMemo(() => {
    switch (task.taskType) {
      case "BUG": return "border-l-red-500";
      case "STORY": return "border-l-green-500";
      default: return "border-l-blue-500";
    }
  }, [task.taskType]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(task)}
      className={cn(
        "bg-white rounded-[3px] shadow-sm mb-2 group relative transition-all duration-200 border border-slate-200 select-none",
        "cursor-grab active:cursor-grabbing border-l-[3px]",
        "hover:bg-[#f4f5f7] hover:border-slate-300", // Jira hover effect
        isDragging ? "opacity-0" : "opacity-100",
        borderClass
      )}
    >
      <div className="p-3 pb-2.5">
        
        {/* Phần Tiêu đề (Title) */}
        <div className="mb-2.5">
          <p className="text-[13px] text-[#172B4D] leading-snug font-medium line-clamp-2 hover:text-[#2684FF] transition-colors">
            {task.title}
          </p>
        </div>

        {/* Phần Chân thẻ (Metadata & Actions) */}
        <div className="flex items-center justify-between min-h-[24px]">
          
          {/* Trái: Icon Phân loại & Mã Công việc */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <TypeIcon type={task.taskType} />
            <span className="text-[11px] font-semibold text-[#5E6C84] group-hover:text-[#42526E] transition-colors">
              {task.taskCode}
            </span>
          </div>

          {/* Phải: Mức độ ưu tiên & Người thực hiện */}
          <div className="flex items-center gap-2 relative z-10">
            
            {/* Icon Mức độ ưu tiên */}
            <div
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-colors cursor-default"
              title={`Priority: ${task.priority}`}
              onPointerDown={(e) => e.stopPropagation()} // Chặn kéo thả tại khu vực này
            >
              <PriorityIcon priority={task.priority} />
            </div>

            {/* Menu Chọn Người thực hiện */}
            <AssigneeDropdown
              currentAssigneeId={currentAssigneeId}
              users={users}
              onUpdate={handleAssigneeUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}