"use client";

import { useEffect, useState } from "react";
import { 
  X, Loader2, Flag, User, Clock, Layers, 
  MoreHorizontal, Link as LinkIcon, History, Zap 
} from "lucide-react";
import { getTaskDetails, updateTask, TaskDetail, UpdateTaskData } from "@/services/apiTask";
import { useToast } from "@/components/ui/ToastProvider";

// --- TYPES LOCAL ---
// Interface này dùng để quản lý state form, nó mapping từ API data
interface LocalFormData extends UpdateTaskData {
  // Thêm các trường hiển thị nếu cần thiết
}

// --- HELPER COMPONENTS ---

const PrioritySelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const colors: Record<string, string> = {
    URGENT: "text-red-600 bg-red-50 border-red-200",
    HIGH: "text-orange-600 bg-orange-50 border-orange-200",
    MEDIUM: "text-blue-600 bg-blue-50 border-blue-200",
    LOW: "text-slate-600 bg-slate-100 border-slate-200"
  };
  return (
    <div className="relative">
      <select 
        className={`appearance-none w-full text-xs font-bold px-3 py-1.5 rounded border ${colors[value] || colors.LOW} focus:ring-2 focus:ring-offset-1 outline-none cursor-pointer uppercase`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface Props {
  taskId: number | null;
  onClose: () => void;
  onUpdate?: () => void;
  members?: any[]; 
  sprints?: any[]; 
  epics?: any[]; 
  statuses?: any[]; // Thêm danh sách status từ cha truyền vào
}

export default function TaskDetailPanel({ 
  taskId, 
  onClose, 
  onUpdate, 
  members = [], 
  sprints = [], 
  epics = [],
  statuses = [] // Danh sách Status (To Do, In Progress...)
}: Props) {
  const { showToast } = useToast();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [formData, setFormData] = useState<LocalFormData>({});
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load Data
  useEffect(() => {
    if (taskId) {
      setLoading(true);
      getTaskDetails(taskId)
        .then(data => {
          setTask(data);
          // Map API data vào form state
          setFormData({
            title: data.title,
            description: data.description || "",
            taskType: data.taskType as any,
            priority: data.priority as any,
            statusId: data.statusId,
            sprintId: data.sprintId,
            epicId: null, // API hiện tại chưa trả về epicId, tạm để null hoặc lấy từ props nếu có
            assigneeId: data.assigneeId,
            storyPoints: data.storyPoints || 0,
            estimatedHours: 0, // API chưa trả về, tạm để 0
            startDate: data.startDate || undefined,
            dueDate: data.dueDate || undefined,
          });
        })
        .catch((err) => {
            console.error(err);
            showToast("Không thể tải thông tin công việc", "error");
        })
        .finally(() => setLoading(false));
    }
  }, [taskId]);

  // Handle Updates
  const handleUpdate = async (field: keyof UpdateTaskData, value: any) => {
    if (!task || !taskId) return;

    // 1. Optimistic Update UI
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update local task state để UI phản hồi ngay (ví dụ đổi Avatar assignee)
    if (field === 'assigneeId') {
        const user = members.find(m => m.id === value || m.userId === value);
        if (user) {
            setTask(prev => prev ? ({
                ...prev, 
                assigneeName: user.name || user.fullName, 
                assigneeAvatar: user.avatar || user.avatarUrl
            }) : null);
        } else if (value === 0 || value === null) {
             setTask(prev => prev ? ({ ...prev, assigneeName: null, assigneeAvatar: null }) : null);
        }
    }

    // 2. Prepare Payload
    let payloadValue = value;
    
    // Xử lý ngày tháng: Nếu chuỗi rỗng -> null
    if (field === 'startDate' || field === 'dueDate') {
         payloadValue = value ? new Date(value).toISOString() : null;
    }
    // Xử lý số: Nếu chuỗi rỗng -> 0 hoặc null tuỳ logic
    if (field === 'storyPoints' || field === 'estimatedHours') {
        payloadValue = Number(value);
    }
    // Xử lý Id: Nếu 0 -> null (cho assignee, sprint, epic)
    if (['sprintId', 'epicId', 'assigneeId'].includes(field) && (value === 0 || value === "0")) {
        payloadValue = null;
    }

    try {
      setIsSaving(true);
      await updateTask(taskId, { [field]: payloadValue });
      if (onUpdate) onUpdate(); // Refresh list ở ngoài nếu cần
    } catch (error) {
      console.error(error);
      showToast("Cập nhật thất bại", "error");
      // Revert logic nếu cần thiết (ở đây làm đơn giản không revert)
    } finally {
      setIsSaving(false);
    }
  };

  // Helper date format: ISO String -> YYYY-MM-DDTHH:mm (cho input datetime-local)
  const toInputDate = (iso?: string | null) => {
      if (!iso) return "";
      return new Date(iso).toISOString().slice(0, 16);
  };

  if (!taskId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]" 
      onClick={onClose}
    >
      <div 
        className="w-full md:w-[800px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* --- HEADER --- */}
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
             {task && (
                <div className="flex items-center text-sm text-slate-500">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded mr-2">
                        {task.taskCode}
                    </span>
                    {task.createdByName && (
                        <>
                            <span className="text-slate-300 mx-1">/</span>
                            <span className="truncate max-w-[150px] text-xs">Created by {task.createdByName}</span>
                        </>
                    )}
                </div>
             )}
             {isSaving && <span className="text-xs text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full"><Loader2 className="w-3 h-3 animate-spin"/> Saving...</span>}
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-md transition-colors"><LinkIcon className="w-4 h-4"/></button>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-md transition-colors"><MoreHorizontal className="w-4 h-4"/></button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><X className="w-5 h-5"/></button>
          </div>
        </div>

        {/* --- BODY (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {loading ? (
             <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin"/></div>
          ) : task ? (
            <div className="flex flex-col md:flex-row min-h-full">
                
                {/* --- LEFT COLUMN: CONTENT (65%) --- */}
                <div className="flex-1 p-8 border-r border-slate-100">
                    {/* Title Input */}
                    <input 
                        className="w-full text-2xl font-bold text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-300 focus:ring-0 p-0 mb-6 resize-none"
                        value={formData.title || ''}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        onBlur={e => handleUpdate('title', e.target.value)}
                        placeholder="Task Title"
                    />

                    {/* Description Textarea */}
                    <div className="mb-8 group">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider group-focus-within:text-blue-500 transition-colors">Description</label>
                        <textarea 
                            className="w-full min-h-[300px] text-sm text-slate-700 leading-relaxed p-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-y"
                            value={formData.description || ''}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            onBlur={e => handleUpdate('description', e.target.value)}
                            placeholder="Add a more detailed description..."
                        />
                    </div>

                    {/* Activity Placeholder */}
                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-500"/> Activity
                        </h3>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">ME</div>
                            <div className="flex-1">
                                <input placeholder="Leave a comment..." className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-50 transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: PROPERTIES (35%) --- */}
                <div className="w-full md:w-[300px] bg-slate-50/80 p-6 space-y-6 shrink-0">
                    
                    {/* Status Dropdown */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                        <select 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-blue-500 cursor-pointer"
                            value={formData.statusId || ''}
                            onChange={e => handleUpdate('statusId', Number(e.target.value))}
                        >
                            {statuses.length > 0 ? (
                                statuses.map(st => <option key={st.id} value={st.id}>{st.name}</option>)
                            ) : (
                                // Fallback nếu chưa truyền props statuses
                                <>
                                    <option value={1}>To Do</option>
                                    <option value={2}>In Progress</option>
                                    <option value={3}>Review</option>
                                    <option value={4}>Done</option>
                                </>
                            )}
                        </select>
                    </div>

                    <hr className="border-slate-200"/>

                    {/* People Group */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">People</h4>
                        
                        {/* Assignee */}
                        <div className="flex items-center justify-between group relative">
                            <div className="flex items-center gap-2 text-sm text-slate-600"><User className="w-4 h-4"/> Assignee</div>
                            <div className="relative">
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-200 px-2 py-1 rounded transition-colors">
                                    <img 
                                        src={task.assigneeAvatar || `https://ui-avatars.com/api/?name=${task.assigneeName || 'Unassigned'}&background=random`} 
                                        className="w-5 h-5 rounded-full object-cover" 
                                        alt="Avatar"
                                    />
                                    <span className="text-sm font-medium text-slate-800 max-w-[100px] truncate">
                                        {task.assigneeName || "Unassigned"}
                                    </span>
                                </div>
                                <select 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    value={formData.assigneeId || 0}
                                    onChange={e => handleUpdate('assigneeId', Number(e.target.value))}
                                >
                                    <option value={0}>Unassigned</option>
                                    {members.map(m => (
                                        <option key={m.userId || m.id} value={m.userId || m.id}>
                                            {m.fullName || m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Reporter */}
                        <div className="flex items-center justify-between text-slate-500">
                             <div className="flex items-center gap-2 text-sm"><Zap className="w-4 h-4"/> Reporter</div>
                             <span className="text-sm text-slate-700">{task.createdByName || "Unknown"}</span>
                        </div>
                    </div>

                    <hr className="border-slate-200"/>

                    {/* Planning Group */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Planning</h4>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-600"><Flag className="w-4 h-4"/> Priority</div>
                            <div className="w-[120px]">
                                <PrioritySelect value={formData.priority || 'LOW'} onChange={(v) => handleUpdate('priority', v)} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 text-sm text-slate-600"><Clock className="w-4 h-4"/> Sprint</div>
                             <select 
                                className="w-[140px] text-sm text-right bg-transparent border-none outline-none text-slate-700 hover:text-blue-600 cursor-pointer truncate font-medium"
                                value={formData.sprintId || 0}
                                onChange={e => handleUpdate('sprintId', Number(e.target.value))}
                             >
                                <option value={0}>Backlog</option>
                                {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                             </select>
                        </div>

                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 text-sm text-slate-600"><Layers className="w-4 h-4"/> Epic</div>
                             <select 
                                className="w-[140px] text-sm text-right bg-transparent border-none outline-none text-slate-700 hover:text-blue-600 cursor-pointer truncate font-medium"
                                value={formData.epicId || 0}
                                onChange={e => handleUpdate('epicId', Number(e.target.value))}
                             >
                                <option value={0}>No Epic</option>
                                {epics.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                             </select>
                        </div>
                    </div>

                    {/* Estimates Input Grid */}
                    <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white p-2.5 rounded border border-slate-200 hover:border-blue-300 transition-colors">
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Points</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full font-bold text-slate-800 outline-none text-sm"
                                value={formData.storyPoints || ''}
                                onChange={e => setFormData({...formData, storyPoints: Number(e.target.value)})}
                                onBlur={e => handleUpdate('storyPoints', Number(e.target.value))}
                            />
                         </div>
                         <div className="bg-white p-2.5 rounded border border-slate-200 hover:border-blue-300 transition-colors">
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Est. Hours</label>
                            <div className="flex items-center gap-1">
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-full font-bold text-slate-800 outline-none text-sm"
                                    value={formData.estimatedHours || ''}
                                    onChange={e => setFormData({...formData, estimatedHours: Number(e.target.value)})}
                                    onBlur={e => handleUpdate('estimatedHours', Number(e.target.value))}
                                />
                                <span className="text-xs text-slate-400 font-medium">h</span>
                            </div>
                         </div>
                    </div>

                    <hr className="border-slate-200"/>

                    {/* Dates Group */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timeline</h4>
                        
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
      </div>
    </div>
  );
}