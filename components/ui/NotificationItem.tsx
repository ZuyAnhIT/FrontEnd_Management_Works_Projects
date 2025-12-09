"use client";

import { ActivityLog } from "@/services/apiActivity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  FileEdit, 
  PlusCircle, 
  Trash2, 
  Info,
  Building2,
  Folder
} from "lucide-react";

// Helper chọn icon dựa trên action
const getActionIcon = (action: string) => {
  switch (action) {
    case "CREATE": return <PlusCircle className="w-3 h-3 text-green-600" />;
    case "UPDATE": return <FileEdit className="w-3 h-3 text-blue-600" />;
    case "DELETE": return <Trash2 className="w-3 h-3 text-red-600" />;
    default: return <Info className="w-3 h-3 text-slate-500" />;
  }
};

// Helper chọn icon entity
const getEntityIcon = (type: string) => {
    switch (type) {
        case "COMPANY": return <Building2 className="w-3 h-3" />;
        case "PROJECT": return <Folder className="w-3 h-3" />;
        default: return <Info className="w-3 h-3" />;
    }
}

export default function NotificationItem({ item }: { item: ActivityLog }) {
  return (
    <div className="flex gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group cursor-pointer">
      
      {/* 1. Avatar */}
      <div className="relative shrink-0">
        <Avatar className="w-9 h-9 border border-slate-200">
          <AvatarImage src={item.userAvatar} />
          <AvatarFallback>{item.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        {/* Action Icon Badge */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
          {getActionIcon(item.action)}
        </div>
      </div>

      {/* 2. Content */}
      <div className="flex-1 space-y-1">
        {/* User Name */}
        <p className="text-xs text-slate-500">
          <span className="font-bold text-slate-800">{item.userName}</span>
        </p>

        {/* Description (HTML) */}
        <div 
          className="text-sm text-slate-700 leading-snug [&>strong]:font-semibold [&>strong]:text-slate-900"
          dangerouslySetInnerHTML={{ __html: item.description }}
        />

        {/* Entity Info Box (Optional style giống bạn vẽ) */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-100/50 px-2 py-1 rounded border border-slate-100 w-fit mt-1">
            {getEntityIcon(item.entityType)}
            <span className="font-medium capitalize">{item.entityType.toLowerCase()}:</span>
            <span>ID #{item.entityId}</span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
          <Clock className="w-3 h-3" />
          {item.timeAgo}
        </div>
      </div>
    </div>
  );
}