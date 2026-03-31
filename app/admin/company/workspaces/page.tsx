"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Loader2, Plus, ChevronsLeft, ChevronLeft,
  ChevronRight, ChevronsRight, Grid, List as ListIcon,
  Filter, Building2, LayoutGrid
} from "lucide-react";

// Context & Utils
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// API Services
import {
  getCompanyWorkspaces, searchCompanyWorkspaces, deleteWorkspace,
  updateWorkspaceStatus, PageResponse, Workspace
} from "@/services/apiWorkspace";

// UI Components
import { Button } from "@/components/ui/Buttons";
import CreateWorkspaceModal from "@/components/features/admin/CreateWorkspaceModal";
import WorkspaceCard from "@/components/features/admin/WorkspaceCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// =============================================================================
// 2. CONSTANTS & INTERFACES
// =============================================================================

const SEARCH_FIELDS = [
  { value: "name", label: "Workspace Name" },
  { value: "code", label: "Workspace Code" },
  { value: "description", label: "Description" },
];

interface WorkspaceSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  name?: string;
  code?: string;
  description?: string;
  status?: "ACTIVE" | "ARCHIVED" | "DELETED";
  [key: string]: any; 
}

const DEFAULT_PAGE_SIZE = 12;

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function CompanyWorkspacesPage() {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & CONTEXT
  // ---------------------------------------------------------------------------
  
  const router = useRouter();
  const { showToast } = useToast();
  const { activeCompany, isLoading: isAuthLoading } = useAuth();
  const companyId = activeCompany?.companyId;

  // ---------------------------------------------------------------------------
  // 5. STATE MANAGEMENT
  // ---------------------------------------------------------------------------

  // Data States
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View & Filter States
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchBy, setSearchBy] = useState("name");
  const [searchValue, setSearchValue] = useState("");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination & Search Params States
  const [pagination, setPagination] = useState<Omit<PageResponse<Workspace>, "content">>({
    pageNumber: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  const [searchParams, setSearchParams] = useState<WorkspaceSearchParams>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  // ---------------------------------------------------------------------------
  // 6. DATA FETCHING (Handlers)
  // ---------------------------------------------------------------------------

  /**
   * Ham goi API lay danh sach workspace ket hop tim kiem va phan trang
   */
  const fetchWorkspaces = useCallback(async (params: WorkspaceSearchParams) => {
    if (!companyId) return;
    setIsLoading(true);

    try {
      let responseData: PageResponse<Workspace>;
      const { name, code, description, status, ...apiParams } = params;
      const isSearching = name || code || description || status;

      if (isSearching) {
        responseData = await searchCompanyWorkspaces(companyId, params);
      } else {
        responseData = await getCompanyWorkspaces(companyId, apiParams);
      }

      setWorkspaces(responseData.content || []);
      setPagination({
        pageNumber: responseData.pageNumber,
        pageSize: responseData.pageSize,
        totalElements: responseData.totalElements,
        totalPages: responseData.totalPages,
        first: responseData.first,
        last: responseData.last,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to retrieve workspaces";
      showToast(message, "error");
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, showToast]);

  // ---------------------------------------------------------------------------
  // 7. SIDE EFFECTS
  // ---------------------------------------------------------------------------

  /**
   * Tu dong goi API khi cac tham so tim kiem hoac cong ty thay doi (co Debounce)
   */
  useEffect(() => {
    if (!companyId || isAuthLoading) return;
    const timer = setTimeout(() => fetchWorkspaces(searchParams), 300);
    return () => clearTimeout(timer);
  }, [searchParams, companyId, isAuthLoading, fetchWorkspaces]);

  // ---------------------------------------------------------------------------
  // 8. EVENT HANDLERS (Business Logic)
  // ---------------------------------------------------------------------------

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

  const handleSearchUpdate = (text: string) => {
    setSearchValue(text);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      name: undefined, code: undefined, description: undefined,
      [searchBy]: text,
    }));
  };

  const handleSearchCriteriaChange = (field: string) => {
    setSearchBy(field);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      name: undefined, code: undefined, description: undefined,
      [field]: searchValue,
    }));
  };

  const initDeleteWorkspace = (workspaceId: number) => {
    setWorkspaceToDelete(workspaceId);
    setShowDeleteModal(true);
  };

  /**
   * Xac nhan va goi API xoa workspace
   */
  const handleConfirmDelete = async () => {
    if (!workspaceToDelete || !companyId) return;
    setIsDeleting(true);
    try {
      await deleteWorkspace(companyId, workspaceToDelete);
      showToast("Workspace successfully deleted", "success");
      fetchWorkspaces(searchParams);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to delete workspace";
      showToast(message, "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setWorkspaceToDelete(null);
    }
  };

  /**
   * Khoi phuc workspace da xoa hoac luu tru
   */
  const handleRestoreWorkspace = async (workspaceId: number) => {
    if (!companyId) return;
    try {
      await updateWorkspaceStatus(companyId, workspaceId, "ACTIVE");
      showToast("Workspace successfully restored", "success");
      fetchWorkspaces(searchParams);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to restore workspace";
      showToast(message, "error");
    }
  };

  const navigateToWorkspace = (id: number) => {
    router.push(`/core/workspace/${id}`);
  };

  // ---------------------------------------------------------------------------
  // 9. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] gap-3">
        <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin" />
        <p className="text-[13px] font-bold text-[#42526E] uppercase tracking-widest">Loading Environments...</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] p-6">
        <div className="max-w-md w-full text-center p-12 bg-white rounded-2xl border border-[#DFE1E6] shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#F4F5F7] rounded-full flex items-center justify-center border border-[#DFE1E6]">
            <Building2 className="w-10 h-10 text-[#6B778C]" />
          </div>
          <h3 className="text-xl font-black text-[#172B4D] tracking-tight">No Active Organization</h3>
          <p className="text-[#42526E] text-sm mt-2 mb-6 leading-relaxed">
            Please select an organization from the dashboard to manage its workspaces.
          </p>
          <Button variant="outline" onClick={() => router.push("/admin")} className="font-bold uppercase tracking-widest text-[12px]">
            Return to Hub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-10 px-6">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase flex items-center gap-3">
              Workspaces 
              <span className="text-[#0052CC] bg-blue-50 px-2.5 py-0.5 rounded-lg text-[14px]">
                {pagination.totalElements}
              </span>
            </h1>
            <p className="text-[14px] text-[#42526E] font-medium mt-1">
              Manage operational environments for <span className="text-[#0052CC] font-bold">{activeCompany?.companyName}</span>.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-6 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create Workspace
          </Button>
        </div>

        {/* TOOLBAR: SEARCH & FILTER */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFE1E6] shadow-sm flex flex-col xl:flex-row gap-5 items-center justify-between">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-48">
              <select
                value={searchBy}
                onChange={(e) => handleSearchCriteriaChange(e.target.value)}
                className="w-full h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[12px] font-black uppercase tracking-widest bg-[#F4F5F7] cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 appearance-none text-[#172B4D]"
              >
                {SEARCH_FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
              <input
                value={searchValue}
                onChange={(e) => handleSearchUpdate(e.target.value)}
                placeholder={`Search by ${searchBy}...`}
                className="w-full h-11 pl-12 pr-4 bg-white border border-[#DFE1E6] rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-[#2684FF] transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
            <div className="relative w-full sm:w-56">
              <select
                value={searchParams.sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="w-full h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[12px] font-bold uppercase tracking-wider bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 appearance-none text-[#42526E]"
              >
                <option value="createdAt">Sort by Creation Date</option>
                <option value="workspaceName">Sort by Name</option>
              </select>
              <ChevronsRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <select
              value={searchParams.sortDir}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, sortDir: e.target.value as "asc" | "desc" }))}
              className="h-11 px-4 border border-[#DFE1E6] rounded-xl text-[12px] font-bold uppercase tracking-wider bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 text-[#42526E]"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>

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
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#F4F5F7]/50 backdrop-blur-sm z-10 rounded-2xl border border-transparent">
              <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80 mb-3" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Syncing data...</span>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 border-2 border-dashed border-[#DFE1E6] rounded-2xl bg-white">
              <div className="w-16 h-16 bg-[#F4F5F7] rounded-full flex items-center justify-center mb-4">
                <LayoutGrid className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-[16px] font-black uppercase tracking-widest text-[#172B4D]">No workspaces found</h3>
              <p className="text-[14px] text-[#6B778C] font-medium mt-1">Adjust filters or create a new workspace to get started.</p>
            </div>
          ) : (
            <div className={cn(
              "animate-in fade-in duration-500",
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"
            )}>
              {workspaces.map((ws) => (
                <WorkspaceCard
                  key={ws.workspaceId}
                  workspace={ws as any}
                  viewMode={viewMode}
                  onDelete={initDeleteWorkspace}
                  onNavigate={navigateToWorkspace}
                  onRestore={handleRestoreWorkspace}
                />
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION FOOTER */}
        {!isLoading && workspaces.length > 0 && (
          <PaginationFooter pagination={pagination} onPageChange={handlePageChange} />
        )}

      </div>

      {/* MODALS */}
      {companyId && (
        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          companyId={companyId}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchWorkspaces(searchParams);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Decommission Workspace"
        description="Are you sure you want to delete this operational environment? This action will archive all associated projects and tasks."
        confirmText="Confirm Deletion"
        cancelText="Cancel"
        modalVariant="danger"
      />
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS (Refactored for Cleanliness)
// =============================================================================

const PaginationFooter = ({ pagination, onPageChange }: any) => {
  if (pagination.totalElements === 0) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[#DFE1E6]">
      <p className="text-[12px] font-bold text-[#6B778C] uppercase tracking-widest">
        Displaying <span className="text-[#172B4D]">{pagination.pageNumber * pagination.pageSize + 1}</span> 
        {" "}to <span className="text-[#172B4D]">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span> 
        {" "}of <span className="text-[#172B4D]">{pagination.totalElements}</span> entries
      </p>

      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#DFE1E6] shadow-sm">
        <PaginationBtn onClick={() => onPageChange(0)} disabled={pagination.first} icon={ChevronsLeft} />
        <PaginationBtn onClick={() => onPageChange(pagination.pageNumber - 1)} disabled={pagination.first} icon={ChevronLeft} />
        <div className="px-4 text-[11px] font-black uppercase tracking-[0.15em] text-[#0052CC]">
          Page {pagination.pageNumber + 1} / {pagination.totalPages}
        </div>
        <PaginationBtn onClick={() => onPageChange(pagination.pageNumber + 1)} disabled={pagination.last} icon={ChevronRight} />
        <PaginationBtn onClick={() => onPageChange(pagination.totalPages - 1)} disabled={pagination.last} icon={ChevronsRight} />
      </div>
    </div>
  );
};

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