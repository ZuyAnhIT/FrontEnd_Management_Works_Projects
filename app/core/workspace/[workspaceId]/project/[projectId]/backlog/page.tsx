"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Loader2, LayoutList } from "lucide-react";

// API & Types
import { 
  getProjectBacklog, 
  getProjectMembers, 
  ProjectBacklogResponse, 
  BacklogQueryParams,
  TaskSummary,
  ProjectMember
} from "@/services/apiProject";

// Components UI
import { Button } from "@/components/ui/button";
import BacklogHeader from "@/components/features/core/backlog/BacklogHeader";
import BacklogToolbar from "@/components/features/core/backlog/BacklogToolbar";
import SprintSection from "@/components/features/core/backlog/SprintSection";
import BacklogTaskItem from "@/components/features/core/backlog/BacklogTaskItem";
import TaskDetailPanel from "@/components/features/core/task/TaskDetailPanel";

// Components Logic (Create & Edit)
import QuickTaskCreate from "@/components/features/core/task/QuickTaskCreate";
import CreateTaskModal from "@/components/features/core/task/CreateTaskModal";
import QuickSprintButton from "@/components/features/core/sprint/QuickSprintButton";
import SprintDetailModal from "@/components/features/core/sprint/SprintDetailModal"; // ✅ Import Modal Chi tiết Sprint

export default function BacklogPage() {
  const params = useParams();
  const { showToast } = useToast();
  const { activeCompany, isLoading: isAuthLoading } = useAuth();

  const companyId = activeCompany?.companyId;
  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  // --- STATE DATA ---
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [data, setData] = useState<ProjectBacklogResponse | null>(null);
  const [backlogTasks, setBacklogTasks] = useState<TaskSummary[]>([]); 
  const [members, setMembers] = useState<ProjectMember[]>([]); 

  // --- STATE UI ---
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null); // ✅ State chọn Sprint để xem chi tiết
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // --- FILTER STATE ---
  const [filters, setFilters] = useState<BacklogQueryParams>({
    keyword: "",
    page: 0,
    size: 20, 
    sortBy: "createdAt",
    sortDir: "desc",
  });

  // ===============================================================
  // 1. FETCH MEMBERS
  // ===============================================================
  useEffect(() => {
    if (!companyId || !workspaceId || !projectId) return;
    
    const fetchMembers = async () => {
        try {
            const res = await getProjectMembers(companyId, workspaceId, projectId, { size: 100 });
            setMembers(res.content);
        } catch (error) {
            console.error("Failed to load members");
        }
    };
    fetchMembers();
  }, [companyId, workspaceId, projectId]);


  // ===============================================================
  // 2. FETCH BACKLOG DATA
  // ===============================================================
  const fetchData = useCallback(async (isLoadMore = false) => {
    if (!companyId || !workspaceId || !projectId) return;
    
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getProjectBacklog(companyId, workspaceId, projectId, filters);
      
      setData(res);
      
      if (isLoadMore) {
         setBacklogTasks(prev => [...prev, ...res.backlogTasks]);
      } else {
         setBacklogTasks(res.backlogTasks);
      }

    } catch (err: any) {
      showToast(err.message || "Failed to load backlog", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [companyId, workspaceId, projectId, filters, showToast]);

  // Auto reload when Filters change
  useEffect(() => {
    if (isAuthLoading) return;
    const t = setTimeout(() => {
       if (filters.page === 0) fetchData(false); 
    }, 300);
    return () => clearTimeout(t);
  }, [filters, isAuthLoading]); 

  // Pagination Load More
  useEffect(() => {
      if (isAuthLoading) return;
      if ((filters.page || 0) > 0) fetchData(true);
  }, [filters.page]);


  // ===============================================================
  // 3. HANDLERS
  // ===============================================================
  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, page: (prev.page || 0) + 1 }));
  };

  // Task Handlers
  const handleOpenTaskDetail = (taskId: number) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTaskId(null);
  };

  // Sprint Handlers
  const handleOpenSprintDetail = (sprintId: number) => {
    setSelectedSprintId(sprintId); // ✅ Mở Modal Sprint
  };

  const handleCloseSprintDetail = () => {
    setSelectedSprintId(null);
  };

  // ✅ GLOBAL REFRESH
  const handleRefresh = () => {
    fetchData(false);
  };

  // ===============================================================
  // 4. RENDER UI
  // ===============================================================
  if (isAuthLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;
  if (!companyId) return <div className="p-8 text-center">No Active Company</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
       
       {/* HEADER */}
       <BacklogHeader 
          totalTasks={data?.backlogTotalElements || 0} 
          onCreateClick={() => setIsCreateTaskModalOpen(true)}
          onRefresh={handleRefresh} 
       />

       {/* BODY CONTAINER */}
       <div className="flex flex-1 overflow-hidden relative">
          
          {/* LEFT: LIST CONTENT */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 transition-all duration-300">
             <div className={`mx-auto pb-20 ${selectedTaskId ? 'max-w-full' : 'max-w-[1200px]'}`}>
                
                {/* Toolbar Filter */}
                <BacklogToolbar 
                   filters={filters}
                   setFilters={setFilters}
                   members={members}
                />

                {loading && (!filters.page || filters.page === 0) ? (
                   <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
                ) : (
                   <>
                      {/* A. ACTIVE SPRINTS SECTION */}
                      {data?.activeSprints && data.activeSprints.length > 0 && (
                         <div className="animate-fadeInUp mb-6">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                               Active Sprints ({data.activeSprints.length})
                            </h2>
                            <SprintSection 
                                sprints={data.activeSprints} 
                                onTaskClick={handleOpenTaskDetail} 
                                onTaskCreated={handleRefresh} 
                                onSprintSettingsClick={handleOpenSprintDetail} // ✅ Truyền handler mở chi tiết Sprint
                            />
                         </div>
                      )}

                      {/* B. QUICK SPRINT BUTTON */}
                      <div className="mb-6">
                          <QuickSprintButton 
                              projectId={projectId} 
                              onSuccess={handleRefresh} 
                          />
                      </div>

                      {/* C. BACKLOG SECTION */}
                      <div className="animate-fadeInUp delay-100">
                         <div className="flex items-center justify-between mb-3 px-1">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                               Backlog ({data?.backlogTotalElements || 0} issues)
                            </h2>
                            <span className="text-[10px] text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                               Unscheduled
                            </span>
                         </div>

                         <div className="bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 min-h-[100px]">
                            {/* List Tasks */}
                            {backlogTasks.length > 0 ? (
                               <div className="space-y-2 mb-2">
                                  {backlogTasks.map(task => (
                                     <BacklogTaskItem 
                                        key={task.id} 
                                        task={task} 
                                        onClick={() => handleOpenTaskDetail(task.id)}
                                     />
                                  ))}
                               </div>
                            ) : (
                               <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                  <LayoutList className="w-10 h-10 mb-2 opacity-50" />
                                  <p className="text-sm">Backlog is empty or no tasks match filters.</p>
                               </div>
                            )}

                            {/* Quick Task Create (Backlog) */}
                            <div className="px-1">
                                <QuickTaskCreate 
                                    companyId={companyId}
                                    workspaceId={workspaceId}
                                    projectId={projectId}
                                    sprintId={null} 
                                    onSuccess={handleRefresh}
                                />
                            </div>
                         </div>

                         {/* Load More Button */}
                         {data && !data.last && (
                            <div className="mt-4 text-center">
                               <Button 
                                  variant="ghost" 
                                  onClick={handleLoadMore} 
                                  disabled={loadingMore}
                                  className="w-full sm:w-auto text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                               >
                                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                  Load More Issues
                               </Button>
                            </div>
                         )}
                      </div>
                   </>
                )}
             </div>
          </div>

          {/* RIGHT: TASK DETAIL PANEL */}
          {selectedTaskId && (
              <TaskDetailPanel 
                 taskId={selectedTaskId} 
                 onClose={handleCloseTaskDetail}
                 onUpdate={handleRefresh}
                 members={members}
                 sprints={data?.activeSprints}
              />
          )}
       </div>

       {/* ✅ GLOBAL SPRINT DETAIL MODAL (Hiển thị khi chọn Sprint) */}
       {selectedSprintId && (
          <SprintDetailModal 
             projectId={projectId}
             sprintId={selectedSprintId}
             onClose={handleCloseSprintDetail}
             onUpdate={handleRefresh}
          />
       )}

       {/* ✅ GLOBAL CREATE TASK MODAL */}
       <CreateTaskModal 
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          onSuccess={handleRefresh}
          companyId={companyId!}
          workspaceId={workspaceId}
          projectId={projectId}
          members={members}
       />
    </div>
  );
}