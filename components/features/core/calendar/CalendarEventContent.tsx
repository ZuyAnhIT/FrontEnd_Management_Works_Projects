"use client";

import React from 'react';
import { Layers } from 'lucide-react';
import { EventContentArg } from '@fullcalendar/core';

// =============================================================================
// 1. INTERFACES
// =============================================================================

// Định nghĩa cấu trúc dữ liệu mở rộng (extendedProps) từ API
interface CustomEventProps {
  type?: 'SPRINT' | 'TASK' | 'BUG' | 'STORY';
  status?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
}

// =============================================================================
// 2. SUB-COMPONENTS
// =============================================================================

/**
 * Render giao diện cho SPRINT (Thường là sự kiện kéo dài nhiều ngày)
 */
const SprintEventView = ({ event }: { event: EventContentArg['event'] }) => {
  return (
    <div 
      className="w-full h-full flex items-center px-2 py-0.5 overflow-hidden rounded text-[11px] font-bold tracking-wide border-l-4 shadow-sm opacity-90 hover:opacity-100 transition-opacity"
      style={{
        backgroundColor: event.backgroundColor, // Màu nền từ API
        borderColor: event.borderColor,         // Màu viền
        color: event.textColor || '#333'
      }}
    >
      <Layers className="w-3 h-3 mr-1.5 opacity-60 shrink-0" />
      <span className="truncate uppercase">{event.title}</span>
    </div>
  );
};

/**
 * Render giao diện cho TASK (Sự kiện hàng ngày)
 */
const TaskEventView = ({ event, props }: { event: EventContentArg['event']; props: CustomEventProps }) => {
  
  // Xử lý tách chuỗi an toàn: "CODE-123 - Title" -> Code: "CODE-123", Name: "Title"
  const separatorIndex = event.title.indexOf(' - ');
  const taskCode = separatorIndex > -1 ? event.title.substring(0, separatorIndex) : event.title;
  const taskName = separatorIndex > -1 ? event.title.substring(separatorIndex + 3) : '';

  return (
    <div 
      className="flex flex-col justify-center px-1.5 py-1 w-full h-full overflow-hidden rounded-[3px] shadow-sm border-l-[3px] hover:brightness-95 transition-all cursor-pointer bg-opacity-15"
      style={{
        backgroundColor: event.backgroundColor, 
        borderColor: event.borderColor,
        color: event.textColor
      }}
    >
      <div className="flex items-center justify-between gap-1.5">
        
        {/* Left: Task Code & Title */}
        <div className="flex items-center gap-1 overflow-hidden">
           {/* Mã Task (In đậm) */}
           <span className="font-bold text-[10px] whitespace-nowrap opacity-90">
             {taskCode}
           </span>
           
           {/* Tên Task (Nếu có) */}
           {taskName && (
             <span className="text-[10px] truncate opacity-80">
               {taskName}
             </span>
           )}
        </div>
        
        {/* Right: Assignee Avatar */}
        <div className="shrink-0">
            {props.assigneeAvatar ? (
              <img
                src={props.assigneeAvatar}
                alt={props.assigneeName || "Assignee"}
                className="w-4 h-4 rounded-full border border-white shadow-sm object-cover"
                title={props.assigneeName}
              />
            ) : (
              // Fallback khi không có avatar
              <div 
                className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[8px] font-bold border border-white/20"
                title="Unassigned"
              >
                ?
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function CalendarEventContent(eventInfo: EventContentArg) {
  const { event } = eventInfo;
  // Ép kiểu extendedProps về Interface đã định nghĩa
  const props = event.extendedProps as CustomEventProps;

  // --- CASE 1: SPRINT ---
  if (props.type === 'SPRINT') {
    return <SprintEventView event={event} />;
  }

  // --- CASE 2: TASK (Default) ---
  return <TaskEventView event={event} props={props} />;
}