"use client";


import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import {
  Plus,
  Sparkles,
  List,
  Calendar,
  User,
  Flame,
} from "lucide-react";


import { getProjectBacklog, BacklogTask } from "@/services/apiProject";
import { CreateTaskModal } from "./create-task-modal";


interface BacklogProps {
  workspaceId: number;
  projectId: number;
}


export function Backlog({ workspaceId, projectId }: BacklogProps) {
  const [tasks, setTasks] = useState<BacklogTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);


  // =====================================================
  // 🔥 Load dữ liệu backlog từ API thật
  // =====================================================
  const fetchBacklog = async () => {
    try {
      setLoading(true);
      const data = await getProjectBacklog(workspaceId, projectId);
      setTasks(data);
    } catch (err) {
      console.error("❌ Lỗi load backlog:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchBacklog();
  }, []);


  // =====================================================
  // 🔥 Loading UI
  // =====================================================
  if (loading)
    return (
      <div className="p-20 text-center text-gray-400 animate-pulse">
        Đang tải backlog...
      </div>
    );


  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/20 to-white">
      <div className="p-6 max-w-[1500px] mx-auto space-y-6">


        {/* =====================================================
            🔥 HEADER
        ===================================================== */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 rounded-3xl p-8 shadow-xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>


          <div className="relative z-10 flex items-center justify-between">


            {/* LEFT */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                <List className="w-8 h-8 text-white" />
              </div>


              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                  Backlog
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </h2>
                <p className="text-white/80 text-sm">{tasks.length} tasks</p>
              </div>
            </div>


            {/* BUTTON */}
            <Button
              onClick={() => setOpenCreate(true)}
              className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg px-6 py-3 font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" /> Tạo Task
            </Button>
          </div>
        </div>


        {/* =====================================================
            🔥 LIST TASKS
        ===================================================== */}
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="shadow-md hover:shadow-xl transition-all duration-300 border-0"
              >
                <CardContent className="p-6 flex justify-between items-start">


                  {/* LEFT SIDE */}
                  <div className="flex-1 space-y-2">


                    {/* TITLE */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">
                        {task.title}
                      </h3>


                      {/* CODE */}
                      <span className="px-3 py-1 text-xs bg-gray-800 text-white rounded-full shadow">
                        {task.taskCode}
                      </span>


                     
                      {/* StatusName */}
                      <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full shadow">
                        {task.taskType}
                      </span>


                      {/* PRIORITY */}
                      <span
                        className={`px-3 py-1 text-xs rounded-full shadow font-semibold
                          ${
                            task.priority === "CRITICAL"
                              ? "bg-red-500 text-white"
                              : task.priority === "HIGH"
                              ? "bg-orange-500 text-white"
                              : task.priority === "MEDIUM"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-500 text-white"
                          }
                        `}
                      >
                        {task.priority}
                      </span>
                      {/* TYPE */}
                      <span className="px-3 py-1 text-xs bg-purple-50 text-purple-600 rounded-full shadow">
                        {task.statusName}
                      </span>
                    </div>


                    {/* EPIC */}
                    {task.epicName && (
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: task.epicColor }}
                        />
                        <p className="text-sm font-medium text-gray-700">
                          {task.epicName}
                        </p>
                      </div>
                    )}


                    {/* STORY POINTS + DUE DATE */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
                      {/* POINT */}
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        {task.storyPoints} pts
                      </div>


                      {/* DUE DATE */}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>


                  {/* RIGHT SIDE */}
                  <div className="flex items-center gap-3">


                    {/* AVATAR */}
                    {task.assigneeAvatarUrl ? (
                      <img
                        src={task.assigneeAvatarUrl}
                        className="w-14 h-14 rounded-xl shadow object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center shadow">
                        <User className="w-7 h-7 text-gray-500" />
                      </div>
                    )}


                    {/* NAME */}
                    <div className="text-sm text-right">
                      <p className="font-semibold text-gray-900">{task.assigneeName}</p>
                      <p className="text-gray-500">Assignee</p>
                    </div>
                  </div>


                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* =====================================================
               🔥 EMPTY STATE
          ===================================================== */
          <div className="text-center py-20 text-gray-500">
            <div className="w-20 h-20 mx-auto bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <List className="w-10 h-10" />
            </div>


            <h3 className="text-xl font-semibold mb-2">Chưa có task nào</h3>
            <p className="text-gray-500 mb-6">Hãy tạo task đầu tiên của bạn</p>


            <Button
              onClick={() => setOpenCreate(true)}
              className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-3 rounded-xl shadow font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" /> Tạo task mới
            </Button>
          </div>
        )}
      </div>


      {/* =====================================================
            🔥 CREATE TASK MODAL
      ===================================================== */}
      <CreateTaskModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        workspaceId={workspaceId}
        projectId={projectId}
        onCreated={fetchBacklog} // reload after create
      />
    </div>
  );
}

