"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"; // Giả sử bạn có UI Dialog
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Play, Trash2 } from "lucide-react";
import { Sprint } from "@/services/apiSprint";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  type: 'START' | 'COMPLETE' | 'DELETE' | null;
  sprint: Sprint | null;
}

export default function SprintActionModals({ 
  isOpen, onClose, onConfirm, loading, type, sprint 
}: ActionModalProps) {
  if (!sprint || !type) return null;

  const renderContent = () => {
    switch (type) {
      case 'START':
        return {
          title: `Start Sprint: ${sprint.name}`,
          desc: `Are you sure you want to start this sprint? It contains ${sprint.taskCount || 0} issues.`,
          icon: <Play className="w-6 h-6 text-blue-600" />,
          btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
          btnText: "Start Sprint"
        };
      case 'COMPLETE':
        return {
          title: `Complete Sprint: ${sprint.name}`,
          desc: (
            <div className="space-y-2 text-sm">
               <p>This sprint contains <b>{sprint.taskCount}</b> issues.</p>
               <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
                  <span>Sprint completed. Any incomplete tasks will be automatically moved to the <b>Backlog</b>.</span>
               </div>
            </div>
          ),
          icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
          btnClass: "bg-green-600 hover:bg-green-700 text-white",
          btnText: "Complete Sprint"
        };
      case 'DELETE':
        const isCancel = sprint.status === 'IN_PROGRESS';
        return {
          title: isCancel ? `Cancel Sprint: ${sprint.name}` : `Delete Sprint: ${sprint.name}`,
          desc: isCancel 
            ? "This sprint is currently active. Canceling it will stop all progress and move issues back to the Backlog."
            : "Are you sure you want to delete this sprint? This action cannot be undone.",
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          btnClass: "bg-red-600 hover:bg-red-700 text-white",
          btnText: isCancel ? "Cancel Sprint" : "Delete Sprint"
        };
      default: return {};
    }
  };

  const content = renderContent();

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-50 rounded-full">{content.icon}</div>
                <h3 className="text-lg font-bold text-slate-900">{content.title}</h3>
            </div>
            
            <div className="text-slate-600 mb-6">
                {content.desc}
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button 
                    className={content.btnClass} 
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? "Processing..." : content.btnText}
                </Button>
            </div>
        </div>
    </div>
  );
}