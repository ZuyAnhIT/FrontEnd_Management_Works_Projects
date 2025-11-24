"use client";

import { useEffect, useState } from "react";
import { 
  X, Loader2, Calendar, User, Flag, 
  CheckCircle2, Bug, Bookmark, 
  Clock, Layout, Zap, Layers, 
  MoreHorizontal, Link as LinkIcon, Trash2, History
} from "lucide-react";
import { getTaskDetails, updateTask, TaskDetail } from "@/services/apiTask"; // Import types và api của bạn
import { useToast } from "@/components/ui/ToastProvider";

// --- TYPES ---
// Đảm bảo khớp với JSON bạn gửi
interface UpdateTaskData {
  title?: string;
  description?: string;
  taskType?: string;
  priority?: string;
  statusId?: number;
  sprintId?: number | null;
  epicId?: number | null;
  assigneeId?: number | null;
  storyPoints?: number;
  estimatedHours?: number;
  startDate?: string;
  dueDate?: string;
}

// --- HELPER COMPONENTS ---

// 1. Badge Status/Priority đẹp hơn
const StatusBadge = ({ statusName, color }: { statusName: string, color: string }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border" 
    style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30` }}>
    <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: color }}></span>
    {statusName}
  </span>
);

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
  members?: any[]; // Danh sách thành viên để select (nếu có)
  sprints?: any[]; // Danh sách Sprint
  epics?: any[];   // Danh sách Epic
}

export default function TaskDetailPanel({ taskId, onClose, onUpdate, members = [], sprints = [], epics = [] }: Props) {
  const { showToast } = useToast();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [formData, setFormData] = useState<UpdateTaskData>({});
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load Data
  useEffect(() => {
    if (taskId) {
      setLoading(true);
      getTaskDetails(taskId)
        .then(data => {
          setTask(data);
          // Map data vào form edit
          setFormData({
            title: data.title,
            description: data.description,
            taskType: data.taskType,
            priority: data.priority,
            statusId: data.statusId,
            sprintId: data.sprintId,
            epicId: data.epicId,
            assigneeId: data.assigneeId,
            storyPoints: data.storyPoints,
            estimatedHours: data.estimatedHours,
            startDate: data.startDate,
            dueDate: data.dueDate,
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
    if (!task) return;

    // 1. Optimistic Update UI (Cập nhật hiển thị ngay lập tức)
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Nếu update assigneeId, cần update cả UI hiển thị avatar/tên (logic giả lập để UX mượt)
    if (field === 'assigneeId' && members.length > 0) {
        const user = members.find(m => m.id === value);
        if (user) setTask(prev => prev ? ({...prev, assigneeName: user.name, assigneeAvatar: user.avatar}) : null);
    }

    // 2. Prepare Payload
    let payloadValue = value;
    if (field === 'startDate' || field === 'dueDate') {
         // Input datetime-local trả về chuỗi rỗng nếu xóa, cần gửi null hoặc ISO
         payloadValue = value ? new Date(value).toISOString() : null;
    }

    try {
      setIsSaving(true);
      // Gọi API update (giả sử API hỗ trợ PATCH từng trường hoặc bạn gửi object cần thiết)
      await updateTask(task.id, { [field]: payloadValue });
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast("Cập nhật thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper date format
  const toInputDate = (iso?: string) => iso ? new Date(iso).toISOString().slice(0, 16) : "";
  const displayDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('vi-VN') : "Chưa đặt";

  if (!taskId) return null;

  return (
    // Overlay nền tối
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
      
      {/* Panel Container */}
      <div 
        className="w-full max-w-[900px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        
        {/* --- HEADER --- */}
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
             {/* Task Code & Breadcrumbs */}
             {task && (
                <div className="flex items-center text-sm text-slate-500">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded mr-2">{task.taskCode}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="truncate max-w-[150px]">{task.createdByName} (Creator)</span>
                </div>
             )}
             {isSaving && <span className="text-xs text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full"><Loader2 className="w-3 h-3 animate-spin"/> Saving...</span>}
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-md transition-colors"><LinkIcon className="w-4 h-4"/></button>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-md transition-colors"><MoreHorizontal className="w-4 h-4"/></button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><X className="w-5 h-5"/></button>
          </div>
        </div>

        {/* --- BODY (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
             <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin"/></div>
          ) : task ? (
            <div className="flex flex-col md:flex-row min-h-full">
                
                {/* --- LEFT COLUMN: CONTENT (65%) --- */}
                <div className="flex-1 p-8 border-r border-slate-100">
                    {/* Title */}
                    <input 
                        className="w-full text-2xl font-bold text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-300 focus:ring-0 p-0 mb-6 resize-none"
                        value={formData.title || ''}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        onBlur={e => handleUpdate('title', e.target.value)}
                        placeholder="Task Title"
                    />

                    {/* Description */}
                    <div className="mb-8">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Description</label>
                        <textarea 
                            className="w-full min-h-[200px] text-sm text-slate-700 leading-relaxed p-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-y"
                            value={formData.description || ''}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            onBlur={e => handleUpdate('description', e.target.value)}
                            placeholder="Add a more detailed description..."
                        />
                    </div>

                    {/* Activity Placeholder (Optional) */}
                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-500"/> Activity
                        </h3>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">ME</div>
                            <div className="flex-1">
                                <input placeholder="Leave a comment..." className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: PROPERTIES (35%) --- */}
                <div className="w-full md:w-[320px] bg-slate-50/50 p-6 space-y-6 shrink-0">
                    
                    {/* Status Section */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                        <select 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-blue-500"
                            value={formData.statusId || ''}
                            onChange={e => handleUpdate('statusId', Number(e.target.value))}
                        >
                            {/* Map status list from props if available */}
                            <option value={1}>To Do</option>
                            <option value={2}>In Progress</option>
                            <option value={4}>Done</option>
                            <option value={5}>Canceled</option>
                        </select>
                    </div>

                    <hr className="border-slate-200"/>

                    {/* People Section */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">People</h4>
                        
                        {/* Assignee */}
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-2 text-sm text-slate-600"><User className="w-4 h-4"/> Assignee</div>
                            <div className="relative">
                                {/* Hiển thị Avatar & Tên của user đang được chọn */}
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-200 px-2 py-1 rounded transition-colors">
                                    <img src={task.assigneeAvatar || "https://ui-avatars.com/api/?name=Unassigned"} className="w-5 h-5 rounded-full" alt="Avatar"/>
                                    <span className="text-sm font-medium text-slate-800 max-w-[100px] truncate">
                                        {task.assigneeName || "Unassigned"}
                                    </span>
                                </div>
                                {/* Invisible Select đè lên trên để thay đổi */}
                                <select 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    value={formData.assigneeId || 0}
                                    onChange={e => handleUpdate('assigneeId', Number(e.target.value))}
                                >
                                    <option value={0}>Unassigned</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                    {/* Fallback nếu chưa có props members */}
                                    <option value={7}>Hoàng Văn Em</option>
                                    <option value={5}>Lê Văn Cường</option>
                                </select>
                            </div>
                        </div>

                        {/* Reporter (Read-only usually) */}
                        <div className="flex items-center justify-between text-slate-500">
                             <div className="flex items-center gap-2 text-sm"><Zap className="w-4 h-4"/> Reporter</div>
                             <span className="text-sm text-slate-700">{task.assignerName || "Unknown"}</span>
                        </div>
                    </div>

                    <hr className="border-slate-200"/>

                    {/* Planning Section */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Planning</h4>

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
                                className="w-[140px] text-sm text-right bg-transparent border-none outline-none text-slate-700 hover:text-blue-600 cursor-pointer truncate"
                                value={formData.sprintId || 0}
                                onChange={e => handleUpdate('sprintId', Number(e.target.value))}
                             >
                                <option value={0}>Backlog (No Sprint)</option>
                                <option value={1}>Sprint 1</option>
                                {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                             </select>
                        </div>

                        {/* Epic */}
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 text-sm text-slate-600"><Layers className="w-4 h-4"/> Epic</div>
                             <select 
                                className="w-[140px] text-sm text-right bg-transparent border-none outline-none text-slate-700 hover:text-blue-600 cursor-pointer truncate"
                                value={formData.epicId || 0}
                                onChange={e => handleUpdate('epicId', Number(e.target.value))}
                             >
                                <option value={0}>No Epic</option>
                                <option value={1}>E-commerce Core</option>
                                {epics.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                             </select>
                        </div>
                    </div>

                    {/* Estimates */}
                    <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white p-2 rounded border border-slate-200">
                            <label className="text-[10px] text-slate-400 font-bold uppercase">Points</label>
                            <input 
                                type="number" 
                                className="w-full font-bold text-slate-800 outline-none"
                                value={formData.storyPoints || ''}
                                onChange={e => setFormData({...formData, storyPoints: Number(e.target.value)})}
                                onBlur={e => handleUpdate('storyPoints', Number(e.target.value))}
                            />
                         </div>
                         <div className="bg-white p-2 rounded border border-slate-200">
                            <label className="text-[10px] text-slate-400 font-bold uppercase">Est. Hours</label>
                            <div className="flex items-center gap-1">
                                <input 
                                    type="number" 
                                    className="w-full font-bold text-slate-800 outline-none"
                                    value={formData.estimatedHours || ''}
                                    onChange={e => setFormData({...formData, estimatedHours: Number(e.target.value)})}
                                    onBlur={e => handleUpdate('estimatedHours', Number(e.target.value))}
                                />
                                <span className="text-xs text-slate-400">h</span>
                            </div>
                         </div>
                    </div>

                    <hr className="border-slate-200"/>

                    {/* Dates Section */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dates</h4>
                        
                        {/* Start Date */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Start Date</span>
                            </div>
                            <input 
                                type="datetime-local"
                                className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-slate-700"
                                value={toInputDate(formData.startDate)}
                                onChange={e => handleUpdate('startDate', e.target.value)}
                            />
                        </div>

                        {/* Due Date */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Due Date</span>
                                {task.completedAt && <span className="text-green-600 font-bold text-[10px]">Completed</span>}
                            </div>
                            <input 
                                type="datetime-local"
                                className={`w-full text-xs p-1.5 border rounded bg-white text-slate-700 ${task.completedAt ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}
                                value={toInputDate(formData.dueDate)}
                                onChange={e => handleUpdate('dueDate', e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Meta Footer */}
                    <div className="mt-auto pt-6 text-[10px] text-slate-400">
                        <p>Created by <span className="font-bold text-slate-500">{task.createdByName}</span> on {new Date(task.createdAt).toLocaleDateString()}</p>
                        <p className="mt-1">Last updated today</p>
                    </div>

                </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}