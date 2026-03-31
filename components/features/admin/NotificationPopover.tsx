"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Loader2,
  CheckCheck,
  Inbox,
  User,
  Building2,
  FolderKanban,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";

// Internal Components & Services
import { getActivities, ActivityLog } from "@/services/apiActivity";
import NotificationItem from "@/components/ui/NotificationItem";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogTab {
  key: string;
  label: string;
  icon: React.ElementType;
  scope: string;
  entityId: number;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần cửa sổ hiển thị thông báo và lịch sử hoạt động.
 * Tự động tính toán các tab (phạm vi) dựa trên URL hiện tại (Project, Workspace, Company).
 */
export default function NotificationPopover({
  isOpen,
  onClose,
}: NotificationPopoverProps) {
  // ---------------------------------------------------------------------------
  // 1. STATE & HOOKS
  // ---------------------------------------------------------------------------
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [availableTabs, setAvailableTabs] = useState<LogTab[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>("USER");

  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // ---------------------------------------------------------------------------
  // 2. CONTEXT LOGIC (Xác định phạm vi hiển thị)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen || !user) return;

    const tabs: LogTab[] = [];

    // Luôn ưu tiên hiển thị tab cá nhân
    tabs.push({
      key: "USER",
      label: "My Logs",
      icon: User,
      scope: "USER",
      entityId: Number(user.id),
    });

    // Phát hiện ngữ cảnh Dự án
    if (params.projectId) {
      const pId = Number(params.projectId);
      if (!isNaN(pId)) {
        tabs.push({
          key: "PROJECT",
          label: "Project",
          icon: FolderKanban,
          scope: "PROJECT",
          entityId: pId,
        });
      }
    }

    // Phát hiện ngữ cảnh Không gian làm việc
    if (params.workspaceId) {
      const wId = Number(params.workspaceId);
      if (!isNaN(wId)) {
        tabs.push({
          key: "WORKSPACE",
          label: "Workspace",
          icon: LayoutGrid,
          scope: "WORKSPACE",
          entityId: wId,
        });
      }
    }

    // Phát hiện ngữ cảnh Quản trị Công ty
    const isCompanyPage = pathname?.includes("/admin/company");
    const targetCompanyId = params.companyId || params.id || localStorage.getItem("lastActiveCompanyId");

    if (isCompanyPage && targetCompanyId) {
      tabs.push({
        key: "COMPANY",
        label: "Company",
        icon: Building2,
        scope: "COMPANY",
        entityId: Number(targetCompanyId),
      });
    }

    setAvailableTabs(tabs);

    // Tự động chuyển đến tab sâu nhất (Dự án > Workspace > Công ty > Cá nhân)
    if (params.projectId) setActiveTabKey("PROJECT");
    else if (params.workspaceId) setActiveTabKey("WORKSPACE");
    else if (isCompanyPage) setActiveTabKey("COMPANY");
  }, [isOpen, pathname, params, user]);

  // ---------------------------------------------------------------------------
  // 3. DATA FETCHING
  // ---------------------------------------------------------------------------

  const fetchActivities = useCallback(async () => {
    const currentTab = availableTabs.find((t) => t.key === activeTabKey);
    if (!currentTab) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getActivities(currentTab.scope, currentTab.entityId);
      setActivities(data);
    } catch (error: any) {
      console.error("[Notification Service] Error:", error);
      setErrorMessage(error.message || "Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  }, [activeTabKey, availableTabs]);

  useEffect(() => {
    if (isOpen && availableTabs.length > 0) {
      fetchActivities();
    }
  }, [isOpen, activeTabKey, availableTabs, fetchActivities]);

  // ---------------------------------------------------------------------------
  // 4. EVENT HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý điều hướng thông minh dựa trên loại thực thể và hành động
   */
  const handleItemClick = (log: ActivityLog) => {
    const wsId = log.workspaceId || params.workspaceId;
    const pId = log.projectId || params.projectId;

    if (!wsId) return;

    let targetUrl = "";
    switch (log.entityType) {
      case "TASK":
      case "SPRINT":
        if (pId) targetUrl = `/core/workspace/${wsId}/project/${pId}/list`;
        break;
      case "PROJECT":
        targetUrl = log.action === "UPDATE" 
          ? `/core/workspace/${wsId}/project/${log.entityId}/settings`
          : `/core/workspace/${wsId}/project/${log.entityId}/board`;
        break;
      case "WORKSPACE":
        if (log.action === "UPDATE") targetUrl = `/core/workspace/${wsId}/settings`;
        break;
    }

    if (targetUrl) {
      router.push(targetUrl);
      onClose();
    }
  };

  // Đóng popover khi nhấp ra ngoài vùng chứa
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // ---------------------------------------------------------------------------
  // 5. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-12 right-0 w-[420px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200 ring-1 ring-slate-900/5"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          Notifications
        </h3>
        <button className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-blue-600 font-bold transition-colors px-2 py-1 rounded hover:bg-white uppercase tracking-wider">
          <CheckCheck className="w-3 h-3" /> Mark all as read
        </button>
      </div>

      {/* Thanh chuyển đổi Tab (Chỉ hiển thị nếu có nhiều phạm vi) */}
      {availableTabs.length > 1 && (
        <div className="flex items-center px-2 bg-slate-50 border-b border-slate-100 overflow-x-auto custom-scrollbar">
          {availableTabs.map((tab) => {
            const isActive = activeTabKey === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTabKey(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold transition-all border-b-2 whitespace-nowrap outline-none uppercase tracking-tight",
                  isActive
                    ? "border-blue-600 text-blue-700 bg-white"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-blue-600" : "text-slate-400")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Danh sách nội dung (Body) */}
      <div className="max-h-[400px] min-h-[200px] overflow-y-auto custom-scrollbar bg-white">
        {isLoading ? (
          <div className="h-48 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs font-semibold">Synchronizing activities...</span>
          </div>
        ) : errorMessage ? (
          <div className="h-48 flex flex-col items-center justify-center text-red-400 gap-2 p-4 text-center">
            <AlertCircle className="w-8 h-8 opacity-80" />
            <p className="text-xs font-medium">{errorMessage}</p>
          </div>
        ) : activities.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {activities.map((log) => (
              <NotificationItem
                key={log.id}
                item={log}
                onClick={() => handleItemClick(log)}
              />
            ))}
            <div className="p-2 text-center bg-slate-50/50 sticky bottom-0 border-t border-slate-100">
              <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors py-1 uppercase tracking-wider">
                View full history
              </button>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
              <Inbox className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-600">No activities found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] text-center font-medium">
              Updates in this {activeTabKey.toLowerCase()} will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}