"use client";

import { useState } from "react";
import { X, Loader2, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSprint, SprintPayload } from "@/services/apiSprint";
import { useToast } from "@/components/ui/ToastProvider";

interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback để reload lại danh sách
  projectId: number;     // ✅ Chỉ cần projectId
}

export default function CreateSprintModal({
  isOpen, onClose, onSuccess, projectId
}: CreateSprintModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // State form
  const [formData, setFormData] = useState<SprintPayload>({
    name: "",
    goal: "",
    startDate: undefined,
    endDate: undefined
  });

  const handleSubmit = async () => {
    // Validate
    if (!formData.name?.trim()) {
        showToast("Sprint name is required", "error");
        return;
    }

    try {
      setLoading(true);

      // Chuẩn bị payload (Convert date string -> ISO format cho API)
      const payload: SprintPayload = {
        name: formData.name,
        goal: formData.goal || "",
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        taskIds: [] // Mảng rỗng mặc định
      };

      // ✅ Gọi API với projectId và payload
      await createSprint(projectId, payload);
      
      showToast("Sprint created successfully", "success");
      onSuccess(); // Reload list
      onClose();   // Đóng modal
      
      // Reset form
      setFormData({ name: "", goal: "" });

    } catch (error) {
      console.error(error);
      showToast("Failed to create sprint", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
           <h2 className="text-lg font-bold text-slate-800">Start New Sprint</h2>
           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
             <X className="w-5 h-5"/>
           </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
           {/* Name */}
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Sprint Name <span className="text-red-500">*</span>
              </label>
              <input 
                autoFocus
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Sprint 24: Login Flow"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
           </div>

           {/* Goal */}
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
                <Target className="w-3 h-3"/> Sprint Goal
              </label>
              <textarea 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="What is the main focus of this sprint?"
                value={formData.goal || ""}
                onChange={e => setFormData({...formData, goal: e.target.value})}
              />
           </div>

           {/* Dates */}
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
                    <Calendar className="w-3 h-3"/> Start Date
                 </label>
                 <input 
                    type="datetime-local"
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-600"
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                 />
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
                    <Calendar className="w-3 h-3"/> End Date
                 </label>
                 <input 
                    type="datetime-local"
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-600"
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                 />
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-end gap-2">
           <Button variant="ghost" onClick={onClose}>Cancel</Button>
           <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2"/>} Create Sprint
           </Button>
        </div>
      </div>
    </div>
  );
}