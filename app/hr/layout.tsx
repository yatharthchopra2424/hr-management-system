import type React from "react"
import { Sidebar } from "@/components/sidebar"

export default function HRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      {children}
    </div>
  )
}
