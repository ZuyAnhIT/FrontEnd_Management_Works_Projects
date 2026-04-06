import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES
// =============================================================================

export interface FinancialData {
    mrr: { 
        currentMonthRevenue: number; 
        previousMonthRevenue: number; 
        growthPercentage: number; 
        isPositiveGrowth: boolean; 
    };
    revenueByPlans: { 
        planName: string; 
        totalRevenue: number; 
        percentage: number; 
    }[];
    recentTransactions: { 
        transactionCode: string; 
        companyName: string; 
        planName: string; 
        amount: number; 
        paidAt: string; 
        status: string; 
    }[];
}

export interface CustomerHealthData {
    activeTenants: { 
        currentActiveCount: number; 
        previousActiveCount: number; 
        growthPercentage: number; 
        isPositiveGrowth: boolean; 
    };
    newVsChurn: { 
        newTenants: number; 
        churnedTenants: number; 
        netRetention: number; 
    };
    tenantsByPlan: { 
        planName: string; 
        tenantCount: number; 
        percentage: number; 
    }[];
}

export interface SystemUsageData {
    totalActiveUsers: number;
    storageUsage: { 
        totalUsedBytes: number; 
        totalCapacityBytes: number; 
        usagePercentage: number; 
    };
    engagementStats: { 
        newProjectsCreated: number; 
        newTasksCreated: number; 
    };
}

// =============================================================================
// 2. API METHODS
// =============================================================================

export const getFinancialOverview = async (year?: number, month?: number): Promise<FinancialData> => {
    const res = await apiClient.get("/admin/analytics/financial-overview", { params: { year, month } });
    return res.data.data;
};

export const getCustomerHealthOverview = async (year?: number, month?: number): Promise<CustomerHealthData> => {
    const res = await apiClient.get("/admin/analytics/customers/overview", { params: { year, month } });
    return res.data.data;
};

export const getSystemUsageOverview = async (year?: number, month?: number): Promise<SystemUsageData> => {
    const res = await apiClient.get("/admin/analytics/system/overview", { params: { year, month } });
    return res.data.data;
};