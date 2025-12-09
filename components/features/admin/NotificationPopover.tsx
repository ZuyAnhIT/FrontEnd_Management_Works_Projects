"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { 
  Bell, Loader2, CheckCheck, Inbox, 
  User, Building2, FolderKanban, LayoutGrid, AlertCircle 
} from "lucide-react";
import { getActivities, ActivityLog } from "@/services/apiActivity";
import NotificationItem from "@/components/ui/NotificationItem";
import { useAuth } from "@/context/AuthContext";

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

// Định nghĩa cấu trúc Tab
interface LogTab {
  key: string;      // Unique key: "USER", "COMPANY", "PROJECT"...
  label: string;    // Tên hiển thị
  icon: any;        // Icon Component
  scope: string;    // API Scope
  entityId: number; // ID để gọi API
}

export default function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
  // Data State
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab State
  const [availableTabs, setAvailableTabs] = useState<LogTab[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>("USER");

  // Hooks
  const params = useParams();
  const pathname = usePathname();
  const popoverRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // --------------------------------------------------------
  // 1. TÍNH TOÁN CÁC TAB KHẢ DỤNG (DYNAMIC TABS)
  // --------------------------------------------------------
  useEffect(() => {
    if (!isOpen || !user) return;

    console.group("🔔 [Notif] Detecting Context...");
    const tabs: LogTab[] = [];

    // --- A. USER TAB (Luôn có) ---
    tabs.push({
        key: "USER",
        label: "My Logs",
        icon: User,
        scope: "USER",
        entityId: Number(user.id)
    });

    // --- B. PROJECT TAB (Nếu có projectId trên URL) ---
    // URL mẫu: /core/workspace/1/project/99
    if (params.projectId) {
        const pId = Number(params.projectId);
        if (!isNaN(pId)) {
            tabs.push({
                key: "PROJECT",
                label: "Project",
                icon: FolderKanban,
                scope: "PROJECT",
                entityId: pId
            });
        }
    }

    // --- C. WORKSPACE TAB (Nếu có workspaceId trên URL) ---
    // URL mẫu: /core/workspace/1
    if (params.workspaceId) {
        const wId = Number(params.workspaceId);
        if (!isNaN(wId)) {
            tabs.push({
                key: "WORKSPACE",
                label: "Workspace",
                icon: LayoutGrid,
                scope: "WORKSPACE",
                entityId: wId
            });
        }
    }

    // --- D. COMPANY TAB (Logic phức tạp hơn) ---
    // URL mẫu: /admin/company/1/dashboard
    const isCompanyPage = pathname?.includes("/admin/company");
    const urlCompanyId = params.companyId || params.id;
    
    // Ưu tiên lấy ID từ URL, nếu không có thì lấy từ LocalStorage
    let targetCompanyId = urlCompanyId ? Number(urlCompanyId) : null;
    
    if (!targetCompanyId && isCompanyPage) {
        const storedId = localStorage.getItem("lastActiveCompanyId"); 
        if (storedId) {
            targetCompanyId = Number(storedId);
            console.log("   -> Found Company ID in Storage:", targetCompanyId);
        }
    }

    if (targetCompanyId && !isNaN(targetCompanyId)) {
        tabs.push({
            key: "COMPANY",
            label: "Company",
            icon: Building2,
            scope: "COMPANY",
            entityId: targetCompanyId
        });
    }

    console.log("   -> Available Tabs:", tabs.map(t => t.key));
    setAvailableTabs(tabs);

    // --- E. SMART DEFAULT ACTIVE (Chọn tab mặc định thông minh) ---
    // Tự động chọn tab có ngữ cảnh cụ thể nhất
    // Thứ tự ưu tiên: Project > Workspace > Company > User
    if (params.projectId) setActiveTabKey("PROJECT");
    else if (params.workspaceId) setActiveTabKey("WORKSPACE");
    else if (targetCompanyId && isCompanyPage) setActiveTabKey("COMPANY");
    else setActiveTabKey("USER"); // Mặc định về User nếu ở Dashboard chung

    console.groupEnd();

  }, [isOpen, pathname, params, user]);

  // --------------------------------------------------------
  // 2. FETCH DATA KHI ACTIVE TAB THAY ĐỔI
  // --------------------------------------------------------
  useEffect(() => {
    if (!isOpen || availableTabs.length === 0) return;

    const currentTab = availableTabs.find(t => t.key === activeTabKey);
    if (!currentTab) return;

    console.log(`🚀 [Notif] Fetching logs for: ${currentTab.key} (ID: ${currentTab.entityId})`);
    
    setLoading(true);
    setErrorMsg(null);

    getActivities(currentTab.scope, currentTab.entityId)
      .then(data => {
          console.log(`✅ [Notif] Loaded ${data.length} activities.`);
          setActivities(data);
      })
      .catch(err => {
          console.error("❌ [Notif] Fetch error:", err);
          setErrorMsg("Failed to load logs.");
      })
      .finally(() => setLoading(false));

  }, [activeTabKey, isOpen, availableTabs]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: any) {
        if (popoverRef.current && !popoverRef.current.contains(event.target)) {
            onClose();
        }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

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

      {/* --- TABS BAR (Dynamic) --- */}
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
                              ${isActive 
                                  ? 'border-blue-600 text-blue-700 bg-white' 
                                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                              }
                          `}
                      >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          {tab.label}
                      </button>
                  )
              })}
          </div>
      )}

      {/* --- CONTENT LIST --- */}
      <div className="max-h-[400px] min-h-[200px] overflow-y-auto custom-scrollbar bg-white">
        {loading ? (
          <div className="h-48 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs font-medium">Synchronizing activities...</span>
          </div>
        ) : errorMsg ? (
           <div className="h-48 flex flex-col items-center justify-center text-red-400 gap-2">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <p className="text-xs">{errorMsg}</p>
           </div>
        ) : activities.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {activities.map((item) => (
              <NotificationItem key={item.id} item={item} />
            ))}
            <div className="p-2 text-center bg-slate-50/50 sticky bottom-0 border-t border-slate-100">
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors py-1">
                    View full history
                </button>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                <Inbox className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">No {activeTabKey.toLowerCase()} activities</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] text-center">
                New actions in this scope will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}