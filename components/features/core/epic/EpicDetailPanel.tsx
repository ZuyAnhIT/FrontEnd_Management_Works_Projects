"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

// Thư viện bên ngoài
import React, { useEffect, useState, useCallback, useRef } from "react";
import { 
  X, Loader2, Calendar, Target, 
  CheckCircle2, AlignLeft, 
  Layout, Activity, ChevronDown 
} from "lucide-react";

// Internal Services
// CẬP NHẬT Ở ĐÂY: Import trực tiếp các hàm thay vì đối tượng apiEpic
import { getEpicDetail, updateEpic, Epic, UpdateEpicPayload } from "@/services/apiEpic"; 
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & HELPERS
// =============================================================================

/**
 * Chuyển đổi định dạng ISO Date sang chuẩn YYYY-MM-DD dành cho Input Date
 */
const toInputDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().split('T')[0];
  } catch {
    return "";
  }
};

/**
 * Cấu hình màu sắc giao diện theo chuẩn Jira Design System dựa trên trạng thái Epic
 */
const getStatusStyle = (status?: string) => {
  switch(status) {
    case 'COMPLETED': 
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'IN_PROGRESS': 
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CLOSED': 
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default: // OPEN
      return 'bg-white text-slate-600 border-slate-300'; 
  }
};

// =============================================================================
// 3. INTERFACES
// =============================================================================

interface EpicDetailPanelProps {
  projectId: number;
  epicId: number | null;
  onClose: () => void;
  onUpdate: () => void;
}

// Bỏ trường color ra khỏi payload nếu không cho phép người dùng thay đổi màu ở form này
type EpicFormData = Omit<UpdateEpicPayload, 'color'>;

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Panel trượt (Slide-over) hiển thị thông tin chi tiết và cho phép chỉnh sửa một Epic.
 */
export default function EpicDetailPanel({ 
  projectId, 
  epicId, 
  onClose, 
  onUpdate 
}: EpicDetailPanelProps) {
  
  // ---------------------------------------------------------------------------
  // 5. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [epic, setEpic] = useState<Epic | null>(null);
  
  // Biến để ngăn chặn việc gọi API nếu component đã unmount
  const isMounted = useRef(true);

  const [formData, setFormData] = useState<EpicFormData>({
    name: "",
    description: "",
    status: "OPEN",
    startDate: "",
    dueDate: ""
  });

  // ---------------------------------------------------------------------------
  // 6. EFFECTS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  /**
   * Tải thông tin chi tiết Epic khi ID thay đổi
   */
  useEffect(() => {
    if (!epicId) return;

    let abortController = new AbortController();

    const fetchEpicDetails = async () => {
      setIsLoading(true);
      try {
        // CẬP NHẬT Ở ĐÂY: Gọi trực tiếp hàm getEpicDetail
        const data = await getEpicDetail(projectId, epicId);
        
        if (!isMounted.current) return;

        setEpic(data);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          status: data.status || "OPEN",
          startDate: data.startDate || "",
          dueDate: data.dueDate || ""
        });
      } catch (error: any) {
        if (!isMounted.current) return;
        showToast(error.message || "Failed to load epic details", "error");
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    };

    fetchEpicDetails();

    return () => {
      abortController.abort();
    };
  }, [projectId, epicId, showToast]);

  // ---------------------------------------------------------------------------
  // 7. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý cập nhật từng trường dữ liệu độc lập (Patch Update)
   */
  const handleUpdateField = useCallback(async (field: keyof EpicFormData, value: any) => {
    if (!epic) return;

    // 1. Lưu lại giá trị gốc để rollback nếu lỗi (Rollback Strategy)
    const originalValue = formData[field];
    
    // Nếu giá trị không thay đổi, bỏ qua việc gọi API
    if (originalValue === value) return;

    // 2. Cập nhật UI ngay lập tức (Optimistic Update)
    setFormData(prev => ({ ...prev, [field]: value }));

    // 3. Xử lý định dạng dữ liệu ngày tháng
    let payloadValue = value;
    if (field === 'startDate' || field === 'dueDate') {
      payloadValue = value ? new Date(value).toISOString() : null;
    }

    // 4. Gửi yêu cầu API
    setIsSaving(true);
    try {
       const payload = { [field]: payloadValue }; 
       // CẬP NHẬT Ở ĐÂY: Gọi trực tiếp hàm updateEpic
       await updateEpic(projectId, epic.id, payload as UpdateEpicPayload);
       
       if (isMounted.current) {
         setEpic(prev => prev ? ({ ...prev, [field]: payloadValue }) : null);
         onUpdate(); 
       }
    } catch (error) {
       console.error("Epic Update Error:", error);
       showToast("Failed to update epic", "error");
       
       // Khôi phục lại giao diện do API lỗi
       if (isMounted.current) {
         setFormData(prev => ({ ...prev, [field]: originalValue }));
       }
    } finally {
       if (isMounted.current) setIsSaving(false);
    }
  }, [epic, formData, onUpdate, projectId, showToast]);

  // ---------------------------------------------------------------------------
  // 8. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (!epicId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-[1px]" 
      onClick={onClose}
    >
       <div 
         className="w-full max-w-[480px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200"
         onClick={e => e.stopPropagation()} // Ngăn sự kiện click làm đóng panel
       >
          
          {/* ================= HEADER SECTION ================= */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
             <div className="flex items-center gap-2.5">
                <Layout className="w-4 h-4 text-[#0052CC]" />
                <span className="text-[12px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                    {epic?.epicCode || "EPIC-ID"}
                </span>
                
                {/* Trạng thái lưu (Saving Indicator) */}
                <div className={cn(
                  "ml-2 text-[10px] font-bold uppercase tracking-widest text-[#0052CC] flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-opacity duration-200",
                  isSaving ? "opacity-100 bg-blue-50" : "opacity-0"
                )}>
                    <Loader2 className="w-3 h-3 animate-spin"/> Saving
                </div>
             </div>

             <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors active:scale-95"
                title="Close panel"
             >
                <X className="w-5 h-5"/>
             </button>
          </div>

          {/* ================= BODY SECTION ================= */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin opacity-80"/>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading details...</span>
                </div>
             ) : epic ? (
                <div className="p-6 pb-24 space-y-8">
                    
                    {/* 1. TÊN EPIC (Title Input) */}
                    <div className="relative group">
                      <textarea 
                          className="w-full text-2xl font-bold text-slate-900 border-2 border-transparent outline-none focus:ring-0 hover:bg-slate-50 focus:bg-white focus:border-blue-500 rounded-lg p-2 -ml-2 resize-none overflow-hidden leading-tight transition-all placeholder:text-slate-300"
                          rows={1}
                          value={formData.name || ''}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          onBlur={e => handleUpdateField('name', e.target.value)}
                          placeholder="What needs to be done?"
                          onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = target.scrollHeight + 'px';
                          }}
                      />
                    </div>

                    {/* 2. CÁC THUỘC TÍNH (Properties Grid) */}
                    <div className="space-y-5">
                        
                        {/* Trạng thái (Status) */}
                        <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                <Activity className="w-3.5 h-3.5" /> Status
                            </div>
                            <div className="relative w-fit">
                                <select 
                                    className={cn(
                                      "appearance-none pl-3 pr-8 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest border cursor-pointer outline-none transition-all shadow-sm",
                                      "focus:ring-2 focus:ring-offset-1 focus:ring-blue-100",
                                      getStatusStyle(formData.status)
                                    )}
                                    value={formData.status || "OPEN"}
                                    onChange={e => handleUpdateField('status', e.target.value)}
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"/>
                            </div>
                        </div>

                        {/* Ngày bắt đầu (Start Date) */}
                        <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                <Calendar className="w-3.5 h-3.5" /> Start Date
                            </div>
                            <input 
                                type="date"
                                className="w-full max-w-[160px] px-2 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded text-[12px] font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                                value={toInputDate(formData.startDate)}
                                onChange={e => handleUpdateField('startDate', e.target.value)}
                            />
                        </div>

                        {/* Ngày kết thúc (Due Date) */}
                        <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                <Target className="w-3.5 h-3.5" /> Due Date
                            </div>
                            <input 
                                type="date"
                                className="w-full max-w-[160px] px-2 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded text-[12px] font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                                value={toInputDate(formData.dueDate)}
                                onChange={e => handleUpdateField('dueDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-100" />

                    {/* 3. MÔ TẢ CHI TIẾT (Description) */}
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                           <AlignLeft className="w-3.5 h-3.5" /> Description
                       </div>
                       <textarea 
                          className="w-full min-h-[160px] text-[13px] text-slate-700 p-3 rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 outline-none resize-none transition-all placeholder:text-slate-400 shadow-sm"
                          placeholder="Add a more detailed description..."
                          value={formData.description || ''}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          onBlur={e => handleUpdateField('description', e.target.value)}
                       />
                    </div>

                    {/* 4. TIẾN ĐỘ THỰC HIỆN (Progress Summary - Read-only) */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Epic Progress</span>
                            <span className="text-[11px] font-bold text-[#0052CC] bg-blue-100/50 px-2 py-0.5 rounded-md border border-blue-200/50">
                                {Math.round(epic.progressPercentage)}%
                            </span>
                        </div>
                        
                        {/* Thanh Process Bar */}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                           <div 
                             className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                             style={{ width: `${epic.progressPercentage}%` }}
                           />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400 pt-1">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/>
                                <span className="text-slate-600">{epic.tasksCompleted} completed</span>
                            </div>
                            <span>{epic.totalTasks} total tasks</span>
                        </div>
                    </div>

                </div>
             ) : (
                // Lỗi hoặc không có dữ liệu
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                    <Layout className="w-12 h-12 opacity-20"/>
                    <p className="text-xs font-bold uppercase tracking-widest">Epic data not found</p>
                </div>
             )}
          </div>
       </div>

       <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
       `}</style>
    </div>
  );
}