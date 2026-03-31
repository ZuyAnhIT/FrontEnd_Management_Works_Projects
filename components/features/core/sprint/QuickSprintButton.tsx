"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";

// Internal UI Components & Services
import { Button } from "@/components/ui/Buttons";
import { createSprint } from "@/services/apiSprint";
import { useToast } from "@/components/ui/ToastProvider";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface QuickSprintButtonProps {
  projectId: number; // Định danh dự án để khởi tạo Sprint
  onSuccess: () => void; // Hàm gọi lại để làm mới danh sách sau khi tạo thành công
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Nút khởi tạo Sprint nhanh (Quick Sprint Creator).
 * Tự động tạo một Sprint mới với các giá trị mặc định từ hệ thống mà không cần mở Modal.
 */
export default function QuickSprintButton({
  projectId,
  onSuccess,
}: QuickSprintButtonProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------------------------------------------------------------------------
  // 5. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý kích hoạt tạo Sprint
   */
  const handleQuickCreate = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // Gọi API tạo Sprint. 
      // Payload rỗng giúp Backend tự nhận diện số thứ tự Sprint tiếp theo (ví dụ: Sprint 5).
      await createSprint(projectId, { taskIds: [] });

      showToast("Next sprint created successfully", "success");
      
      // Kích hoạt callback để component cha tải lại dữ liệu mới nhất
      onSuccess();
    } catch (error: any) {
      console.error("Quick Create Sprint Error:", error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to create new sprint";
        
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, projectId, onSuccess, showToast]);

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <Button
      onClick={handleQuickCreate}
      disabled={isProcessing}
      variant="outline"
      className={cn(
        "w-full h-11 mb-8 transition-all duration-200 border-2 border-dashed select-none",
        "bg-slate-50/50 border-slate-200 text-slate-500",
        "hover:bg-[#E3F2FD] hover:border-[#2684FF] hover:text-[#0052CC] hover:shadow-sm",
        "active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed",
        "text-[12px] font-bold uppercase tracking-widest"
      )}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2.5" />
      ) : (
        <Plus className="w-4 h-4 mr-2.5" />
      )}
      
      {isProcessing ? "Initializing..." : "Create Next Sprint"}
    </Button>
  );
}