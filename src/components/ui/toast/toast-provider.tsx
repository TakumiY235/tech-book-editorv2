'use client';

import * as React from "react"
import { createContext, useContext, useState } from "react"
import { ToastProvider as RadixToastProvider } from '@radix-ui/react-toast';

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <RadixToastProvider>
      <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
        {children}
        <ToastContainer />
      </ToastContext.Provider>
    </RadixToastProvider>
  )
}

function ToastContainer() {
  const context = useContext(ToastContext)
  if (!context) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {context.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[300px] rounded-lg border bg-background p-4 shadow-lg ${
            toast.variant === "destructive" ? "border-destructive" : ""
          }`}
          role="alert"
        >
          {toast.title && (
            <div className="mb-1 font-medium">{toast.title}</div>
          )}
          {toast.description && (
            <div className="text-sm text-muted-foreground">
              {toast.description}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}