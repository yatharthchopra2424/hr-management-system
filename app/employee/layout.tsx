import type React from "react"
import { EmployeeSidebar } from "@/components/employee-sidebar"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <EmployeeSidebar />
      {children}
    </div>
  )
}
