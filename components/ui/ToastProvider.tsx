"use client"


import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import clsx from "clsx"


type ToastType = "success" | "error" | "warning" | "info"


interface Toast {
  id: string
  message: string
  type: ToastType
}


interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}


const ToastContext = createContext<ToastContextType | undefined>(undefined)


export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])


  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = crypto.randomUUID() // 🔥 Fix: unique key 100%


      setToasts((prev) => [...prev, { id, message, type }])


      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    },
    []
  )


  const iconForType = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-white/90" />
      case "error":
        return <XCircle className="w-5 h-5 text-white/90" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-white/90" />
      default:
        return <Info className="w-5 h-5 text-white/90" />
    }
  }


  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}


      {/* Toast Container */}
      <div className="fixed top-6 right-6 flex flex-col gap-3 z-[9999] items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium animate-fadeDown backdrop-blur-md",
              toast.type === "success" &&
                "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-green-400/50",
              toast.type === "error" &&
                "bg-gradient-to-r from-rose-500 to-red-500 text-white border-red-400/50",
              toast.type === "warning" &&
                "bg-gradient-to-r from-amber-400 to-orange-500 text-black border-yellow-300/50",
              toast.type === "info" &&
                "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400/50"
            )}
          >
            {iconForType(toast.type)}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}


export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}



