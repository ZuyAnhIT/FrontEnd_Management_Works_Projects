"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. UTILS (Hàm tiện ích nội bộ)
// =============================================================================

/**
 * Xây dựng params sạch cho API:
 * - Loại bỏ null, undefined, chuỗi rỗng.
 * - Tự động join mảng thành chuỗi ngăn cách bởi dấu phẩy (cho statusIds, epicIds...).
 */
const buildQueryParams = (params: any) => {
  if (!params) return {};
  
  const clean: any = {};
  
  Object.keys(params).forEach((key) => {
    const value = params[key];
    
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        // Backend Spring Boot thường nhận list qua chuỗi "1,2,3" hoặc lặp lại key
        // Logic cũ của bạn join phẩy, nên giữ nguyên cách này
        if (value.length > 0) {
            clean[key] = value.join(","); 
        }
      } else {
        clean[key] = value;
      }
    }
  });

  return clean;
};

// =============================================================================
// 2. INTERFACES (Định nghĩa kiểu dữ liệu)
// =============================================================================

// --- Shared Sub-Interfaces ---
export interface StatsStatus { id: number; name: string; color: string; }
export interface StatsAssignee { id: number; name: string; avatarUrl: string; }
export interface StatsEpic { id: number; name: string; color: string; }
export interface StatsTask {
  id: number;
  taskCode: string;
  title: string;
  taskType: string;
  priority: string;
  sprintId: number;
  storyPoints: number;
  startDate: string;
  dueDate: string;
  sortOrder: number;
  status: StatsStatus;
  epic?: StatsEpic;
  assignee?: StatsAssignee;
  tags?: { id: number; name: string; color: string }[];
}

// --- 2.1 Overview Module ---
export interface OverviewParams {
  from?: string;        // YYYY-MM-DD
  to?: string;          // YYYY-MM-DD
  keyword?: string;
  assigneeId?: number;
  priority?: string;
  taskType?: string;
  statusIds?: number[];
}

export interface WeeklyOverviewData {
  fromDate: string;
  toDate: string;
  dueSoonCount: number;
  dueSoonTasks: StatsTask[];
  createdCount: number;
  createdTasks: StatsTask[];
  completedCount: number;
  completedTasks: StatsTask[];
  updatedCount: number;
  updatedTasks: StatsTask[];
}

// --- 2.2 Distribution Charts ---
export interface DistributionStat {
  name: string;      // Map từ statusName/typeName...
  color: string;
  code?: string;
  taskCount: number;
  percentage: number;
  [key: string]: any;
}

// --- 2.3 Epic Progress ---
export interface EpicProgressParams {
  sprintId?: number | null;
  statusIds?: number[];
  from?: string;
  to?: string;
  export?: boolean;
}

export interface EpicProgressStat {
  epicId: number;
  epicName: string;
  epicCode: string;
  color: string;
  totalTasks: number;
  completedTasks: number;
  taskProgressPercent: number;
  totalPoints: number;
  completedPoints: number;
  pointProgressPercent: number;
}

// --- 2.4 Workload ---
export interface WorkloadParams {
  viewType?: "POINTS" | "HOURS";
  groupBy?: "STATUS" | "PRIORITY";
  sprintId?: number | "ALL" | null;
  from?: string;
  to?: string;
  statusIds?: number[];
  export?: boolean;
}

export interface WorkloadBreakdown {
  stackName: string;
  color: string;
  value: number;
  taskCount: number;
}

export interface WorkloadStat {
  userId: number;
  userName: string;
  avatarUrl: string;
  totalLoad: number;
  breakdowns: WorkloadBreakdown[];
}

// --- 2.5 Roadmap ---
export interface RoadmapParams {
  viewType?: "EPIC" | "SPRINT" | "ALL";
  keyword?: string;
  from?: string;
  to?: string;
  epicIds?: number[];
  epicStatuses?: string[];
  sprintIds?: number[];
  sprintStatuses?: string[];
}

export interface RoadmapItemResponse {
  id: string;
  originalId: number;
  title: string;
  type: "EPIC" | "SPRINT";
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  color: string;
  totalTasks: number;
  completedTasks: number;
}

// --- 2.6 Calendar ---
export interface CalendarParams {
  from: string; // Required
  to: string;   // Required
  keyword?: string;
  assigneeId?: number;
  priority?: string;
  taskType?: string;
  showSprints?: boolean;
}

export interface CalendarEvent {
  id: string;
  originalId: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  type: "TASK" | "SPRINT";
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  statusName: string;
  priority: string | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;
}

// =============================================================================
// 3. API METHODS (Các hàm gọi API)
// =============================================================================

/**
 * 1. Lấy tổng quan (Weekly Overview)
 */
export const getWeeklyOverview = async (
  projectId: number,
  params?: OverviewParams
): Promise<WeeklyOverviewData> => {
  try {
    const res = await apiClient.get(`/statistics/projects/${projectId}`, {
      params: buildQueryParams(params),
    });

    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Failed to load overview data.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error loading overview.");
  }
};

/**
 * 2. Lấy phân bổ trạng thái (Status Distribution)
 */
export const getStatusDistribution = async (projectId: number): Promise<DistributionStat[]> => {
  try {
    const res = await apiClient.get(`/statistics/projects/${projectId}/status-distribution`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to load status distribution.");

    // Map dữ liệu từ Backend về chuẩn Frontend
    return data.map((item: any) => ({
      name: item.statusName,
      color: item.color,
      taskCount: item.taskCount,
      percentage: item.percentage,
    }));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error loading status distribution.");
  }
};

/**
 * 3. Lấy phân bổ mức độ ưu tiên (Priority Distribution)
 */
export const getPriorityDistribution = async (projectId: number): Promise<DistributionStat[]> => {
  try {
    const res = await apiClient.get(`/statistics/projects/${projectId}/priority-distribution`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to load priority distribution.");

    return data.map((item: any) => ({
      name: item.priorityName,
      code: item.priorityCode,
      color: item.color,
      taskCount: item.taskCount,
      percentage: item.percentage,
    }));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error loading priority distribution.");
  }
};

/**
 * 4. Lấy phân bổ loại công việc (Type Distribution)
 */
export const getTypeDistribution = async (projectId: number): Promise<DistributionStat[]> => {
  try {
    const res = await apiClient.get(`/statistics/projects/${projectId}/type-distribution`);
    const { success, message, data } = res.data;

    if (!success) throw new Error(message || "Failed to load type distribution.");

    return data.map((item: any) => ({
      name: item.typeName,
      code: item.typeCode,
      color: item.color,
      taskCount: item.taskCount,
      percentage: item.percentage,
    }));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error loading type distribution.");
  }
};

/**
 * 5. Lấy tiến độ theo Epic (Epic Progress)
 */
export const getEpicProgress = async (
  projectId: number,
  params?: EpicProgressParams
): Promise<EpicProgressStat[]> => {
  try {
    const res = await apiClient.get(`/statistics/projects/${projectId}/epic-progress`, {
      params: buildQueryParams(params),
    });

    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Failed to load epic progress.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error loading epic progress.");
  }
};

/**
 * 5.1 Export Excel cho Epic Progress
 */
export const exportEpicProgress = async (
  projectId: number,
  params?: EpicProgressParams
): Promise<Blob> => {
  try {
    const queryParams = buildQueryParams(params);
    const res = await apiClient.get(`/statistics/projects/${projectId}/epic-progress`, {
      params: { ...queryParams, export: true },
      responseType: "blob",
    });
    return res.data;
  } catch (error: any) {
    // Với Blob, xử lý lỗi hơi khác (thường backend trả về JSON lỗi thay vì Blob)
    // Nhưng để đơn giản ta vẫn ném lỗi chuẩn
    throw new Error("Failed to export epic progress report.");
  }
};

/**
 * 6. Lấy tải công việc (Workload)
 */
export const getProjectWorkload = async (
  projectId: number,
  params?: WorkloadParams
): Promise<WorkloadStat[]> => {
  try {
    const queryParams = buildQueryParams(params);
    const res = await apiClient.get(`/statistics/${projectId}/workload`, {
      params: { ...queryParams, export: false },
    });

    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Failed to load workload.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error loading workload.");
  }
};

/**
 * 6.1 Export Excel cho Workload
 */
export const exportWorkloadReport = async (
  projectId: number,
  params?: WorkloadParams
): Promise<Blob> => {
  try {
    const queryParams = buildQueryParams(params);
    const res = await apiClient.get(`/statistics/${projectId}/workload`, {
      params: { ...queryParams, export: true },
      responseType: "blob",
    });
    return res.data;
  } catch (error: any) {
    throw new Error("Failed to export workload report.");
  }
};

/**
 * 7. Lấy dữ liệu Roadmap
 */
export const getProjectRoadmap = async (
  projectId: number,
  params?: RoadmapParams
): Promise<RoadmapItemResponse[]> => {
  try {
    // Hàm buildQueryParams đã tự động xử lý join mảng epicIds, sprintIds...
    const res = await apiClient.get(`/statistics/projects/${projectId}/roadmap`, {
      params: buildQueryParams(params),
    });

    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Failed to load roadmap.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error loading roadmap.");
  }
};

/**
 * 8. Lấy dữ liệu Lịch dự án (Calendar)
 */
export const getProjectCalendar = async (
  projectId: number,
  params: CalendarParams
): Promise<CalendarEvent[]> => {
  try {
    const res = await apiClient.get(`/statistics/projects/${projectId}/calendar`, {
      params: buildQueryParams(params),
    });

    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Failed to load calendar events.");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "System error loading calendar.");
  }
};