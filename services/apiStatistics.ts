"use client";

import apiClient from "@/lib/apiClient";

// --- DTOs dựa trên JSON mẫu ---

export interface StatsStatus {
  id: number;
  name: string;
  color: string;
}

export interface StatsAssignee {
  id: number;
  name: string;
  avatarUrl: string;
}

export interface StatsEpic {
  id: number;
  name: string;
  color: string;
}

export interface StatsTask {
  id: number;
  taskCode: string;
  title: string;
  taskType: string; // BUG, TASK, STORY...
  priority: string; // URGENT, MEDIUM...
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

export interface OverviewParams {
  from?: string;        // YYYY-MM-DD
  to?: string;          // YYYY-MM-DD
  keyword?: string;
  assigneeId?: number;
  priority?: string;    // LOW, MEDIUM, HIGH, URGENT
  taskType?: string;    // STORY, TASK, BUG...
  statusIds?: number[]; // Array ID
}

// Response tổng thể
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

// Interface chuẩn cho biểu đồ (Dùng chung cho Status/Priority/Type)
export interface DistributionStat {
  name: string;       // Map từ statusName
  color: string; 
  code?: string;     
  taskCount: number;  // Giữ nguyên
  percentage: number; // Giữ nguyên
  [key: string]: any;
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

// Interface cho Params Lọc
export interface EpicProgressParams {
  sprintId?: number | null;
  statusIds?: number[]; // Mảng ID
  from?: string;        // YYYY-MM-DD
  to?: string;          // YYYY-MM-DD
}

// Interface cho Workload
export interface WorkloadBreakdown {
  stackName: string; // Tên đoạn (vd: "In Progress", "High")
  color: string;     // Mã màu
  value: number;     // Giá trị (Points hoặc Hours)
  taskCount: number; // Số lượng task trong đoạn này
}

export interface WorkloadStat {
  userId: number;
  userName: string;
  avatarUrl: string;
  totalLoad: number;
  breakdowns: WorkloadBreakdown[];
}

// Params
export interface WorkloadParams {
  viewType?: "POINTS" | "HOURS";
  groupBy?: "STATUS" | "PRIORITY";
  sprintId?: number | null;
  from?: string;
  to?: string;
  statusIds?: number[];
}

// ✅ CẬP NHẬT: Interface Params đầy đủ
export interface RoadmapParams {
  viewType?: "EPIC" | "SPRINT" | "ALL"; 
  keyword?: string;
  from?: string;
  to?: string;
  
  // Filter Mảng (Multi-select)
  epicIds?: number[];
  epicStatuses?: string[];
  sprintIds?: number[];
  sprintStatuses?: string[];
}

export interface RoadmapItemResponse {
  id: string;        // "epic-1", "sprint-2"
  originalId: number;
  title: string;
  type: "EPIC" | "SPRINT";
  startDate: string;
  endDate: string;
  progress: number;  // 0-100
  status: string;
  color: string;
  totalTasks: number;
  completedTasks: number;
}

export interface CalendarEvent {
  id: string;          // Ví dụ: "task-1", "sprint-2" (để render key trên lịch)
  originalId: number;  // ID gốc trong DB (để gọi API detail khi click)
  title: string;
  start: string;       // ISO 8601 string (2025-09-01T00:00:00)
  end: string;         // ISO 8601 string
  allDay: boolean;
  type: "TASK" | "SPRINT";
  
  // UI Properties
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  
  // Meta data
  statusName: string;
  priority: string | null;      // Chỉ có ở Task
  assigneeName: string | null;  // Chỉ có ở Task
  assigneeAvatar: string | null;// Chỉ có ở Task
}

export interface CalendarParams {
  from: string; // YYYY-MM-DD (Bắt buộc)
  to: string;   // YYYY-MM-DD (Bắt buộc)
  keyword?: string;
  assigneeId?: number;
  priority?: string;
  taskType?: string;
  showSprints?: boolean;
}


// --- API METHODS ---

// 1. Lấy tổng quan (Hỗ trợ Filter & Date Range)
export const getWeeklyOverview = async (
  projectId: number, 
  params?: OverviewParams
): Promise<WeeklyOverviewData> => {
  
  const cleanParams: any = {};

  if (params?.from) cleanParams.from = params.from;
  if (params?.to) cleanParams.to = params.to;
  if (params?.keyword) cleanParams.keyword = params.keyword;
  if (params?.assigneeId) cleanParams.assigneeId = params.assigneeId;
  if (params?.priority) cleanParams.priority = params.priority;
  if (params?.taskType) cleanParams.taskType = params.taskType;
  
  if (params?.statusIds && params.statusIds.length > 0) {
      cleanParams.statusIds = params.statusIds.join(",");
  }

  const res = await apiClient.get(`/statistics/projects/${projectId}`, { 
    params: cleanParams 
  });

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// 2. Lấy phân bổ trạng thái (Status Distribution)
export const getStatusDistribution = async (projectId: number): Promise<DistributionStat[]> => {
  const res = await apiClient.get(`/statistics/projects/${projectId}/status-distribution`);
  
  if (!res.data.success) throw new Error(res.data.message);
  
  // Map dữ liệu từ Backend về chuẩn Frontend
  return res.data.data.map((item: any) => ({
      name: item.statusName,   // Backend trả về statusName -> Đổi thành name
      color: item.color,
      taskCount: item.taskCount,
      percentage: item.percentage
  }));
};

// 3. Lấy phân bổ mức độ ưu tiên (Priority Distribution)
export const getPriorityDistribution = async (projectId: number): Promise<DistributionStat[]> => {
  const res = await apiClient.get(`/statistics/projects/${projectId}/priority-distribution`);
  
  if (!res.data.success) throw new Error(res.data.message);
  
  // Map dữ liệu từ Backend về chuẩn Frontend
  // Backend: priorityName, priorityCode
  // Frontend Interface: name, code
  return res.data.data.map((item: any) => ({
      name: item.priorityName, 
      code: item.priorityCode,
      color: item.color,
      taskCount: item.taskCount,
      percentage: item.percentage
  }));
};

// 4. Lấy phân bổ loại công việc (Type Distribution)
export const getTypeDistribution = async (projectId: number): Promise<DistributionStat[]> => {
  const res = await apiClient.get(`/statistics/projects/${projectId}/type-distribution`);
  
  if (!res.data.success) throw new Error(res.data.message);
  
  // Map dữ liệu
  return res.data.data.map((item: any) => ({
      name: item.typeName, 
      code: item.typeCode, 
      color: item.color,
      taskCount: item.taskCount,
      percentage: item.percentage
  }));
};

// 5. Lấy tiến độ theo Epic với các tham số lọc
export const getEpicProgress = async (
  projectId: number, 
  params?: EpicProgressParams
): Promise<EpicProgressStat[]> => {
  
  // Clean params
  const cleanParams: any = {};
  if (params?.sprintId) cleanParams.sprintId = params.sprintId;
  if (params?.from) cleanParams.from = params.from;
  if (params?.to) cleanParams.to = params.to;
  
  // Xử lý mảng statusIds (axios cần format: statusIds=1&statusIds=2...)
  // Hoặc gửi dạng chuỗi "1,2,3" tùy backend quy định. 
  // Ở đây giả định backend nhận array params chuẩn.
  if (params?.statusIds && params.statusIds.length > 0) {
      cleanParams.statusIds = params.statusIds.join(","); // Chuyển về chuỗi "1,2,3" cho an toàn
  }

  const res = await apiClient.get(`/statistics/projects/${projectId}/epic-progress`, { 
    params: cleanParams 
  });

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// 6. Lấy tải công việc (Workload) với các tham số lọc
export const getProjectWorkload = async (
  projectId: number, 
  params?: WorkloadParams
): Promise<WorkloadStat[]> => {
  
  // Clean params
  const cleanParams: any = {};
  if (params?.viewType) cleanParams.viewType = params.viewType;
  if (params?.groupBy) cleanParams.groupBy = params.groupBy;
  if (params?.sprintId) cleanParams.sprintId = params.sprintId;
  if (params?.from) cleanParams.from = params.from;
  if (params?.to) cleanParams.to = params.to;
  
  if (params?.statusIds && params.statusIds.length > 0) {
      cleanParams.statusIds = params.statusIds.join(",");
  }

  const res = await apiClient.get(`/statistics/projects/${projectId}/workload`, { 
    params: cleanParams 
  });

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// 7. Lấy dữ liệu Roadmap với các tham số lọc
export const getProjectRoadmap = async (
  projectId: number, 
  params?: RoadmapParams
): Promise<RoadmapItemResponse[]> => {
  
  const cleanParams: any = {};
  
  if (params?.viewType) cleanParams.viewType = params.viewType;
  if (params?.keyword) cleanParams.keyword = params.keyword;
  if (params?.from) cleanParams.from = params.from;
  if (params?.to) cleanParams.to = params.to;

  // Xử lý mảng: Axios mặc định gửi mảng dạng key[]=val, 
  // nhưng Spring Boot thường thích dạng key=val1,val2 hoặc lặp lại key=val1&key=val2
  // Ở đây ta join thành chuỗi "1,2,3" để an toàn nhất với nhiều loại backend
  if (params?.epicIds?.length) cleanParams.epicIds = params.epicIds.join(",");
  if (params?.sprintIds?.length) cleanParams.sprintIds = params.sprintIds.join(",");
  if (params?.epicStatuses?.length) cleanParams.epicStatuses = params.epicStatuses.join(",");
  if (params?.sprintStatuses?.length) cleanParams.sprintStatuses = params.sprintStatuses.join(",");

  const res = await apiClient.get(`/statistics/projects/${projectId}/roadmap`, { 
    params: cleanParams 
  });

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

// 8. Lấy dữ liệu Lịch dự án (Calendar)
export const getProjectCalendar = async (
  projectId: number, 
  params: CalendarParams
): Promise<CalendarEvent[]> => {
  
  const cleanParams: any = {
    from: params.from,
    to: params.to
  };

  if (params.keyword) cleanParams.keyword = params.keyword;
  if (params.assigneeId) cleanParams.assigneeId = params.assigneeId;
  if (params.priority) cleanParams.priority = params.priority;
  if (params.taskType) cleanParams.taskType = params.taskType;
  
  // Kiểm tra boolean để tránh lỗi khi giá trị là false
  if (params.showSprints !== undefined) cleanParams.showSprints = params.showSprints;

  const res = await apiClient.get(`/statistics/projects/${projectId}/calendar`, { 
    params: cleanParams 
  });

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};