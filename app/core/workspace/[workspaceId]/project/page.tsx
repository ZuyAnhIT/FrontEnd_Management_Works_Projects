"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Briefcase,
  LayoutGrid
} from "lucide-react";

// Context & Utils
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// API Services
import {
  getProjects,
  searchProjects,
  deleteProject,
  updateProjectStatus,
  Project,
  PageResponse,
} from "@/services/apiProject";

// Internal Components
import ProjectCard from "@/components/features/core/project/ProjectCard";
import CreateProjectModal from "@/components/features/core/project/CreateProjectModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Chatbot } from "@/components/chatbot/chatbot";
import { Button } from "@/components/ui/Buttons";

// =============================================================================
// 2. CONSTANTS & TYPES
// =============================================================================

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

interface ProjectSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: string;
  status?: string;
  name?: string;
  code?: string;
  manager?: string;
  [key: string]: any;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function ProjectPage() {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS, CONTEXT & PARAMS
  // ---------------------------------------------------------------------------
  
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const { activeCompany, isLoading: isAuthLoading } = useAuth();

  const workspaceId = Number(params.workspaceId);
  const companyId = activeCompany?.companyId;

  // ---------------------------------------------------------------------------
  // 5. STATE MANAGEMENT
  // ---------------------------------------------------------------------------

  // Trang thai du lieu
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Trang thai giao dien (View & Modals)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Trang thai loc va tim kiem
  const [searchBy, setSearchBy] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Trang thai xoa dự án
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Trang thai phan trang va tham so tim kiem
  const [pagination, setPagination] = useState({
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

  // ---------------------------------------------------------------------------
  // 6. DATA FETCHING (Handlers)
  // ---------------------------------------------------------------------------

  /**
   * Tai danh sach du an dua tren tham so tim kiem va loc status
   */
  const fetchProjectsData = useCallback(async (params: ProjectSearchParams) => {
    if (!workspaceId || !companyId) return;
    setIsLoading(true);

    try {
      const { name, code, manager, ...otherParams } = params;
      const isSearching = (name?.trim()) || (code?.trim()) || (manager?.trim());

      let response: PageResponse<Project>;

      if (isSearching) {
        response = await searchProjects(companyId, workspaceId, params);
      } else {
        response = await getProjects(companyId, workspaceId, otherParams);
      }

      setProjects(response.content || []);
      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        first: response.first,
        last: response.last,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to load projects";
      showToast(message, "error");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, workspaceId, showToast]);

  // Hieu ung tu dong tai lai khi searchParams thay doi (co Debounce)
  useEffect(() => {
    if (!workspaceId || !companyId || isAuthLoading) return;
    const timer = setTimeout(() => fetchProjectsData(searchParams), 300);
    return () => clearTimeout(timer);
  }, [searchParams, workspaceId, companyId, isAuthLoading, fetchProjectsData]);

  // ---------------------------------------------------------------------------
  // 7. EVENT HANDLERS (Business Logic)
  // ---------------------------------------------------------------------------

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (field: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === "desc" ? "asc" : "desc",
      page: 0,
    }));
  };

  const handleSearchUpdate = (text: string) => {
    setSearchValue(text);
    setSearchParams((prev) => {
      const newParams = { ...prev };
      // Xoa cac truong tim kiem cũ truoc khi gan truong moi
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

  const handleSearchCriteriaChange = (field: string) => {
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

  const handleStatusFilterUpdate = (status: string) => {
    setFilterStatus(status);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      status: status === "ALL" ? undefined : status,
    }));
  };

  const handleCreationSuccess = () => {
    setShowCreateModal(false);
    showToast("Project created successfully", "success");
    fetchProjectsData(searchParams);
  };

  const initiateDeleteProject = (id: number) => {
    setProjectToDelete(id);
    setIsDeleteModalOpen(true);
  };

  /**
   * Xac nhan di chuyen du an vao thung rac
   */
  const handleConfirmDeleteAction = async () => {
    if (!projectToDelete || !workspaceId || !companyId) return;
    setIsDeleting(true);
    try {
      await deleteProject(companyId, workspaceId, projectToDelete);
      showToast("Project moved to trash", "success");
      fetchProjectsData(searchParams);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to delete project", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  /**
   * Khoi phuc du an ve trang thai hoat dong
   */
  const handleRestoreProject = async (id: number) => {
    if (!workspaceId || !companyId) return;
    try {
      await updateProjectStatus(companyId, workspaceId, id, "ACTIVE");
      showToast("Project successfully restored", "success");
      fetchProjectsData(searchParams);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to restore project", "error");
    }
  };

  const navigateToProjectBoard = (projectId: number) => {
    router.push(`/core/workspace/${workspaceId}/project/${projectId}/board`);
  };

  // ---------------------------------------------------------------------------
  // 8. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F5F7] gap-3">
        <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
        <p className="text-[12px] font-black text-[#6B778C] uppercase tracking-widest">Syncing Projects...</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
        <p className="font-black text-[#6B778C] uppercase tracking-widest">No active workspace session</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] px-6 py-10 font-sans text-[#172B4D]">
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase flex items-center gap-3">
              Projects 
              <span className="text-[#0052CC] bg-blue-50 px-2.5 py-0.5 rounded-lg text-[14px]">
                {pagination.totalElements}
              </span>
            </h1>
            <p className="text-[14px] text-[#42526E] font-medium mt-1">
              Manage operational objectives and high-level project tasks.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-6 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create Project
          </Button>
        </div>

        {/* TOOLBAR: SEARCH & FILTER */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFE1E6] shadow-sm flex flex-col xl:flex-row gap-5 items-center justify-between">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            
            <div className="relative w-full md:w-44">
              <select
                value={searchBy}
                onChange={(e) => handleSearchCriteriaChange(e.target.value)}
                className="w-full h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[12px] font-black uppercase tracking-widest bg-[#F4F5F7] cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 appearance-none"
              >
                {SEARCH_FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative w-full md:w-[400px] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
              <input
                value={searchValue}
                onChange={(e) => handleSearchUpdate(e.target.value)}
                placeholder={`Filter projects by ${searchBy}...`}
                className="w-full pl-12 pr-4 h-11 bg-white border border-[#DFE1E6] rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-[#2684FF] transition-all"
              />
            </div>

            <div className="relative w-full md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterUpdate(e.target.value)}
                className="w-full h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[12px] font-black uppercase tracking-widest bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 appearance-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none rotate-90" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
            <div className="flex gap-2">
              <select
                value={searchParams.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[12px] font-bold uppercase tracking-wider bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 appearance-none text-[#42526E]"
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="priority">Priority</option>
              </select>
              <select
                value={searchParams.sortDir}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, sortDir: e.target.value }))}
                className="h-11 px-4 border border-[#DFE1E6] rounded-xl text-[12px] font-bold uppercase tracking-wider bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 text-[#42526E]"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
            
            <div className="flex bg-[#F4F5F7] p-1 rounded-xl border border-[#DFE1E6]">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all active:scale-95",
                  viewMode === "grid" ? "bg-white shadow-sm text-[#0052CC]" : "text-[#6B778C] hover:text-[#172B4D]"
                )}
                title="Grid Layout"
              >
                <Grid className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all active:scale-95",
                  viewMode === "list" ? "bg-white shadow-sm text-[#0052CC]" : "text-[#6B778C] hover:text-[#172B4D]"
                )}
                title="List Layout"
              >
                <ListIcon className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#F4F5F7]/50 backdrop-blur-sm z-10 rounded-2xl">
              <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80 mb-3" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Syncing Data...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-[#DFE1E6] rounded-2xl bg-white">
              <div className="w-16 h-16 bg-[#F4F5F7] rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-[16px] font-black uppercase tracking-widest text-[#172B4D]">No projects found</h3>
              <p className="text-[14px] text-[#6B778C] font-medium mt-1">Adjust filters or create a new project to get started.</p>
            </div>
          ) : (
            <div className={cn(
              "animate-in fade-in duration-500",
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"
            )}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  p={project}
                  viewMode={viewMode}
                  workspaceId={workspaceId}
                  isTrash={project.status === "DELETED"}
                  onDelete={initiateDeleteProject}
                  onRestore={handleRestoreProject}
                  onNavigate={() => navigateToProjectBoard(project.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION FOOTER */}
        {!isLoading && projects.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#DFE1E6]">
            <p className="text-[12px] font-bold text-[#6B778C] uppercase tracking-widest">
              Displaying <span className="text-[#172B4D]">{pagination.pageNumber * pagination.pageSize + 1}</span> 
              {" "}to <span className="text-[#172B4D]">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span> 
              {" "}of <span className="text-[#172B4D]">{pagination.totalElements}</span> entries
            </p>

            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#DFE1E6] shadow-sm">
              <PaginationBtn onClick={() => handlePageChange(0)} disabled={pagination.first} icon={ChevronsLeft} />
              <PaginationBtn onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.first} icon={ChevronLeft} />
              <div className="px-4 text-[11px] font-black uppercase tracking-[0.15em] text-[#0052CC]">
                Page {pagination.pageNumber + 1} / {pagination.totalPages}
              </div>
              <PaginationBtn onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.last} icon={ChevronRight} />
              <PaginationBtn onClick={() => handlePageChange(pagination.totalPages - 1)} disabled={pagination.last} icon={ChevronsRight} />
            </div>
          </div>
        )}

        {/* MODALS & CHATBOT */}
        {workspaceId && companyId && (
          <CreateProjectModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            workspaceId={workspaceId}
            companyId={companyId}
            onSuccess={handleCreationSuccess}
          />
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDeleteAction}
          isLoading={isDeleting}
          title="Archive Project"
          description="Are you sure you want to move this project to the trash? You can restore it later if needed."
          confirmText="Confirm Archive"
          cancelText="Cancel"
          modalVariant="danger"
        />

        <Chatbot />
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS (Refactored for Cleanliness)
// =============================================================================

const PaginationBtn = ({ onClick, disabled, icon: Icon }: any) => (
  <Button 
    onClick={onClick} 
    disabled={disabled} 
    variant="outline" 
    size="icon" 
    className="h-9 w-9 rounded-lg border-transparent text-[#42526E] hover:bg-[#F4F5F7] hover:text-[#172B4D] disabled:opacity-30 active:scale-90 transition-all"
  >
    <Icon className="w-4.5 h-4.5" />
  </Button>
);