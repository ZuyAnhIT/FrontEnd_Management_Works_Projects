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

// --- API METHODS ---

// 1. Lấy thống kê tổng quan hàng tuần cho project
export const getWeeklyOverview = async (projectId: number): Promise<WeeklyOverviewData> => {
  const res = await apiClient.get(`/statistics/projects/${projectId}`); // Gọi đúng endpoint gốc
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