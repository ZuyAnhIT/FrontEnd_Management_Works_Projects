"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, ArrowLeftRight, Ban, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider"; 
import { deleteProjectStatus } from "@/services/apiBoard"; 
// 👇 Import Component Modal
import ConfirmationModal from "@/components/ui/ConfirmationModal"; 

interface ColumnContextMenuProps {
  projectId: number;
  columnId: string;
  columnLabel: string;
  onDeleted?: (columnId: string) => void;
  onMoveColumn?: (columnId: string, direction: "left" | "right") => void;
  onSetColumnLimit?: (columnId: string) => void;
}

export function ColumnContextMenu({
  projectId,
  columnId,
  columnLabel,
  onMoveColumn,
  onSetColumnLimit,
  onDeleted,
}: ColumnContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false); // Menu dropdown
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Loading state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // 👇 State mở Modal
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Chỉ đóng menu khi KHÔNG click vào modal (đề phòng click nhầm backdrop modal đóng luôn menu cũng ko sao)
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMoreActions(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // 1. Hàm được gọi khi user bấm nút "Delete" trong menu
  const handleRequestDelete = () => {
      setIsOpen(false); // Đóng menu dropdown
      setIsConfirmOpen(true); // Mở Modal xác nhận
  };

  // 2. Hàm gọi API thực sự (khi user bấm nút đỏ trong Modal)
  const handleConfirmDelete = async () => {
    try {
        setIsDeleting(true); // Loading trong Modal

        // Gọi API
        await deleteProjectStatus(projectId, Number(columnId));

        showToast("Đã xóa trạng thái thành công.", "success");
        setIsConfirmOpen(false); // Đóng Modal

        // Báo cho cha update UI
        if (onDeleted) {
            onDeleted(columnId);
        }

    } catch (error: any) {
        // Nếu lỗi, vẫn giữ Modal mở để user biết
        showToast(error.message || "Không thể xóa cột này.", "error");
        console.error(error);
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <>
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 rounded text-slate-500 hover:bg-slate-200 transition-colors ${isOpen ? 'bg-slate-200 text-slate-700' : ''}`}
                title="Column actions"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl z-50 border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {!showMoreActions ? (
                    <div className="flex flex-col py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                        {columnLabel}
                    </div>
                    
                    <button
                        onClick={() => {
                            console.log("Move logic");
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

                    {/* 👇 Bấm nút này sẽ mở Modal */}
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

        {/* 👇 Render Modal nằm ngoài DOM của menu dropdown nhưng vẫn trong Component này */}
        <ConfirmationModal
            isOpen={isConfirmOpen}
            onClose={() => !isDeleting && setIsConfirmOpen(false)} // Không cho đóng khi đang loading
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
            title={`Delete Column "${columnLabel}"?`}
            description="Bạn có chắc muốn xóa cột này? Hành động này không thể hoàn tác và tất cả các cài đặt của cột sẽ bị mất."
            confirmText="Delete Column"
            cancelText="Keep Column"
            modalVariant="danger"
        />
    </>
  );
}