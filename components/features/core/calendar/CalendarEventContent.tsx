"use client";

import React from 'react';
import { Layers } from 'lucide-react';

// Nhận props từ FullCalendar
export default function CalendarEventContent(eventInfo: any) {
  const { event } = eventInfo;
  const props = event.extendedProps; // Dữ liệu custom từ API (type, status, assignee...)

  // --- RENDER 1: SPRINT (Dải sự kiện All-Day) ---
  if (props.type === 'SPRINT') {
    return (
      <div 
        className="w-full h-full flex items-center px-2 py-0.5 overflow-hidden rounded text-[11px] font-bold tracking-wide border-l-4 shadow-sm opacity-90 hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: event.backgroundColor, // Màu nền từ API (#f1f5f9)
          borderColor: event.borderColor,         // Màu viền (#94a3b8)
          color: event.textColor || '#333'
        }}
      >
        <Layers className="w-3 h-3 mr-1.5 opacity-60" />
        <span className="truncate uppercase">{event.title}</span>
      </div>
    );
  }

  // --- RENDER 2: TASK (Sự kiện thường) ---
  return (
    <div 
      className="flex flex-col justify-center px-1.5 py-1 w-full h-full overflow-hidden rounded-[3px] shadow-sm border-l-[3px] hover:brightness-95 transition-all cursor-pointer bg-opacity-15"
      style={{
        // FullCalendar tự xử lý màu nền, ta dùng style này để override nhẹ nếu cần
        backgroundColor: event.backgroundColor, 
        borderColor: event.borderColor,
        color: event.textColor
      }}
    >
      <div className="flex items-center justify-between gap-1.5">
        {/* Mã Task + Tiêu đề */}
        <div className="flex items-center gap-1 overflow-hidden">
           {/* Giả sử title là "ECOM-12 - Fix bug...", ta tách lấy mã ECOM-12 */}
           <span className="font-bold text-[10px] whitespace-nowrap opacity-90">
             {event.title.split(' - ')[0]}
           </span>
           <span className="text-[10px] truncate opacity-80">
             {event.title.split(' - ')[1] || event.title}
           </span>
        </div>
        
        {/* Avatar Assignee */}
        <div className="shrink-0">
            {props.assigneeAvatar ? (
              <img
                src={props.assigneeAvatar}
                alt={props.assigneeName}
                className="w-4 h-4 rounded-full border border-white shadow-sm"
                title={props.assigneeName}
              />
            ) : (
              // Fallback avatar nếu null
              <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[8px] font-bold border border-white/20">
                ?
              </div>
            )}
        </div>
      </div>
    </div>
  );
}