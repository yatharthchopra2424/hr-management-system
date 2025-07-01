import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, CheckCircle, XCircle, Plus, Building2, Activity, BookOpen, Target } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AttendancePage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "hr") {
    redirect("/employee/dashboard")
  }

  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  // Get real attendance data
  const [{ data: employees, count: totalEmployees }, { data: todayAttendance }] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact" }).eq("role", "employee"),
    supabase
      .from("attendance")
      .select(`
      *,
      user_profiles(full_name, department, departments(name))
    `)
      .eq("date", today)
      .order("created_at", { ascending: false }),
  ])

  const presentToday = todayAttendance?.filter((a) => a.status === "present").length || 0
  const absentToday = (totalEmployees || 0) - presentToday
  const attendanceRate = totalEmployees ? ((presentToday / totalEmployees) * 100).toFixed(1) : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      case "sick_leave":
        return "bg-blue-100 text-blue-800"
      case "vacation":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "-"
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          </div>
          <Button asChild>
            <Link href="/hr/attendance/mark">
              <Plus className="h-4 w-4 mr-2" />
              Mark Attendance
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalEmployees || 0}</div>
            </CardContent>
          </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Present Today</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{presentToday}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Absent Today</CardTitle>
                <XCircle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{absentToday}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
                <Calendar className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{attendanceRate}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Attendance */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Today's Attendance - {new Date().toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Check In</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Check Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAttendance?.map((record: any) => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {record.user_profiles?.full_name || "Unknown Employee"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {record.user_profiles?.departments?.name ||
                            record.user_profiles?.department ||
                            "No Department"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {record.check_in_time ? (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {formatTime(record.check_in_time)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {record.check_out_time ? (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {formatTime(record.check_out_time)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Show employees who haven't marked attendance */}
                    {employees
                      ?.filter((emp) => !todayAttendance?.some((att) => att.user_id === emp.id))
                      .map((employee) => (
                        <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{employee.full_name}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{employee.department || "No Department"}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-gray-100 text-gray-800">Not Marked</Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-400">-</td>
                          <td className="py-3 px-4 text-gray-400">-</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!employees?.length && (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No employees found</h3>
                    <p className="mt-1 text-sm text-gray-500">Add employees to start tracking attendance.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  )
}
