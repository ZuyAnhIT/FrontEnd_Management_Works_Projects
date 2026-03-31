"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// Internal UI Components
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import { Textarea } from "@/components/ui/TextAreas";
import { useToast } from "@/components/ui/ToastProvider";

// Internal Services & Utils
import { getEpics, createEpic, updateEpic, deleteEpic, Epic, CreateEpicPayload } from "@/services/apiEpic";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & INTERFACES
// =============================================================================

/**
 * Bộ màu tiêu chuẩn dành cho việc phân loại Epic
 */
const EPIC_COLORS = [
  "#8e44ad", "#3498db", "#e67e22", "#e74c3c", "#2ecc71",
  "#1abc9c", "#9b59b6", "#f1c40f", "#34495e", "#95a5a6",
];

type ViewMode = "LIST" | "CREATE" | "EDIT" | "DELETE_CONFIRM";

interface EpicModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  currentEpicId: number | null; // ID của Epic hiện tại đang được gán cho Task (có thể null)
  onSelectEpic: (epic: Epic | null) => void;
}

type EpicFormPayload = Omit<CreateEpicPayload, "status"> & { status?: string };

const INITIAL_FORM_STATE: EpicFormPayload = {
  name: "",
  description: "",
  color: EPIC_COLORS[0],
  startDate: "",
  dueDate: "",
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Cửa sổ quản lý danh mục phân hệ lớn (Epic Modal).
 * Bao gồm các tính năng: Liệt kê, Tìm kiếm, Thêm mới, Chỉnh sửa và Chọn Epic cho Task.
 */
export default function EpicModal({
  isOpen,
  onClose,
  projectId,
  currentEpicId,
  onSelectEpic,
}: EpicModalProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();

  const [mode, setMode] = useState<ViewMode>("LIST");
  const [epics, setEpics] = useState<Epic[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [formData, setFormData] = useState<EpicFormPayload>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // ---------------------------------------------------------------------------
  // 5. EFFECTS & DATA FETCHING
  // ---------------------------------------------------------------------------

  const fetchEpics = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const data = await getEpics(projectId);
      setEpics(data);
    } catch (error) {
      showToast("Failed to load Epics", "error");
    } finally {
      setIsLoadingList(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    if (isOpen) {
      setMode("LIST");
      setSearchTerm("");
      setDeleteConfirmation("");
      fetchEpics();
    }
  }, [isOpen, fetchEpics]);

  // ---------------------------------------------------------------------------
  // 6. MEMOIZED DATA
  // ---------------------------------------------------------------------------

  /**
   * Bộ lọc và sắp xếp hiển thị Epic:
   * 1. Lọc theo từ khóa tìm kiếm (nếu có).
   * 2. Nếu không tìm kiếm, luôn đẩy Epic đang được chọn lên đầu danh sách.
   */
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
        return [currentEpic, ...rest]; 
      }
    }
    return result;
  }, [epics, searchTerm, currentEpicId]);

  // ---------------------------------------------------------------------------
  // 7. HANDLERS
  // ---------------------------------------------------------------------------

  const handleSelect = useCallback((epic: Epic | null) => {
    onSelectEpic(epic);
    onClose();
  }, [onClose, onSelectEpic]);

  const handleOpenCreate = useCallback(() => {
    setEditingEpic(null);
    setFormData(INITIAL_FORM_STATE);
    setMode("CREATE");
  }, []);

  const handleOpenEdit = useCallback((epic: Epic, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setEditingEpic(epic);
    setFormData({
      name: epic.name,
      description: epic.description || "",
      color: epic.color || EPIC_COLORS[0],
      startDate: epic.startDate || "",
      dueDate: epic.dueDate || "",
    });
    setMode("EDIT");
  }, []);

  const handleOpenDeleteConfirm = useCallback(() => {
    setDeleteConfirmation("");
    setMode("DELETE_CONFIRM");
  }, []);

  const handleSubmitForm = async () => {
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (mode === "CREATE") {
        const newEpic = await createEpic(projectId, formData as CreateEpicPayload);
        setEpics((prev) => [newEpic, ...prev]);
        setMode("LIST");
        showToast("Epic created successfully", "success");
      } else if (mode === "EDIT" && editingEpic) {
        const updatedEpic = await updateEpic(projectId, editingEpic.id, formData);
        setEpics((prev) => prev.map((e) => (e.id === updatedEpic.id ? updatedEpic : e)));
        setMode("LIST");
        showToast("Epic updated successfully", "success");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to save epic";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEpic = async () => {
    if (!editingEpic || deleteConfirmation.toLowerCase() !== "delete") return;
    
    setIsSubmitting(true);
    try {
      await deleteEpic(projectId, editingEpic.id);
      setEpics((prev) => prev.filter((e) => e.id !== editingEpic.id));
      
      if (currentEpicId === editingEpic.id) {
        onSelectEpic(null); // Gỡ Epic khỏi Task nếu nó đang được sử dụng
      }
      
      setMode("LIST");
      showToast("Epic deleted successfully", "success");
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Cannot delete Epic with associated tasks";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 8. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[480px] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ================= HEADER SECTION ================= */}
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-5 bg-white shrink-0">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            {mode !== "LIST" && (
              <button
                onClick={() => setMode(mode === "DELETE_CONFIRM" ? "EDIT" : "LIST")}
                className="hover:bg-slate-100 p-1.5 rounded-md mr-1.5 transition-colors active:scale-95 text-slate-500"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            
            <span className="text-sm uppercase tracking-wide">
                {mode === "LIST" && "Select Epic"}
                {mode === "CREATE" && "Create New Epic"}
                {mode === "EDIT" && "Edit Epic Details"}
                {mode === "DELETE_CONFIRM" && "Confirm Deletion"}
            </span>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-md hover:bg-slate-100 transition-colors active:scale-95 text-slate-400 hover:text-slate-700" 
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= BODY SECTION ================= */}
        <div className="flex-1 overflow-hidden bg-slate-50/50 flex flex-col">
          
          {/* --- CHẾ ĐỘ 1: HIỂN THỊ DANH SÁCH (LIST MODE) --- */}
          {mode === "LIST" && (
            <div className="flex flex-col h-full">
              
              {/* Thanh Công cụ trên cùng (Tìm kiếm & Thêm mới) */}
              <div className="p-5 pb-3 space-y-4 shrink-0 bg-white border-b border-slate-100 z-10">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search epics..."
                    className="pl-9 h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <Button
                  variant="outline"
                  className="w-full border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 bg-white h-10 justify-start px-4 text-sm font-semibold shadow-sm transition-colors"
                  onClick={handleOpenCreate}
                >
                  <Plus className="w-4 h-4 mr-2" /> Create new epic
                </Button>
                
                <div
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all shadow-sm",
                    currentEpicId === null
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100"
                      : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  )}
                  onClick={() => handleSelect(null)}
                >
                  <span className="text-sm font-semibold text-slate-500 italic">
                    Unassigned (No Epic)
                  </span>
                  {currentEpicId === null && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              </div>

              {/* Danh sách cuộn chứa các thẻ Epic */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-3 bg-slate-50/50 min-h-[250px]">
                {isLoadingList ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <>
                    {displayEpics.map((epic) => (
                      <div
                        key={epic.id}
                        className={cn(
                          "group flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all bg-white",
                          currentEpicId === epic.id
                            ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100 shadow-sm"
                            : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                        )}
                        onClick={() => handleSelect(epic)}
                      >
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <div
                            className="w-3.5 h-10 rounded-[3px] shrink-0"
                            style={{ backgroundColor: epic.color }}
                          />
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-slate-800 truncate">
                              {epic.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-0.5">
                              {epic.epicCode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-2">
                          {currentEpicId === epic.id && (
                            <Check className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                          <button
                            onClick={(e) => handleOpenEdit(epic, e)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                            title="Edit Epic Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {!isLoadingList && displayEpics.length === 0 && (
                      <div className="text-center text-xs font-semibold text-slate-400 py-8 uppercase tracking-widest">
                        No epics found
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* --- CHẾ ĐỘ 2: BIỂU MẪU TẠO/SỬA (CREATE / EDIT MODE) --- */}
          {(mode === "CREATE" || mode === "EDIT") && (
             <div className="p-6 space-y-5 overflow-y-auto animate-in slide-in-from-right-5 duration-200 bg-white min-h-[350px]">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Epic Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    autoFocus
                    className="bg-white h-10 font-medium"
                    disabled={isSubmitting}
                    placeholder="e.g. Q3 Marketing Campaign"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white min-h-[100px] resize-none text-sm placeholder:text-slate-300"
                    disabled={isSubmitting}
                    placeholder="Add details about this epic..."
                  />
                </div>
                
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Display Color
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {EPIC_COLORS.map((colorHex) => (
                      <button
                        key={colorHex}
                        type="button"
                        className={cn(
                          "w-6 h-6 rounded-full transition-transform active:scale-95",
                          formData.color === colorHex
                            ? "ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-md"
                            : "hover:scale-110 hover:shadow-sm"
                        )}
                        style={{ backgroundColor: colorHex }}
                        onClick={() => setFormData({ ...formData, color: colorHex })}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      className="w-full text-xs h-10 bg-white"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      className="w-full text-xs h-10 bg-white"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
             </div>
          )}

          {/* --- CHẾ ĐỘ 3: XÁC NHẬN XÓA (DELETE CONFIRM MODE) --- */}
          {mode === "DELETE_CONFIRM" && editingEpic && (
            <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-200 bg-white min-h-[350px]">
              <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3 border border-red-100 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-bold">This action cannot be undone!</p>
                  <p className="mt-1.5 text-xs leading-relaxed opacity-90">
                    Epic <strong>"{editingEpic.name}"</strong> will be permanently deleted. This action may fail if there are tasks currently assigned to it.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Type <strong className="text-slate-800">DELETE</strong> to confirm:
                </label>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="delete"
                  className="h-10 border-red-200 focus:border-red-500 focus:ring-red-100 placeholder:text-red-200 text-red-700"
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

        </div>

        {/* ================= FOOTER SECTION ================= */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          
          {/* Left Actions */}
          <div className="w-1/3">
              {mode === "EDIT" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 px-3"
                  onClick={handleOpenDeleteConfirm}
                  disabled={isSubmitting}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                </Button>
              )}
          </div>

          {/* Right Actions */}
          <div className="w-2/3 flex gap-2 justify-end">
            {mode === "DELETE_CONFIRM" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("EDIT")}
                  disabled={isSubmitting}
                  className="h-9"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-9 bg-red-600 hover:bg-red-700 text-white min-w-[100px]"
                  onClick={handleDeleteEpic}
                  disabled={deleteConfirmation.toLowerCase() !== "delete" || isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => mode === "LIST" ? onClose() : setMode("LIST")}
                  disabled={isSubmitting}
                  className="h-9 text-slate-500 hover:text-slate-700"
                >
                  {mode === "LIST" ? "Close" : "Cancel"}
                </Button>
                
                {(mode === "CREATE" || mode === "EDIT") && (
                  <Button
                    size="sm"
                    className="h-9 bg-blue-600 hover:bg-blue-700 text-white min-w-[90px] font-semibold"
                    onClick={handleSubmitForm}
                    disabled={isSubmitting || !formData.name.trim()}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : mode === "CREATE" ? (
                      "Create Epic"
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}