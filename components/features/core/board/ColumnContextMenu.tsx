"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, ArrowLeftRight, Ban, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider"; 
import { deleteProjectStatus } from "@/services/apiBoard"; 
import ConfirmationModal from "@/components/ui/ConfirmationModal"; 

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface ColumnContextMenuProps {
  projectId: number;
  columnId: string;
  columnLabel: string;
  onDeleted?: (columnId: string) => void;
  onMoveColumn?: (columnId: string, direction: "left" | "right") => void;
  onSetColumnLimit?: (columnId: string) => void;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export function ColumnContextMenu({
  projectId,
  columnId,
  columnLabel,
  onMoveColumn,
  onSetColumnLimit,
  onDeleted,
}: ColumnContextMenuProps) {
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // --- EFFECT: CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMoreActions(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // --- HANDLERS ---

  const handleRequestDelete = () => {
      setIsOpen(false); // Close menu
      setIsConfirmOpen(true); // Open modal
  };

  const handleConfirmDelete = async () => {
    try {
        setIsDeleting(true);
        await deleteProjectStatus(projectId, Number(columnId));

        showToast("Column deleted successfully.", "success");
        setIsConfirmOpen(false);

        if (onDeleted) {
            onDeleted(columnId);
        }
    } catch (error: any) {
        // Use error message from API
        const message = error.message || error.response?.data?.message || "Failed to delete column.";
        showToast(message, "error");
    } finally {
        setIsDeleting(false);
    }
  };

  // --- RENDER ---
  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1.5 rounded text-slate-500 hover:bg-slate-200 transition-colors ${isOpen ? 'bg-slate-200 text-slate-700' : ''}`}
          title="Column actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl z-50 border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {!showMoreActions ? (
              // Main Menu
              <div className="flex flex-col py-1">
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  {columnLabel}
                </div>
                
                <button
                  onClick={() => {
                    console.log("Move logic"); // Placeholder
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4 text-slate-400" />
                  Move column
                </button>

                <button
                  onClick={() => {
                    onSetColumnLimit?.(columnId);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4 text-slate-400" />
                  Set column limit
                </button>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  onClick={handleRequestDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  onClick={() => setShowMoreActions(true)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-between"
                >
                  More actions
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ) : (
              // Sub Menu (More Actions)
              <div className="flex flex-col py-1">
                <button
                  onClick={() => setShowMoreActions(false)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 mb-1"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                  Back
                </button>
                <div className="px-4 py-2 text-sm text-slate-400 italic text-center">
                  No extra actions yet
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => !isDeleting && setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={`Delete Column "${columnLabel}"?`}
        description="Are you sure you want to delete this column? This action cannot be undone and all settings will be lost."
        confirmText="Delete Column"
        cancelText="Cancel"
        modalVariant="danger"
      />
    </>
  );
}