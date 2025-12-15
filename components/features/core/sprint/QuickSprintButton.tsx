"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createSprint } from "@/services/apiSprint";
import { useToast } from "@/components/ui/ToastProvider";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface QuickSprintButtonProps {
  projectId: number; // Chỉ cần projectId để tạo Sprint
  onSuccess: () => void; // Callback reload list sau khi tạo
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function QuickSprintButton({
  projectId,
  onSuccess,
}: QuickSprintButtonProps) {
  // --- HOOKS ---
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // --- HANDLER: QUICK CREATE ---
  const handleQuickCreate = async () => {
    try {
      setIsLoading(true);

      // Gọi API tạo Sprint nhanh. Payload rỗng -> Backend tự sinh tên "Sprint {N}"
      // Payload cũng phải bao gồm taskIds (mảng rỗng) nếu API yêu cầu
      await createSprint(projectId, { taskIds: [] });

      showToast("Sprint created successfully!", "success");
      onSuccess(); // Reload lại danh sách bên ngoài
    } catch (error: any) {
      console.error(error);
      // Sử dụng message từ API trả về (nếu có)
      const message =
        error.message ||
        error.response?.data?.message ||
        "Could not create sprint.";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <Button
      onClick={handleQuickCreate}
      disabled={isLoading}
      variant="outline"
      className="w-full border-dashed border-2 border-slate-300 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-slate-500 h-10 font-semibold mb-8 transition-all"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <Plus className="w-4 h-4 mr-2" />
      )}
      Create Next Sprint
    </Button>
  );
}
