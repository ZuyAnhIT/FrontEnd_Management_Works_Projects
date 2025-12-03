"use client";

import { useEffect, useState } from "react";
import { 
  X, Loader2, Calendar, Target, 
  CheckCircle2, AlignLeft, 
  Layout, Activity, ChevronDown 
} from "lucide-react";
import { apiEpic, Epic, UpdateEpicPayload } from "@/services/apiEpic"; 
import { useToast } from "@/components/ui/ToastProvider";

interface EpicDetailPanelProps {
  projectId: number;
  epicId: number | null;
  onClose: () => void;
  onUpdate: () => void;
}

// Helper convert date ISO -> YYYY-MM-DD
const toInputDate = (iso?: string) => iso ? new Date(iso).toISOString().split('T')[0] : "";

export default function EpicDetailPanel({ projectId, epicId, onClose, onUpdate }: EpicDetailPanelProps) {
  const { showToast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [epic, setEpic] = useState<Epic | null>(null);
  
  // Form Data (Bỏ field color)
  const [formData, setFormData] = useState<Omit<UpdateEpicPayload, 'color'>>({
    name: "",
    description: "",
    status: "OPEN",
    startDate: "",
    dueDate: ""
  });

  // Load Data
  useEffect(() => {
    if (epicId) {
      setLoading(true);
      apiEpic.getEpicDetail(projectId, epicId)
        .then(data => {
            setEpic(data);
            setFormData({
                name: data.name,
                description: data.description,
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

  // Handle Update
  const handleUpdate = async (field: keyof Omit<UpdateEpicPayload, 'color'>, value: any) => {
    if (!epic) return;

    // A. Optimistic Update
    setFormData(prev => ({ ...prev, [field]: value }));

    // B. Prepare Payload
    let payloadValue = value;
    if (field === 'startDate' || field === 'dueDate') {
        payloadValue = value ? new Date(value).toISOString() : null;
    }

    try {
       setIsSaving(true);
       const payload = { [field]: payloadValue }; 
       
       await apiEpic.updateEpic(projectId, epic.id, payload as UpdateEpicPayload);
       
       setEpic(prev => prev ? ({ ...prev, [field]: payloadValue }) : null);
       onUpdate();
    } catch (error) {
       console.error(error);
       showToast("Update failed", "error");
    } finally {
       setIsSaving(false);
    }
  };

  // ✅ FIX: Thêm dấu ? để chấp nhận undefined hoặc string
  const getStatusColor = (status?: string) => {
      switch(status) {
          case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
          case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-200';
          default: return 'bg-slate-100 text-slate-600 border-slate-200'; // OPEN hoặc undefined
      }
  };

  if (!epicId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-transparent" onClick={onClose}>
       
       {/* Panel Container - Width 450px Modern UI */}
       <div 
         className="w-full max-w-[450px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200"
         onClick={e => e.stopPropagation()}
       >
          
          {/* --- HEADER --- */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
             <div className="flex items-center gap-2 text-slate-500">
                <Layout className="w-4 h-4" />
                <span className="text-xs font-mono font-medium uppercase tracking-wider">
                    {epic?.epicCode || "EPIC-ID"}
                </span>
                
                {/* Saving Indicator */}
                {isSaving && (
                    <span className="ml-2 text-[10px] text-blue-600 flex items-center gap-1 animate-pulse bg-blue-50 px-1.5 py-0.5 rounded">
                        <Loader2 className="w-2.5 h-2.5 animate-spin"/> Saving
                    </span>
                )}
             </div>

             <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
             >
                <X className="w-5 h-5"/>
             </button>
          </div>

          {/* --- BODY --- */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             {loading ? (
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin"/>
                </div>
             ) : epic ? (
                <div className="p-5 pb-20 space-y-6">
                   
                   {/* 1. TITLE INPUT */}
                   <textarea 
                       className="w-full text-xl font-semibold text-slate-900 border-none outline-none focus:ring-0 bg-transparent placeholder:text-slate-300 p-0 resize-none overflow-hidden leading-snug"
                       rows={2}
                       value={formData.name || ''}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       onBlur={e => handleUpdate('name', e.target.value)}
                       placeholder="Enter epic title here..."
                       onInput={(e) => {
                           const target = e.target as HTMLTextAreaElement;
                           target.style.height = 'auto';
                           target.style.height = target.scrollHeight + 'px';
                       }}
                   />

                   {/* 2. PROPERTIES LIST (Modern Task Style) */}
                   <div className="space-y-4">
                       
                       {/* Status Property */}
                       <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                           <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                               <Activity className="w-3.5 h-3.5" /> Status
                           </div>
                           <div className="relative w-fit">
                               <select 
                                   // ✅ FIX: formData.status có thể undefined, hàm getStatusColor đã handle được
                                   className={`appearance-none pl-3 pr-8 py-1.5 rounded-md text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-100 transition-all ${getStatusColor(formData.status)}`}
                                   value={formData.status || "OPEN"}
                                   onChange={e => handleUpdate('status', e.target.value)}
                               >
                                   <option value="OPEN">Open</option>
                                   <option value="IN_PROGRESS">In Progress</option>
                                   <option value="COMPLETED">Completed</option>
                                   <option value="CLOSED">Closed</option>
                               </select>
                               <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"/>
                           </div>
                       </div>

                       {/* Start Date */}
                       <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                           <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                               <Calendar className="w-3.5 h-3.5" /> Start Date
                           </div>
                           <input 
                               type="date"
                               className="w-full max-w-[160px] px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded text-xs text-slate-700 outline-none focus:bg-white focus:border-blue-300 transition-all cursor-pointer"
                               value={toInputDate(formData.startDate)}
                               onChange={e => handleUpdate('startDate', e.target.value)}
                           />
                       </div>

                       {/* Due Date */}
                       <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                           <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                               <Target className="w-3.5 h-3.5" /> Due Date
                           </div>
                           <input 
                               type="date"
                               className="w-full max-w-[160px] px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded text-xs text-slate-700 outline-none focus:bg-white focus:border-blue-300 transition-all cursor-pointer"
                               value={toInputDate(formData.dueDate)}
                               onChange={e => handleUpdate('dueDate', e.target.value)}
                           />
                       </div>

                   </div>

                   <hr className="border-slate-100" />

                   {/* 3. DESCRIPTION SECTION */}
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <AlignLeft className="w-4 h-4 text-slate-400" /> Description
                      </div>
                      <textarea 
                         className="w-full min-h-[150px] text-sm text-slate-700 p-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all placeholder:text-slate-400"
                         placeholder="Add a more detailed description..."
                         value={formData.description || ''}
                         onChange={e => setFormData({...formData, description: e.target.value})}
                         onBlur={e => handleUpdate('description', e.target.value)}
                      />
                   </div>

                   {/* 4. PROGRESS SUMMARY (Read-only Visualization) */}
                   <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                       <div className="flex justify-between items-center">
                           <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Epic Progress</span>
                           <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                               {Math.round(epic.progressPercentage)}%
                           </span>
                       </div>
                       
                       <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${epic.progressPercentage}%` }}
                          />
                       </div>

                       <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                           <CheckCircle2 className="w-3.5 h-3.5 text-slate-400"/>
                           <span>{epic.tasksCompleted} completed</span>
                           <span className="text-slate-300">|</span>
                           <span>{epic.totalTasks} total tasks</span>
                       </div>
                   </div>

                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Layout className="w-12 h-12 mb-3 opacity-20"/>
                    <p>Select an epic to view details</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}