"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Trash2,
  Search,
  Grid,
  List as ListIcon,
  Filter,
  Archive,
  Loader2
} from "lucide-react";

import {
  getProjects,
  getTrashedProjects,
  createProject,
  deleteProject,
} from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/button"; // Giả sử có

import ProjectCard from "@/components/features/core/project/ProjectCard";
import CreateProjectModal from "@/components/features/core/project/CreateProjectModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ProjectPage() {
  const { showToast } = useToast();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  const [projects, setProjects] = useState<any[]>([]);
  const [trashedProjects, setTrashedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "trash">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProjects = async () => {
    if (!workspaceId || isNaN(workspaceId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // getProjects trả về PageResponse<Project>
      const page = await getProjects(workspaceId);

      // getTrashedProjects đã trả về array
      const trash = await getTrashedProjects(workspaceId);

      setProjects(page.content || []);
      setTrashedProjects(trash || []);

    } catch (err: any) {
      showToast(err.message || "Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (workspaceId) {
      loadProjects();
    }
  }, [workspaceId]);

  const handleCreateSuccess = (newProject: any) => {
    setProjects((prev) => [newProject, ...prev]);
    setShowModal(false);
    showToast("Project created successfully!", "success");
  };

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setDeleteLoading(true);
      await deleteProject(workspaceId, deleteTargetId);
      showToast("Project moved to trash!", "success");

      // Refresh data logic (Simple version: reload all)
      loadProjects();
    } catch (err: any) {
      showToast(err.message || "Failed to delete project", "error");
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  const currentList = activeTab === "active" ? projects : trashedProjects;
  const filteredList = currentList
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((p) =>
      filterPriority === "all" ? true : p.priority === filterPriority
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            <p className="text-sm text-slate-500 mt-1">Create and manage your team projects</p>
          </div>
          {activeTab === "active" && (
            <Button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Project
            </Button>
          )}
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* Tabs & Search Group */}
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "active" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <FolderKanban className="w-4 h-4" /> Active
              </button>
              <button
                onClick={() => setActiveTab("trash")}
                className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "trash" ? "bg-white text-red-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Trash2 className="w-4 h-4" /> Trash
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-4 h-9 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Priority Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="h-9 pl-9 pr-8 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="all">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              {activeTab === 'trash' ? <Trash2 className="w-8 h-8 text-slate-300" /> : <FolderKanban className="w-8 h-8 text-slate-300" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {searchQuery || filterPriority !== "all" ? "No projects found" : activeTab === 'trash' ? "Trash is empty" : "No projects yet"}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs text-center">
              {searchQuery || filterPriority !== "all"
                ? "Try adjusting your filters."
                : activeTab === 'active' ? "Create your first project to get started." : "Deleted projects will appear here."}
            </p>
            {activeTab === "active" && !searchQuery && filterPriority === "all" && (
              <Button
                onClick={() => setShowModal(true)}
                variant="outline"
                className="border-slate-300 text-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" /> Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className={`animate-in fade-in duration-500 ${viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col space-y-3"
            }`}>
            {filteredList.map((p, idx) => (
              <div key={p.id}>
                <ProjectCard
                  p={p}
                  onDelete={handleDelete}
                  isTrash={activeTab === "trash"}
                  workspaceId={workspaceId}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!deleteLoading) setIsDeleteModalOpen(false);
          }}
          onConfirm={confirmDelete}
          isLoading={deleteLoading}
          title="Delete Project?"
          description="This project will be moved to trash. You can restore it later."
          confirmText="Move to Trash"
          cancelText="Cancel"
        />

        <CreateProjectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          workspaceId={workspaceId}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </div>
  );
}