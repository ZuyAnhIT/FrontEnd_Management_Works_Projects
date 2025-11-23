"use client";

// =================================================================
// 1️⃣ IMPORTS
// =================================================================
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Plus,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Grid,
  List as ListIcon,
  Filter,
  Briefcase
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/button";

// API Services
import {
  getProjects,
  searchProjects,
  deleteProject,
  updateProjectStatus,
  Project,
  PageResponse
} from "@/services/apiProject";

// Components
import ProjectCard from "@/components/features/core/project/ProjectCard";
import CreateProjectModal from "@/components/features/core/project/CreateProjectModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// =================================================================
// 2️⃣ CONSTANTS & TYPES
// =================================================================

const SEARCH_FIELDS = [
  { value: "name", label: "Project Name" },
  { value: "code", label: "Project Code" }, 
  { value: "manager", label: "Manager" },   
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PAUSED", label: "Paused" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

type ProjectSearchParams = {
  page: number;
  size: number;
  sortBy: string;
  sortDir: string;
  status?: string;
  name?: string;
  code?: string;
  manager?: string;
  [key: string]: any;
};

// =================================================================
// 3️⃣ COMPONENT CHÍNH
// =================================================================
export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  
  // ✅ Lấy workspaceId chuẩn từ URL và ép kiểu số
  const workspaceId = Number(params.workspaceId);
  
  const { showToast } = useToast();
  const { activeCompany, isLoading: isAuthLoading } = useAuth();
  const companyId = activeCompany?.companyId;

  // --- STATE DATA ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE UI ---
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // --- STATE SEARCH & FILTER ---
  const [searchBy, setSearchBy] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // --- STATE DELETE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- STATE PAGINATION ---
  const [pagination, setPagination] = useState<Omit<PageResponse<Project>, "content">>({
    pageNumber: 0,
    pageSize: 12,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  const [searchParams, setSearchParams] = useState<ProjectSearchParams>({
    page: 0,
    size: 12,
    sortBy: "createdAt",
    sortDir: "desc",
    status: undefined, 
  });

  // ===============================================================
  // 4️⃣ FETCH DATA LOGIC
  // ===============================================================
  const fetchProjects = useCallback(async (params: ProjectSearchParams) => {
    if (!workspaceId || !companyId) return;
    setLoading(true);

    try {
      const { name, code, manager, ...otherParams } = params;
      const isSearching = (name && name.trim() !== "") || 
                          (code && code.trim() !== "") || 
                          (manager && manager.trim() !== "");

      let data: PageResponse<Project>;

      if (isSearching) {
        // Gọi API Search
        data = await searchProjects(companyId, workspaceId, params);
      } else {
        // Gọi API List thường
        data = await getProjects(companyId, workspaceId, otherParams);
      }

      setProjects(data.content || []);
      setPagination({
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        first: data.first,
        last: data.last,
      });

    } catch (err: any) {
      console.error("Fetch error:", err);
      showToast(err.message || "Failed to load projects", "error");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, workspaceId, showToast]);

  // Auto reload
  useEffect(() => {
    if (!workspaceId || !companyId) return;
    const t = setTimeout(() => fetchProjects(searchParams), 300);
    return () => clearTimeout(t);
  }, [searchParams, workspaceId, companyId, fetchProjects]);


  // ===============================================================
  // 5️⃣ HANDLERS
  // ===============================================================

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (field: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === "desc" ? "asc" : "desc",
      page: 0,
    }));
  };

  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    setSearchParams((prev) => {
        const newParams = { ...prev };
        delete newParams.name;
        delete newParams.code;
        delete newParams.manager;
        
        newParams.page = 0;
        if (text.trim() !== "") {
            newParams[searchBy] = text.trim();
        }
        return newParams;
    });
  };

  const handleSearchByChange = (field: string) => {
    setSearchBy(field);
    setSearchValue(""); 
    setSearchParams((prev) => {
        const newParams = { ...prev };
        delete newParams.name;
        delete newParams.code;
        delete newParams.manager;
        return { ...newParams, page: 0 };
    });
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      status: status === "ALL" ? undefined : status,
    }));
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    showToast("Project created successfully!", "success");
    fetchProjects(searchParams);
  };

  // --- DELETE LOGIC ---
  const handleDeleteClick = (id: number) => {
    setProjectToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete || !workspaceId || !companyId) return;
    setIsDeleting(true);
    try {
      await deleteProject(companyId, workspaceId, projectToDelete);
      showToast("Project moved to trash!", "success");
      fetchProjects(searchParams);
    } catch (err: any) {
      showToast(err.message || "Failed to delete project", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleRestore = async (id: number) => {
    if (!workspaceId || !companyId) return;
    try {
      await updateProjectStatus(companyId, workspaceId, id, "ACTIVE");
      showToast("Project restored successfully!", "success");
      fetchProjects(searchParams);
    } catch (err: any) {
      showToast(err.message || "Failed to restore project", "error");
    }
  };

  // Navigate to Board
  const goToProjectBoard = (projectId: number) => {
    router.push(`/core/workspace/${workspaceId}/project/${projectId}/board`);
  };


  // ===============================================================
  // 6️⃣ RENDER UI
  // ===============================================================

  if (isAuthLoading) return <div className="flex items-center justify-center h-screen bg-slate-50"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;

  if (!companyId) return <div className="p-8 text-center">No Active Company</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
               Projects <span className="text-slate-400 text-lg ml-2">({pagination.totalElements})</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage projects and tasks.</p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Project
          </Button>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
             
             {/* Search Field Select */}
             <div className="relative w-full md:w-36">
                <select
                  value={searchBy}
                  onChange={(e) => handleSearchByChange(e.target.value)}
                  className="w-full h-10 pl-3 pr-7 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer"
                >
                   {SEARCH_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
             </div>

             {/* Search Input */}
             <div className="relative w-full md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={`Search by ${searchBy}...`}
                  className="w-full h-10 pl-9 pr-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
             </div>

             {/* Status Filter */}
             <div className="relative w-full md:w-44">
                <select
                   value={filterStatus}
                   onChange={(e) => handleStatusChange(e.target.value)}
                   className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer bg-white text-slate-700"
                >
                   {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
             </div>
          </div>

          {/* Right: Sort & View */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
             <div className="flex gap-2">
                <select
                  value={searchParams.sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                   <option value="createdAt">Created Date</option>
                   <option value="name">Name</option>
                   <option value="priority">Priority</option>
                </select>
                
                <select
                  value={searchParams.sortDir}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, sortDir: e.target.value }))}
                  className="h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                   <option value="desc">Desc</option>
                   <option value="asc">Asc</option>
                </select>
             </div>

             <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}><ListIcon className="w-4 h-4" /></button>
             </div>
          </div>
        </div>

        {/* LIST CONTENT */}
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                p={p}
                viewMode={viewMode}
                // ✅ QUAN TRỌNG: Truyền workspaceId xuống ProjectCard để fix lỗi link Settings
                workspaceId={workspaceId} 
                isTrash={p.status === "DELETED"}
                onDelete={handleDeleteClick}
                onRestore={handleRestore}
                onNavigate={() => goToProjectBoard(p.id)}
              />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {projects.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                <p className="text-sm text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{(pagination.pageNumber * pagination.pageSize) + 1}</span> to <span className="font-semibold text-slate-900">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span> of <span className="font-semibold text-slate-900">{pagination.totalElements}</span> results
                </p>
                <div className="flex items-center gap-1">
                    <Button onClick={() => handlePageChange(0)} disabled={pagination.first} variant="outline" size="icon" className="h-9 w-9"><ChevronsLeft className="w-4 h-4" /></Button>
                    <Button onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.first} variant="outline" size="icon" className="h-9 w-9"><ChevronLeft className="w-4 h-4" /></Button>
                    <span className="text-sm font-medium px-2">Page {pagination.pageNumber + 1} / {pagination.totalPages || 1}</span>
                    <Button onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.last} variant="outline" size="icon" className="h-9 w-9"><ChevronRight className="w-4 h-4" /></Button>
                    <Button onClick={() => handlePageChange(pagination.totalPages - 1)} disabled={pagination.last} variant="outline" size="icon" className="h-9 w-9"><ChevronsRight className="w-4 h-4" /></Button>
                </div>
            </div>
        )}

        {/* MODALS */}
        {workspaceId && companyId && (
            <CreateProjectModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} workspaceId={workspaceId} companyId={companyId} onSuccess={handleCreateSuccess} />
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="Delete Project?"
          description="This project will be moved to trash. You can restore it later."
          confirmText="Delete"
          cancelText="Cancel"
          modalVariant="danger"
        />

      </div>
    </div>
  );
}