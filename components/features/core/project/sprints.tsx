"use client";


import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  GitBranch,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Calendar,
  Target,
  CheckCircle2,
  Plus,
} from "lucide-react";


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateSprintModal } from "./create-sprint-modal";
import { CreateTaskModal } from "./create-task-modal";


import { useToast } from "@/components/ui/ToastProvider";
import {
  getSprints,
  startSprint,
  completeSprint,
  cancelSprint,
  getSprintDetail,
  Sprint,
} from "@/services/apiSprint";


export function Sprints() {


  const { showToast } = useToast();
  const { projectId } = useParams() as { projectId: string };
  const params = useParams();
  const workspaceId = Number(params.workspaceId);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState<number | null>(null);
  const [createTaskSprintId, setCreateTaskSprintId] = useState<number | null>(null);


  //
  // ------------------------------------------
  // Load Sprints
  // ------------------------------------------
  //
  const loadSprints = async () => {
    try {
      setLoading(true);
      const data = await getSprints(Number(projectId));
      setSprints(data);
    } catch (err: any) {
      showToast(err.message || "Không thể tải danh sách sprint", "error");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (projectId) loadSprints();
  }, [projectId]);


  //
  // ------------------------------------------
  // Expand Sprint
  // ------------------------------------------
  //
  const toggleExpand = async (id: number) => {
    const isOpen = expanded.has(id);


    if (isOpen) {
      const s = new Set(expanded);
      s.delete(id);
      setExpanded(s);
      return;
    }


    try {
      setDetailLoading(id);
      const detail = await getSprintDetail(Number(projectId), id);


      // thay tasks
      setSprints((prev) =>
        prev.map((s) => (s.id === id ? { ...s, tasks: detail.tasks } : s))
      );


      // mở card
      const s = new Set(expanded);
      s.add(id);
      setExpanded(s);
    } catch (err: any) {
      showToast(err.message || "Không thể tải chi tiết sprint", "error");
    } finally {
      setDetailLoading(null);
    }
  };
  ///
  const reloadSprintDetail = async (sprintId: number) => {
    try {
      const detail = await getSprintDetail(Number(projectId), sprintId);


      setSprints(prev =>
        prev.map(s =>
          s.id === sprintId ? { ...s, tasks: detail.tasks } : s
        )
      );
    } catch (err) {
      console.error("Reload sprint detail failed:", err);
    }
  };


  //
  // ------------------------------------------
  // Actions
  // ------------------------------------------
  //
  const handleStart = async (id: number) => {
    try {
      await startSprint(Number(projectId), id);
      showToast("Sprint started!", "success");
      loadSprints();
    } catch (err: any) {
      showToast(err.message || "Không thể start sprint", "error");
    }
  };


  const handleComplete = async (id: number) => {
    try {
      await completeSprint(Number(projectId), id);
      showToast("Sprint completed!", "success");
      loadSprints();
    } catch (err: any) {
      showToast(err.message || "Không thể complete sprint", "error");
    }
  };




  const handleCancel = async (id: number) => {
    try {
      await cancelSprint(Number(projectId), id);
      showToast("Sprint canceled!", "success");
      loadSprints();
    } catch (err: any) {
      showToast(err.message || "Không thể cancel sprint", "error");
    }
  };


  //
  // ------------------------------------------
  // Stats
  // ------------------------------------------
  //
  const active = sprints.filter((s) => s.status === "IN_PROGRESS");
  const completed = sprints.filter((s) => s.status === "COMPLETED");


  //
  // ------------------------------------------
  // UI START
  // ------------------------------------------
  //
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading sprints...</p>
      </div>
    );


  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl p-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>


          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <GitBranch className="w-8 h-8 text-white" />
              </div>


              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">Sprints</h1>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>


                <div className="flex items-center gap-4 text-white/80">
                  <span className="text-sm">{sprints.length} total sprints</span>
                  <span className="text-sm flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {active.length} active
                  </span>
                </div>
              </div>
            </div>


            {/* OPEN MODAL */}
            <Button
              onClick={() => setShowCreateModal(true)}
              className="group bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 h-auto font-semibold"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Sprint
            </Button>
          </div>
        </div>


        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeInUp">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Sprints</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {active.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {completed.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Planned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* LIST */}
        <div className="space-y-6 animate-fadeInUp delay-100">
          {sprints.map((s, i) => {
            const isExpanded = expanded.has(s.id);


            const completedTasks = (s.tasks || []).filter(
              (t) => t.statusName === "COMPLETED" || t.statusName === "DONE"
            ).length;


            const totalTasks = (s.tasks || []).length;


            const percent =
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0;


            //
            // ---------------- Sprint Colors ----------------
            //
            const bgColor =
              s.status === "IN_PROGRESS"
                ? "from-purple-500 to-pink-500"
                : s.status === "COMPLETED"
                  ? "from-green-500 to-emerald-500"
                  : s.status === "CANCELLED"
                    ? "from-gray-500 to-gray-600"
                    : "from-blue-500 to-cyan-500";


            //
            // ---------------- Sprint Actions ----------------
            //
            const isPlanned = s.status === "NOT_STARTED";


            return (
              <Card
                key={s.id}
                className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden animate-fadeInUp"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="p-0">
                  {/* HEADER */}
                  <div className={`bg-gradient-to-r p-6 ${bgColor}`}>
                    <div className="flex items-start justify-between gap-4">
                      {/* LEFT */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-white">{s.name}</h2>


                          <span className="text-xs px-3 py-1.5 rounded-full font-semibold shadow-md bg-white/20 backdrop-blur-sm text-white">
                            {s.status}
                          </span>
                        </div>


                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-white/80" />
                          <p className="text-white/90 text-sm">{s.goal}</p>
                        </div>


                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-white/70 text-xs mb-1">Start Date</p>
                            <p className="text-white font-semibold">
                              {new Date(s.startDate).toLocaleDateString()}
                            </p>
                          </div>


                          <div>
                            <p className="text-white/70 text-xs mb-1">End Date</p>
                            <p className="text-white font-semibold">
                              {new Date(s.endDate).toLocaleDateString()}
                            </p>
                          </div>


                          <div>
                            <p className="text-white/70 text-xs mb-1">Tasks</p>
                            <p className="text-white font-semibold">{totalTasks}</p>
                          </div>


                          <div>
                            <p className="text-white/70 text-xs mb-1">Progress</p>
                            <p className="text-white font-semibold">{percent}%</p>
                          </div>
                        </div>
                      </div>


                      {/* ACTIONS */}
                      <div className="flex flex-col gap-2">
                        {isPlanned && (
                          <Button
                            onClick={() => handleStart(s.id)}
                            className="bg-white/20 text-white hover:bg-white/30"
                          >
                            Start
                          </Button>
                        )}


                        {s.status === "IN_PROGRESS" && (
                          <>
                            <Button
                              onClick={() => handleComplete(s.id)}
                              className="bg-white/20 text-white hover:bg-white/30"
                            >
                              Complete
                            </Button>


                            <Button
                              onClick={() => handleCancel(s.id)}
                              className="bg-white/20 text-white hover:bg-white/30"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>


                      {/* EXPAND */}
                      <button
                        onClick={() => toggleExpand(s.id)}
                        className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all duration-300 group shadow-lg"
                      >
                        {detailLoading === s.id ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isExpanded ? (
                          <ChevronDown className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                        )}
                      </button>
                    </div>


                    {/* PROGRESS BAR */}
                    <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-lg"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>


                  {/* TASK LIST */}
                  {isExpanded && (
                    <div className="p-6 bg-gradient-to-b from-purple-50 to-pink-50">
                      {/* HEADER: Sửa lại để có nút Create Task bên phải */}
                      <div className="flex items-center justify-between mb-4">


                        {/* Bên trái: Title và số lượng */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {totalTasks}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg">Sprint Tasks</h3>
                          <span className="text-sm text-gray-500">
                            ({completedTasks} completed)
                          </span>
                        </div>


                        <Button
                          // SỬA Ở ĐÂY: Lưu ID của sprint hiện tại vào state
                          onClick={() => setCreateTaskSprintId(s.id)}
                          className="hidden md:flex gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>New Task</span>
                        </Button>
                      </div>


                      <div className="space-y-3">
                        {(s.tasks || []).map((t, idx) => (
                          <div
                            key={t.id}
                            className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all duration-300 animate-fadeInUp"
                            style={{ animationDelay: `${idx * 30}ms` }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              {/* LEFT */}
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h4 className="font-bold text-gray-900">{t.title}</h4>


                                  {/* PRIORITY */}
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-semibold ${t.priority === "CRITICAL"
                                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                      : t.priority === "HIGH"
                                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                        : t.priority === "MEDIUM"
                                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                          : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                                      }`}
                                  >
                                    {t.priority}
                                  </span>


                                  {/* STATUS */}
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-semibold ${t.statusName === "DONE" || t.statusName === "COMPLETED"
                                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                      : t.statusName === "IN_PROGRESS"
                                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                        : t.statusName === "REVIEW"
                                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                          : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                                      }`}
                                  >
                                    {t.statusName}
                                  </span>
                                </div>
                              </div>


                              {/* AVATAR */}
                              <div className="flex-shrink-0 group">
                                <div className="relative">
                                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>


                                  <div className="relative w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-2xl">
                                      {t.assigneeAvatarUrl ? (
                                        <img
                                          src={t.assigneeAvatarUrl}
                                          className="w-12 h-12 rounded-2xl object-cover"
                                        />
                                      ) : (
                                        "👤"
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>


        {/* EMPTY */}
        {sprints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
              <GitBranch className="w-12 h-12 text-white" />
            </div>


            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No sprints yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first sprint to organize work
            </p>


            <Button
              onClick={() => setShowCreateModal(true)}
              className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 h-auto font-semibold"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Create First Sprint
            </Button>
          </div>
        )}


        {/* MODAL */}
        <CreateSprintModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          projectId={Number(projectId)}
          onCreated={() => {
            setShowCreateModal(false);
            loadSprints();
            showToast("Sprint created successfully!", "success");
          }}
        />
        {createTaskSprintId !== null && (
          <CreateTaskModal
            isOpen={true}
            onClose={() => setCreateTaskSprintId(null)}


            projectId={Number(projectId)}
            workspaceId={workspaceId}


            sprintId={createTaskSprintId}


            onCreated={async () => {
              const sid = createTaskSprintId;


              setCreateTaskSprintId(null);


              await loadSprints();                // reload danh sách sprint
              if (sid) await reloadSprintDetail(sid);  // reload task sprint đang mở


              showToast("Task created successfully!", "success");
            }}


          />
        )}


      </div>


      {/* ANIMATIONS */}
      <style jsx>{`
        .bg-grid-white\\/10 {
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
        .delay-100 {
          animation-delay: 100ms;
        }
      `}</style>
    </div>
  );
}



