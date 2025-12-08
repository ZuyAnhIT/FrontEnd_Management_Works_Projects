"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Services
import { getProjectCalendar, CalendarEvent, CalendarParams } from '@/services/apiStatistics';
import { getProjectMembers, ProjectMember } from '@/services/apiProject';
import { getProjectStatuses, RawStatusColumn } from "@/services/apiBoard"; 
import { getSprints, Sprint } from "@/services/apiSprint";
import { apiEpic, Epic } from "@/services/apiEpic";

// Components
import CalendarFilterBar from '@/components/features/core/calendar/CalendarFilterBar';
import CalendarEventContent from '@/components/features/core/calendar/CalendarEventContent';
import { useToast } from "@/components/ui/ToastProvider";

// Modals
import SprintDetailModal from "@/components/features/core/sprint/SprintDetailModal";
import TaskDetailPanel from "@/components/features/core/task/TaskDetailPanel"; // ✅ Import Task Panel

export default function ProjectCalendarPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const workspaceId = Number(params.workspaceId);
  const companyId = Number(params.companyId) || 1; 
  const { showToast } = useToast();

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Data State cho Task Modal
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [statuses, setStatuses] = useState<RawStatusColumn[]>([]);

  // Calendar State
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentView, setCurrentView] = useState("dayGridMonth");

  // Selection State
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null); // ✅ State Task

  const [filters, setFilters] = useState({
    keyword: '',
    assigneeId: '',
    priority: '',
    taskType: '',
    showSprints: true,
    from: '', 
    to: ''
  });

  const calendarRef = useRef<FullCalendar>(null);

  // --- API HANDLERS ---
  
  // 1. Fetch All Project Data (Members, Sprints, Epics, Statuses)
  // Gom lại gọi 1 lần khi load trang để tối ưu
  useEffect(() => {
    if (!projectId || !workspaceId) return;

    const fetchAllData = async () => {
      try {
        const [membersRes, sprintsRes, epicsRes, statusesRes] = await Promise.all([
            getProjectMembers(companyId, workspaceId, projectId, { size: 100 }),
            getSprints(projectId),
            apiEpic.getEpics(projectId),
            getProjectStatuses(projectId)
        ]);

        setMembers(membersRes.content || []);
        setSprints(sprintsRes || []);
        setEpics(epicsRes || []);
        setStatuses(statusesRes || []);

      } catch (err) {
        console.error("Failed to fetch project meta data", err);
      }
    };

    fetchAllData();
  }, [companyId, workspaceId, projectId]);

  // 2. Fetch Events
  const fetchEvents = useCallback(async () => {
    if (!projectId || !dateRange) return;
    setLoading(true);
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
    } catch (error) {
        showToast("Failed to load calendar events", "error");
    } finally {
        setLoading(false);
    }
  }, [projectId, dateRange, filters]);

  useEffect(() => {
    const t = setTimeout(() => fetchEvents(), 300);
    return () => clearTimeout(t);
  }, [fetchEvents]);

  // --- UI HANDLERS ---

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDatesSet = (dateInfo: any) => {
    setDateRange({
      from: dateInfo.startStr.split('T')[0],
      to: dateInfo.endStr.split('T')[0],
    });
    setCurrentTitle(dateInfo.view.title);
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    if (action === 'PREV') calendarApi.prev();
    if (action === 'NEXT') calendarApi.next();
    if (action === 'TODAY') calendarApi.today();
  };

  const handleViewChange = (view: string) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
        calendarApi.changeView(view);
        setCurrentView(view);
    }
  };

  // ✅ CLICK EVENT: Mở Modal tương ứng
  const handleEventClick = (info: any) => {
    const props = info.event.extendedProps;
    
    if (props.type === 'SPRINT') {
        setSelectedSprintId(props.originalId);
    } else if (props.type === 'TASK') {
        setSelectedTaskId(props.originalId); // ✅ Set Task ID
    }
  };

  if (!projectId) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      
      {/* HEADER & FILTER */}
      <div className="bg-white border-b border-slate-200 shrink-0 z-10 shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Project Calendar</h1>
            {loading && (
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin"/> Syncing...
                </div>
            )}
        </div>
        <div className="px-4 pb-3">
            <CalendarFilterBar 
                filters={filters} 
                onFilterChange={handleFilterChange}
                viewMode={currentView}
                onViewChange={handleViewChange}
                onNavigate={handleNavigate}
                titleDate={currentTitle}
                members={members} 
            />
        </div>
      </div>

      {/* CALENDAR BODY */}
      <div className="flex-1 p-4 sm:p-6 overflow-hidden">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 h-full relative">
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={false} 
                events={events}
                datesSet={handleDatesSet}
                eventContent={CalendarEventContent}
                eventClick={handleEventClick}
                editable={false}
                selectable={true}
                height="100%"
                dayMaxEvents={4}
                firstDay={1}
                fixedWeekCount={false}
                nowIndicator={true}
                eventClassNames="focus:outline-none"
            />
        </div>
      </div>

      {/* MODAL: SPRINT DETAIL */}
      {selectedSprintId && (
          <SprintDetailModal 
              projectId={projectId}
              sprintId={selectedSprintId}
              onClose={() => setSelectedSprintId(null)}
              onUpdate={fetchEvents} 
          />
      )}

      {/* ✅ MODAL: TASK DETAIL */}
      {selectedTaskId && (
          <TaskDetailPanel 
              taskId={selectedTaskId}
              onClose={() => setSelectedTaskId(null)}
              onUpdate={fetchEvents} // Reload lịch khi task thay đổi
              companyId={companyId}
              workspaceId={workspaceId}
              projectId={projectId}
              members={members}
              sprints={sprints}
              epics={epics}
              statuses={statuses}
          />
      )}
    </div>
  );
}