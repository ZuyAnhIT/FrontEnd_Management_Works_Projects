"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react"
import clsx from "clsx" // Giữ nguyên clsx hoặc chuyển thành cn nếu bạn có sẵn

// =============================================================================
// 1. INTERFACES & CONTEXT
// =============================================================================

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// =============================================================================
// 2. TOAST PROVIDER
// =============================================================================

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([])

    // Logic: Xóa toast khỏi state
    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    // Logic: Thêm toast vào state và tự động xóa sau duration
    const showToast = useCallback(
        (message: string, type: ToastType = "info", duration = 4000) => {
            const id = crypto.randomUUID()
            setToasts((prev) => [...prev, { id, message, type }])

            setTimeout(() => {
                removeToast(id)
            }, duration)
        },
        [removeToast]
    )

    // Cấu hình icon và màu sắc theo style Minimalist
    const getToastStyles = (type: ToastType) => {
        switch (type) {
            case "success":
                return {
                    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
                    borderClass: "border-l-green-500",
                    bgIconClass: "bg-green-50",
                    title: "Success"
                }
            case "error":
                return {
                    icon: <XCircle className="w-5 h-5 text-red-600" />,
                    borderClass: "border-l-red-500",
                    bgIconClass: "bg-red-50",
                    title: "Error"
                }
            case "warning":
                return {
                    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
                    borderClass: "border-l-amber-500",
                    bgIconClass: "bg-amber-50",
                    title: "Warning"
                }
            default: // info
                return {
                    icon: <Info className="w-5 h-5 text-blue-600" />,
                    borderClass: "border-l-blue-500",
                    bgIconClass: "bg-blue-50",
                    title: "Info"
                }
        }
    }

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}

            {/* Toast Container */}
            {/* Vị trí cố định, lớp z-index cao */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => {
                    const style = getToastStyles(toast.type)
                    
                    return (
                        <div
                            key={toast.id}
                            className={clsx(
                                // Base styles: shadow, rounded, border-l-4
                                "pointer-events-auto relative flex items-start gap-3 p-4 rounded-lg shadow-lg bg-white border border-slate-100",
                                "animate-in slide-in-from-right-full duration-300", // Animation mượt mà
                                "border-l-[4px]", // Viền trái màu để nhận diện nhanh
                                style.borderClass
                            )}
                        >
                            {/* Icon Wrapper */}
                            <div className={clsx("p-1 rounded-full shrink-0", style.bgIconClass)}>
                                {style.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-0.5">
                                {/* Tiêu đề Toast */}
                                <p className="text-sm font-medium text-slate-800 leading-tight">
                                    {style.title}
                                </p>
                                {/* Message */}
                                <p className="text-sm text-slate-500 mt-1 leading-snug">
                                    {toast.message}
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded transition-colors"
                                title="Close Notification"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </ToastContext.Provider>
    )
}

// =============================================================================
// 3. USE HOOK
// =============================================================================

export const useToast = () => {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("useToast must be used within a ToastProvider")
    return ctx
}