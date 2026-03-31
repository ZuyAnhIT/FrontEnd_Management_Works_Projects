"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo } from 'react';
import { Layers, User } from 'lucide-react';
import { EventContentArg } from '@fullcalendar/core';

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

/**
 * Định dạng dữ liệu mở rộng được truyền vào thông qua FullCalendar Event
 */
interface CustomEventProps {
  type?: 'SPRINT' | 'TASK' | 'BUG' | 'STORY';
  status?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
}

// =============================================================================
// 3. SUB-COMPONENTS
// =============================================================================

/**
 * Thành phần hiển thị sự kiện dạng Sprint (Thường kéo dài qua nhiều ngày).
 * Thiết kế theo dạng khối nền ngang (Block) để dễ nhận diện tiến độ.
 */
const SprintEventView = ({ event }: { event: EventContentArg['event'] }) => {
  return (
    <div 
      className={cn(
        "w-full h-full flex items-center px-2 py-0.5 overflow-hidden rounded-md border-l-[3px]",
        "opacity-90 hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
      )}
      style={{
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        color: event.textColor || '#172B4D' // Mặc định dùng màu text chuẩn Jira
      }}
    >
      <Layers className="w-3.5 h-3.5 mr-1.5 opacity-70 shrink-0" />
      <span className="truncate text-[10px] font-bold uppercase tracking-widest">
        {event.title}
      </span>
    </div>
  );
};

/**
 * Thành phần hiển thị sự kiện dạng Task (Thường nằm gọn trong 1 ngày).
 * Thiết kế dạng thẻ mini (Mini Card) hiển thị mã công việc, tên và người thực hiện.
 */
const TaskEventView = ({ 
  event, 
  props 
}: { 
  event: EventContentArg['event']; 
  props: CustomEventProps 
}) => {
  
  // Trích xuất mã công việc và tiêu đề từ chuỗi định dạng mặc định của FullCalendar
  const { taskCode, taskName } = useMemo(() => {
    const separatorIndex = event.title.indexOf(' - ');
    if (separatorIndex > -1) {
      return {
        taskCode: event.title.substring(0, separatorIndex),
        taskName: event.title.substring(separatorIndex + 3)
      };
    }
    return { taskCode: event.title, taskName: "" };
  }, [event.title]);

  return (
    <div 
      className={cn(
        "flex flex-col justify-center px-1.5 py-1 w-full h-full overflow-hidden rounded-[3px]",
        "border-l-[3px] shadow-sm bg-opacity-20 hover:brightness-95 transition-all cursor-pointer"
      )}
      style={{
        backgroundColor: event.backgroundColor, 
        borderColor: event.borderColor,
        color: event.textColor || '#172B4D'
      }}
    >
      <div className="flex items-center justify-between gap-1.5">
        
        {/* Thông tin định danh công việc (Identity) */}
        <div className="flex items-center gap-1.5 overflow-hidden">
           <span className="font-bold text-[9px] uppercase tracking-widest whitespace-nowrap opacity-80">
             {taskCode}
           </span>
           
           {taskName && (
             <span className="text-[11px] font-medium truncate leading-tight">
               {taskName}
             </span>
           )}
        </div>
        
        {/* Hình đại diện người thực hiện (Assignee Avatar) */}
        <div className="shrink-0 ml-1 flex items-center justify-center">
            {props.assigneeAvatar ? (
              <img
                src={props.assigneeAvatar}
                alt={props.assigneeName || "Assignee"}
                className="w-4 h-4 rounded-full border border-white/50 shadow-sm object-cover"
                title={props.assigneeName}
              />
            ) : (
              <div 
                className="w-4 h-4 rounded-full bg-white/40 flex items-center justify-center border border-white/50"
                title="Unassigned"
              >
                <User className="w-2.5 h-2.5 opacity-70" style={{ color: event.textColor || '#172B4D' }} />
              </div>
            )}
        </div>

      </div>
    </div>
  );
};

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Bộ điều phối nội dung (Content Injector) cho thư viện FullCalendar.
 * Tự động phân luồng hiển thị giao diện tùy thuộc vào loại sự kiện (Sprint hay Task).
 */
export default function CalendarEventContent(eventInfo: EventContentArg) {
  const { event } = eventInfo;
  const props = event.extendedProps as CustomEventProps;

  // Phân luồng hiển thị dựa trên Metadata
  if (props.type === 'SPRINT') {
    return <SprintEventView event={event} />;
  }

  // Mặc định hiển thị dạng Task Card nhỏ
  return <TaskEventView event={event} props={props} />;
}