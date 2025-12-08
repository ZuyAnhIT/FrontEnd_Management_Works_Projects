"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { 
  Archive, RefreshCcw, Loader2, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Bug, FileText, Bookmark, CheckCircle2
} from "lucide-react";

// Services
import { 
  getArchivedTasks, 
  ArchivedTaskParams, 
  getProjectMembers, 
  ProjectMember,
  TaskResponse 
} from "@/services/apiProject";

import { restoreTask } from "@/services/apiTask"; 

import { useToast } from "@/components/ui/ToastProvider";
import ArchivedFilterBar from "@/components/features/core/archived/ArchivedFilterBar";
import { Button } from "@/components/ui/button"; 
import ConfirmationModal from "@/components/ui/ConfirmationModal"; // ✅ Import Modal Xác nhận

export default function ArchivedPage() {
  const params = useParams();
  const companyId = Number(params.companyId) || 1; 
  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);
  const { showToast } = useToast();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  
  // State quản lý Modal Xác nhận Khôi phục
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [taskToRestore, setTaskToRestore] = useState<{id: number, title: string} | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Pagination State
  const [pagination, setPagination] = useState({
      pageNumber: 0,
      pageSize: 10,
      totalPages: 0,
      totalElements: 0,
      first: true,
      last: true
  });

  // Filters
  const [filters, setFilters] = useState<ArchivedTaskParams>({});

  // --- API CALLS ---
  useEffect(() => {
    if(!projectId) return;
    getProjectMembers(companyId, workspaceId, projectId, { size: 100 })
      .then(res => setMembers(res.content || []))
      .catch(console.error);
  }, [companyId, workspaceId, projectId]);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
        const apiParams: ArchivedTaskParams = {
            page: pagination.pageNumber,
            size: pagination.pageSize,
            ...filters
        };
        const res = await getArchivedTasks(companyId, workspaceId, projectId, apiParams);
        
        setTasks(res.content);
        setPagination({
            pageNumber: res.pageNumber,
            pageSize: res.pageSize,
            totalPages: res.totalPages,
            totalElements: res.totalElements,
            first: res.first,
            last: res.last
        });
    } catch (error) {
        console.error("Failed to load archived tasks", error);
        showToast("Failed to load archived tasks", "error");
    } finally {
        setLoading(false);
    }
  }, [companyId, workspaceId, projectId, pagination.pageNumber, filters]);

  useEffect(() => {
    const t = setTimeout(() => fetchTasks(), 300);
    return () => clearTimeout(t);
  }, [fetchTasks]);

  // --- HANDLERS ---

  const handleFilterChange = (key: keyof ArchivedTaskParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  };

  const handlePageChange = (newPage: number) => {
      if (newPage >= 0 && newPage < pagination.totalPages) {
          setPagination(prev => ({ ...prev, pageNumber: newPage }));
      }
  };

  // 1. Mở Modal xác nhận
  const handleRequestRestore = (task: TaskResponse) => {
    setTaskToRestore({ id: task.id, title: task.title });
    setConfirmModalOpen(true);
  };

  // 2. Thực hiện Restore khi người dùng bấm Confirm
  const confirmRestore = async () => {
    if (!taskToRestore) return;

    try {
        setIsRestoring(true); // Bật loading trên modal

        // Gọi API Restore
        await restoreTask(taskToRestore.id);
        
        showToast("Task restored successfully!", "success");

        // Cập nhật UI: Loại bỏ task khỏi danh sách ngay lập tức
        setTasks(prev => prev.filter(t => t.id !== taskToRestore.id));
        setPagination(prev => ({ ...prev, totalElements: prev.totalElements - 1 }));

        // Đóng modal
        setConfirmModalOpen(false);
        setTaskToRestore(null);

    } catch (error) {
        console.error(error);
        showToast("Failed to restore task. Please try again.", "error");
    } finally {
        setIsRestoring(false);
    }
  };

  // UI Helpers (Giữ nguyên)
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "BUG": return <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-100 text-[10px] font-bold uppercase"><Bug className="w-3 h-3" /> Bug</div>;
      case "STORY": return <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-100 text-[10px] font-bold uppercase"><Bookmark className="w-3 h-3" /> Story</div>;
      default: return <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> Task</div>;
    }
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case "URGENT": return "bg-red-50 text-red-700 border-red-200";
      case "HIGH": return "bg-orange-50 text-orange-700 border-orange-200";
      case "MEDIUM": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  if (!projectId) return null;

  return (
    <div className="p-6 sm:p-8 min-h-screen bg-slate-50/50">
        
        {/* HEADER & FILTER */}
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg shadow-sm border border-orange-200">
                    <Archive className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Archived Items</h1>
                    <p className="text-sm text-slate-500">View and restore tasks that have been archived.</p>
                </div>
            </div>
        </div>

        <ArchivedFilterBar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
            members={members}
        />

        {/* TABLE CONTENT */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-sm text-slate-500">Loading archives...</span>
                </div>
            ) : tasks.length > 0 ? (
                <>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-bold text-slate-600 uppercase text-[11px] tracking-wider w-[50px] text-center">#</th>
                                    <th className="px-6 py-3 font-bold text-slate-600 uppercase text-[11px] tracking-wider w-[120px]">Key</th>
                                    <th className="px-6 py-3 font-bold text-slate-600 uppercase text-[11px] tracking-wider">Title</th>
                                    <th className="px-6 py-3 font-bold text-slate-600 uppercase text-[11px] tracking-wider w-[180px]">Assignee</th>
                                    <th className="px-6 py-3 font-bold text-slate-600 uppercase text-[11px] tracking-wider w-[120px]">Status</th>
                                    <th className="px-6 py-3 font-bold text-slate-600 uppercase text-[11px] tracking-wider w-[100px]">Type</th>
                                    <th className="px-6 py-3 font-bold text-slate-600 uppercase text-[11px] tracking-wider w-[100px]">Priority</th>
                                    <th className="px-6 py-3 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-right w-[100px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tasks.map((task, index) => {
                                    const stt = pagination.pageNumber * pagination.pageSize + index + 1;
                                    return (
                                        <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 text-center text-slate-400 font-medium text-xs">{stt}</td>
                                            <td className="px-6 py-4"><span className="font-mono font-medium text-slate-700">{task.taskCode}</span></td>
                                            
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800 line-clamp-1" title={task.title}>{task.title}</span>
                                                    {task.epic && (
                                                        <span className="text-[10px] mt-1 opacity-80 flex items-center gap-1" style={{ color: task.epic.color }}>
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: task.epic.color}}></span>
                                                            {task.epic.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {task.assignee ? (
                                                    <div className="flex items-center gap-2">
                                                        <img src={task.assignee.avatarUrl} alt={task.assignee.name} className="w-6 h-6 rounded-full border border-slate-200"/>
                                                        <span className="text-slate-600 truncate max-w-[120px] text-xs">{task.assignee.name}</span>
                                                    </div>
                                                ) : <span className="text-slate-400 italic text-xs">Unassigned</span>}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border inline-block text-center min-w-[80px]" style={{backgroundColor: task.status.color + '15', color: task.status.color, borderColor: task.status.color + '40'}}>
                                                    {task.status.name}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3">{getTypeBadge(task.taskType)}</td>

                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${getPriorityStyle(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleRequestRestore(task)} // ✅ Mở Modal
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md border border-transparent hover:border-blue-100 transition-all flex items-center gap-1 text-xs font-medium"
                                                        title="Restore Task"
                                                    >
                                                        <RefreshCcw className="w-3.5 h-3.5" /> Restore
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION CONTROLS */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
                        <p className="text-xs text-slate-500 font-medium">
                            Page <span className="font-bold text-slate-700">{pagination.pageNumber + 1}</span> of <span className="font-bold text-slate-700">{pagination.totalPages || 1}</span>
                            <span className="mx-2 text-slate-300">|</span>
                            Total <span className="font-bold text-slate-700">{pagination.totalElements}</span> items
                        </p>
                        
                        <div className="flex gap-1">
                            <Button onClick={() => handlePageChange(0)} disabled={pagination.first} variant="outline" size="icon" className="h-8 w-8 bg-white border-slate-200 text-slate-600 hover:text-blue-600">
                                <ChevronsLeft className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.first} variant="outline" size="icon" className="h-8 w-8 bg-white border-slate-200 text-slate-600 hover:text-blue-600">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.last} variant="outline" size="icon" className="h-8 w-8 bg-white border-slate-200 text-slate-600 hover:text-blue-600">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handlePageChange(pagination.totalPages - 1)} disabled={pagination.last} variant="outline" size="icon" className="h-8 w-8 bg-white border-slate-200 text-slate-600 hover:text-blue-600">
                                <ChevronsRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20">
                    <div className="p-4 bg-slate-50 rounded-full mb-3 shadow-sm border border-slate-100">
                        <Archive className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-600">No archived tasks found</p>
                    <p className="text-sm">Tasks you archive will appear here.</p>
                </div>
            )}
        </div>

        {/* ✅ CONFIRMATION MODAL */}
        <ConfirmationModal
            isOpen={confirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            onConfirm={confirmRestore}
            isLoading={isRestoring}
            title="Restore Task"
            description={`Are you sure you want to restore the task "${taskToRestore?.title}"? It will be moved back to the project board.`}
            confirmText="Restore"
            modalVariant="info" // Dùng màu xanh dương cho hành động khôi phục (không phải nguy hiểm)
        />
    </div>
  );
}