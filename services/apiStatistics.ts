"use client";

import apiClient from "@/lib/apiClient";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

// -----------------------------------------------------------------------------
// Dữ liệu dùng chung (Shared)
// -----------------------------------------------------------------------------

export interface StatsStatus { id: number; name: string; color: string; }
export interface StatsAssignee { id: number; name: string; avatarUrl: string; }
export interface StatsEpic { id: number; name: string; color: string; }

/**
 * Thông tin công việc tóm tắt dùng trong các báo cáo thống kê
 */
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

// -----------------------------------------------------------------------------
// Phân hệ Tổng quan (Overview)
// -----------------------------------------------------------------------------

export interface OverviewParams {
  from?: string; // Định dạng YYYY-MM-DD
  to?: string;   // Định dạng YYYY-MM-DD
  keyword?: string;
  assigneeId?: number;
  priority?: string;
  taskType?: string;
  statusIds?: number[];
}

/**
 * Dữ liệu thống kê hoạt động hàng tuần
 */
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

// -----------------------------------------------------------------------------
// Phân hệ Biểu đồ phân bổ (Distribution Charts)
// -----------------------------------------------------------------------------

/**
 * Dữ liệu cho các biểu đồ tròn (Trạng thái, Ưu tiên, Loại công việc)
 */
export interface DistributionStat {
  name: string;
  color: string;
  code?: string;
  taskCount: number;
  percentage: number;
  [key: string]: any;
}

// -----------------------------------------------------------------------------
// Phân hệ Tiến độ Epic (Epic Progress)
// -----------------------------------------------------------------------------

export interface EpicProgressParams {
  sprintId?: number | null;
  statusIds?: number[];
  from?: string;
  to?: string;
  export?: boolean;
}

/**
 * Thống kê chi tiết tiến độ hoàn thành của Epic
 */
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

// -----------------------------------------------------------------------------
// Phân hệ Tải công việc (Workload)
// -----------------------------------------------------------------------------

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

/**
 * Thống kê khối lượng công việc theo từng thành viên
 */
export interface WorkloadStat {
  userId: number;
  userName: string;
  avatarUrl: string;
  totalLoad: number;
  breakdowns: WorkloadBreakdown[];
}

// -----------------------------------------------------------------------------
// Phân hệ Lộ trình & Lịch (Roadmap & Calendar)
// -----------------------------------------------------------------------------

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

export interface CalendarParams {
  from: string; // Bắt buộc
  to: string;   // Bắt buộc
  keyword?: string;
  assigneeId?: number;
  priority?: string;
  taskType?: string;
  showSprints?: boolean;
}

/**
 * Sự kiện hiển thị trên lịch dự án
 */
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
// INTERNAL HELPERS
// =============================================================================

/**
 * Xây dựng tham số truy vấn sạch cho API
 * Loại bỏ các giá trị trống và chuyển đổi mảng thành chuỗi phân cách bởi dấu phẩy
 */
const buildQueryParams = (params: any) => {
  if (!params) return {};
  
  const clean: any = {};
  
  Object.keys(params).forEach((key) => {
    const value = params[key];
    
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
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
// API METHODS
// =============================================================================

/**
 * Lấy báo cáo tổng quan hoạt động theo tuần của dự án
 */
export const getWeeklyOverview = async (
  projectId: number,
  params?: OverviewParams
): Promise<WeeklyOverviewData> => {
  try {
    const url = `/statistics/projects/${projectId}`;
    const res = await apiClient.get(url, {
      params: buildQueryParams(params),
    });

    const { success, message, data } = res.data;
    if (!success) {
      throw new Error(message || "Failed to load overview data");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading overview";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy dữ liệu phân bổ công việc theo trạng thái
 */
export const getStatusDistribution = async (projectId: number): Promise<DistributionStat[]> => {
  try {
    const url = `/statistics/projects/${projectId}/status-distribution`;
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load status distribution");
    }

    return data.map((item: any) => ({
      name: item.statusName,
      color: item.color,
      taskCount: item.taskCount,
      percentage: item.percentage,
    }));
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading status distribution";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy dữ liệu phân bổ công việc theo mức độ ưu tiên
 */
export const getPriorityDistribution = async (projectId: number): Promise<DistributionStat[]> => {
  try {
    const url = `/statistics/projects/${projectId}/priority-distribution`;
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load priority distribution");
    }

    return data.map((item: any) => ({
      name: item.priorityName,
      code: item.priorityCode,
      color: item.color,
      taskCount: item.taskCount,
      percentage: item.percentage,
    }));
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading priority distribution";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy dữ liệu phân bổ công việc theo loại (Task, Bug, Story...)
 */
export const getTypeDistribution = async (projectId: number): Promise<DistributionStat[]> => {
  try {
    const url = `/statistics/projects/${projectId}/type-distribution`;
    const res = await apiClient.get(url);
    const { success, message, data } = res.data;

    if (!success) {
      throw new Error(message || "Failed to load type distribution");
    }

    return data.map((item: any) => ({
      name: item.typeName,
      code: item.typeCode,
      color: item.color,
      taskCount: item.taskCount,
      percentage: item.percentage,
    }));
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading type distribution";
    throw new Error(errorMsg);
  }
};

/**
 * Lấy dữ liệu tiến độ hoàn thành của các Epic trong dự án
 */
export const getEpicProgress = async (
  projectId: number,
  params?: EpicProgressParams
): Promise<EpicProgressStat[]> => {
  try {
    const url = `/statistics/projects/${projectId}/epic-progress`;
    const res = await apiClient.get(url, {
      params: buildQueryParams(params),
    });

    const { success, message, data } = res.data;
    if (!success) {
      throw new Error(message || "Failed to load epic progress");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading epic progress";
    throw new Error(errorMsg);
  }
};

/**
 * Xuất báo cáo tiến độ Epic dưới định dạng tệp Excel
 */
export const exportEpicProgress = async (
  projectId: number,
  params?: EpicProgressParams
): Promise<Blob> => {
  try {
    const queryParams = buildQueryParams(params);
    const url = `/statistics/projects/${projectId}/epic-progress`;
    const res = await apiClient.get(url, {
      params: { ...queryParams, export: true },
      responseType: "blob",
    });
    return res.data;
  } catch (error: any) {
    throw new Error("Failed to export epic progress report");
  }
};

/**
 * Lấy dữ liệu phân bổ khối lượng công việc (Workload) của các thành viên
 */
export const getProjectWorkload = async (
  projectId: number,
  params?: WorkloadParams
): Promise<WorkloadStat[]> => {
  try {
    const queryParams = buildQueryParams(params);
    const url = `/statistics/${projectId}/workload`;
    const res = await apiClient.get(url, {
      params: { ...queryParams, export: false },
    });

    const { success, message, data } = res.data;
    if (!success) {
      throw new Error(message || "Failed to load workload");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading workload";
    throw new Error(errorMsg);
  }
};

/**
 * Xuất báo cáo khối lượng công việc (Workload) dưới định dạng tệp Excel
 */
export const exportWorkloadReport = async (
  projectId: number,
  params?: WorkloadParams
): Promise<Blob> => {
  try {
    const queryParams = buildQueryParams(params);
    const url = `/statistics/${projectId}/workload`;
    const res = await apiClient.get(url, {
      params: { ...queryParams, export: true },
      responseType: "blob",
    });
    return res.data;
  } catch (error: any) {
    throw new Error("Failed to export workload report");
  }
};

/**
 * Truy vấn dữ liệu lộ trình (Roadmap) của dự án
 */
export const getProjectRoadmap = async (
  projectId: number,
  params?: RoadmapParams
): Promise<RoadmapItemResponse[]> => {
  try {
    const url = `/statistics/projects/${projectId}/roadmap`;
    const res = await apiClient.get(url, {
      params: buildQueryParams(params),
    });

    const { success, message, data } = res.data;
    if (!success) {
      throw new Error(message || "Failed to load roadmap");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading roadmap";
    throw new Error(errorMsg);
  }
};

/**
 * Truy vấn các sự kiện cho lịch dự án (Tasks và Sprints)
 */
export const getProjectCalendar = async (
  projectId: number,
  params: CalendarParams
): Promise<CalendarEvent[]> => {
  try {
    const url = `/statistics/projects/${projectId}/calendar`;
    const res = await apiClient.get(url, {
      params: buildQueryParams(params),
    });

    const { success, message, data } = res.data;
    if (!success) {
      throw new Error(message || "Failed to load calendar events");
    }
    return data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "An error occurred while loading calendar";
    throw new Error(errorMsg);
  }
};