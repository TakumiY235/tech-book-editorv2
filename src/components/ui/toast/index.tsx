import { useContext } from "react"
import { ToastContext } from "./toast-provider"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  const toast = (props: Omit<Toast, "id">) => {
    context.addToast(props)
  }

  return { toast }
}

export { ToastProvider } from "./toast-provider"