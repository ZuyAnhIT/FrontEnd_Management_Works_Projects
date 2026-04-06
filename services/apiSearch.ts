import apiClient from "@/lib/apiClient";

// =============================================================================
// 1. INTERFACES (Cần Backend cập nhật đủ các ID này)
// =============================================================================

export interface SearchProject {
    projectId: number;
    projectName: string;
    projectCode: string;
    workspaceId: number; 
}

export interface SearchEpic {
    epicId: number;
    epicName: string;
    epicCode: string;
    projectName: string;
    projectId: number;   
    workspaceId: number; 
}

export interface SearchTask {
    taskId: number;
    taskTitle: string;
    taskCode: string;
    statusColor: string;
    projectId: number;   
    workspaceId: number; 
}

export interface GlobalSearchData {
    projects: SearchProject[];
    epics: SearchEpic[];
    tasks: SearchTask[];
}

// =============================================================================
// 2. API METHODS
// =============================================================================

export const getGlobalSearchResults = async (query: string): Promise<GlobalSearchData> => {
    try {
        
        const res = await apiClient.get("/search/global", {
            params: { q: query }
        });
        
        // Chấp nhận HTTP Status 200 hoặc custom status 200 từ Backend
        if (res.status === 200 || res.data?.status === 200 || res.data?.success) {
            return res.data.data as GlobalSearchData;
        }
        
        throw new Error(res.data?.message || "Invalid search response format");
    } catch (err: any) {
        console.error("[Search API Error]:", err); // Log ra để bạn debug dễ hơn
        const errorMessage = err.response?.data?.message || err.message || "An error occurred during search";
        throw new Error(errorMessage);
    }
};