"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskSummary } from "@/services/apiProject";
import { Bookmark, Bug, CheckCircle2, ArrowUp, ArrowDown, Minus, User as UserIcon, Check, Search, ChevronRight, Plus, Circle } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { updateTask } from "@/services/apiTask";

// --- MOCK SUBTASK INTERFACE ---
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

// --- ICONS CONFIG ---
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG": return <Bug className="w-3.5 h-3.5 text-red-500 fill-red-50" />;
    case "STORY": return <Bookmark className="w-3.5 h-3.5 text-green-600 fill-green-50" />;
    default: return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />;
  }
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  if (priority === 'URGENT') return <ArrowUp className="w-3.5 h-3.5 text-red-600" />;
  if (priority === 'HIGH') return <ArrowUp className="w-3.5 h-3.5 text-orange-500" />;
  if (priority === 'LOW') return <ArrowDown className="w-3.5 h-3.5 text-slate-400" />;
  return <Minus className="w-3.5 h-3.5 text-yellow-500 rotate-90" />;
};

// --- INTERFACES ĐÃ SỬA ---
// ✅ Update: Cho phép id tùy chọn, thêm memberId để khớp với ProjectMember
export interface BoardUser {
  id?: number | string;       
  userId?: number | string;   
  memberId?: number | string; // Thêm trường này
  name?: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
}

interface BoardTaskCardProps {
  task: TaskSummary & { subtasks?: Subtask[] };
  index: number;
  users?: BoardUser[]; // Sử dụng BoardUser thay vì User cũ
  onClick?: (task: TaskSummary) => void;
}

// --- JIRA-STYLE ASSIGNEE DROPDOWN ---
const AssigneeDropdown = ({ 
  taskId, 
  currentAssigneeId, 
  users = [], 
  onUpdate 
}: { 
  taskId: number; 
  currentAssigneeId: number | null; 
  users: BoardUser[]; 
  onUpdate: (id: number | null) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Logic tìm user: Check cả userId, memberId và id
  const currentUser = users.find(u => (u.userId || u.memberId || u.id) === currentAssigneeId);

  const filteredUsers = users.filter(user => {
    const name = (user.fullName || user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(""); 
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (userId: number | null) => {
    onUpdate(userId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'UN';
  
  const getAvatarColor = (id: number) => {
    const colors = ['bg-[#FF5630]', 'bg-[#36B37E]', 'bg-[#6554C0]', 'bg-[#00B8D9]', 'bg-[#FFAB00]'];
    return colors[id % colors.length];
  };

  return (
    <div className="relative" ref={dropdownRef} onPointerDown={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center w-6 h-6 rounded-full transition-all border border-transparent
          ${!currentUser ? 'bg-slate-200 hover:bg-slate-300 text-slate-500' : ''}
          hover:ring-2 hover:ring-blue-100 focus:outline-none
        `}
        title={currentUser ? `Assigned to ${currentUser.fullName || currentUser.name}` : "Assign user"}
      >
        {currentUser ? (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${getAvatarColor(Number(currentUser.userId || currentUser.memberId || currentUser.id))}`}>
            {currentUser.avatarUrl || currentUser.avatar ? (
               <img src={currentUser.avatarUrl || currentUser.avatar} alt="avatar" className="w-full h-full rounded-full object-cover"/>
            ) : (
               getInitials(currentUser.fullName || currentUser.name || '')
            )}
          </div>
        ) : (
          <UserIcon className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-[260px] bg-white rounded-lg shadow-[0_4px_12px_-2px_rgba(0,0,0,0.16)] z-50 border border-slate-200 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col overflow-hidden"
        >
          <div className="p-3 border-b border-slate-100">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input 
                  ref={inputRef}
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-[3px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          
          <div className="max-h-[220px] overflow-y-auto py-1">
            <button
              onClick={() => handleSelect(null)}
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 flex items-center gap-3 group"
            >
               <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-slate-300 transition-colors">
                  <UserIcon className="w-3.5 h-3.5" />
               </div>
               <span className="text-slate-700 font-medium">Unassigned</span>
               {currentAssigneeId === null && <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />}
            </button>

            {filteredUsers.length > 0 && <div className="h-px bg-slate-100 my-1 mx-3"></div>}
            
            {filteredUsers.length === 0 ? (
               <div className="px-4 py-3 text-xs text-slate-500 text-center">No users found</div>
            ) : (
              filteredUsers.map((user) => {
                 // ✅ Lấy ID chuẩn xác từ 1 trong 3 trường
                 const userId = (user.userId || user.memberId || user.id) as number;
                 const isSelected = currentAssigneeId === userId;
                 return (
                  <button
                    key={userId}
                    onClick={() => handleSelect(userId)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3 ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold ${getAvatarColor(userId)}`}>
                       {user.avatarUrl || user.avatar ? (
                          <img src={user.avatarUrl || user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover"/>
                       ) : (
                          getInitials(user.fullName || user.name || '')
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-[13px]">{user.fullName || user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate leading-none mt-0.5">{user.email}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-blue-600 flex-shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function BoardTaskCard({ task, index, users = [], onClick }: BoardTaskCardProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const sortableId = useMemo(() => task.id.toString(), [task.id]);

  const [localAssigneeId, setLocalAssigneeId] = useState<number | null>((task as any).assigneeId || null);

  useEffect(() => {
    setLocalAssigneeId((task as any).assigneeId || null);
  }, [(task as any).assigneeId]);

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
    opacity: isDragging ? 0 : 1,
  };

  const handleAssigneeUpdate = async (newAssigneeId: number | null) => {
    setLocalAssigneeId(newAssigneeId);
    try {
      await updateTask(task.id, { assigneeId: newAssigneeId });
      showToast("Assignee updated", "success");
      router.refresh(); 
    } catch (error) {
      console.error("Failed to update assignee", error);
      showToast("Failed to update assignee", "error");
      setLocalAssigneeId((task as any).assigneeId || null);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // Trigger modal open on click
      onClick={() => onClick && onClick(task)}
      className={`
        bg-white rounded-[3px] shadow-[0px_1px_2px_0px_rgba(9,30,66,0.15)] mb-2 group relative transition-all duration-200
        hover:bg-[#ebecf0] cursor-grab active:cursor-grabbing border-l-[3px]
        ${isDragging ? "opacity-0" : ""}
        ${task.taskType === 'BUG' ? 'border-l-red-500' : task.taskType === 'STORY' ? 'border-l-green-500' : 'border-l-blue-500'}
      `}
    >
      <div className="p-3 pb-2">
        <div className="mb-3">
          <p className="text-[14px] text-[#172B4D] leading-snug hover:text-blue-600 hover:underline cursor-pointer font-medium line-clamp-2">
            {task.title}
          </p>
        </div>

        <div className="flex items-center justify-between min-h-[24px]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-500" title={task.taskType}>
                <TypeIcon type={task.taskType} />
                <span className="text-[11px] font-semibold text-[#5E6C84] hover:text-[#172B4D] cursor-pointer">
                {task.taskCode}
                </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div 
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200/60 cursor-pointer transition-colors" 
              title={`Priority: ${task.priority}`}
              onPointerDown={(e) => e.stopPropagation()} 
            >
              <PriorityIcon priority={task.priority} />
            </div>

            <AssigneeDropdown 
              taskId={task.id}
              currentAssigneeId={localAssigneeId} 
              users={users}
              onUpdate={handleAssigneeUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}