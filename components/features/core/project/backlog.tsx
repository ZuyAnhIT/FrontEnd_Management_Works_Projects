"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  List,
  Calendar,
  User,
  Flame,
  LayoutGrid,
  Search,
  Filter
} from "lucide-react";

// Import Toast
import { useToast } from "@/components/ui/ToastProvider";
import { getProjectBacklog, BacklogTask } from "@/services/apiProject";
import { CreateTaskModal } from "./create-task-modal";

interface BacklogProps {
  workspaceId: number;
  projectId: number;
}

export function Backlog({ workspaceId, projectId }: BacklogProps) {
  const { showToast } = useToast(); 
  const [tasks, setTasks] = useState<BacklogTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  const fetchBacklog = async () => {
    try {
      setLoading(true);
      const data = await getProjectBacklog(workspaceId, projectId);
      setTasks(data);
    } catch (err: any) {
      showToast(err.message || "Không thể tải danh sách Backlog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklog();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-700 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading backlog...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 🔥 Tăng độ rộng tối đa để cân với Board */}
      <div className="p-6 max-w-[2400px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-md">
              <List className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Backlog</h1>
              <p className="text-xs text-slate-500 font-medium">{tasks.length} tasks total</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-500 focus:bg-white transition-all w-64"
              />
            </div>
            
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 h-10">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>

            <Button 
              onClick={() => setOpenCreate(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm h-10 font-medium"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create Issue
            </Button>
          </div>
        </div>

        {/* LIST TASKS */}
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {/* Left: Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                      {task.taskCode}
                    </span>
                    {task.epicName && (
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide"
                        style={{ 
                          borderColor: task.epicColor ? `${task.epicColor}40` : '#e2e8f0',
                          color: task.epicColor || '#64748b',
                          backgroundColor: task.epicColor ? `${task.epicColor}10` : '#f8fafc'
                        }}
                      >
                        {task.epicName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 truncate pr-2">
                    {task.title}
                  </h3>
                </div>

                {/* Right: Meta Info */}
                <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                      {task.statusName}
                    </span>
                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold border uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400">
                    {task.storyPoints && (
                      <div className="flex items-center gap-1.5" title="Story Points">
                        <Flame className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium text-slate-600">{task.storyPoints}</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 hidden sm:flex" title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium text-slate-600">
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                        </span>
                      </div>
                    )}

                    <div className="pl-2 border-l border-slate-100" title={task.assigneeName || "Unassigned"}>
                      {task.assigneeAvatarUrl ? (
                        <img
                          src={task.assigneeAvatarUrl}
                          alt={task.assigneeName}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-white bg-slate-100"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="w-16 h-16 mb-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 shadow-sm">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No tasks found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6 max-w-xs mx-auto">Your backlog is currently empty. Start by creating a new task for your team.</p>
            <Button
              onClick={() => setOpenCreate(true)}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" /> Create First Issue
            </Button>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        workspaceId={workspaceId}
        projectId={projectId}
        onCreated={fetchBacklog}
      />
    </div>
  );
}