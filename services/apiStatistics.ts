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

// --- API METHODS ---

export const getWeeklyOverview = async (projectId: number): Promise<WeeklyOverviewData> => {
  const res = await apiClient.get(`/statistics/projects/${projectId}`); // Gọi đúng endpoint gốc
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};