"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, ChevronDown, Plus, LayoutList } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";

// API Services
import {
  getProjectMembers,
  getProjectTasks,
  getTasksGrouped,
  ProjectMember,
  TaskResponse,
  TasksGroupedResponse,
  ProjectTaskFilterParams
} from "@/services/apiProject";

// Feature Components
import TaskRow from "@/components/features/core/list/task-row";
// ✅ THAY ĐỔI: Import trực tiếp Panel thay vì Wrapper
import TaskDetailPanel from "@/components/features/core/task/TaskDetailPanel";
import CreateTaskModal from "@/components/features/core/task/CreateTaskModal";
import ListHeader from "@/components/features/core/list/ListHeader";

export default function ProjectListPage() {
  // 1. Context & Params
  const params = useParams();
  const { activeCompany, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const companyId = activeCompany?.companyId;
  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  // 2. State Data
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<TasksGroupedResponse>({});
  const [members, setMembers] = useState<ProjectMember[]>([]);

  // 3. State UI & Filters
  const [groupBy, setGroupBy] = useState<string>("none");
  const [filters, setFilters] = useState<ProjectTaskFilterParams>({
    search: "",
    page: 0,
    size: 50,
    assigneeId: undefined,
    priority: undefined,
    taskType: undefined
  });

  // Modal State
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ==================================================================
  // 4. FETCH DATA
  // ==================================================================
 
  useEffect(() => {
    if (!companyId || !workspaceId || !projectId) return;
    getProjectMembers(companyId, workspaceId, projectId, { size: 100 })
      .then(res => setMembers(res.content))
      .catch(err => console.error("Load members failed", err));
  }, [companyId, workspaceId, projectId]);

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    try {
        if (groupBy === "none") {
            const res = await getProjectTasks(companyId, workspaceId, projectId, filters);
            setTasks(res.content);
        } else {
            const res = await getTasksGrouped(
                companyId, workspaceId, projectId,
                groupBy,
                filters.sprintId,
                filters.search
            );
            setGroupedTasks(res);
        }
    } catch (error) {
        console.error("Failed to fetch tasks", error);
        showToast("Failed to load tasks", "error");
    } finally {
        setLoading(false);
    }
  }, [companyId, workspaceId, projectId, filters, groupBy, showToast]);

  useEffect(() => {
    if (isAuthLoading) return;
    const t = setTimeout(() => {
        fetchData();
    }, 300);
    return () => clearTimeout(t);
  }, [fetchData, isAuthLoading]);

  // ==================================================================
  // 5. HANDLERS
  // ==================================================================

  const handleTaskSelect = (task: TaskResponse) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // ==================================================================
  // 6. RENDER
  // ==================================================================
 
  if (isAuthLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  return (
    // Flex Col Layout: Header -> Action Bar -> Content
    <div className="h-[calc(100vh-64px)] flex flex-col bg-white relative overflow-hidden">
     
      {/* 1. LIST HEADER (Bộ lọc) */}
      <ListHeader
         filters={filters}
         setFilters={setFilters}
         groupBy={groupBy}
         setGroupBy={setGroupBy}
         members={members}
         totalTasks={groupBy === "none" ? tasks.length : Object.values(groupedTasks).flat().length}
      />

      {/* 2. ACTION BAR (Nút Create cố định - KHÔNG BỊ CUỘN) */}
      <div className="flex items-center justify-end px-6 py-3 bg-white border-b border-slate-200 shrink-0 z-10">
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-9 font-semibold transition-all active:scale-95 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Issue
          </Button>
      </div>

      {/* 3. CONTENT TABLE (Phần này sẽ cuộn) */}
      <div className="flex-1 overflow-hidden relative bg-slate-50/30">
         <div className="h-full overflow-y-auto custom-scrollbar">
           
            <div className="mx-auto max-w-[1800px] w-full px-6 py-6">
                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center h-60">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-50"/>
                    </div>
                ) : (
                    /* Table Container */
                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
                        <table className="min-w-full text-left border-collapse w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center bg-slate-50">#</th>
                                    <th className="px-4 py-3 w-32 bg-slate-50">Type / Key</th>
                                    <th className="px-4 py-3 bg-slate-50">Summary</th>
                                    <th className="px-4 py-3 w-36 bg-slate-50">Status</th>
                                    <th className="px-4 py-3 w-32 bg-slate-50">Priority</th>
                                    <th className="px-4 py-3 w-48 bg-slate-50">Assignee</th>
                                    <th className="px-4 py-3 w-32 bg-slate-50">Due Date</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {/* CASE 1: LIST VIEW */}
                                {groupBy === "none" ? (
                                    tasks.length > 0 ? (
                                        tasks.map(task => (
                                            <TaskRow key={task.id} task={task} onTaskSelect={handleTaskSelect} />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-16 text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <LayoutList className="w-10 h-10 opacity-20"/>
                                                    <span>No tasks found.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                ) : (
                                    /* CASE 2: GROUPED VIEW */
                                    Object.entries(groupedTasks).length > 0 ? (
                                        Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                                            <React.Fragment key={`group-${groupName}`}>
                                                {/* Group Header */}
                                                <tr className="bg-slate-50/80 border-b border-slate-200">
                                                    <td colSpan={7} className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <ChevronDown className="w-4 h-4 text-slate-500" />
                                                            <span className="font-bold text-xs text-slate-700 uppercase">{groupName}</span>
                                                            <span className="text-xs text-slate-400 font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                                {groupTasks.length} issues
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {/* Tasks */}
                                                {groupTasks.map(task => (
                                                    <TaskRow key={task.id} task={task} onTaskSelect={handleTaskSelect} />
                                                ))}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-16 text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <LayoutList className="w-10 h-10 opacity-20"/>
                                                    <span>No grouped tasks found.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
         </div>
      </div>

      {/* 3. DETAIL SLIDE OVER (FIXED) - ✅ DÙNG TRỰC TIẾP TASK DETAIL PANEL */}
      {isDetailOpen && selectedTask && (
        // Không cần bọc thêm div fixed vì TaskDetailPanel đã có fixed inset-0
        <TaskDetailPanel
            taskId={selectedTask.id}
            onClose={() => { setIsDetailOpen(false); setSelectedTask(null); }}
            onUpdate={handleRefresh}
            // Context
            companyId={companyId!}
            workspaceId={workspaceId}
            projectId={projectId}
            // Data Lists (Truyền members đã fetch, các list khác tạm để rỗng hoặc cần fetch thêm nếu muốn hiển thị dropdown đầy đủ)
            members={members}
            sprints={[]} 
            epics={[]}
            statuses={[]}
        />
      )}

      {/* 4. CREATE MODAL */}
      <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleRefresh}
          companyId={companyId!}
          workspaceId={workspaceId}
          projectId={projectId}
          members={members}
      />
    </div>
  );
}