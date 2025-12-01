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