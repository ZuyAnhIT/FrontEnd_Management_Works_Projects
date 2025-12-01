"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, ChevronDown, Plus, Calendar } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// API Services
import { updateTask } from "@/services/apiTask";
// Import API Status bạn vừa cung cấp
import { getProjectStatuses, RawStatusColumn } from "@/services/apiBoard"; 
import {
  getProjectMembers,
  getProjectTasks,
  getTasksGrouped,
  ProjectMember,
  TaskResponse,
  TasksGroupedResponse,
  ProjectTaskFilterParams,
} from "@/services/apiProject";

import TaskDetailPanel from "@/components/features/core/task/TaskDetailPanel";
import CreateTaskModal from "@/components/features/core/task/CreateTaskModal";
import ListHeader from "@/components/features/core/list/ListHeader";

// ==================================================================
// 1. COMPONENT CON: JIRA TASK ROW
// ==================================================================
const JiraTaskRow = ({
  task,
  members,
  statuses, // Nhận list status chuẩn từ API Board
  onSelect,
  onUpdate
}: {
  task: TaskResponse;
  members: ProjectMember[];
  statuses: RawStatusColumn[]; // Sử dụng RawStatusColumn
  onSelect: (t: TaskResponse) => void;
  onUpdate: (taskId: number, data: any) => void;
}) => {

  const getPriorityColor = (p: string) => {
    switch (p?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      case 'urgent': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  const statusColor = task.status?.color || '#64748b';
  
  // Style cho Select Status
  const dynamicStyle = {
    color: statusColor,
    backgroundColor: `${statusColor}15`, 
    borderColor: `${statusColor}40`,
  };

  return (
    <tr
      onClick={() => onSelect(task)}
      className="group bg-white hover:bg-slate-50 border-b border-slate-100 transition-all cursor-pointer text-sm"
    >
      {/* 1. KEY */}
      <td className="px-4 py-3 w-28 whitespace-nowrap align-middle">
        <span className="text-slate-500 font-mono text-xs font-medium">{task.taskCode}</span>
      </td>

      {/* 2. SUMMARY */}
      <td className="px-4 py-3 align-middle">
        <div className="flex flex-col justify-center">
          <span className="text-slate-700 font-medium hover:text-blue-600 transition-colors truncate max-w-[400px]">
            {task.title}
          </span>
        </div>
      </td>

      {/* 3. STATUS (DROPDOWN) */}
      <td className="px-4 py-2 w-48 align-middle" onClick={(e) => e.stopPropagation()}>
        <div className="relative group/status">
          <select
            className="appearance-none w-full h-8 pl-3 pr-8 text-[11px] font-bold uppercase rounded-[3px] border cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all truncate"
            style={dynamicStyle}
            value={task.status?.id || ''}
            onChange={(e) => onUpdate(task.id, { statusId: Number(e.target.value) })}
          >
            {statuses.map(st => (
              <option key={st.id} value={st.id} className="bg-white text-slate-700 font-medium py-1">
                {st.name.toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown 
            className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" 
            style={{ color: statusColor }}
          />
        </div>
      </td>

      {/* 4. PRIORITY */}
      <td className="px-4 py-3 w-32 align-middle">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </td>

      {/* 5. ASSIGNEE */}
      <td className="px-4 py-3 w-48 align-middle" onClick={(e) => e.stopPropagation()}>
        <div className="relative group/assignee w-full">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 py-1 px-2 rounded -ml-2 transition-colors">
            <Avatar className="w-6 h-6 border border-slate-100 shadow-sm">
              {task.assignee?.avatarUrl ? (
                <AvatarImage src={task.assignee.avatarUrl} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-slate-200 text-slate-600 text-[9px] font-bold">
                  {task.assignee?.name ? task.assignee.name.substring(0, 2).toUpperCase() : "UN"}
                </AvatarFallback>
              )}
            </Avatar>
            <span className={`text-xs truncate ${task.assignee ? 'text-slate-700 font-medium' : 'text-slate-400 font-normal italic'}`}>
              {task.assignee?.name || "Unassigned"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-auto opacity-0 group-hover/assignee:opacity-100 transition-opacity" />
          </div>

          <select
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            value={task.assignee?.id || 0}
            onChange={e => onUpdate(task.id, { assigneeId: Number(e.target.value) === 0 ? null : Number(e.target.value) })}
          >
            <option value={0}>Unassigned</option>
            {members.map(m => (
              <option key={m.userId} value={m.userId}>
                {m.fullName}
              </option>
            ))}
          </select>
        </div>
      </td>

      {/* 6. DUE DATE */}
      <td className="px-4 py-3 w-36 text-slate-500 text-xs align-middle">
        {task.dueDate ? (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        ) : (
          <span className="text-slate-300 ml-5">-</span>
        )}
      </td>
    </tr>
  );
};

// ==================================================================
// 2. MAIN PAGE COMPONENT
// ==================================================================

export default function ProjectListPage() {
  const params = useParams();
  const { activeCompany, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const companyId = activeCompany?.companyId;
  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  // Data State
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<TasksGroupedResponse>({});
  const [members, setMembers] = useState<ProjectMember[]>([]);
  
  // ✅ STATE: Sử dụng RawStatusColumn từ API bạn cung cấp
  const [statuses, setStatuses] = useState<RawStatusColumn[]>([]);

  // UI State
  const [groupBy, setGroupBy] = useState<string>("none");
  const [filters, setFilters] = useState<ProjectTaskFilterParams>({ search: "", page: 0, size: 50 });
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!companyId || !workspaceId || !projectId) return;

    const fetchDataInfo = async () => {
       try {
         // ✅ Gọi API getProjectStatuses mà bạn đã cung cấp
         const [membersRes, statusRes] = await Promise.all([
            getProjectMembers(companyId, workspaceId, projectId, { size: 100 }),
            getProjectStatuses(projectId) 
         ]);
         
         if(membersRes.content) setMembers(membersRes.content);
         
         // ✅ Lưu trực tiếp dữ liệu chuẩn RawStatusColumn[] vào state
         if(Array.isArray(statusRes) && statusRes.length > 0) {
            setStatuses(statusRes);
         }
       } catch (err) {
         console.error("Load project info failed", err);
       }
    };

    fetchDataInfo();
  }, [companyId, workspaceId, projectId]);

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    try {
      if (groupBy === "none") {
        const res = await getProjectTasks(companyId, workspaceId, projectId, filters);
        setTasks(res.content);
      } else {
        const res = await getTasksGrouped(companyId, workspaceId, projectId, groupBy, filters.sprintId, filters.search);
        setGroupedTasks(res);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      showToast("Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  }, [companyId, workspaceId, projectId, filters, groupBy, showToast]);

  useEffect(() => {
    if (!isAuthLoading) {
      const t = setTimeout(fetchData, 300);
      return () => clearTimeout(t);
    }
  }, [fetchData, isAuthLoading]);

  // --- UPDATE HANDLER ---
  const handleInlineUpdate = async (taskId: number, data: any) => {
    if (!companyId || !workspaceId || !projectId) return;

    // Helper update optimistic state
    const updateLocalState = (list: TaskResponse[]) => {
      return list.map(t => {
        if (t.id === taskId) {
          let updated = { ...t };
          
          if (data.statusId) {
            const statusObj = statuses.find(s => s.id === data.statusId);
            // Mapping RawStatusColumn sang format TaskStatus của TaskResponse (nếu cần thiết)
            if (statusObj) {
                updated.status = { 
                    id: statusObj.id,
                    name: statusObj.name,
                    color: statusObj.color,
                    isCompleted: statusObj.isCompletedStatus // mapping field
                };
            }
          }

          if (data.assigneeId) {
            const member = members.find(m => m.userId === data.assigneeId);
            if (member) {
              updated.assignee = {
                id: member.userId,
                name: member.fullName,
                avatarUrl: member.avatarUrl
              };
            }
          } else if (data.assigneeId === null) {
            updated.assignee = null;
          }

          return { ...updated, ...data };
        }
        return t;
      });
    };

    if (groupBy === 'none') {
      setTasks(prev => updateLocalState(prev));
    } else {
      setGroupedTasks(prev => {
        const newGrouped: TasksGroupedResponse = {};
        Object.keys(prev).forEach(key => {
          newGrouped[key] = updateLocalState(prev[key]);
        });
        return newGrouped;
      });
    }

    try {
      await updateTask(taskId, data);
      showToast("Updated successfully", "success");
    } catch (error) {
      showToast("Update failed", "error");
      fetchData(); 
    }
  };

  const handleTaskSelect = (task: TaskResponse) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  if (isAuthLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-white relative overflow-hidden">
      <ListHeader
        filters={filters}
        setFilters={setFilters}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        members={members}
        totalTasks={groupBy === "none" ? tasks.length : Object.values(groupedTasks).flat().length}
      />

      <div className="flex items-center justify-end px-6 py-3 bg-white border-b border-slate-200 shrink-0 z-10">
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-8 px-4 text-xs font-bold flex items-center rounded-[3px]">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Create
        </Button>
      </div>

      <div className="flex-1 overflow-hidden relative bg-slate-50/30">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <div className="min-w-full inline-block align-middle">
            {loading ? (
              <div className="flex items-center justify-center h-60"><Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-50" /></div>
            ) : (
              <div className="border-b border-slate-200 px-6">
                <table className="min-w-full text-left border-collapse w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm h-10">
                    <tr>
                      <th className="px-4 w-28 text-left bg-slate-50 border-r border-transparent">Key</th>
                      <th className="px-4 text-left bg-slate-50 border-r border-transparent">Summary</th>
                      <th className="px-4 w-48 text-left bg-slate-50 border-r border-transparent">Status</th>
                      <th className="px-4 w-32 text-left bg-slate-50 border-r border-transparent">Priority</th>
                      <th className="px-4 w-48 text-left bg-slate-50 border-r border-transparent">Assignee</th>
                      <th className="px-4 w-36 text-left bg-slate-50">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {groupBy === "none" ? (
                      tasks.length > 0 ? (
                        tasks.map(task => (
                          <JiraTaskRow 
                            key={task.id} 
                            task={task} 
                            members={members} 
                            statuses={statuses} 
                            onSelect={handleTaskSelect} 
                            onUpdate={handleInlineUpdate} 
                          />
                        ))
                      ) : (
                        <tr><td colSpan={6} className="text-center py-20 text-slate-400">No issues found.</td></tr>
                      )
                    ) : (
                      Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                        <React.Fragment key={`group-${groupName}`}>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <td colSpan={6} className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">{groupName}</span>
                                <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">{groupTasks.length}</span>
                              </div>
                            </td>
                          </tr>
                          {groupTasks.map(task => (
                            <JiraTaskRow 
                              key={task.id} 
                              task={task} 
                              members={members} 
                              statuses={statuses} 
                              onSelect={handleTaskSelect} 
                              onUpdate={handleInlineUpdate} 
                            />
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDetailOpen && selectedTask && (
        <TaskDetailPanel
          taskId={selectedTask.id}
          onClose={() => { setIsDetailOpen(false); setSelectedTask(null); }}
          onUpdate={fetchData}
          companyId={companyId!}
          workspaceId={workspaceId}
          projectId={projectId}
          members={members}
          statuses={statuses} // Truyền RawStatusColumn[] vào DetailPanel nếu nó hỗ trợ
          sprints={[]}
          epics={[]}
          isOpen={isDetailOpen}
          
          
        />
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
        companyId={companyId!}
        workspaceId={workspaceId}
        projectId={projectId}
        members={members}
      />
    </div>
  );
}