"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, AlertTriangle, Trash2, Check, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { Input } from "@/components/ui/Inputs";
import * as apiTag from "@/services/apiTag"; 
import { Tag } from "@/services/apiTag";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & INTERFACES
// =============================================================================

const TAG_COLORS = [
  "#8e44ad", "#3498db", "#e67e22", "#e74c3c", "#2ecc71",
  "#1abc9c", "#9b59b6", "#f1c40f", "#34495e", "#95a5a6",
  "#7f8c8d", "#2c3e50",
];

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: Tag | null;
  companyId: number;
  workspaceId: number;
  projectId: number;
  onUpdate: (tag: Tag) => void;
  onDelete: (tagId: number) => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function TagModal({
  isOpen,
  onClose,
  tag,
  companyId,
  workspaceId,
  projectId,
  onUpdate,
  onDelete,
}: TagModalProps) {
  const { showToast } = useToast();

  // --- STATE ---
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Sync dữ liệu khi tag thay đổi
  useEffect(() => {
    if (isOpen && tag) {
      setName(tag.name);
      setColor(tag.color || TAG_COLORS[0]);
      setIsDeleteMode(false);
      setDeleteConfirmation("");
    }
  }, [isOpen, tag]);

  // --- HANDLERS ---

  const handleSave = async () => {
    if (!tag || !name.trim()) return;

    setIsSubmitting(true);
    try {
      // ✅ Sử dụng hàm trực tiếp từ namespace
      const updatedTag = await apiTag.updateTag(
        companyId,
        workspaceId,
        projectId,
        tag.id,
        { name: name.trim(), color }
      );
      onUpdate(updatedTag);
      showToast("Tag updated successfully", "success");
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update tag";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!tag || deleteConfirmation.toLowerCase() !== "delete") return;

    setIsSubmitting(true);
    try {
      await apiTag.deleteTag(companyId, workspaceId, projectId, tag.id);
      onDelete(tag.id);
      showToast("Tag deleted successfully", "success");
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || "Cannot delete tag in use";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER ---
  if (!isOpen || !tag) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", isDeleteMode ? "bg-red-50" : "bg-blue-50")}>
              {isDeleteMode ? (
                <Trash2 className="w-4 h-4 text-red-600" />
              ) : (
                <TagIcon className="w-4 h-4 text-[#0052CC]" />
              )}
            </div>
            <span className="font-bold text-[#172B4D] tracking-tight">
              {isDeleteMode ? "Delete Tag" : "Edit Tag Details"}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          {!isDeleteMode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Input Tên */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Label Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  placeholder="e.g. urgent-fix"
                  className="h-10 border-slate-200 focus:border-[#2684FF] focus:ring-2 focus:ring-blue-100"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  disabled={isSubmitting}
                />
              </div>

              {/* Chọn màu */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Brand Color
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      className={cn(
                        "w-8 h-8 rounded-lg transition-all flex items-center justify-center border-2 border-transparent",
                        color === c ? "scale-110 shadow-md ring-2 ring-blue-100 border-white" : "hover:scale-105 opacity-80 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                      disabled={isSubmitting}
                    >
                      {color === c && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-red-50 p-4 rounded-xl flex gap-3 border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-red-900">Destructive Action</p>
                  <p className="mt-1 text-red-700/80 leading-relaxed text-xs">
                    Tag <strong>"{tag.name}"</strong> will be removed from all tasks. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Type <span className="text-red-600 font-black">delete</span> to confirm:
                </label>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="delete"
                  className="border-red-200 focus:border-red-500 focus:ring-red-100 h-10"
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0">
          {!isDeleteMode ? (
            <>
              <button
                className="text-red-500 hover:text-red-700 text-[12px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                onClick={() => setIsDeleteMode(true)}
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting} className="font-bold text-[12px] uppercase">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-[#0052CC] hover:bg-[#0047B3] text-white font-bold text-[12px] uppercase min-w-[80px] shadow-sm active:scale-95 transition-all"
                  onClick={handleSave}
                  disabled={isSubmitting || !name.trim()}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-3 w-full justify-end">
              <Button variant="ghost" size="sm" onClick={() => setIsDeleteMode(false)} disabled={isSubmitting} className="font-bold text-[12px] uppercase">
                Back
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] uppercase shadow-sm active:scale-95 transition-all"
                onClick={handleDelete}
                disabled={deleteConfirmation.toLowerCase() !== "delete" || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}