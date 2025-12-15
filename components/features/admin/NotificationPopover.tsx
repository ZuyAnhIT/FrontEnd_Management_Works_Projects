"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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

import { getActivities, ActivityLog } from "@/services/apiActivity";
import NotificationItem from "@/components/ui/NotificationItem";
import { useAuth } from "@/context/AuthContext";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogTab {
  key: string;
  label: string;
  icon: any;
  scope: string;
  entityId: number;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function NotificationPopover({
  isOpen,
  onClose,
}: NotificationPopoverProps) {
  // --- STATE ---
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [availableTabs, setAvailableTabs] = useState<LogTab[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>("USER");

  // --- HOOKS ---
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // =========================================================================
  // 3. LOGIC: CALCULATE TABS (Tính toán các tab hiển thị dựa trên ngữ cảnh)
  // =========================================================================
  useEffect(() => {
    if (!isOpen || !user) return;

    const tabs: LogTab[] = [];

    // A. USER TAB (Luôn hiển thị)
    tabs.push({
      key: "USER",
      label: "My Logs",
      icon: User,
      scope: "USER",
      entityId: Number(user.id),
    });

    // B. PROJECT TAB (Nếu đang ở trang Project)
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

    // C. WORKSPACE TAB (Nếu đang ở trang Workspace)
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

    // D. COMPANY TAB (Nếu đang ở trang Company Admin hoặc có context)
    const isCompanyPage = pathname?.includes("/admin/company");
    const urlCompanyId = params.companyId || params.id;
    let targetCompanyId = urlCompanyId ? Number(urlCompanyId) : null;

    // Fallback: Lấy ID từ localStorage nếu đang ở trang admin chung
    if (!targetCompanyId && isCompanyPage) {
      const storedId = localStorage.getItem("lastActiveCompanyId");
      if (storedId) targetCompanyId = Number(storedId);
    }

    if (targetCompanyId && !isNaN(targetCompanyId)) {
      tabs.push({
        key: "COMPANY",
        label: "Company",
        icon: Building2,
        scope: "COMPANY",
        entityId: targetCompanyId,
      });
    }

    setAvailableTabs(tabs);

    // E. SMART ACTIVE TAB (Tự động chọn tab phù hợp nhất)
    if (params.projectId) setActiveTabKey("PROJECT");
    else if (params.workspaceId) setActiveTabKey("WORKSPACE");
    else if (targetCompanyId && isCompanyPage) setActiveTabKey("COMPANY");
    else setActiveTabKey("USER");
  }, [isOpen, pathname, params, user]);

  // =========================================================================
  // 4. LOGIC: FETCH DATA
  // =========================================================================
  useEffect(() => {
    if (!isOpen || availableTabs.length === 0) return;

    const fetchData = async () => {
      const currentTab = availableTabs.find((t) => t.key === activeTabKey);
      if (!currentTab) return;

      setLoading(true);
      setErrorMsg(null);

      try {
        const data = await getActivities(currentTab.scope, currentTab.entityId);
        setActivities(data);
      } catch (err: any) {
        console.error("Fetch activities error:", err);
        // Lấy message lỗi từ API hoặc fallback tiếng Anh
        setErrorMsg(err.message || "Failed to load activities.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTabKey, isOpen, availableTabs]);

  // =========================================================================
  // 5. LOGIC: NAVIGATION (Điều hướng khi click vào thông báo)
  // =========================================================================
  const handleNavigate = (log: ActivityLog) => {
    // 1. Xác định Workspace ID và Project ID
    // Ưu tiên lấy từ log, nếu không có thì lấy từ URL hiện tại
    const wsId = log.workspaceId || params.workspaceId;
    const pId = log.projectId || params.projectId;

    if (!wsId) {
      console.warn("Cannot navigate: Missing Workspace ID context");
      return;
    }

    let url = "";

    // 2. Switch case dựa trên loại đối tượng (Entity Type)
    switch (log.entityType) {
      case "TASK":
      case "SPRINT":
        // Điều hướng về trang danh sách Sprint/Task
        if (pId) {
          url = `/core/workspace/${wsId}/project/${pId}/list`;
        }
        break;

      case "PROJECT":
        const targetProjectId = log.entityId;
        if (log.action === "UPDATE") {
          // Nếu là cập nhật thông tin -> Vào trang Settings
          url = `/core/workspace/${wsId}/project/${targetProjectId}/settings`;
        } else {
          // Các hành động khác -> Vào trang Board
          url = `/core/workspace/${wsId}/project/${targetProjectId}/board`;
        }
        break;

      case "WORKSPACE":
        // Cập nhật workspace -> Vào trang Settings Workspace
        if (log.action === "UPDATE") {
          url = `/core/workspace/${wsId}/settings`;
        }
        break;

      default:
        console.log(`No navigation rule for entity type: ${log.entityType}`);
        break;
    }

    // 3. Thực hiện chuyển trang & đóng popover
    if (url) {
      router.push(url);
      onClose();
    }
  };

  // =========================================================================
  // 6. LOGIC: CLICK OUTSIDE
  // =========================================================================
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // =========================================================================
  // 7. RENDER
  // =========================================================================
  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-12 right-0 w-[420px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200 ring-1 ring-slate-900/5"
    >
      {/* --- HEADER --- */}
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          Notifications
        </h3>
        <button className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-blue-600 font-medium transition-colors px-2 py-1 rounded hover:bg-white">
          <CheckCheck className="w-3 h-3" /> Mark all read
        </button>
      </div>

      {/* --- TABS BAR --- */}
      {availableTabs.length > 1 && (
        <div className="flex items-center px-2 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {availableTabs.map((tab) => {
            const isActive = activeTabKey === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTabKey(tab.key)}
                className={`
                  flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap outline-none
                  ${
                    isActive
                      ? "border-blue-600 text-blue-700 bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }
                `}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* --- CONTENT LIST --- */}
      <div className="max-h-[400px] min-h-[200px] overflow-y-auto custom-scrollbar bg-white">
        {loading ? (
          // Loading State
          <div className="h-48 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs font-medium">
              Synchronizing activities...
            </span>
          </div>
        ) : errorMsg ? (
          // Error State
          <div className="h-48 flex flex-col items-center justify-center text-red-400 gap-2">
            <AlertCircle className="w-8 h-8 opacity-80" />
            <p className="text-xs">{errorMsg}</p>
          </div>
        ) : activities.length > 0 ? (
          // Data State
          <div className="divide-y divide-slate-50">
            {activities.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onClick={() => handleNavigate(item)}
              />
            ))}
            <div className="p-2 text-center bg-slate-50/50 sticky bottom-0 border-t border-slate-100">
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors py-1">
                View full history
              </button>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
              <Inbox className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              No {activeTabKey.toLowerCase()} activities found
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] text-center">
              New actions in this scope will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
