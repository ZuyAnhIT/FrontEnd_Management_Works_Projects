"use client"

import { useState, useCallback, useEffect, useRef } from "react"

interface ResizableSplitViewProps {
  left: React.ReactNode
  right: React.ReactNode
  isRightOpen: boolean
  onCloseRight: () => void
  minLeftWidth?: number
  minRightWidth?: number
  defaultRightWidth?: number
}

export default function ResizableSplitView({
  left,
  right,
  isRightOpen,
  onCloseRight,
  minLeftWidth = 400,
  minRightWidth = 400,
  defaultRightWidth = 600,
}: ResizableSplitViewProps) {
  const [rightWidth, setRightWidth] = useState(defaultRightWidth)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const startResizing = useCallback(() => {
    setIsResizing(true)
    // Vô hiệu hóa select text khi đang kéo để trải nghiệm mượt mà
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        // Tính toán chiều rộng mới của panel phải
        // (right = container.right - mouse.x)
        const newRightWidth = containerRect.right - e.clientX

        // Giới hạn chiều rộng (không quá nhỏ, và không lấn hết panel trái)
        if (newRightWidth >= minRightWidth && (containerRect.width - newRightWidth) >= minLeftWidth) {
          setRightWidth(newRightWidth)
        }
      }
    },
    [isResizing, minLeftWidth, minRightWidth]
  )

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize)
      window.addEventListener("mouseup", stopResizing)
    }
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [isResizing, resize, stopResizing])

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden relative bg-slate-50">
      {/* Left Panel (List) */}
      <div 
        className="flex-1 overflow-hidden flex flex-col h-full min-w-0"
      >
        {left}
      </div>

      {/* Right Panel (Detail) */}
      {isRightOpen && (
        <>
          {/* Resizer Handle */}
          <div
            className={`
                w-1 hover:w-1.5 cursor-col-resize z-50 transition-all delay-75
                flex items-center justify-center
                ${isResizing ? 'bg-blue-500 w-1.5' : 'bg-slate-200 hover:bg-blue-400'}
            `}
            onMouseDown={startResizing}
          >
             {/* Optional: Grip indicator */}
             {/* <div className="h-8 w-0.5 bg-slate-400 rounded-full opacity-0 hover:opacity-100 transition-opacity" /> */}
          </div>
          
          {/* Panel Container */}
          <div
            style={{ width: rightWidth }}
            className="h-full bg-white shadow-2xl z-40 flex flex-col overflow-hidden shrink-0"
          >
             {right}
          </div>
        </>
      )}
    </div>
  )
}