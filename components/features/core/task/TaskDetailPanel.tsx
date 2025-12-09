"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { 
  X, Loader2, Flag, User, Clock, Layers, 
  MoreHorizontal, Link as LinkIcon, Zap,
  Bold, Italic, List, ListOrdered, Code,
  Tag as TagIcon, Plus, ChevronDown,
Maximize2,Archive
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import TagModal from "@/components/features/core/tag/TagModal"; 
import EpicModal from "@/components/features/core/epic/EpicModal"; 
// API Services
import { getTaskDetails, updateTask, updateTaskEpic, TaskDetail, UpdateTaskData ,archiveTask} from "@/services/apiTask";
import {
    getSubtaskList,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    Subtask
} from "@/services/apiSubTask";
import { apiTag, Tag } from "@/services/apiTag"; // Import Tag API

import { useToast } from "@/components/ui/ToastProvider";
import SubtaskDetailView from "./SubtaskDetailView";
// Components Con
import TaskComment from "@/components/features/core/task/TaskComment";
import TaskSubtasks from "@/components/features/core/task/TaskSubtasks";

// --- HELPER COMPONENTS ---

const PrioritySelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const colors: Record<string, string> = {
    URGENT: "text-red-700 bg-red-50 border-red-200",
    HIGH: "text-orange-700 bg-orange-50 border-orange-200",
    MEDIUM: "text-blue-700 bg-blue-50 border-blue-200",
    LOW: "text-slate-600 bg-slate-100 border-slate-200"
  };
  return (
    <div className="relative group w-full">
      <select 
        className={`appearance-none w-full text-xs font-bold px-3 py-1.5 rounded border ${colors[value] || colors.LOW} focus:ring-2 focus:ring-offset-1 outline-none cursor-pointer uppercase transition-all`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>
      <ChevronDown className="w-3 h-3 absolute right-2 top-2 text-current opacity-50 pointer-events-none"/>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface Props {
  taskId: number | null;
  onClose: () => void;
  onUpdate?: () => void;
  onSwitchToFloating?: () => void;
  members?: any[]; 
  sprints?: any[]; 
  epics?: any[]; 
  statuses?: any[];
  companyId: number;
  workspaceId: number;
  projectId: number;
}

interface ExtendedTaskDetail extends TaskDetail {
  tags?: Tag[];
}

export default function TaskDetailPanel({ 
  taskId, 
  onClose, 
  onUpdate, 
  onSwitchToFloating,
  members = [], 
  sprints = [], 
  epics = [],
  statuses = [],
  companyId,
  workspaceId,
  projectId
}: Props) {
  const { showToast } = useToast();
  
  // State Data
  const [task, setTask] = useState<ExtendedTaskDetail | null>(null);
  const [formData, setFormData] = useState<UpdateTaskData>({});
  
  // State UI
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Subtask State
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // --- TAGS STATE ---
  const [allProjectTags, setAllProjectTags] = useState<Tag[]>([]);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  
  // --- EPIC MODAL STATE ---
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<number | null>(null);
  //archive
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  //
  const [subtaskToDelete, setSubtaskToDelete] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingSubtask, setIsDeletingSubtask] = useState(false);
  // Refs
  const tagButtonRef = useRef<HTMLButtonElement>(null);
  const tagPopoverRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  //Tag Details Modal
const [editingTag, setEditingTag] = useState<Tag | null>(null);
  // Click outside Tag Popover
//   useEffect(() => {
//     if (task) {
//       console.group("--- DEBUG ASSIGNEE ---");
//       console.log("1. ID Assignee trong Task:", task.assigneeId, typeof task.assigneeId);
      
//       const memberIds = members.map(m => m.userId || m.id);
//       console.log("2. Danh sách ID Members có sẵn:", memberIds);
      
//       // Kiểm tra xem ID có tồn tại trong danh sách không
//       const exists = memberIds.includes(task.assigneeId as any); // ép kiểu để check nhanh
//       console.log("3. Có tìm thấy Assignee trong Members không?", exists ? "✅ CÓ" : "❌ KHÔNG");
      
//       // Kiểm tra kiểu dữ liệu (Rất quan trọng: '1' khác 1)
//       if (members.length > 0) {
//          const firstMemberId = members[0].userId || members[0].id;
//          console.log("4. Kiểu dữ liệu ID của Member đầu tiên:", typeof firstMemberId);
//       }
//       console.groupEnd();
//     }
//   }, [task, members]);
  useEffect(() => {
    function handleClickOutside(event: any) {
        if (tagPopoverRef.current && !tagPopoverRef.current.contains(event.target) && !tagButtonRef.current?.contains(event.target)) {
            setIsTagPopoverOpen(false);
            setTagSearch(""); // Reset search when closing
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when popover opens
  useEffect(() => {
    if (isTagPopoverOpen && tagInputRef.current) {
        setTimeout(() => tagInputRef.current?.focus(), 50);
    }
  }, [isTagPopoverOpen]);
  
  // LOAD DATA
  useEffect(() => {
    if (taskId) {
      setLoading(true);
      
      getTaskDetails(taskId)
        .then(data => {
          // 1. 🔥 TÍNH TOÁN CÁC ID AN TOÀN TRƯỚC (Ưu tiên lấy từ object lồng nhau)
          const safeAssigneeId = data.assignee?.id ?? data.assigneeId ?? null;
          const safeStatusId = data.status?.id ?? data.statusId;
          const safeSprintId = data.sprint?.id ?? data.sprintId ?? null;
          const safeEpicId = data.epic?.id ?? data.epicId ?? null;

          // 2. 🔥 CẬP NHẬT STATE TASK VỚI CÁC ID ĐÃ ĐƯỢC TÍNH TOÁN
          // (Phải làm bước này thì task.assigneeId mới có giá trị 5)
          setTask({
              ...data,
              assigneeId: safeAssigneeId,
              sprintId: safeSprintId,
              epicId: safeEpicId,
              statusId: safeStatusId,
              // Map thêm thông tin hiển thị nếu API trả về object assignee nhưng thiếu assigneeName ở ngoài
              assigneeName: data.assignee?.name || data.assigneeName,
              assigneeAvatar: data.assignee?.avatarUrl || data.assigneeAvatar
          } as ExtendedTaskDetail);

          // 3. Cập nhật Form Data cho các thẻ Input/Select
          setFormData({
            title: data.title,
            description: data.description || "",
            taskType: data.taskType,
            priority: data.priority,
            
            statusId: safeStatusId,
            sprintId: safeSprintId,
            epicId: safeEpicId,
            assigneeId: safeAssigneeId,
            
            storyPoints: data.storyPoints || 0,
            estimatedHours: data.estimatedHours || 0,
            startDate: data.startDate || undefined,
            dueDate: data.dueDate || undefined,
          });
        })
        .catch((err) => {
            console.error(err);
            showToast("Không thể tải thông tin công việc", "error");
        })
        .finally(() => setLoading(false));

       fetchSubtasks(taskId);
       apiTag.getTags(companyId, workspaceId, projectId).then(setAllProjectTags);
    }
  }, [taskId, companyId, workspaceId, projectId]);

  const fetchSubtasks = async (id: number) => {
      try {
          const data = await getSubtaskList(companyId, workspaceId, projectId, id);
          setSubtasks(Array.isArray(data) ? data : []);
      } catch (error) {
          console.error(error);
      }
  };

  // --- TAG HANDLERS ---

  // Filter tags based on search input
  const filteredTags = useMemo(() => {
      if (!tagSearch.trim()) return allProjectTags;
      return allProjectTags.filter(t => 
          t.name.toLowerCase().includes(tagSearch.toLowerCase())
      );
  }, [allProjectTags, tagSearch]);

  const handleAddTag = async (tag: Tag) => {
    if (!taskId) return;
    const currentTags = task?.tags || [];
    
    // Prevent duplicate
    if (currentTags.find(t => t.id === tag.id)) {
        setIsTagPopoverOpen(false);
        setTagSearch("");
        return;
    }

    // Optimistic update
    const newTags = [...currentTags, tag];
    setTask(prev => prev ? { ...prev, tags: newTags } : null);
    setIsTagPopoverOpen(false);
    setTagSearch("");

    try {
        await apiTag.assignTagToTask(companyId, workspaceId, projectId, taskId, tag.id);
        showToast("Đã thêm thẻ", "success");
    } catch (error) {
        setTask(prev => prev ? { ...prev, tags: currentTags } : null); // Revert
        showToast("Lỗi khi thêm thẻ", "error");
    }
  };

  const handleCreateNewTag = async () => {
      if (!taskId || !tagSearch.trim()) return;
      
      try {
          // 1. Create Tag
          const newTag = await apiTag.createTag(companyId, workspaceId, projectId, {
              name: tagSearch.trim(),
              color: "#95a5a6"
          });
          
          // 2. Update local list
          setAllProjectTags(prev => [...prev, newTag]);
          
          // 3. Assign to task
          handleAddTag(newTag);

      } catch (error) {
          showToast("Lỗi khi tạo thẻ mới", "error");
      }
  };

  const handleRemoveTag = async (tagId: number) => {
    if (!taskId) return;
    const currentTags = task?.tags || [];
    const newTags = currentTags.filter(t => t.id !== tagId);
    
    setTask(prev => prev ? { ...prev, tags: newTags } : null);
    
    try {
        await apiTag.removeTagFromTask(companyId, workspaceId, projectId, taskId, tagId);
    } catch (error) {
        setTask(prev => prev ? { ...prev, tags: currentTags } : null); // Revert
        showToast("Lỗi khi xóa thẻ", "error");
    }
  };

  // --- MAIN UPDATE HANDLER ---
  const handleUpdate = async (field: keyof UpdateTaskData, value: any) => {
    if (!task || !taskId) return;
    
    // 1. Update form data local
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 2. OPTIMISTIC UI UPDATES

    // -> Fix Assignee: Cập nhật Avatar và Tên
    if (field === 'assigneeId') {
        const userId = Number(value);
        if (userId === 0) {
            setTask(prev => prev ? ({ ...prev, assigneeId: null, assigneeName: null, assigneeAvatar: null }) : null);
        } else {
            const user = members.find(m => (m.userId || m.id) === userId);
            if (user) {
                setTask(prev => prev ? ({ 
                    ...prev, 
                    assigneeId: userId,
                    assigneeName: user.fullName || user.name,
                    assigneeAvatar: user.avatarUrl || user.avatar
                }) : null);
            }
        }
    }

    // -> Fix Status: Cập nhật Màu và Tên Status
    if (field === 'statusId') {
        const newStatusId = Number(value);
        const statusObj = statuses.find(s => s.id === newStatusId);
        if (statusObj) {
            setTask(prev => prev ? ({ 
                ...prev, 
                statusId: newStatusId, 
                statusName: statusObj.name, 
                statusColor: statusObj.color 
            }) : null);
        }
    }

    // 3. Prepare Payload
    let payloadValue = value;
    if (field === 'startDate' || field === 'dueDate') payloadValue = value ? new Date(value).toISOString() : null;
    if (field === 'storyPoints' || field === 'estimatedHours') payloadValue = Number(value);
    
    if (['sprintId', 'epicId', 'assigneeId'].includes(field) && (value === 0 || value === "0")) {
        payloadValue = null;
    }

    // 4. Call API
    try {
      setIsSaving(true);
      await updateTask(taskId, { [field]: payloadValue });
      if (onUpdate) onUpdate(); 
    } catch (error) {
      console.error(error);
      showToast("Cập nhật thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // --- ARCHIVE HANDLER ---
    const onClickArchive = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Ngăn click lan ra ngoài
      setIsArchiveConfirmOpen(true);
    };
    const onConfirmArchive = async () => {
      if (!taskId) return;
  
      try {
        setIsSaving(true); // Tận dụng state loading có sẵn hoặc tạo mới
        await archiveTask(taskId);
  
        showToast("Đã lưu trữ task thành công", "success");
  
        // Đóng modal chi tiết
        onClose();
  
        // Quan trọng: Gọi onUpdate để refresh danh sách ở màn hình cha
        if (onUpdate) {
          onUpdate();
        }
      } catch (error: any) {
        showToast(error.message || "Lỗi khi lưu trữ task", "error");
      } finally {
        setIsSaving(false);
      }
    };
  // Subtask Handlers (Giữ nguyên)
  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim() || !taskId) return;
    try {
        await createSubtask(companyId, workspaceId, projectId, taskId, { title: newSubtaskTitle });
        setNewSubtaskTitle("");
        setIsAddingSubtask(false);
        fetchSubtasks(taskId);
    } catch (error) { showToast("Failed to create subtask", "error"); }
  };
  const handleToggleSubtask = async (subtask: Subtask) => {
    if (!taskId) return;
    const newStatus = subtask.status === 'DONE' ? 'TO_DO' : 'DONE';
    setSubtasks(prev => prev.map(s => s.id === subtask.id ? { ...s, status: newStatus } : s));
    try { await updateSubtask(companyId, workspaceId, projectId, taskId, subtask.id, { status: newStatus }); }
    catch (error) { fetchSubtasks(taskId); }
  };
  // 1. Hàm này gắn vào nút thùng rác: Chỉ mở Modal
  const handleDeleteSubtask = (subTaskId: number) => {
    setSubtaskToDelete(subTaskId);
    setIsDeleteConfirmOpen(true);
  };

  // 2. Hàm này gắn vào nút Confirm của Modal: Gọi API xóa thật
  const onConfirmDeleteSubtask = async () => {
    if (!taskId || !subtaskToDelete) return;
    
    setIsDeletingSubtask(true); // Hiện loading trên nút
    
    // Optimistic Update: Xóa trên giao diện trước
    const previousSubtasks = [...subtasks];
    setSubtasks(prev => prev.filter(s => s.id !== subtaskToDelete));

    try {
        await deleteSubtask(companyId, workspaceId, projectId, taskId, subtaskToDelete);
        showToast("Đã xóa công việc phụ", "success");
        setIsDeleteConfirmOpen(false); // Đóng modal khi xong
    } catch (error) {
        setSubtasks(previousSubtasks); // Hoàn tác nếu lỗi
        showToast("Xóa thất bại", "error");
    } finally {
        setIsDeletingSubtask(false);
        setSubtaskToDelete(null);
    }
  };
  const handleSaveDescription = async () => {
    if (!taskId) return;
    await handleUpdate('description', formData.description);
    setIsEditingDescription(false);
  };

  const toInputDate = (iso?: string | null) => iso ? new Date(iso).toISOString().slice(0, 16) : "";

    if (!taskId) return null;
    // --- EPIC MODAL HANDLER ---
    const handleEpicChange = async (selectedEpic: any | null) => {
      // 1. OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức
      const newEpicId = selectedEpic ? selectedEpic.id : null;
      
      setTask(prev => prev ? { 
          ...prev, 
          epicId: newEpicId,
          // Nếu null (bỏ chọn), set epic object thành null luôn để UI render đúng
          epic: selectedEpic ? {
              id: selectedEpic.id,
              name: selectedEpic.name,
              color: selectedEpic.color
          } : null
      } : null);

      setFormData(prev => ({ ...prev, epicId: newEpicId }));

      // 2. CALL API & SYNC
      try {
          setIsSaving(true);
          
          // ✅ SỬ DỤNG API PATCH (updateTaskEpic) ĐỂ XỬ LÝ CHÍNH XÁC VIỆC GỠ (NULL)
          const updatedTaskData = await updateTaskEpic(taskId!, newEpicId);
          
          // Cập nhật lại state bằng dữ liệu chuẩn từ Backend
          setTask(updatedTaskData as ExtendedTaskDetail);
          
          if (onUpdate) onUpdate();
      } catch (error) {
          showToast("Cập nhật Epic thất bại", "error");
          // Revert nếu cần thiết (logic revert phức tạp hơn chút nên tạm bỏ qua ở đây)
      } finally {
          setIsSaving(false);
      }
  };

  // --- THÊM HÀM NÀY ĐỂ XỬ LÝ UPDATE SUBTASK (ASSIGNEE, TITLE...) ---
  const handleUpdateSubtask = async (subTaskId: number, data: any) => {
    if (!taskId) return;

    // 1. Optimistic Update (Cập nhật UI ngay lập tức để không bị giật)
    setSubtasks(prev => prev.map(s => {
        if (s.id === subTaskId) {
            // Nếu đang update người gán
            if (data.assigneeId !== undefined) {
                if (data.assigneeId === 0 || data.assigneeId === null) {
                    return { ...s, ...data, assigneeId: null, assigneeName: null, assigneeAvatar: null };
                }
                // Tìm thông tin member để hiển thị avatar ngay
                const member = members.find(m => (m.userId || m.id) === Number(data.assigneeId));
                return { 
                    ...s, 
                    ...data, 
                    assigneeId: Number(data.assigneeId),
                    assigneeName: member?.fullName || member?.name, 
                    assigneeAvatar: member?.avatarUrl || member?.avatar 
                };
            }
            // Các trường khác (title...)
            return { ...s, ...data };
        }
        return s;
    }));

    // 2. Call API
    try {
        await updateSubtask(companyId, workspaceId, projectId, taskId, subTaskId, data);
    } catch (error) {
        console.error("Lỗi update subtask:", error);
        showToast("Cập nhật thất bại", "error");
        fetchSubtasks(taskId); // Revert lại dữ liệu gốc nếu lỗi
    }
  };
  
 if (!taskId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]" onClick={onClose}>
      <div className="w-full md:w-[800px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* ✅ LOGIC MỚI: Kiểm tra xem có đang chọn Subtask không */}
        {selectedSubtaskId ? (
          // 🟢 TRƯỜNG HỢP 1: HIỆN MÀN HÌNH SUBTASK DETAIL
          <SubtaskDetailView 
            subtaskId={selectedSubtaskId}
            taskId={taskId}
            companyId={companyId}
            workspaceId={workspaceId}
            projectId={projectId}
            members={members}
            onBack={() => setSelectedSubtaskId(null)} // Quay lại màn Task cha
            onClose={onClose} // Đóng toàn bộ Popup
            onUpdateParent={() => fetchSubtasks(taskId)} // Refresh list ở cha
          />
        ) : (
          // 🔴 TRƯỜNG HỢP 2: HIỆN GIAO DIỆN TASK DETAIL CŨ (Header + Body)
          <>
            {/* --- HEADER CŨ --- */}
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
              <div className="flex items-center gap-3">
                  {/* Epic (Jira Style) */}
                  {task && (
                    <div 
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${task.epic ? "hover:bg-purple-50" : "hover:bg-slate-100"}`} 
                      onClick={() => setIsEpicModalOpen(true)}
                    >
                      {task.epic ? (
                          <>
                              <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: task.epic.color || '#a855f7' }}></div>
                              <span className="text-sm font-medium truncate max-w-[120px]" style={{ color: task.epic.color || '#a855f7' }}>
                                  {task.epic.name}
                              </span>
                          </>
                      ) : (
                          <span className="text-sm text-slate-400 flex items-center gap-1 italic group-hover:text-slate-600">
                              <Plus className="w-3 h-3"/> Epic
                          </span>
                      )}
                  </div>
                  )}
                  
                  <div className="h-4 w-px bg-slate-200 mx-1"></div>
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{task?.taskCode}</span>
                  {isSaving && <span className="text-xs text-blue-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Saving...</span>}
              </div>
                  
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        onClick={onClickArchive}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Archive className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Lưu trữ Task</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                {onSwitchToFloating && (
                    
                    <button 
                      onClick={onSwitchToFloating} 
                      className="p-2 hover:bg-slate-100 rounded-md text-slate-500 hover:text-blue-600 transition-colors"
                      title="Mở rộng cửa sổ"
                    >
                      <Maximize2 className="w-4 h-4"/>
                    </button>
                  )}
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-4 h-4 text-slate-500"/></button>
              </div>
            </div>

            {/* --- BODY CŨ --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              {loading ? (
                  <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin"/></div>
              ) : task ? (
                <div className="flex flex-col min-h-full">
                    
                    {/* --- LEFT COLUMN (65%) --- */}
                    <div className="flex-1 p-8 border-r border-slate-100">
                        {/* Title */}
                        <input 
                            className="w-full text-2xl font-bold text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-300 focus:ring-0 p-0 mb-6"
                            value={formData.title || ''}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            onBlur={e => handleUpdate('title', e.target.value)}
                            placeholder="Task Title"
                        />

                        {/* Description */}
                        <div className="space-y-2 group mb-8">
                            <h3 className="text-sm font-bold text-slate-900">Description</h3>
                            {isEditingDescription ? (
                                <div className="border border-blue-500 rounded-md p-2">
                                    <Textarea 
                                        className="min-h-[150px] border-none focus-visible:ring-0 resize-none text-sm"
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button size="sm" onClick={handleSaveDescription}>Save</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditingDescription(false)}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    className="min-h-[60px] text-sm text-slate-700 hover:bg-slate-50 p-2 rounded cursor-pointer border border-transparent hover:border-slate-200"
                                    onClick={() => setIsEditingDescription(true)}
                                >
                                    {formData.description ? <div className="whitespace-pre-wrap">{formData.description}</div> : <span className="text-slate-400 italic">Add description...</span>}
                                </div>
                            )}
                        </div>

                        {/* Subtasks */}
                        <TaskSubtasks 
                            subtasks={subtasks}
                            members={members}
                            onToggleStatus={handleToggleSubtask}
                            onDelete={(id) => handleDeleteSubtask(Number(id))}
                            onAddSubtask={() => setIsAddingSubtask(true)}
                            onAssigneeChange={(subTaskId, userId) => handleUpdateSubtask(subTaskId, { assigneeId: userId })}
                            onEditContent={(subTaskId, data) => handleUpdateSubtask(subTaskId, data)}
                           // 👉 Thêm sự kiện view detail
                        onViewDetail={(subId) => setSelectedSubtaskId(subId)}
                        />
                          
                          {isAddingSubtask && (
                            <div className="mt-2 flex gap-2">
                                <Input 
                                    value={newSubtaskTitle} 
                                    onChange={e => setNewSubtaskTitle(e.target.value)} 
                                    onKeyDown={e => e.key === 'Enter' && handleCreateSubtask()}
                                    autoFocus placeholder="Subtask title..." 
                                    className="h-9 text-sm"
                                />
                                <Button size="sm" onClick={handleCreateSubtask} className="h-9">Add</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsAddingSubtask(false)} className="h-9">Cancel</Button>
                            </div>
                          )}

                        {/* Comments */}
                        <div className="mt-8">
                              <TaskComment taskId={taskId} />
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN (35%) --- */}
                    <div className="w-full md:w-full bg-slate-50/80 p-6 space-y-6 shrink-0 border-l border-slate-100">
                        
                        {/* STATUS SELECTOR */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase">Status</label>
                            <div className="relative">
                                <select 
                                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-md text-sm font-bold shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 appearance-none uppercase"
                                    value={formData.statusId || ''}
                                    onChange={e => handleUpdate('statusId', Number(e.target.value))}
                                    style={{ 
                                        color: task.statusColor || 'inherit',
                                        borderLeftWidth: '4px',
                                        borderLeftColor: task.statusColor || 'transparent'
                                    }}
                                >
                                    {statuses.length > 0 ? (
                                        statuses.map(st => <option key={st.id} value={st.id}>{st.name}</option>)
                                    ) : (
                                        <option value={0}>Loading...</option>
                                    )}
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none"/>
                            </div>
                        </div>

                        <hr className="border-slate-200"/>

                        {/* ASSIGNEE & REPORTER */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase">People</h4>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-600"><User className="w-4 h-4"/> Assignee</div>
                                <div className="relative group min-w-[140px]">
                                    <div className="flex items-center justify-end gap-2 cursor-pointer hover:bg-slate-200 px-2 py-1.5 rounded transition-all">
                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border border-white shadow-sm shrink-0">
                                            {task.assigneeAvatar ? (
                                                <img src={task.assigneeAvatar} className="w-full h-full object-cover" alt="Avatar"/>
                                            ) : (
                                                <User className="w-3.5 h-3.5 text-slate-400"/>
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium truncate max-w-[120px] ${!task.assigneeName ? 'text-slate-400 italic' : 'text-slate-700'}`}>
                                            {task.assigneeName || "Unassigned"}
                                        </span>
                                    </div>
                                    <select 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        value={formData.assigneeId ? String(formData.assigneeId) : "0"}
                                        onChange={e => handleUpdate('assigneeId', Number(e.target.value))}
                                    >
                                        <option value="0">Unassigned</option>
                                        {members.map(m => (
                                            <option key={m.userId || m.id} value={String(m.userId || m.id)}>
                                                {m.fullName || m.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-slate-500">
                                  <div className="flex items-center gap-2 text-sm"><Zap className="w-4 h-4"/> Reporter</div>
                                  <span className="text-sm text-slate-700">{task.createdByName || "Unknown"}</span>
                            </div>
                        </div>

                        <hr className="border-slate-200"/>
                                
                        {/* TAGS SECTION */}
                        <div className="space-y-3 relative" ref={tagPopoverRef}>
                            <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-bold text-slate-400 uppercase">Tags</label>
                                  <button 
                                    ref={tagButtonRef}
                                    onClick={() => setIsTagPopoverOpen(!isTagPopoverOpen)}
                                    className="text-slate-500 hover:text-blue-600 transition-colors p-1 hover:bg-slate-200 rounded"
                                  >
                                    <Plus className="w-4 h-4"/>
                                  </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                    {task.tags && task.tags.length > 0 ? (
                                        task.tags.map(tag => (
                                            <div 
                                                key={tag.id} 
                                                className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-700 group cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all"
                                                onClick={() => setEditingTag(tag)}
                                            >
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                                {tag.name}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveTag(tag.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-1 p-0.5 rounded-full hover:bg-slate-200"
                                                >
                                                    <X className="w-3 h-3"/>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No tags</span>
                                    )}
                            </div>

                            {/* Tag Popover */}
                            {isTagPopoverOpen && (
                                <div className="absolute right-0 top-8 z-20 w-56 bg-white rounded-md shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-100">
                                    <Input 
                                        ref={tagInputRef}
                                        placeholder="Search or create tag..."
                                        className="h-8 text-xs mb-2"
                                        value={tagSearch}
                                        onChange={(e) => setTagSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && tagSearch.trim()) {
                                                const exactMatch = allProjectTags.find(t => t.name.toLowerCase() === tagSearch.trim().toLowerCase());
                                                if (exactMatch) handleAddTag(exactMatch);
                                                else handleCreateNewTag();
                                            }
                                        }}
                                    />
                                    <div className="text-[10px] text-slate-400 px-2 py-1 border-b border-slate-50 uppercase font-bold">Select an option</div>
                                    <div className="max-h-40 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                                        {filteredTags.length > 0 ? (
                                            filteredTags.filter(t => !task.tags?.find(tt => tt.id === t.id)).map(tag => (
                                                <button
                                                    key={tag.id}
                                                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 rounded flex items-center gap-2 transition-colors"
                                                    onClick={() => handleAddTag(tag)}
                                                >
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                                    {tag.name}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-2 py-2 text-xs text-slate-500 italic text-center">No existing tags match</div>
                                        )}
                                        {tagSearch.trim() && !allProjectTags.find(t => t.name.toLowerCase() === tagSearch.trim().toLowerCase()) && (
                                            <button
                                                className="w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 text-blue-600 font-medium rounded flex items-center gap-2 border-t border-slate-100 mt-1 pt-2"
                                                onClick={handleCreateNewTag}
                                            >
                                                <Plus className="w-3 h-3" />
                                                Create "{tagSearch}"
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-200"/>

                        {/* Planning (Epic/Sprint) */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase">Planning</h4>
                            
                            {/* Priority */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-600"><Flag className="w-4 h-4"/> Priority</div>
                                <div className="w-[120px]">
                                    <PrioritySelect value={formData.priority || 'LOW'} onChange={(v) => handleUpdate('priority', v)} />
                                </div>
                            </div>

                            {/* Sprint */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-600"><Clock className="w-4 h-4"/> Sprint</div>
                                <select 
                                    className="w-full text-sm text-right bg-transparent border-none outline-none text-slate-700 hover:text-blue-600 font-medium cursor-pointer truncate transition-colors hover:bg-slate-100 rounded px-2 py-1 appearance-none"
                                    value={Number(formData.sprintId) || 0}
                                    onChange={e => handleUpdate('sprintId', Number(e.target.value))}
                                >
                                    <option value={0}>Backlog</option>
                                    {sprints.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Time Tracking */}
                        <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-2.5 rounded border border-slate-200">
                                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Points</label>
                                <input 
                                    type="number" min="0" className="w-full font-bold text-slate-800 outline-none text-sm"
                                    value={formData.storyPoints || ''}
                                    onChange={e => setFormData({...formData, storyPoints: Number(e.target.value)})}
                                    onBlur={e => handleUpdate('storyPoints', Number(e.target.value))}
                                />
                              </div>
                              <div className="bg-white p-2.5 rounded border border-slate-200">
                                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Est. Hours</label>
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="number" min="0" className="w-full font-bold text-slate-800 outline-none text-sm"
                                        value={formData.estimatedHours || ''}
                                        onChange={e => setFormData({...formData, estimatedHours: Number(e.target.value)})}
                                        onBlur={e => handleUpdate('estimatedHours', Number(e.target.value))}
                                    />
                                    <span className="text-xs text-slate-400">h</span>
                                </div>
                              </div>
                        </div>

                        <hr className="border-slate-200"/>

                        {/* Dates */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase">Timeline</h4>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-slate-600 font-medium">
                                    <span>Start Date</span>
                                </div>
                                <input 
                                    type="datetime-local"
                                    className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-700 outline-none focus:border-blue-500"
                                    value={toInputDate(formData.startDate)}
                                    onChange={e => handleUpdate('startDate', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-slate-600 font-medium">
                                    <span>Due Date</span>
                                    {task.dueDate && new Date(task.dueDate) < new Date() && (
                                        <span className="text-red-500 font-bold text-[10px]">Overdue</span>
                                    )}
                                </div>
                                <input 
                                    type="datetime-local"
                                    className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-700 outline-none focus:border-blue-500"
                                    value={toInputDate(formData.dueDate)}
                                    onChange={e => handleUpdate('dueDate', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* --- MODALS --- */}
                        <TagModal 
                            isOpen={!!editingTag}
                            onClose={() => setEditingTag(null)}
                            tag={editingTag}
                            companyId={companyId}
                            workspaceId={workspaceId}
                            projectId={projectId}
                            onUpdate={(updatedTag) => {
                                setAllProjectTags(prev => prev.map(t => t.id === updatedTag.id ? updatedTag : t));
                                setTask(prev => prev ? {
                                    ...prev,
                                    tags: prev.tags?.map(t => t.id === updatedTag.id ? updatedTag : t)
                                } : null);
                            }}
                            onDelete={(deletedTagId) => {
                                setAllProjectTags(prev => prev.filter(t => t.id !== deletedTagId));
                                setTask(prev => prev ? {
                                    ...prev,
                                    tags: prev.tags?.filter(t => t.id !== deletedTagId)
                                } : null);
                            }}
                        />    
                        <EpicModal
                            isOpen={isEpicModalOpen}
                            onClose={() => setIsEpicModalOpen(false)}
                            projectId={projectId}
                            currentEpicId={task?.epic?.id ?? task?.epicId ?? null}
                            onSelectEpic={handleEpicChange} 
                        />
                        <ConfirmationModal
                            isOpen={isDeleteConfirmOpen}
                            onClose={() => setIsDeleteConfirmOpen(false)}
                            onConfirm={onConfirmDeleteSubtask}
                            isLoading={isDeletingSubtask}
                            title="Delete Subtask"
                            description="Are you sure you want to delete this subtask? This action cannot be undone."
                            confirmText="Delete"
                            modalVariant="danger"
                        />
                         <ConfirmationModal
                                isOpen={isArchiveConfirmOpen}
                                onClose={() => setIsArchiveConfirmOpen(false)}
                                onConfirm={onConfirmArchive}
                                isLoading={isSaving}
                                title="Lưu trữ công việc"
                                description="Công việc này sẽ được chuyển vào kho lưu trữ. Bạn có thể khôi phục lại sau nếu cần."
                                confirmText="Lưu trữ"
                                cancelText="Hủy"
                                modalVariant="warning" // Hoặc "danger" tùy bạn chọn màu
                              />
                        {/* Meta Footer */}
                        <div className="mt-auto pt-6 text-[10px] text-slate-400">
                            {task.createdAt && (
                                  <p>Created on {new Date(task.createdAt).toLocaleString('vi-VN')}</p>
                            )}
                            <p className="mt-1">Last updated just now</p>
                        </div>

                    </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}