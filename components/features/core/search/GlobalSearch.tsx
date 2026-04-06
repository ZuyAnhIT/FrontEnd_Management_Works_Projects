"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FolderKanban, Zap, CheckSquare, XCircle } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { getGlobalSearchResults, GlobalSearchData, SearchProject, SearchEpic, SearchTask } from "@/services/apiSearch";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

export default function GlobalSearch() {
    const router = useRouter();
    const { showToast } = useToast();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 400); 
    const [results, setResults] = useState<GlobalSearchData | null>(null);

    // Đóng popup khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Gọi API khi có từ khóa
    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery.trim().length < 2) {
                setResults(null);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            setIsOpen(true);

            try {
                const data = await getGlobalSearchResults(debouncedQuery.trim());
                setResults(data);
            } catch (err: any) {
                setError(err.message);
                setResults(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    // =========================================================================
    // CƠ CHẾ CHUYỂN HƯỚNG (ROUTING MECHANISM)
    // =========================================================================

    const navToProject = (p: SearchProject) => {
        if (!p.workspaceId || !p.projectId) return showToast("Backend is missing workspaceId/projectId", "error");
        setIsOpen(false);
        router.push(`/core/workspace/${p.workspaceId}/project/${p.projectId}`);
    };

    const navToEpic = (e: SearchEpic) => {
        if (!e.workspaceId || !e.projectId) return showToast("Backend is missing workspaceId/projectId", "error");
        setIsOpen(false);
        // Chuyển hướng sang màn Timeline của dự án
        router.push(`/core/workspace/${e.workspaceId}/project/${e.projectId}/timeline`);
    };

    const navToTask = (t: SearchTask) => {
        if (!t.workspaceId || !t.projectId) return showToast("Backend is missing workspaceId/projectId", "error");
        setIsOpen(false);
        // Chuyển hướng sang màn Board của dự án và đính kèm taskId lên URL để Board tự động mở Modal
        router.push(`/core/workspace/${t.workspaceId}/project/${t.projectId}?taskId=${t.taskId}`);
    };

    // =========================================================================

    const hasProjects = results?.projects && results.projects.length > 0;
    const hasEpics = results?.epics && results.epics.length > 0;
    const hasTasks = results?.tasks && results.tasks.length > 0;
    const hasAnyResults = hasProjects || hasEpics || hasTasks;

    return (
        <div className="relative w-full max-w-[400px]" ref={dropdownRef}>
            {/* THANH TÌM KIẾM */}
            <div className={cn(
                "flex items-center h-9 px-3 rounded-md border transition-all duration-200",
                isFocused ? "bg-white border-[#4C9AFF] shadow-[0_0_0_2px_rgba(76,154,255,0.2)]" : "bg-[#091E420F] border-transparent hover:bg-[#091E4214]"
            )}>
                {isLoading ? <Loader2 className="w-4 h-4 text-[#0052CC] animate-spin shrink-0" /> : <Search className={cn("w-4 h-4 shrink-0 transition-colors", isFocused ? "text-[#0052CC]" : "text-[#6B778C]")} />}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        if (query.trim().length >= 2) setIsOpen(true);
                    }}
                    placeholder="Search projects, epics, or tasks..."
                    className="w-full bg-transparent border-none outline-none px-2 text-[13px] font-medium text-[#172B4D] placeholder:text-[#6B778C]"
                />
                {query && (
                    <button onClick={() => { setQuery(""); setResults(null); setIsOpen(false); inputRef.current?.focus(); }} className="p-0.5 text-[#6B778C] hover:text-[#172B4D] rounded-full">
                        <XCircle className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* DROPDOWN KẾT QUẢ */}
            {isOpen && query.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-lg border border-[#DFE1E6] z-50 max-h-[480px] overflow-y-auto custom-scrollbar flex flex-col">
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center p-6 text-[#6B778C] text-[12px] font-bold uppercase tracking-widest gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-[#0052CC]" /> Searching...
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-[#BF2600] text-[12px] font-medium bg-[#FFEBE6]">
                            {error}
                        </div>
                    ) : hasAnyResults ? (
                        <div className="py-2">
                            {/* KHU VỰC: DỰ ÁN */}
                            {hasProjects && (
                                <div className="mb-2">
                                    <h4 className="px-4 py-1.5 text-[10px] font-black text-[#6B778C] uppercase tracking-[0.15em] bg-[#FAFBFC] border-y border-[#F4F5F7]">Projects</h4>
                                    {results.projects.map(p => (
                                        <button key={p.projectId} onClick={() => navToProject(p)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#DEEBFF] hover:border-l-2 hover:border-[#0052CC] border-l-2 border-transparent transition-all outline-none group text-left">
                                            <div className="w-6 h-6 rounded bg-[#F4F5F7] group-hover:bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#DFE1E6]">
                                                <FolderKanban className="w-3.5 h-3.5 text-[#42526E]" />
                                            </div>
                                            <div className="flex-1 truncate">
                                                <span className="text-[13px] font-bold text-[#172B4D] block truncate">{p.projectName}</span>
                                                <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">{p.projectCode}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* KHU VỰC: EPICS */}
                            {hasEpics && (
                                <div className="mb-2">
                                    <h4 className="px-4 py-1.5 text-[10px] font-black text-[#6B778C] uppercase tracking-[0.15em] bg-[#FAFBFC] border-y border-[#F4F5F7]">Epics</h4>
                                    {results.epics.map(e => (
                                        <button key={e.epicId} onClick={() => navToEpic(e)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#EAE6FF] hover:border-l-2 hover:border-[#403294] border-l-2 border-transparent transition-all outline-none group text-left">
                                            <div className="w-6 h-6 rounded bg-[#403294] flex items-center justify-center shrink-0 shadow-sm">
                                                <Zap className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <div className="flex-1 truncate">
                                                <span className="text-[13px] font-bold text-[#172B4D] block truncate">{e.epicName}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-[#403294] bg-[#EAE6FF] px-1.5 py-[1px] rounded uppercase tracking-wider">{e.epicCode}</span>
                                                    <span className="text-[10px] text-[#6B778C] truncate">{e.projectName}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* KHU VỰC: TASKS */}
                            {hasTasks && (
                                <div>
                                    <h4 className="px-4 py-1.5 text-[10px] font-black text-[#6B778C] uppercase tracking-[0.15em] bg-[#FAFBFC] border-y border-[#F4F5F7]">Tasks</h4>
                                    {results.tasks.map(t => (
                                        <button key={t.taskId} onClick={() => navToTask(t)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#E3FCEF] hover:border-l-2 hover:border-[#006644] border-l-2 border-transparent transition-all outline-none group text-left">
                                            <div className="w-6 h-6 rounded bg-[#F4F5F7] group-hover:bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#DFE1E6]">
                                                <CheckSquare className="w-3.5 h-3.5 text-[#006644]" />
                                            </div>
                                            <div className="flex-1 truncate">
                                                <span className="text-[13px] font-bold text-[#172B4D] block truncate">{t.taskTitle}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-[#172B4D] uppercase tracking-wider">{t.taskCode}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.statusColor || "#DFE1E6" }} />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-[#6B778C]">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-[12px] font-bold">We couldn't find anything matching "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}