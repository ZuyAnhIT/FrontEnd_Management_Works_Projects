"use client";

// =================================================================
// 1️⃣ IMPORTS
// =================================================================
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
  Filter,
  Building2,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Buttons";

// API Services
import {
  getCompanyWorkspaces,
  searchCompanyWorkspaces,
  PageResponse,
  Workspace,
  deleteWorkspace,
  updateWorkspaceStatus,
} from "@/services/apiWorkspace";

// Components
import CreateWorkspaceModal from "@/components/features/admin/CreateWorkspaceModal";
import WorkspaceCard from "@/components/features/admin/WorkspaceCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// =================================================================
// 2️⃣ CONSTANTS & TYPES
// =================================================================

// Các trường cho phép tìm kiếm trong dropdown
const SEARCH_FIELDS = [
  { value: "name", label: "Name" },
  { value: "code", label: "Code" },
  { value: "description", label: "Description" },
];

// Định nghĩa tham số tìm kiếm chuẩn để gọi API
type WorkspaceSearchParams = {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  name?: string;
  code?: string;
  description?: string;
  status?: "ACTIVE" | "ARCHIVED" | "DELETED";
  [key: string]: any; // Cho phép dynamic key để map field search
};

// =================================================================
// 3️⃣ COMPONENT CHÍNH
// =================================================================
export default function CompanyWorkspacesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Lấy activeCompany từ AuthContext
  const { activeCompany, isLoading: isAuthLoading } = useAuth();
  const companyId = activeCompany?.companyId;

  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE GIAO DIỆN (View & Search) ---
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchBy, setSearchBy] = useState("name");
  const [searchValue, setSearchValue] = useState("");

  // --- STATE MODALS ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<number | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // --- STATE PHÂN TRANG & SEARCH PARAMS ---
  const [pagination, setPagination] = useState<
    Omit<PageResponse<Workspace>, "content">
  >({
    pageNumber: 0,
    pageSize: 12,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

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

  // =================================================================
  // 4️⃣ FETCH DATA LOGIC (Logic nghiệp vụ quan trọng)
  // =================================================================

  // Hàm gọi API lấy danh sách (được bọc useCallback để dùng trong useEffect)
  const fetchWorkspaces = useCallback(
    async (params: WorkspaceSearchParams) => {
      if (!companyId) return;
      setLoading(true);

      try {
        let data: PageResponse<Workspace>;

        // Tách các params search ra để kiểm tra xem có đang search không
        const { name, code, description, status, ...apiParams } = params;
        const isSearching = name || code || description || status;

        if (isSearching) {
          // Nếu có từ khóa -> Gọi API Search
          data = await searchCompanyWorkspaces(companyId, params);
        } else {
          // Nếu không -> Gọi API Get All
          data = await getCompanyWorkspaces(companyId, apiParams);
        }

        // Cập nhật State
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
        console.error("Fetch error:", err);
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load workspaces";
        showToast(message, "error");
        setWorkspaces([]);
      } finally {
        setLoading(false);
      }
    },
    [companyId, showToast]
  );

  // 🟢 USE EFFECT: Tự động load khi searchParams hoặc companyId thay đổi (Có Debounce)
  useEffect(() => {
    if (!companyId || isAuthLoading) return;

    const t = setTimeout(() => fetchWorkspaces(searchParams), 300);
    return () => clearTimeout(t);
  }, [searchParams, companyId, isAuthLoading, fetchWorkspaces]);

  // =================================================================
  // 5️⃣ HANDLERS (Logic nghiệp vụ quan trọng)
  // =================================================================

  // Chuyển trang
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  // Sắp xếp (Sort)
  const handleSort = (field: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: field,
      sortDir:
        prev.sortBy === field && prev.sortDir === "desc" ? "asc" : "desc",
      page: 0, // Reset về trang đầu khi sort
    }));
  };

  // Xử lý khi gõ vào ô tìm kiếm
  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      // Reset các field cũ
      name: undefined,
      code: undefined,
      description: undefined,
      // Gán giá trị vào field đang chọn (ví dụ: name: "abc")
      [searchBy]: text,
    }));
  };

  // Xử lý khi đổi tiêu chí tìm kiếm (Name -> Code)
  const handleSearchByChange = (field: string) => {
    setSearchBy(field);
    // Cập nhật lại params với giá trị hiện tại nhưng field mới
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      name: undefined,
      code: undefined,
      description: undefined,
      [field]: searchValue,
    }));
  };

  // Xóa Workspace (Mở modal)
  const handleDeleteClick = (workspaceId: number) => {
    setWorkspaceToDelete(workspaceId);
    setShowDeleteModal(true);
  };

  // Xác nhận Xóa (Gọi API)
  const handleConfirmDelete = async () => {
    if (!workspaceToDelete || !companyId) return;
    setIsDeleting(true);
    try {
      await deleteWorkspace(companyId, workspaceToDelete);
      showToast("Workspace deleted successfully", "success");
      // Load lại danh sách
      fetchWorkspaces(searchParams);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete workspace";
      showToast(message, "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setWorkspaceToDelete(null);
    }
  };

  // Khôi phục Workspace (Restore)
  const handleRestore = async (workspaceId: number) => {
    if (!companyId) return;
    try {
      await updateWorkspaceStatus(companyId, workspaceId, "ACTIVE");
      showToast("Workspace restored successfully", "success");
      fetchWorkspaces(searchParams);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to restore workspace";
      showToast(message, "error");
    }
  };

  // Điều hướng vào trang chi tiết Workspace (Module Core)
  const goToWorkspace = (id: number) => {
    router.push(`/core/workspace/${id}`);
  };

  // =================================================================
  // 6️⃣ RENDER UI
  // =================================================================

  // 🔴 Màn hình Loading Auth
  if (isAuthLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );

  // 🔴 Màn hình Empty (Chưa chọn công ty)
  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-10 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Building2 className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No Active Company
          </h3>
          <p className="text-slate-500 mt-1 mb-4">
            Please select a company from the dashboard.
          </p>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Go to Hub
          </Button>
        </div>
      </div>
    );
  }

  // 🔵 Màn hình chính
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Workspaces{" "}
              <span className="text-slate-400 font-normal text-lg ml-2">
                ({pagination.totalElements})
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage working environments for{" "}
              <span className="font-semibold text-blue-600">
                {activeCompany?.companyName}
              </span>
              .
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Workspace
          </Button>
        </div>

        {/* --- FILTER & SEARCH BAR --- */}
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* LEFT: Search Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Dropdown chọn trường tìm kiếm */}
            <div className="relative w-36">
              <select
                value={searchBy}
                onChange={(e) => handleSearchByChange(e.target.value)}
                className="w-full h-10 pl-3 pr-7 border rounded-lg text-sm bg-slate-50 border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer"
              >
                {SEARCH_FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Input tìm kiếm */}
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
              <input
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={`Search by ${searchBy}...`}
                className="w-full h-10 pl-9 pr-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* RIGHT: Sort & View Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={searchParams.sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none"
              >
                <option value="createdAt">Sort by Created</option>
                <option value="workspaceName">Sort by Name</option>
              </select>
              <ChevronsRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Direction */}
            <select
              value={searchParams.sortDir}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  sortDir: e.target.value as "asc" | "desc",
                }))
              }
              className="h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>

            {/* View Mode Switch (Grid/List) */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* --- CONTENT LIST --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No workspaces found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Create a new workspace to get started.
            </p>
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
                workspace={ws as any} // ÉP KIỂU ĐỂ TRÁNH LỖI TYPE STATUS
                viewMode={viewMode}
                onDelete={handleDeleteClick}
                onNavigate={goToWorkspace}
                onRestore={handleRestore}
              />
            ))}
          </div>
        )}

        {/* --- PAGINATION --- */}
        {workspaces.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {pagination.pageNumber * pagination.pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(
                  (pagination.pageNumber + 1) * pagination.pageSize,
                  pagination.totalElements
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {pagination.totalElements}
              </span>{" "}
              results
            </p>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(0)}
                disabled={pagination.first}
                size="icon"
                variant="outline"
                className="w-9 h-9"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={pagination.first}
                size="icon"
                variant="outline"
                className="w-9 h-9"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm font-medium px-2">
                Page {pagination.pageNumber + 1} / {pagination.totalPages || 1}
              </span>

              <Button
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={pagination.last}
                size="icon"
                variant="outline"
                className="w-9 h-9"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => handlePageChange(pagination.totalPages - 1)}
                disabled={pagination.last}
                size="icon"
                variant="outline"
                className="w-9 h-9"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* --- MODALS --- */}
        {/* Chỉ render modal tạo khi đã có companyId */}
        {companyId && (
          <CreateWorkspaceModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            companyId={companyId}
            onSuccess={() => {
              setShowCreateModal(false);
              // Refresh lại danh sách sau khi tạo
              fetchWorkspaces(searchParams);
            }}
          />
        )}

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
