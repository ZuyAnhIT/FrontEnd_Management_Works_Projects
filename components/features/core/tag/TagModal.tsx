"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, AlertTriangle, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiTag, Tag } from "@/services/apiTag";
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// 1. CONSTANTS & INTERFACES
// =============================================================================

// Danh sách màu giống Epic để đồng bộ giao diện
const TAG_COLORS = [
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
  "#7f8c8d",
  "#2c3e50",
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
// 2. MAIN COMPONENT
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

  // State Delete Confirmation
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Load data khi mở modal hoặc tag thay đổi
  useEffect(() => {
    if (isOpen && tag) {
      setName(tag.name);
      setColor(tag.color || TAG_COLORS[0]);
      setIsDeleteMode(false);
      setDeleteConfirmation("");
    }
  }, [isOpen, tag]);

  // --- HANDLERS: SAVE ---

  const handleSave = async () => {
    if (!tag || !name.trim()) return;

    setIsSubmitting(true);
    try {
      const updatedTag = await apiTag.updateTag(
        companyId,
        workspaceId,
        projectId,
        tag.id,
        {
          name: name.trim(),
          color: color,
        }
      );
      onUpdate(updatedTag);
      showToast("Tag updated successfully", "success");
      onClose();
    } catch (error: any) {
      console.error(error);
      const message =
        error.message ||
        error.response?.data?.message ||
        "Failed to update tag";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLERS: DELETE ---

  const handleDelete = async () => {
    if (!tag || deleteConfirmation.toLowerCase() !== "delete") return;

    setIsSubmitting(true);
    try {
      await apiTag.deleteTag(companyId, workspaceId, projectId, tag.id);
      onDelete(tag.id);
      showToast("Tag deleted successfully", "success");
      onClose();
    } catch (error: any) {
      console.error(error);
      const message =
        error.message ||
        error.response?.data?.message ||
        "Cannot delete tag in use";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER GUARD ---
  if (!isOpen || !tag) return null;

  // --- RENDER UI ---
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 bg-white shrink-0">
          <span className="font-bold text-slate-700">
            {isDeleteMode ? "Delete Tag?" : "Edit Tag Details"}
          </span>
          <button onClick={onClose} disabled={isSubmitting}>
            <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-4">
          {!isDeleteMode ? (
            /* --- EDIT FORM --- */
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-200">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Tag Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="bg-white"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  disabled={isSubmitting}
                />
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                        color === c
                          ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                      disabled={isSubmitting}
                    >
                      {color === c && (
                        <Check className="w-3 h-3 text-white stroke-[3px]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* --- DELETE CONFIRMATION UI --- */
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
              <div className="bg-red-50 p-4 rounded-md flex gap-3 border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-bold">This action cannot be undone!</p>
                  <p className="mt-1 text-xs">
                    The tag <strong>"{tag.name}"</strong> will be permanently
                    deleted from all associated tasks.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Type <strong>delete</strong> to confirm:
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
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          {!isDeleteMode ? (
            /* Footer Edit Mode */
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                onClick={() => {
                  setIsDeleteMode(true);
                  setDeleteConfirmation("");
                }}
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[80px]"
                  onClick={handleSave}
                  disabled={isSubmitting || !name.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Footer Delete Mode */
            <div className="flex gap-2 w-full justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteMode(false)}
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
          )}
        </div>
      </div>
    </div>
  );
}
