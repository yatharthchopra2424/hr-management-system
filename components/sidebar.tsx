"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, BookOpen, Calendar, Target, LogOut, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/client"
import { useRouter } from "next/navigation"

const navigation = [
  {
    name: "Dashboard",
    href: "/hr/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Employees",
    href: "/hr/employees",
    icon: Users,
  },
  {
    name: "Training Plans",
    href: "/hr/training",
    icon: BookOpen,
  },
  {
    name: "Attendance",
    href: "/hr/attendance",
    icon: Calendar,
  },
  {
    name: "Skills Matrix",
    href: "/hr/skills",
    icon: Target,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-blue-600">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">HR System</h1>
            <p className="text-xs text-blue-200">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white",
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-blue-200")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-blue-100 hover:bg-blue-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
