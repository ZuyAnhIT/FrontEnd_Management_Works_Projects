"use client";

import { useEffect, useState, useCallback } from "react";
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
  Filter
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/button";

import {
  getCompanyWorkspaces,
  searchCompanyWorkspaces,
  PageResponse,
  Workspace,
  deleteWorkspace,
  updateWorkspaceStatus
} from "@/services/apiWorkspace";

import CreateWorkspaceModal from "@/components/features/admin/CreateWorkspaceModal";
import WorkspaceCard from "@/components/features/admin/WorkspaceCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";


// -----------------------------------------------
// ⭐ Search fields dùng cho dropdown
// -----------------------------------------------
const SEARCH_FIELDS = [
  { value: "name", label: "Name" },
  { value: "code", label: "Code" },
  { value: "description", label: "Description" },
];

export default function CompanyWorkspacesPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const companyId = user?.company?.companyId;

  // Data
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // View
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search
  const [searchBy, setSearchBy] = useState("name");
  const [searchValue, setSearchValue] = useState("");

  // Modal Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // Pagination
  const [pagination, setPagination] = useState<Omit<PageResponse<Workspace>, "content">>({
    pageNumber: 0,
    pageSize: 12,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  type WorkspaceSearchParams = {
    page: number;
    size: number;
    sortBy: string;
    sortDir: "asc" | "desc";
    name?: string;
    code?: string;
    description?: string;
    status?: "ACTIVE" | "ARCHIVED" | "DELETED";
  };

  const [searchParams, setSearchParams] = useState<WorkspaceSearchParams>({
    page: 0,
    size: 10,
    sortBy: "createdAt",
    sortDir: "desc",

    name: undefined,
    code: undefined,
    description: undefined,
    status: undefined,
  });


  // ===============================================================
  // 🔄 Fetch Workspaces (đồng bộ MembersPage)
  // ===============================================================
  const fetchWorkspaces = useCallback(async (params: typeof searchParams) => {
    if (!companyId) return;
    setLoading(true);

    try {
      let data: PageResponse<Workspace>;

      const { name, code, description, status, ...apiParams } = params;
      const isSearching = name || code || description || status;

      if (isSearching) {
        data = await searchCompanyWorkspaces(companyId, params);
      } else {
        data = await getCompanyWorkspaces(companyId, apiParams);
      }

      setWorkspaces(data.content || []);
      setPagination({
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        first: data.first,
        last: data.last,
      });

    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to load workspaces", "error");
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, showToast]);

  // Auto reload khi params thay đổi (Debounce)
  useEffect(() => {
    if (!companyId || isAuthLoading) return;

    const t = setTimeout(() => fetchWorkspaces(searchParams), 300);
    return () => clearTimeout(t);

  }, [searchParams, companyId, isAuthLoading, fetchWorkspaces]);

  // ===============================================================
  // ⚙️ Pagination
  // ===============================================================
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  // ===============================================================
  // ⚙️ Sort
  // ===============================================================
  const handleSort = (field: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: field,
      sortDir:
        prev.sortBy === field && prev.sortDir === "desc" ? "asc" : "desc",
      page: 0,
    }));
  };

  // ===============================================================
  // ⚙️ Delete Workspace
  // ===============================================================
  const handleDelete = (workspaceId: number) => {
    setWorkspaceToDelete(workspaceId);
    setShowDeleteModal(true);
  };
  // ===============================================================
  // ⚙️ Navigate to workspace
  // ===============================================================
  const goToWorkspace = (id: number) => {
    router.push(`/core/workspace/${id}`);
  };


  // ===============================================================
  // 🛑 Loading
  // ===============================================================
  if (isAuthLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );

  const handleConfirmDelete = async () => {
    if (!workspaceToDelete || !companyId) return;

    setIsDeleting(true);

    try {
      await deleteWorkspace(companyId, workspaceToDelete);

      showToast("Workspace deleted successfully", "success");

      fetchWorkspaces(searchParams);
    } catch (err: any) {
      showToast(err.message || "Failed to delete workspace", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setWorkspaceToDelete(null);
    }
  };


  const handleRestore = async (workspaceId: number) => {
    if (!companyId) return;

    try {
      await updateWorkspaceStatus(companyId, workspaceId, "ACTIVE");

      showToast("Workspace restored successfully", "success");

      fetchWorkspaces(searchParams);
    } catch (err: any) {
      showToast(err.message || "Failed to restore workspace", "error");
    }
  };

  // ===============================================================
  // 🖥️ Render
  // ===============================================================
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Workspaces ({pagination.totalElements})</h1>
            <p className="text-sm text-slate-500">Manage working environments</p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Workspace
          </Button>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* LEFT: Search Field Selector + Search Input */}
          <div className="flex items-center gap-3 w-full md:w-auto">

            {/* Search By (dropdown nhỏ bên trái input) */}
            <div className="relative w-36">
              <select
                value={searchBy}
                onChange={(e) => {
                  const field = e.target.value;
                  setSearchBy(field);

                  setSearchParams(prev => ({
                    ...prev,
                    page: 0,
                    name: undefined,
                    code: undefined,
                    description: undefined,
                    [field]: searchValue,
                  }));
                }}
                className="w-full h-10 pl-3 pr-7 border rounded-md text-sm bg-white border-slate-300 focus:ring-2 focus:ring-blue-100"
              >
                {SEARCH_FIELDS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                value={searchValue}
                onChange={(e) => {
                  const text = e.target.value;
                  setSearchValue(text);

                  setSearchParams(prev => ({
                    ...prev,
                    page: 0,
                    name: undefined,
                    code: undefined,
                    description: undefined,
                    [searchBy]: text,
                  }));
                }}
                placeholder={`Search by ${searchBy}...`}
                className="w-full h-10 pl-9 pr-3 border border-slate-300 rounded-md text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* RIGHT: Sort button + View toggle */}
          <div className="flex items-center gap-3">

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={searchParams.sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="h-10 pl-3 pr-8 border border-slate-300 rounded-md text-sm bg-white"
              >
                <option value="createdAt">Sort by Created</option>
                <option value="workspaceName">Sort by Name</option>
              </select>
              <ChevronsRight className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dir */}
            <select
              value={searchParams.sortDir}
              onChange={(e) =>
                setSearchParams(prev => ({
                  ...prev,
                  sortDir: e.target.value as "asc" | "desc",
                }))
              }
              className="h-10 px-3 border border-slate-300 rounded-md text-sm bg-white"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>

            {/* View Switch */}
            <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500"
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${viewMode === "list"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500"
                  }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>


        {/* LIST */}
        {workspaces.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No workspaces found.
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-3"
            }
          >
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.workspaceId}
                workspace={ws}
                viewMode={viewMode}
                onDelete={handleDelete}
                onNavigate={goToWorkspace}
                onRestore={handleRestore}   // ⭐ THÊM DÒNG NÀY
              />


            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold">
              {pagination.pageNumber * pagination.pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {pagination.pageNumber * pagination.pageSize + workspaces.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold">{pagination.totalElements}</span>{" "}
            results
          </p>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePageChange(0)}
              disabled={pagination.first}
              size="icon"
              variant="outline"
              className="w-8 h-8"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => handlePageChange(pagination.pageNumber - 1)}
              disabled={pagination.first}
              size="icon"
              variant="outline"
              className="w-8 h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-sm font-medium">
              Page {pagination.pageNumber + 1} of {pagination.totalPages}
            </span>

            <Button
              onClick={() => handlePageChange(pagination.pageNumber + 1)}
              disabled={pagination.last}
              size="icon"
              variant="outline"
              className="w-8 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => handlePageChange(pagination.totalPages - 1)}
              disabled={pagination.last}
              size="icon"
              variant="outline"
              className="w-8 h-8"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* MODAL */}
        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          companyId={companyId}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchWorkspaces(searchParams);
          }}
        />
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="Delete Workspace"
          description="Are you sure you want to delete this workspace? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          modalVariant="danger"
        />

      </div>
    </div>
  );
}
