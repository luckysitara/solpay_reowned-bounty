import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import {
  Toast,
  ToastProps,
  ToastActionElement,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

type Notification = {
  id: string
  title: string
  description: string
  type: "success" | "error" | "info"
}

type NotificationContextType = {
  showNotification: (notification: Omit<Notification, "id">) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()

  const showNotification = useCallback(
    ({ title, description, type }: Omit<Notification, "id">) => {
      toast({
        title,
        description,
        variant: type === "error" ? "destructive" : undefined,
      })
    },
    [toast],
  )

  return <NotificationContext.Provider value={{ showNotification }}>{children}</NotificationContext.Provider>
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

