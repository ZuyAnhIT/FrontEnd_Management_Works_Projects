"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  List,
  CheckSquare,
} from "lucide-react";

// API client
import apiClient from "@/lib/apiClient";

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: {
    avatar: string;
    name: string;
  } | null;
  subtasks: Subtask[];
}

interface BacklogProps {
  projectId: number;
}

export function Backlog({ projectId }: BacklogProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

  // =========================
  // 📌 Load tasks từ API thật
  // =========================
  const fetchTasks = async () => {
    try {
      const res = await apiClient.get(`/api/projects/${projectId}/tasks`);
      setTasks(res.data.data || []);
    } catch (error) {
      console.error("❌ Lỗi fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleExpand = (taskId: number) => {
    const updated = new Set(expandedTasks);
    updated.has(taskId) ? updated.delete(taskId) : updated.add(taskId);
    setExpandedTasks(updated);
  };

  if (loading)
    return (
      <div className="p-20 text-center text-gray-400 animate-pulse">
        Loading tasks...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl p-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <List className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">Backlog</h1>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-white/80 text-sm">{tasks.length} tasks in total</p>
              </div>
            </div>

            <Button className="group bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 h-auto font-semibold">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4 animate-fadeInUp">
          {tasks.map((task, index) => {
            const isExpanded = expandedTasks.has(task.id);
            const done = task.subtasks.filter((st) => st.completed).length;
            const total = task.subtasks.length;

            return (
              <Card
                key={task.id}
                className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-0">

                    {/* Expand button */}
                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="flex-shrink-0 p-5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                      )}
                    </button>

                    {/* Task content */}
                    <div className="flex-1 py-5 pr-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Title */}
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>

                            {/* Priority */}
                            <span
                              className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-md ${
                                task.priority === "critical"
                                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                  : task.priority === "high"
                                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                  : task.priority === "medium"
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                  : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                              }`}
                            >
                              {task.priority}
                            </span>

                            {/* STATUS */}
                            <span
                              className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-md ${
                                task.status === "done"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : task.status === "review"
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                  : task.status === "in-progress"
                                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                  : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                              }`}
                            >
                              {task.status}
                            </span>

                            {/* Subtasks badge */}
                            {total > 0 && (
                              <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                {done}/{total}
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {task.description}
                          </p>

                          {/* Expanded subtasks */}
                          {isExpanded && total > 0 && (
                            <div className="mt-6 space-y-3 pt-4 border-t-2 border-purple-100">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckSquare className="w-5 h-5 text-purple-600" />
                                <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">
                                  Subtasks ({done}/{total})
                                </p>
                              </div>

                              {task.subtasks.map((subtask, subIndex) => (
                                <div
                                  key={subtask.id}
                                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-md animate-fadeInUp"
                                  style={{ animationDelay: `${subIndex * 30}ms` }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    readOnly
                                    className="w-5 h-5 rounded border-2 border-purple-300 text-purple-600"
                                  />

                                  <span
                                    className={`text-sm flex-1 ${
                                      subtask.completed
                                        ? "line-through text-gray-400"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {subtask.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Assignee */}
                        {task.assignee && (
                          <div className="flex-shrink-0 group">
                            <div className="relative">
                              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>
                              <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">{task.assignee.avatar}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
              <List className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-6">Create your first task</p>
            <Button className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 h-auto font-semibold">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Add Your First Task
            </Button>
          </div>
        )}
      </div>

      {/* CSS */}
      <style jsx>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
