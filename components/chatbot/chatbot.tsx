'use client'

import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { MessageSquare, X, Send, History, Minimize2, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sendChatMessage, uploadChatFile } from '@/services/apiChat'

interface Message {
  id: string
  role: 'user' | 'bot' | 'system'
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
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; initialLeft: number; initialTop: number } | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState<string>('')

  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'bot', text: 'Chao ban! Toi co the giup gi hom nay?', timestamp: new Date() }
  ])
  const [sessions] = useState<ChatSession[]>([
    { id: 'h1', title: 'Phien mac dinh', date: 'Hom nay', messages: [] }
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('chat_session_id')
    if (stored) {
      setThreadId(stored)
    } else {
      const newId = uuidv4()
      localStorage.setItem('chat_session_id', newId)
      setThreadId(newId)
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current || !bubbleRef.current) return
      const deltaX = e.clientX - dragRef.current.startX
      const deltaY = e.clientY - dragRef.current.startY
      const newLeft = dragRef.current.initialLeft + deltaX
      const newTop = dragRef.current.initialTop + deltaY

      bubbleRef.current.style.left = `${newLeft}px`
      bubbleRef.current.style.top = `${newTop}px`
      bubbleRef.current.style.right = 'auto'
      bubbleRef.current.style.bottom = 'auto'
    }

    const handleMouseUp = () => {
      if (!isDragging || !bubbleRef.current) return
      setIsDragging(false)

      const rect = bubbleRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const distLeft = rect.left
      const distRight = windowWidth - rect.right

      if (distLeft < distRight) {
        bubbleRef.current.style.left = '20px'
        bubbleRef.current.style.right = 'auto'
      } else {
        bubbleRef.current.style.left = 'auto'
        bubbleRef.current.style.right = '20px'
      }

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

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return
    const now = new Date()
    const optimisticText = selectedFile ? `File: ${selectedFile.name}${input ? `\n${input}` : ''}` : input

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: optimisticText, timestamp: now }
    setMessages(prev => [...prev, userMsg])

    const currentFile = selectedFile
    const currentInput = input
    setInput('')
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setLoading(true)

    try {
      const safeThreadId = threadId || 'default_session'
      const payload = { message: currentInput, thread_id: safeThreadId }
      if (!threadId) setThreadId(safeThreadId)

      const data = currentFile
        ? await uploadChatFile(payload, currentFile)
        : await sendChatMessage(payload)

      const normalizeText = (val: unknown) => {
        if (typeof val === 'string') return val
        if (val && typeof val === 'object') {
          const maybeText = (val as { text?: unknown }).text
          if (typeof maybeText === 'string') return maybeText
          try {
            return JSON.stringify(val)
          } catch {
            return 'Unsupported response'
          }
        }
        if (val === null || val === undefined) return 'No response'
        return String(val)
      }

      const botText = normalizeText(data?.response ?? data?.detail ?? data?.message ?? 'No response')
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: botText, timestamp: new Date() }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error(err)
      const errText = err instanceof Error ? err.message : 'Connection error'
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 2).toString(), role: 'system', text: errText, timestamp: new Date() }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={bubbleRef}
      className={`fixed z-50 flex flex-col items-end transition-all duration-300 ease-out ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ bottom: '20px', right: '20px' }}
    >
      <div
        className={`
          bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 mb-4
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'w-[380px] h-[520px] opacity-100 scale-100' : 'w-0 h-0 opacity-0 scale-90'}
          flex
        `}
      >
        <div className="flex-1 flex flex-col w-full bg-white relative">
          <div
            className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center cursor-move"
            onMouseDown={handleMouseDown}
          >
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`
                   max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap
                   ${msg.role === 'user' 
                     ? 'bg-blue-600 text-white rounded-br-none' 
                     : msg.role === 'system'
                       ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-none'
                       : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}
                 `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-500">Sending...</div>}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 space-y-2">
            {selectedFile && (
              <div className="flex items-center justify-between text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded">
                <span className="truncate">File: {selectedFile.name}</span>
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0])
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                title="Attach Excel file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={selectedFile ? 'Add note for the file...' : 'Type your request...'}
                className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="rounded-full w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
                disabled={loading || (!input.trim() && !selectedFile)}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

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
          <div className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Drag me!
          </div>
        </button>
      )}
    </div>
  )
}
