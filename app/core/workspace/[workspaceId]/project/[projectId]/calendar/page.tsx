"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Services & Hooks
import { getProjectCalendar, CalendarEvent, CalendarParams } from '@/services/apiStatistics';
import { getProjectMembers, ProjectMember } from '@/services/apiProject';
import { getProjectStatuses, RawStatusColumn } from "@/services/apiBoard"; 
import { getSprints, Sprint } from "@/services/apiSprint";
import { getEpics, Epic } from "@/services/apiEpic"; // ✅ Da sua loi import
import { updateTask } from "@/services/apiTask";
import { useAuth } from "@/context/AuthContext";
import { useProjectRole } from "@/hooks/useProjectRole";
import { useToast } from "@/components/ui/ToastProvider";

// UI Components & Modals
import CalendarFilterBar from '@/components/features/core/calendar/CalendarFilterBar';
import CalendarEventContent from '@/components/features/core/calendar/CalendarEventContent';
import SprintDetailModal from "@/components/features/core/sprint/SprintDetailModal";
import TaskDetailPanel from "@/components/features/core/task/TaskDetailPanel"; 
import TaskDetailModalFloating from "@/components/features/core/task/TaskDetailModalFloating";
import { Chatbot } from "@/components/chatbot/chatbot";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function ProjectCalendarPage() {
    
    // ---------------------------------------------------------------------------
    // 3. HOOKS, CONTEXT & PARAMS
    // ---------------------------------------------------------------------------
    
    const params = useParams();
    const { showToast } = useToast();
    const { activeCompany } = useAuth();
    
    const projectId = Number(params.projectId);
    const workspaceId = Number(params.workspaceId);
    const companyId = activeCompany?.companyId || 0;

    // Kiem tra quyen han nguoi dung trong du an
    const { isGuest } = useProjectRole(projectId);
    const calendarRef = useRef<FullCalendar>(null);

    // ---------------------------------------------------------------------------
    // 4. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    // Data States
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Metadata States (Dung cho Modal chi tiet)
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [epics, setEpics] = useState<Epic[]>([]);
    const [statuses, setStatuses] = useState<RawStatusColumn[]>([]);

    // UI & Navigation States
    const [viewMode, setViewMode] = useState<'panel' | 'floating'>('floating');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);

    const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
    const [currentTitle, setCurrentTitle] = useState("");
    const [currentView, setCurrentView] = useState("dayGridMonth");

    // Filter States
    const [filters, setFilters] = useState({
        keyword: '',
        assigneeId: '',
        priority: '',
        taskType: '',
        showSprints: true,
        from: '', 
        to: ''
    });

    // ---------------------------------------------------------------------------
    // 5. DATA FETCHING (Handlers)
    // ---------------------------------------------------------------------------

    /**
     * Tai danh sach du lieu nen (Metadata) cua du an
     */
    const fetchMetadata = useCallback(async () => {
        if (!projectId || !workspaceId || !companyId) return;

        try {
            const [membersRes, sprintsRes, epicsRes, statusesRes] = await Promise.all([
                getProjectMembers(companyId, workspaceId, projectId, { size: 100 }),
                getSprints(projectId),
                getEpics(projectId),
                getProjectStatuses(projectId)
            ]);

            setMembers(membersRes.content || []);
            setSprints(sprintsRes || []);
            setEpics(epicsRes || []);
            setStatuses(statusesRes || []);
        } catch (err: any) {
            console.error("[Calendar] Metadata fetch error:", err.message);
        }
    }, [companyId, workspaceId, projectId]);

    /**
     * Tai danh sach cac su kien lich dua tren khoang thoi gian va bo loc
     */
    const fetchCalendarEvents = useCallback(async () => {
        if (!projectId || !dateRange) return;
        
        setIsLoading(true);
        try {
            const apiParams: CalendarParams = {
                from: filters.from || dateRange.from,
                to: filters.to || dateRange.to,
                keyword: filters.keyword || undefined,
                assigneeId: filters.assigneeId ? Number(filters.assigneeId) : undefined,
                priority: filters.priority || undefined,
                taskType: filters.taskType || undefined,
                showSprints: filters.showSprints,
            };
            const data = await getProjectCalendar(projectId, apiParams);
            setEvents(data);
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to sync calendar events", "error");
        } finally {
            setIsLoading(false);
        }
    }, [projectId, dateRange, filters, showToast]);

    // Side effects cho viec tai du lieu
    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    useEffect(() => {
        const timer = setTimeout(() => fetchCalendarEvents(), 300);
        return () => clearTimeout(timer);
    }, [fetchCalendarEvents]);

    // ---------------------------------------------------------------------------
    // 6. EVENT HANDLERS (Business Logic)
    // ---------------------------------------------------------------------------

    const handleFilterUpdate = (key: keyof typeof filters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    /**
     * Cap nhat khoang thoi gian khi nguoi dung dieu huong lich
     */
    const handleDatesUpdate = (dateInfo: any) => {
        setDateRange({
            from: dateInfo.startStr.split('T')[0],
            to: dateInfo.endStr.split('T')[0],
        });
        setCurrentTitle(dateInfo.view.title);
    };

    const handleCalendarNavigation = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        if (action === 'PREV') api.prev();
        if (action === 'NEXT') api.next();
        if (action === 'TODAY') api.today();
    };

    const handleViewTypeChange = (view: string) => {
        const api = calendarRef.current?.getApi();
        if (api) {
            api.changeView(view);
            setCurrentView(view);
        }
    };

    /**
     * Mo modal chi tiet khi click vao su kien
     */
    const handleEventSelection = (info: any) => {
        const { type, originalId } = info.event.extendedProps;
        
        if (type === 'SPRINT') {
            setSelectedSprintId(originalId);
        } else if (type === 'TASK') {
            setSelectedTaskId(originalId); 
            setIsTaskModalOpen(true); 
        }
    };

    /**
     * Xu ly cap nhat thoi gian khi keo tha su kien (Drag & Drop)
     */
    const handleEventMovement = async (info: any) => {
        if (isGuest) {
            info.revert();
            return;
        }

        const { type, originalId } = info.event.extendedProps;
        if (type === 'TASK') {
            const newStart = info.event.start?.toISOString();
            const newEnd = info.event.end?.toISOString() || newStart; 
            try {
                await updateTask(originalId, { startDate: newStart, dueDate: newEnd });
                showToast("Schedule updated successfully", "success");
            } catch (err: any) {
                info.revert();
                showToast(err.message || "Failed to update schedule", "error");
            }
        } else {
            info.revert();
        }
    };

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    if (!projectId) return null;

    const taskDetailProps = {
        taskId: selectedTaskId || 0,
        companyId,
        workspaceId,
        projectId,
        members,
        statuses,
        sprints,
        epics,
        readOnly: isGuest,
        onUpdate: fetchCalendarEvents,
        onClose: () => { setIsTaskModalOpen(false); setSelectedTaskId(null); }
    };

    return (
        <div className="flex flex-col h-screen bg-[#F4F5F7] overflow-hidden relative font-sans text-[#172B4D]">
            
            {/* HEADER & FILTER SECTION */}
            <header className="bg-white border-b border-[#DFE1E6] shrink-0 z-10 shadow-sm">
                <div className="px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-black uppercase tracking-tight text-[#172B4D]">Project Calendar</h1>
                    {isLoading && (
                        <div className="flex items-center gap-2 text-[11px] font-black text-[#0052CC] bg-[#DEEBFF] px-3 py-1 rounded-lg animate-pulse">
                            <Loader2 className="w-3.5 h-3.5 animate-spin"/> Syncing Roadmap...
                        </div>
                    )}
                </div>
                <div className="px-5 pb-4">
                    <CalendarFilterBar 
                        filters={filters} 
                        onFilterChange={handleFilterUpdate}
                        viewMode={currentView}
                        onViewChange={handleViewTypeChange}
                        onNavigate={handleCalendarNavigation}
                        titleDate={currentTitle}
                        members={members} 
                    />
                </div>
            </header>

            {/* CALENDAR MAIN BODY */}
            <main className="flex-1 p-4 sm:p-6 overflow-hidden animate-in fade-in duration-500">
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-[#DFE1E6] h-full relative overflow-hidden">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={false} 
                        events={events}
                        datesSet={handleDatesUpdate}
                        eventContent={CalendarEventContent}
                        eventClick={handleEventSelection}
                        
                        // Permissions Control
                        editable={!isGuest}      
                        selectable={!isGuest}    
                        droppable={!isGuest} 
                        eventDrop={handleEventMovement}
                        eventResize={handleEventMovement}

                        height="100%"
                        dayMaxEvents={4}
                        firstDay={1}
                        fixedWeekCount={false}
                        nowIndicator={true}
                        eventClassNames="cursor-pointer transition-transform active:scale-[0.98]"
                    />
                </div>
            </main>

            {/* MODALS REGISTRATION */}

            {/* Sprint Details */}
            {selectedSprintId && (
                <SprintDetailModal 
                    projectId={projectId}
                    sprintId={selectedSprintId}
                    onClose={() => setSelectedSprintId(null)}
                    onUpdate={fetchCalendarEvents} 
                    readOnly={isGuest}
                />
            )}
            
            {/* Task Details (Toggle between Panel and Floating) */}
            {isTaskModalOpen && selectedTaskId && (
                viewMode === 'panel' ? (
                    <TaskDetailPanel
                        {...taskDetailProps}
                        onSwitchToFloating={() => setViewMode('floating')} 
                    />
                ) : (
                    <TaskDetailModalFloating
                        {...taskDetailProps}
                        isOpen={true}
                        onSwitchToPanel={() => setViewMode('panel')} 
                    />
                )
            )}

            <Chatbot />
        </div>
    );
}