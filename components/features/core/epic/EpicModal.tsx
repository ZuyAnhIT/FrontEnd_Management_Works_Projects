"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  ArrowLeft,
  Calendar,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextAreas";

import { apiEpic, Epic, CreateEpicPayload } from "@/services/apiEpic";
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// 1. CONSTANTS & INTERFACES
// =============================================================================

const EPIC_COLORS = [
  "#8e44ad",
  "#3498db",
  "#e67e22",
  "#e74c3c",
  "#2ecc71",
  "#1abc9c",
  "#9b59b6",
  "#f1c40f",
  "#34495e",
  "#95a5a6",
];

interface EpicModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  currentEpicId: number | null; // ID của Epic hiện tại của Task (có thể null)
  onSelectEpic: (epic: Epic | null) => void;
}

type ViewMode = "LIST" | "CREATE" | "EDIT" | "DELETE_CONFIRM";

// Lấy type của payload Create/Update
type EpicFormPayload = Omit<CreateEpicPayload, "status"> & { status?: string };

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function EpicModal({
  isOpen,
  onClose,
  projectId,
  currentEpicId,
  onSelectEpic,
}: EpicModalProps) {
  // --- HOOKS ---
  const { showToast } = useToast();

  // --- STATE ---
  const [mode, setMode] = useState<ViewMode>("LIST");
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [formData, setFormData] = useState<EpicFormPayload>({
    name: "",
    description: "",
    color: EPIC_COLORS[0],
    startDate: "",
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // --- EFFECT: LOAD DATA ---
  useEffect(() => {
    if (isOpen) {
      setMode("LIST");
      setSearchTerm("");
      setDeleteConfirmation("");
      fetchEpics();
    }
  }, [isOpen, projectId]);

  const fetchEpics = async () => {
    setLoading(true);
    try {
      const data = await apiEpic.getEpics(projectId);
      setEpics(data);
    } catch (error) {
      showToast("Failed to load Epics.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- MEMO: SẮP XẾP DANH SÁCH EPIC ---
  // 1. Lọc theo search term
  // 2. Nếu không search, đưa Epic đang chọn (currentEpicId) lên đầu danh sách
  const displayEpics = useMemo(() => {
    let result = epics.filter((e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!searchTerm && currentEpicId) {
      const currentIndex = result.findIndex((e) => e.id === currentEpicId);
      if (currentIndex > -1) {
        const currentEpic = result[currentIndex];
        const rest = [...result];
        rest.splice(currentIndex, 1);
        return [currentEpic, ...rest]; // Đưa lên đầu
      }
    }
    return result;
  }, [epics, searchTerm, currentEpicId]);

  // --- HANDLERS ---

  // Chọn Epic và đóng modal
  const handleSelect = (epic: Epic | null) => {
    onSelectEpic(epic);
    onClose();
  };

  // Mở Form tạo mới
  const handleOpenCreate = () => {
    setEditingEpic(null);
    setFormData({
      name: "",
      description: "",
      color: EPIC_COLORS[0],
      startDate: "",
      dueDate: "",
    });
    setMode("CREATE");
  };

  // Mở Form chỉnh sửa
  const handleOpenEdit = (epic: Epic, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện chọn epic khi click nút Edit
    setEditingEpic(epic);
    setFormData({
      name: epic.name,
      description: epic.description || "",
      color: epic.color || EPIC_COLORS[0],
      startDate: epic.startDate || "",
      dueDate: epic.dueDate || "",
    });
    setMode("EDIT");
  };

  // Mở xác nhận xóa
  const openDeleteConfirm = () => {
    setDeleteConfirmation("");
    setMode("DELETE_CONFIRM");
  };

  // Submit Create/Edit
  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    setIsSubmitting(true);

    try {
      if (mode === "CREATE") {
        const newEpic = await apiEpic.createEpic(
          projectId,
          formData as CreateEpicPayload
        );
        setEpics((prev) => [newEpic, ...prev]);
        setMode("LIST");
        showToast("Epic created successfully", "success");
      } else if (mode === "EDIT" && editingEpic) {
        const updatedEpic = await apiEpic.updateEpic(
          projectId,
          editingEpic.id,
          formData
        );
        setEpics((prev) =>
          prev.map((e) => (e.id === updatedEpic.id ? updatedEpic : e))
        );
        setMode("LIST");
        showToast("Epic updated successfully", "success");
      }
    } catch (error: any) {
      const message =
        error.message || error.response?.data?.message || "Action failed.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa Epic
  const handleDelete = async () => {
    if (!editingEpic || deleteConfirmation.toLowerCase() !== "delete") return;
    setIsSubmitting(true);
    try {
      await apiEpic.deleteEpic(projectId, editingEpic.id);
      setEpics((prev) => prev.filter((e) => e.id !== editingEpic.id));
      if (currentEpicId === editingEpic.id) onSelectEpic(null); // Gỡ bỏ epic đang chọn
      setMode("LIST");
      showToast("Epic deleted successfully", "success");
    } catch (error: any) {
      const message =
        error.message ||
        error.response?.data?.message ||
        "Cannot delete Epic with associated tasks.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- RENDER FUNCTIONS ---

  // Render Form Create/Edit
  const renderForm = () => (
    <div className="p-4 space-y-4 overflow-y-auto animate-in slide-in-from-right-5 duration-200">
      {/* Input Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          autoFocus
          className="bg-white"
          disabled={isSubmitting}
        />
      </div>
      {/* Input Desc */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase">
          Description
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="bg-white min-h-[80px] resize-none"
          disabled={isSubmitting}
        />
      </div>
      {/* Color Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {EPIC_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-6 h-6 rounded-full transition-transform ${
                formData.color === c
                  ? "ring-2 ring-offset-1 ring-slate-400 scale-110"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
              onClick={() => setFormData({ ...formData, color: c })}
              disabled={isSubmitting}
            />
          ))}
        </div>
      </div>
      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Start Date
          </label>
          <Input
            type="date"
            className="w-full text-xs pl-2 py-2 border border-slate-200 rounded-md outline-none"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Due Date
          </label>
          <Input
            type="date"
            className="w-full text-xs pl-2 py-2 border border-slate-200 rounded-md outline-none"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );

  // Render Delete Confirmation
  const renderDeleteConfirm = () => (
    <div className="p-6 space-y-4 animate-in slide-in-from-right-4 duration-200">
      <div className="bg-red-50 p-4 rounded-md flex gap-3 border border-red-100">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
        <div className="text-sm text-red-800">
          <p className="font-bold">This action cannot be undone!</p>
          <p className="mt-1 text-xs">
            Epic <strong>"{editingEpic?.name}"</strong> will be permanently
            deleted. This may fail if there are associated tasks.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">
          Type <strong>delete</strong> to confirm deletion:
        </label>
        <Input
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          placeholder="delete"
          className="border-red-300 focus-visible:ring-red-500"
          autoFocus
          disabled={isSubmitting}
        />
      </div>
    </div>
  );

  // --- RENDER MAIN UI ---
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-[450px] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-white shrink-0">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            {mode !== "LIST" && (
              <button
                onClick={() =>
                  setMode(mode === "DELETE_CONFIRM" ? "EDIT" : "LIST")
                }
                className="hover:bg-slate-100 p-1 rounded-full mr-1"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
            )}
            {mode === "LIST" && "Select Epic"}
            {mode === "CREATE" && "Create New Epic"}
            {mode === "EDIT" && "Edit Epic"}
            {mode === "DELETE_CONFIRM" && "Confirm Deletion"}
          </div>
          <button onClick={onClose} title="Close">
            <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-hidden bg-slate-50/50 flex flex-col">
          {/* --- MODE: LIST --- */}
          {mode === "LIST" && (
            <div className="flex flex-col h-full">
              {/* Fixed Top Section (Search, Create, Unassign) */}
              <div className="p-4 pb-2 space-y-3 shrink-0 bg-slate-50/50 z-10">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Search epics..."
                    className="pl-9 bg-white border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 bg-white h-10 justify-start px-3"
                  onClick={handleOpenCreate}
                >
                  <Plus className="w-4 h-4 mr-2" /> Create new epic
                </Button>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    currentEpicId === null
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-blue-300"
                  }`}
                  onClick={() => handleSelect(null)}
                >
                  <span className="text-sm font-medium text-slate-600 italic">
                    No Epic (Unassigned)
                  </span>
                  {currentEpicId === null && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Scrollable List */}
              <div
                className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-2 min-h-0"
                style={{ maxHeight: "350px" }}
              >
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : (
                  displayEpics.map((epic) => (
                    <div
                      key={epic.id}
                      className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        currentEpicId === epic.id
                          ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200 shadow-sm"
                          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
                      }`}
                      onClick={() => handleSelect(epic)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className="w-3 h-10 rounded-sm shrink-0"
                          style={{ backgroundColor: epic.color }}
                        ></div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-bold text-slate-700 truncate">
                            {epic.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {epic.epicCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {currentEpicId === epic.id && (
                          <Check className="w-4 h-4 text-blue-600 mr-1 shrink-0" />
                        )}
                        <button
                          onClick={(e) => handleOpenEdit(epic, e)}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit Epic"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {!loading && displayEpics.length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-4 italic">
                    No epics found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- MODE: CREATE / EDIT --- */}
          {(mode === "CREATE" || mode === "EDIT") && renderForm()}

          {/* --- MODE: DELETE CONFIRM --- */}
          {mode === "DELETE_CONFIRM" && editingEpic && renderDeleteConfirm()}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
          {/* Left Actions (Delete) */}
          {mode === "EDIT" ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={openDeleteConfirm}
              disabled={isSubmitting}
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete
            </Button>
          ) : (
            <div />
          )}

          {/* Right Actions (Save/Cancel/Confirm Delete) */}
          {mode === "DELETE_CONFIRM" ? (
            <div className="flex gap-2 w-full justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("EDIT")}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                disabled={
                  deleteConfirmation.toLowerCase() !== "delete" || isSubmitting
                }
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </div>
          ) : (
            <div
              className={`flex gap-2 ${
                mode === "LIST" ? "w-full justify-end" : ""
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (mode === "LIST") onClose();
                  else setMode("LIST");
                }}
                disabled={isSubmitting}
              >
                {mode === "LIST" ? "Close" : "Cancel"}
              </Button>
              {(mode === "CREATE" || mode === "EDIT") && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[80px]"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : mode === "CREATE" ? (
                    "Create"
                  ) : (
                    "Save"
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
