"use client";
import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  Grid,
  List as ListIcon,
  Filter,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getCompanyWorkspaces,
  deleteWorkspace,
} from "@/services/apiWorkspace";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/button"; // Giả sử có component Button chuẩn

import CreateWorkspaceModal from "@/components/features/admin/CreateWorkspaceModal";
import WorkspaceCard from "@/components/features/admin/WorkspaceCard";

export default function CompanyWorkspacesPage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const companyId = user?.company?.companyId || null;
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!companyId) {
      setLoading(false);
      return;
    }
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const data = await getCompanyWorkspaces(companyId);
        setWorkspaces(data);
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách workspace.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, [companyId, isAuthLoading, showToast]);

  const handleGoToWorkspace = (workspaceId: number) => {
    router.push(`/core/workspace/${workspaceId}`);
  };

  const handleDelete = async (workspaceId: number) => {
    if (!companyId) return;
    // Thay confirm native bằng modal confirm (nếu có) sẽ tốt hơn
    if (!window.confirm("Are you sure you want to delete this workspace?")) return;

    try {
      await deleteWorkspace(companyId, workspaceId);
      showToast("Workspace deleted successfully!", "success");
      setWorkspaces((prev) => prev.filter((w) => w.workspaceId !== workspaceId));
    } catch (err: any) {
      showToast(err.message || "Failed to delete workspace!", "error");
    }
  };

  const handleCreateSuccess = (newWs: any) => {
    setWorkspaces((prev) => [newWs, ...prev]);
    setShowCreateModal(false);
    showToast("Workspace created successfully!", "success");
  };

  const filteredList = workspaces
    .filter((w) =>
      w.workspaceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter((w) =>
      filterStatus === "all" ? true : w.status === filterStatus
    );

  if (isAuthLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">Loading workspaces...</p>
        </div>
      </div>
    );

  if (!companyId)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">
        Error: Company information not found.
      </div>
    );

  return (
    // Nền xám nhạt (Jira standard)
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">
        
        {/* =====================================================
            HEADER: Title & Create Button
        ===================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-2xl font-bold text-slate-900">Workspaces</h1>
              <p className="text-sm text-slate-500 mt-1">Manage all departments and working environments</p>
           </div>
           
           <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px]"
           >
              <Plus className="w-4 h-4 mr-2" /> Create Workspace
           </Button>
        </div>

        {/* =====================================================
            TOOLBAR: Search & Filters
        ===================================================== */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
           
           {/* Search */}
           <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspaces..."
                className="w-full pl-9 pr-4 h-10 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
           </div>

           {/* Right Filters */}
           <div className="flex items-center gap-3 w-full md:w-auto">
              
              {/* Status Filter */}
              <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Filter className="w-4 h-4" />
                 </div>
                 <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-10 pl-9 pr-8 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                 >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                 </select>
              </div>

              {/* View Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
                 <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    title="Grid View"
                 >
                    <Grid className="w-4 h-4" />
                 </button>
                 <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    title="List View"
                 >
                    <ListIcon className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>

        {/* =====================================================
            CONTENT: Workspaces List
        ===================================================== */}
        {filteredList.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Building2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {searchQuery || filterStatus !== "all" ? "No workspaces found" : "No workspaces yet"}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs text-center">
              {searchQuery || filterStatus !== "all" 
                ? "Try adjusting your filters or search query." 
                : "Get started by creating your first workspace to organize your team."}
            </p>
            {!searchQuery && filterStatus === "all" && (
               <Button 
                  onClick={() => setShowCreateModal(true)}
                  variant="outline"
                  className="border-slate-300 text-slate-700"
               >
                  <Plus className="w-4 h-4 mr-2" /> Create Workspace
               </Button>
            )}
          </div>
        ) : (
          /* Grid/List Content */
          <div className={`animate-in fade-in duration-500 ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" // Tăng số cột cho màn hình lớn
              : "flex flex-col space-y-3"
          }`}>
            {filteredList.map((ws, idx) => (
              <div key={ws.workspaceId}>
                <WorkspaceCard
                  workspace={ws}
                  onDelete={handleDelete}
                  onNavigate={handleGoToWorkspace}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        )}

        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          companyId={companyId}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </div>
  );
}