import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Building2, UserPlus, Calendar, BookOpen, Target, TrendingUp, Clock } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HRDashboard() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "hr") {
    redirect("/employee/dashboard")
  }

  const supabase = createServerClient()

  // Get real dashboard data
  const [
    { data: employees, count: totalEmployees },
    { data: departments, count: totalDepartments },
    { data: todayAttendance },
    { data: recentTraining },
    { data: pendingAssessments },
  ] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact" }).eq("role", "employee"),
    supabase.from("departments").select("*", { count: "exact" }),
    supabase
      .from("attendance")
      .select(`
      *,
      user_profiles(full_name, department)
    `)
      .eq("date", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: false }),
    supabase
      .from("training_sessions")
      .select(`
      *,
      training_participants(count)
    `)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("assessment_results").select("*").is("passed", null).limit(5),
  ])

  // Calculate stats
  const presentToday = todayAttendance?.filter((a) => a.status === "present").length || 0
  const attendanceRate = totalEmployees ? Math.round((presentToday / totalEmployees) * 100) : 0
  const newThisMonth =
    employees?.filter((emp) => {
      const joinedDate = new Date(emp.joined_at)
      const now = new Date()
      return joinedDate.getMonth() === now.getMonth() && joinedDate.getFullYear() === now.getFullYear()
    }).length || 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          </div>
          <div className="text-sm text-gray-600">Welcome back, {profile.full_name}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalEmployees || 0}</div>
                <p className="text-xs text-green-600 mt-1">
                  {newThisMonth > 0 ? `+${newThisMonth} this month` : "No new hires this month"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Departments</CardTitle>
                <Building2 className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalDepartments || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Across all divisions</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Attendance Today</CardTitle>
                <UserPlus className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{attendanceRate}%</div>
                <p className="text-xs text-blue-600 mt-1">
                  {presentToday} of {totalEmployees} present
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activities */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayAttendance?.slice(0, 5).map((attendance: any) => (
                  <div key={attendance.id} className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        attendance.status === "present" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {attendance.status === "present" ? "Employee checked in" : "Employee absent"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {attendance.user_profiles?.full_name} - {attendance.user_profiles?.department}
                      </p>
                    </div>
                  </div>
                ))}
                {(!todayAttendance || todayAttendance.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No attendance records for today</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild className="h-20 flex-col space-y-2">
                    <Link href="/hr/employees/new">
                      <Users className="h-6 w-6" />
                      <span>Add Employee</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
                    <Link href="/hr/training/new">
                      <BookOpen className="h-6 w-6" />
                      <span>Schedule Training</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
                    <Link href="/hr/attendance">
                      <Clock className="h-6 w-6" />
                      <span>Mark Attendance</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
                    <Link href="/hr/skills">
                      <Target className="h-6 w-6" />
                      <span>Update Skills</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
  )
}
