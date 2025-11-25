"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { DragDropContext, DropResult } from "@hello-pangea/dnd"; 
import { Loader2, AlertCircle } from "lucide-react";

// API
import { 
  getProjectBoardData, 
  getProjectStatuses, 
  BoardColumnResponse, 
  RawBoardColumn, 
  RawStatusColumn,
  moveTaskToStatus,
  BoardFilterParams 
} from "@/services/apiBoard";
import { getProjectMembers, ProjectMember } from "@/services/apiProject"; 

// Components
import BoardHeader from "@/components/features/core/board/BoardHeader";
import BoardColumn from "@/components/features/core/board/BoardColumn";
import CreateColumnButton from "@/components/features/core/board/CreateColumnButton";

export default function BoardPage() {
  const params = useParams();
  const { showToast } = useToast();
  const { activeCompany, isLoading: isAuthLoading } = useAuth();

  // 1. Lấy IDs
  const paramCompanyId = Number(params.companyId);
  const companyId = !isNaN(paramCompanyId) ? paramCompanyId : activeCompany?.companyId;
  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  // --- STATE ---
  const [columns, setColumns] = useState<BoardColumnResponse[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<BoardFilterParams>({
    keyword: "",
    sprintId: null, 
    assigneeId: undefined,
    priority: undefined,
    taskType: undefined
  });

  // --- HELPER: CHUẨN HÓA DỮ LIỆU ---
  const normalizeData = (
    boardData: RawBoardColumn[], 
    statusList: RawStatusColumn[]
  ): BoardColumnResponse[] => {
    const columnMap = new Map<number, BoardColumnResponse>();

    // Init columns from status list
    if (Array.isArray(statusList)) {
        statusList.forEach(st => {
            columnMap.set(st.id, {
                id: st.id,
                name: st.name,
                color: st.color,
                position: st.sortOrder,
                isCompletedStatus: st.isCompletedStatus,
                tasks: [] 
            });
        });
    }

    // Fill tasks from board data
    if (Array.isArray(boardData)) {
        boardData.forEach(bd => {
            const existingCol = columnMap.get(bd.statusId);
            if (existingCol) {
                existingCol.tasks = bd.tasks || [];
            } else {
                columnMap.set(bd.statusId, {
                    id: bd.statusId,
                    name: bd.statusName,
                    color: bd.color || "#000000",
                    position: bd.order || 0,
                    isCompletedStatus: bd.isCompleted || false,
                    tasks: bd.tasks || []
                });
            }
        });
    }

    return Array.from(columnMap.values()).sort((a, b) => a.position - b.position);
  };

  // --- 2. FETCH DATA ---
  const fetchBoardData = useCallback(async () => {
    if (isAuthLoading) return;

    if (!companyId || !workspaceId || !projectId) {
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const [rawBoardData, rawStatusList, membersRes] = await Promise.all([
        getProjectBoardData(companyId, workspaceId, projectId, filters),
        getProjectStatuses(projectId),
        getProjectMembers(companyId, workspaceId, projectId, { size: 100 })
      ]);

      setMembers(membersRes.content || []);
      const normalizedColumns = normalizeData(rawBoardData, rawStatusList);
      setColumns(normalizedColumns);

    } catch (err: any) {
      console.error("❌ [API ERROR]:", err);
      setError(err.message || "Failed to load board data");
      showToast("Failed to load board data", "error");
    } finally {
      setLoading(false);
    }
  }, [companyId, workspaceId, projectId, filters, showToast, isAuthLoading]);

  // Debounce Search & Filter Change
  useEffect(() => {
    const t = setTimeout(() => {
        if (!isAuthLoading && companyId) fetchBoardData();
    }, 300);
    return () => clearTimeout(t);
  }, [fetchBoardData, isAuthLoading, companyId]);

  // --- 3. LOGIC MỚI: XỬ LÝ KHI TẠO CỘT THÀNH CÔNG ---
  const handleColumnCreated = (newStatusData: any) => {
    // Mapping dữ liệu từ API trả về thành format của BoardColumnResponse
    const newColumn: BoardColumnResponse = {
        id: newStatusData.id,
        name: newStatusData.name,
        color: newStatusData.color,
        position: newStatusData.sortOrder,
        isCompletedStatus: newStatusData.isCompletedStatus,
        tasks: [] // Cột mới chưa có task
    };

    // Cập nhật state để hiển thị ngay lập tức
    setColumns(prev => [...prev, newColumn]);
    showToast("Đã tạo cột mới thành công", "success");
  };

  // --- 4. DRAG & DROP HANDLER ---
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newColumns = columns.map(col => ({ ...col, tasks: [...col.tasks] }));
    const sourceColIndex = newColumns.findIndex(c => c.id.toString() === source.droppableId);
    const destColIndex = newColumns.findIndex(c => c.id.toString() === destination.droppableId);

    if (sourceColIndex === -1 || destColIndex === -1) return;

    const sourceCol = newColumns[sourceColIndex];
    const destCol = newColumns[destColIndex];
    
    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    destCol.tasks.splice(destination.index, 0, movedTask);

    setColumns(newColumns); 

    try {
        await moveTaskToStatus(Number(draggableId), {
            newStatusId: Number(destCol.id),
            newSortOrder: destination.index
        });
    } catch (error) {
        console.error("Move failed:", error);
        showToast("Move failed. Reverting...", "error");
        fetchBoardData(); 
    }
  };

  // --- RENDER ---
  if (isAuthLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-white overflow-hidden">
        
        <BoardHeader 
            filters={filters} 
            setFilters={setFilters}
            members={members}
            totalTasks={columns.reduce((acc, col) => acc + (col.tasks?.length || 0), 0)}
        />

        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-white">
            {loading && columns.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600"/>
                    <p className="text-sm text-slate-500 font-medium">Loading board...</p>
                </div>
            ) : error ? (
                <div className="h-full flex flex-col items-center justify-center text-red-500 gap-3">
                    <AlertCircle className="w-10 h-10 opacity-80"/>
                    <p className="font-medium">{error}</p>
                    <button onClick={fetchBoardData} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md shadow-sm hover:bg-red-50 font-semibold text-sm">
                        Try Again
                    </button>
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="h-full flex px-6 pt-6 pb-4 gap-4 items-start min-w-max">
                        
                        {columns.map((col, index) => (
                            <BoardColumn 
                                key={col.id} 
                                column={col} 
                                index={index}
                            />
                        ))}

                        {/* ✅ ĐÃ CẬP NHẬT: Truyền props cho nút tạo cột */}
                        <CreateColumnButton 
                            projectId={projectId} 
                            onSuccess={handleColumnCreated} 
                        />
                        
                    </div>
                </DragDropContext>
            )}
        </div>
    </div>
  );
}