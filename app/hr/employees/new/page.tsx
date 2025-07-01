import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { redirect } from "next/navigation"
import CreateEmployeeForm from "@/components/create-employee-form"
import Link from "next/link"
import { ArrowLeft, Building2, Activity, Users, BookOpen, Calendar, Target } from "lucide-react"

export default async function NewEmployeePage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "hr") {
    redirect("/employee/dashboard")
  }

  const supabase = createServerClient()

  // Get departments and levels for the form
  const [{ data: departments }, { data: levels }] = await Promise.all([
    supabase.from("departments").select("*").order("name"),
    supabase.from("levels").select("*").order("order_index"),
  ])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg">HR System</h1>
              <p className="text-blue-200 text-sm">Management Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <div className="space-y-2">
            <Link
              href="/hr/dashboard"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Activity className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/hr/employees"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-700 text-white"
            >
              <Users className="h-5 w-5" />
              <span>Employees</span>
            </Link>
            <Link
              href="/hr/training"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span>Training Plans</span>
            </Link>
            <Link
              href="/hr/attendance"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span>Attendance</span>
            </Link>
            <Link
              href="/hr/skills"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Target className="h-5 w-5" />
              <span>Skills Matrix</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-blue-500">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center space-x-2 text-blue-200 hover:text-white transition-colors"
            >
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/hr/employees"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Employees</span>
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <CreateEmployeeForm departments={departments || []} levels={levels || []} />
        </main>
      </div>
    </div>
  )
}
