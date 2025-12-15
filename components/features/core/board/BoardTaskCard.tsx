"use client";

import { useMemo, useState, useRef, useEffect } from "react";
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
  LucideIcon,
} from "lucide-react";

import { TaskSummary } from "@/services/apiProject";
import { updateTask } from "@/services/apiTask";
import { useToast } from "@/components/ui/ToastProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";

// =============================================================================
// 1. INTERFACES & HELPERS
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

// Helper lấy chữ cái đầu
const getInitials = (name: string) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "UN";

// --- ICONS ---

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG":
      return <Bug className="w-3.5 h-3.5 text-red-500 fill-red-50" />;
    case "STORY":
      return <Bookmark className="w-3.5 h-3.5 text-green-600 fill-green-50" />;
    default:
      return (
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
      );
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
// 2. SUB-COMPONENT: ASSIGNEE DROPDOWN
// =============================================================================

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

  // Tìm user hiện tại
  const currentUser = users.find(
    (u) => (u.userId || u.memberId || u.id) === currentAssigneeId
  );

  // Filter users
  const filteredUsers = users.filter((user) => {
    const name = (user.fullName || user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  // Xử lý click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto focus input sau khi mở
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
    // Ngăn chặn sự kiện Drag của cha lan vào đây
    <div
      className="relative"
      ref={dropdownRef}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          flex items-center justify-center w-6 h-6 rounded-full transition-all border border-transparent
          hover:ring-2 hover:ring-blue-200 focus:outline-none relative z-10
          ${
            !currentUser ? "bg-slate-100 text-slate-400 hover:bg-slate-200" : ""
          }
        `}
        title={
          currentUser
            ? `Assigned to ${currentUser.fullName || currentUser.name}`
            : "Assign user"
        }
      >
        {currentUser ? (
          <Avatar className="w-6 h-6 border-2 border-white">
            <AvatarImage
              src={currentUser.avatarUrl || currentUser.avatar}
              className="object-cover"
            />
            <AvatarFallback className="text-[8px] bg-blue-600 text-white">
              {getInitials(currentUser.fullName || currentUser.name || "")}
            </AvatarFallback>
          </Avatar>
        ) : (
          <UserIcon className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-[240px] bg-white rounded-md shadow-xl z-[9999] border border-slate-200 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* User List */}
          <div className="max-h-[200px] overflow-y-auto py-1 custom-scrollbar">
            {/* Option Unassigned */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 flex items-center gap-2 group"
            >
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <UserIcon className="w-3 h-3" />
              </div>
              <span className="text-slate-600 font-medium">Unassigned</span>
              {currentAssigneeId === null && (
                <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />
              )}
            </button>

            {filteredUsers.length > 0 && (
              <div className="h-px bg-slate-100 my-1 mx-2"></div>
            )}

            {filteredUsers.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => {
                const userId = (user.userId ||
                  user.memberId ||
                  user.id) as number;
                const isSelected = currentAssigneeId === userId;
                return (
                  <button
                    key={userId}
                    type="button"
                    onClick={() => handleSelect(userId)}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2 ${
                      isSelected
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={user.avatarUrl || user.avatar} />
                      <AvatarFallback className="text-[8px] bg-blue-100 text-blue-700">
                        {getInitials(user.fullName || user.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {user.fullName || user.name}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3 h-3 ml-auto text-blue-600 flex-shrink-0" />
                    )}
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
// 3. MAIN COMPONENT
// =============================================================================

export default function BoardTaskCard({
  task,
  index,
  users = [],
  onClick,
  onUpdateSuccess,
}: BoardTaskCardProps) {
  // --- HOOKS ---
  const { showToast } = useToast();
  const router = useRouter();

  // --- DND-KIT ---
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
    opacity: isDragging ? 0 : 1, // Ẩn card gốc khi đang kéo
  };

  // --- STATE ---
  // Lấy ID từ nested object (task.assignee.id)
  const initialAssigneeId = task.assignee ? task.assignee.id : null;
  const [currentAssigneeId, setCurrentAssigneeId] = useState<number | null>(
    initialAssigneeId
  );

  // Sync state khi props task thay đổi (ví dụ sau khi reload)
  useEffect(() => {
    setCurrentAssigneeId(task.assignee ? task.assignee.id : null);
  }, [task.assignee]);

  // --- HANDLER ---
  const handleAssigneeUpdate = async (newAssigneeId: number | null) => {
    // 1. Optimistic Update (Cập nhật giao diện ngay lập tức)
    setCurrentAssigneeId(newAssigneeId);

    try {
      // 2. Gọi API Cập nhật
      await updateTask(task.id, { assigneeId: newAssigneeId });
      showToast("Assignee updated successfully", "success");

      // 3. Reload data để đồng bộ state tổng
      if (onUpdateSuccess) {
        onUpdateSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update assignee", error);
      showToast("Failed to update assignee", "error");

      // 4. Revert UI nếu lỗi
      setCurrentAssigneeId(task.assignee ? task.assignee.id : null);
    }
  };

  // Border color based on task type
  const borderClass =
    task.taskType === "BUG"
      ? "border-l-red-500"
      : task.taskType === "STORY"
      ? "border-l-green-500"
      : "border-l-blue-500";

  // --- RENDER ---
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(task)} // Click card để mở detail
      className={`
        bg-white rounded-[3px] shadow-sm mb-2 group relative transition-all duration-200 border border-slate-200
        hover:bg-[#f4f5f7] cursor-grab active:cursor-grabbing border-l-[3px]
        ${isDragging ? "opacity-0" : ""}
        ${borderClass}
      `}
    >
      <div className="p-3 pb-2">
        {/* Title */}
        <div className="mb-2">
          <p className="text-[14px] text-[#172B4D] leading-snug font-medium line-clamp-2 hover:text-blue-600 transition-colors">
            {task.title}
          </p>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between min-h-[24px]">
          {/* Left: Type & Code */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <TypeIcon type={task.taskType} />
            <span className="text-[11px] font-semibold text-[#5E6C84] hover:underline">
              {task.taskCode}
            </span>
          </div>

          {/* Right: Priority & Assignee */}
          <div className="flex items-center gap-1.5 relative z-10">
            {/* Priority Icon (Tooltip on hover) */}
            <div
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-colors cursor-pointer"
              title={`Priority: ${task.priority}`}
              onPointerDown={(e) => e.stopPropagation()} // Chặn kéo thả tại icon này
            >
              <PriorityIcon priority={task.priority} />
            </div>

            {/* Assignee Selection */}
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
