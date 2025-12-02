"use client";

import { useEffect, useState } from "react";
import { 
  X, Loader2, Calendar, Layers, Target, 
  PieChart, CheckCircle2, Palette, Activity 
} from "lucide-react";
import { apiEpic, Epic, UpdateEpicPayload } from "@/services/apiEpic"; 
import { useToast } from "@/components/ui/ToastProvider";

interface EpicDetailPanelProps {
  projectId: number;
  epicId: number | null;
  onClose: () => void;
  onUpdate: () => void; // Callback để reload Timeline/List
}

// Helper convert date ISO -> YYYY-MM-DD cho input type="date"
const toInputDate = (iso?: string) => iso ? new Date(iso).toISOString().split('T')[0] : "";

export default function EpicDetailPanel({ projectId, epicId, onClose, onUpdate }: EpicDetailPanelProps) {
  const { showToast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [epic, setEpic] = useState<Epic | null>(null);
  
  // Form Data để edit (Tách biệt với data gốc để làm Optimistic UI)
  const [formData, setFormData] = useState<UpdateEpicPayload>({
    name: "",
    description: "",
    color: "#3b82f6",
    status: "OPEN",
    startDate: "",
    dueDate: ""
  });

  // 1. Load Data khi mở Panel
  useEffect(() => {
    if (epicId) {
      setLoading(true);
      apiEpic.getEpicDetail(projectId, epicId)
        .then(data => {
            setEpic(data);
            setFormData({
                name: data.name,
                description: data.description,
                color: data.color,
                status: data.status,
                startDate: data.startDate,
                dueDate: data.dueDate
            });
        })
        .catch(err => {
            console.error(err);
            showToast("Failed to load epic details", "error");
        })
        .finally(() => setLoading(false));
    }
  }, [projectId, epicId, showToast]);

  // 2. Handle Update (Auto-save logic)
  const handleUpdate = async (field: keyof UpdateEpicPayload, value: any) => {
    if (!epic) return;

    // A. Cập nhật UI ngay lập tức (Optimistic)
    setFormData(prev => ({ ...prev, [field]: value }));

    // B. Chuẩn bị dữ liệu gửi API
    let payloadValue = value;
    
    // Xử lý ngày tháng: Input date trả về rỗng nếu xóa, cần gửi null hoặc giữ nguyên logic backend
    if (field === 'startDate' || field === 'dueDate') {
        payloadValue = value ? new Date(value).toISOString() : null;
    }

    try {
       setIsSaving(true);
       
       // ✅ FIX: Ép kiểu object động về UpdateEpicPayload để tránh lỗi TypeScript
       const payload = { [field]: payloadValue } as UpdateEpicPayload;
       
       // Gọi API update
       await apiEpic.updateEpic(projectId, epic.id, payload);
       
       // Cập nhật lại data gốc nếu thành công
       setEpic(prev => prev ? ({ ...prev, [field]: payloadValue }) : null);
       
       // Báo cho cha reload (để cập nhật Gantt Chart)
       onUpdate();
    } catch (error) {
       console.error(error);
       showToast("Update failed", "error");
    } finally {
       setIsSaving(false);
    }
  };

  if (!epicId) return null;

  return (
    // Overlay: Trong suốt, bắt sự kiện click ra ngoài
    <div className="fixed inset-0 z-50 flex justify-end bg-transparent" onClick={onClose}>
       
       {/* Panel Container */}
       <div 
         className="w-full max-w-[600px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200"
         onClick={e => e.stopPropagation()}
       >
          
          {/* --- HEADER --- */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
             <div className="flex items-center gap-3">
                {/* Epic Code Badge */}
                <div className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600 shadow-sm">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-bold">{epic?.epicCode || "EPIC"}</span>
                </div>
                
                {/* Saving Indicator */}
                {isSaving && (
                    <span className="text-xs text-blue-600 flex items-center gap-1 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin"/> Saving...
                    </span>
                )}
             </div>

             {/* Close Button */}
             <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-red-500 p-2 rounded-md hover:bg-slate-100 transition-colors"
             >
                <X className="w-5 h-5"/>
             </button>
          </div>

          {/* --- BODY (Scrollable) --- */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
             {loading ? (
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin"/>
                </div>
             ) : epic ? (
                <div className="space-y-8">
                   
                   {/* 1. TITLE & COLOR PICKER */}
                   <div className="flex gap-4 items-start">
                      <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Epic Name</label>
                          <input 
                             className="w-full text-2xl font-bold text-slate-900 border-none outline-none focus:ring-0 bg-transparent placeholder:text-slate-300 p-0 leading-tight"
                             value={formData.name || ''}
                             onChange={e => setFormData({...formData, name: e.target.value})}
                             onBlur={e => handleUpdate('name', e.target.value)}
                             placeholder="Enter epic name..."
                          />
                      </div>
                      
                      {/* Color Picker Widget */}
                      <div className="relative group cursor-pointer">
                          <div 
                            className="w-10 h-10 rounded-lg shadow-sm border-2 border-white ring-1 ring-slate-200 flex items-center justify-center transition-transform group-hover:scale-105"
                            style={{ backgroundColor: formData.color }}
                          >
                             <Palette className="w-5 h-5 text-white mix-blend-difference opacity-80" />
                          </div>
                          {/* Invisible Color Input covering the div */}
                          <input 
                             type="color" 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                             value={formData.color}
                             onChange={e => handleUpdate('color', e.target.value)}
                          />
                      </div>
                   </div>

                   {/* 2. DASHBOARD MINI (Status & Progress) */}
                   <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 grid grid-cols-3 gap-4">
                       {/* Status Select */}
                       <div className="flex flex-col justify-center border-r border-slate-200 pr-4">
                           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                           <select 
                               className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 py-1.5 px-2 rounded focus:outline-none focus:border-purple-500 cursor-pointer"
                               value={formData.status}
                               onChange={e => handleUpdate('status', e.target.value)}
                           >
                               <option value="OPEN">Open</option>
                               <option value="IN_PROGRESS">In Progress</option>
                               <option value="COMPLETED">Completed</option>
                               <option value="CLOSED">Closed</option>
                           </select>
                       </div>

                       {/* Task Counter */}
                       <div className="flex flex-col justify-center items-center border-r border-slate-200 px-4">
                           <span className="text-2xl font-bold text-slate-800">
                               {epic.tasksCompleted}<span className="text-slate-400 text-lg">/{epic.totalTasks}</span>
                           </span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                               <CheckCircle2 className="w-3 h-3"/> Tasks Done
                           </span>
                       </div>

                       {/* Progress Percent */}
                       <div className="flex flex-col justify-center items-center pl-4">
                           <span className={`text-2xl font-bold ${epic.progressPercentage === 100 ? 'text-green-600' : 'text-purple-600'}`}>
                               {Math.round(epic.progressPercentage)}%
                           </span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                               <Activity className="w-3 h-3"/> Completion
                           </span>
                       </div>
                   </div>

                   {/* Progress Bar Visual */}
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500 ease-out"
                        style={{ 
                            width: `${epic.progressPercentage}%`,
                            backgroundColor: formData.color 
                        }}
                      />
                   </div>

                   {/* 3. DESCRIPTION */}
                   <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                         Description
                      </h3>
                      <textarea 
                         className="w-full min-h-[120px] text-sm text-slate-700 p-4 rounded-lg border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none resize-none transition-all"
                         placeholder="What is the goal of this epic?"
                         value={formData.description || ''}
                         onChange={e => setFormData({...formData, description: e.target.value})}
                         onBlur={e => handleUpdate('description', e.target.value)}
                      />
                   </div>

                   <hr className="border-slate-100" />

                   {/* 4. DATES PROPERTIES */}
                   <div className="space-y-4">
                       <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                          Timeline
                       </h3>
                       
                       <div className="grid grid-cols-2 gap-6">
                           {/* Start Date */}
                           <div className="space-y-1">
                              <label className="text-xs text-slate-500 font-medium">Start Date</label>
                              <div className="relative">
                                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                                  <input 
                                     type="date"
                                     className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                     value={toInputDate(formData.startDate)}
                                     onChange={e => handleUpdate('startDate', e.target.value)}
                                  />
                              </div>
                           </div>
                           
                           {/* Due Date */}
                           <div className="space-y-1">
                              <label className="text-xs text-slate-500 font-medium">Due Date</label>
                              <div className="relative">
                                  <Target className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                                  <input 
                                     type="date"
                                     className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                     value={toInputDate(formData.dueDate)}
                                     onChange={e => handleUpdate('dueDate', e.target.value)}
                                  />
                              </div>
                           </div>
                       </div>
                   </div>

                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Layers className="w-12 h-12 mb-3 opacity-20"/>
                    <p>Epic not found</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}