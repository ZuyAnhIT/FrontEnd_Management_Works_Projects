'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, History, GripVertical, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  date: string
  messages: Message[]
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [position, setPosition] = useState({ x: -20, y: -20 }) // Right-bottom offset
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; initialLeft: number; initialTop: number } | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)

  // Chat logic
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn?', timestamp: new Date() }
  ])
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: 'h1', title: 'Hỏi về task #123', date: 'Hôm qua', messages: [] },
    { id: 'h2', title: 'Cách tạo column mới', date: '2 ngày trước', messages: [] }
  ])

  // Drag Logic (Xử lý kéo thả quanh viền)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current || !bubbleRef.current) return

      const deltaX = e.clientX - dragRef.current.startX
      const deltaY = e.clientY - dragRef.current.startY
      
      const newLeft = dragRef.current.initialLeft + deltaX
      const newTop = dragRef.current.initialTop + deltaY

      // Set tạm thời vị trí
      bubbleRef.current.style.left = `${newLeft}px`
      bubbleRef.current.style.top = `${newTop}px`
      bubbleRef.current.style.right = 'auto'
      bubbleRef.current.style.bottom = 'auto'
    }

    const handleMouseUp = () => {
      if (!isDragging || !bubbleRef.current) return
      setIsDragging(false)

      // Snap to edge logic (Kéo thả quanh viền)
      const rect = bubbleRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      const distLeft = rect.left
      const distRight = windowWidth - rect.right
      
      // Tìm cạnh gần nhất theo trục X
      if (distLeft < distRight) {
        bubbleRef.current.style.left = '20px'
        bubbleRef.current.style.right = 'auto'
      } else {
        bubbleRef.current.style.left = 'auto'
        bubbleRef.current.style.right = '20px'
      }

      // Clamp trục Y để không bay ra ngoài
      let newTop = rect.top
      if (newTop < 20) newTop = 20
      if (newTop > windowHeight - rect.height - 20) newTop = windowHeight - rect.height - 20
      
      bubbleRef.current.style.top = `${newTop}px`
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!bubbleRef.current) return
    const rect = bubbleRef.current.getBoundingClientRect()
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top
    }
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    
    // Fake bot reply
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        text: 'Tôi là AI demo. Tính năng này đang được phát triển.', 
        timestamp: new Date() 
      }])
    }, 1000)
  }

  return (
    <div
      ref={bubbleRef}
      className={`fixed z-50 flex flex-col items-end transition-all duration-300 ease-out ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ bottom: '20px', right: '20px' }} // Vị trí khởi tạo
    >
      {/* Chat Window */}
      <div 
        className={`
          bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 mb-4
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'w-[380px] h-[500px] opacity-100 scale-100' : 'w-0 h-0 opacity-0 scale-90'}
          flex
        `}
      >
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col w-full bg-white relative">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center cursor-move" onMouseDown={handleMouseDown}>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
               <span className="font-semibold text-sm">AI Support</span>
            </div>
            <div className="flex items-center gap-1">
               <button onClick={() => setShowHistory(!showHistory)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" title="History">
                 <History className="w-4 h-4" />
               </button>
               <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                 <Minimize2 className="w-4 h-4" />
               </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
             {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`
                   max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm
                   ${msg.role === 'user' 
                     ? 'bg-blue-600 text-white rounded-br-none' 
                     : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}
                 `}>
                   {msg.text}
                 </div>
               </div>
             ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <Button onClick={handleSend} size="icon" className="rounded-full w-9 h-9 bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* History Drawer (Overlay) */}
          <div className={`absolute inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 z-10 ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-white">History</span>
                <button onClick={() => setShowHistory(false)}><X className="w-4 h-4" /></button>
             </div>
             <div className="p-2 space-y-1">
                {sessions.map(s => (
                  <button key={s.id} className="w-full text-left p-3 rounded hover:bg-slate-800 transition-colors text-sm">
                    <div className="text-white font-medium truncate">{s.title}</div>
                    <div className="text-xs text-slate-500">{s.date}</div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Bubble Trigger Button */}
      {!isOpen && (
        <button
          onMouseDown={handleMouseDown}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 cursor-move group relative"
        >
          <MessageSquare className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          {/* Tooltip hint */}
          <div className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Drag me!
          </div>
        </button>
      )}
    </div>
  )
}