"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, usePathname, useRouter } from "next/navigation"; // ✅ Thêm useRouter
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

interface LogTab {
  key: string;
  label: string;
  icon: any;
  scope: string;
  entityId: number;
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
  const router = useRouter(); // ✅ Init Router để chuyển trang
  const popoverRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // --------------------------------------------------------
  // 1. TÍNH TOÁN CÁC TAB KHẢ DỤNG (LOGIC GIỮ NGUYÊN)
  // --------------------------------------------------------
  useEffect(() => {
    if (!isOpen || !user) return;

    const tabs: LogTab[] = [];

    // A. USER TAB
    tabs.push({
        key: "USER",
        label: "My Logs",
        icon: User,
        scope: "USER",
        entityId: Number(user.id)
    });

    // B. PROJECT TAB
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

    // C. WORKSPACE TAB
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

    // D. COMPANY TAB
    const isCompanyPage = pathname?.includes("/admin/company");
    const urlCompanyId = params.companyId || params.id;
    let targetCompanyId = urlCompanyId ? Number(urlCompanyId) : null;
    
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
            entityId: targetCompanyId
        });
    }

    setAvailableTabs(tabs);

    // E. SMART DEFAULT ACTIVE
    if (params.projectId) setActiveTabKey("PROJECT");
    else if (params.workspaceId) setActiveTabKey("WORKSPACE");
    else if (targetCompanyId && isCompanyPage) setActiveTabKey("COMPANY");
    else setActiveTabKey("USER");

  }, [isOpen, pathname, params, user]);

  // --------------------------------------------------------
  // 2. FETCH DATA
  // --------------------------------------------------------
  useEffect(() => {
    if (!isOpen || availableTabs.length === 0) return;

    const currentTab = availableTabs.find(t => t.key === activeTabKey);
    if (!currentTab) return;
    
    setLoading(true);
    setErrorMsg(null);

    getActivities(currentTab.scope, currentTab.entityId)
      .then(data => setActivities(data))
      .catch(err => {
          console.error("Fetch activities error:", err);
          setErrorMsg("Failed to load logs.");
      })
      .finally(() => setLoading(false));

  }, [activeTabKey, isOpen, availableTabs]);

  // --------------------------------------------------------
  // 3. 🎯 HANDLE NAVIGATION (LOGIC MỚI)
  // --------------------------------------------------------
  const handleNavigate = (log: ActivityLog) => {
    // 1. Xác định Workspace ID và Project ID
    // Ưu tiên lấy từ log (nếu API trả về), nếu không thì lấy từ URL hiện tại (params)
    // Lưu ý: Nếu ở tab "My Logs" mà click vào task của dự án khác với URL hiện tại, 
    // cần API trả về projectId/workspaceId trong log để điều hướng đúng.
    const wsId = log.workspaceId || params.workspaceId;
    const pId = log.projectId || params.projectId;

    if (!wsId) {
        console.warn("Cannot navigate: Missing Workspace ID");
        return;
    }

    let url = "";

    switch (log.entityType) {
        case "TASK":
        case "SPRINT":
            // -> Chuyển hướng đến trang Sprints (List Task)
            if (pId) {
                url = `/core/workspace/${wsId}/project/${pId}/sprints`;
            }
            break;

        case "PROJECT":
            // Nếu Entity là Project, thì entityId chính là Project ID cần đến
            const targetProjectId = log.entityId; 
            
            if (log.action === "UPDATE") {
                // Thay đổi thông tin dự án -> Settings
                url = `/core/workspace/${wsId}/project/${targetProjectId}/settings`;
            } else {
                // Tạo mới, start, complete -> Board
                url = `/core/workspace/${wsId}/project/${targetProjectId}/board`;
            }
            break;

        case "WORKSPACE":
            // Thay đổi thông tin workspace -> Settings Workspace
            if (log.action === "UPDATE") {
                url = `/core/workspace/${wsId}/settings`;
            }
            break;
            
        default:
            // Mặc định không làm gì hoặc log ra console
            console.log("No navigation rule for type:", log.entityType);
            break;
    }

    // Thực hiện chuyển trang và đóng popover
    if (url) {
        router.push(url);
        onClose();
    }
  };

  // --------------------------------------------------------
  // 4. CLICK OUTSIDE
  // --------------------------------------------------------
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
              <NotificationItem 
                key={item.id} 
                item={item} 
                // ✅ Truyền hàm click xuống Item để xử lý chuyển trang
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