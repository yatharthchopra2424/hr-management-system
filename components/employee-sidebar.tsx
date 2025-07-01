"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, User, BookOpen, Calendar, Target, LogOut, Building2, Award, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/client"
import { useRouter } from "next/navigation"

const navigation = [
  {
    name: "Dashboard",
    href: "/employee/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Profile",
    href: "/employee/profile",
    icon: User,
  },
  {
    name: "Training & Courses",
    href: "/employee/training",
    icon: BookOpen,
  },
  {
    name: "Assessments",
    href: "/employee/assessments",
    icon: Award,
  },
  {
    name: "Attendance",
    href: "/employee/attendance",
    icon: Clock,
  },
  {
    name: "My Schedule",
    href: "/employee/schedule",
    icon: Calendar,
  },
  {
    name: "Skills & Goals",
    href: "/employee/skills",
    icon: Target,
  },
]

export function EmployeeSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-indigo-600">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Building2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Employee Portal</h1>
            <p className="text-xs text-indigo-200">My Workspace</p>
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
                isActive ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-indigo-200")} />
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
          className="w-full justify-start text-indigo-100 hover:bg-indigo-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
