"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSprint } from "@/services/apiSprint";
import { useToast } from "@/components/ui/ToastProvider";

interface QuickSprintButtonProps {
  projectId: number;      // ✅ Chỉ cần projectId để tạo Sprint
  onSuccess: () => void;  // Callback reload list sau khi tạo
}

export default function QuickSprintButton({ 
  projectId, onSuccess 
}: QuickSprintButtonProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickCreate = async () => {
    try {
      setIsLoading(true);
      
      // Gọi API tạo Sprint nhanh
      // Payload rỗng {} -> Backend tự sinh tên "Sprint {N}"
      await createSprint(projectId, {}); 
      
      showToast("Sprint created successfully", "success");
      onSuccess(); // Reload lại danh sách bên ngoài
      
    } catch (error) {
      console.error(error);
      showToast("Could not create sprint", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleQuickCreate}
      disabled={isLoading}
      variant="outline"
      className="w-full border-dashed border-2 border-slate-300 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-slate-500 h-10 font-semibold mb-8 transition-all"
    >
       {isLoading ? (
         <Loader2 className="w-4 h-4 animate-spin mr-2"/>
       ) : (
         <Plus className="w-4 h-4 mr-2"/>
       )}
       Create Next Sprint
    </Button>
  );
}