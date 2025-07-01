import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useState } from "react"

export default async function EmployeeAttendancePage() {
  const profile = await getUserProfile()

  // Redirect if not authenticated or not an employee
  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "employee") {
    redirect("/hr/dashboard")
  }

  const supabase = createServerClient()

  // Get current month dates
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Fetch attendance data
  const [attendanceRecordsResult, todayRecordResult] = await Promise.all([
    supabase
      .from("attendance_records")
      .select("*")
      .eq("employee_id", profile.id)
      .gte("date", startOfMonth.toISOString().split('T')[0])
      .lte("date", endOfMonth.toISOString().split('T')[0])
      .order("date", { ascending: false }),
    supabase
      .from("attendance_records")
      .select("*")
      .eq("employee_id", profile.id)
      .eq("date", now.toISOString().split('T')[0])
      .single()
  ])

  const attendanceRecords = attendanceRecordsResult.data || []
  const todayRecord = todayRecordResult.data

  // Calculate stats
  const workingDays = 22 // Approximate working days in a month
  const presentDays = attendanceRecords.filter(r => r.status === 'present').length
  const absentDays = attendanceRecords.filter(r => r.status === 'absent').length
  const lateDays = attendanceRecords.filter(r => r.status === 'late').length
  const attendanceRate = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0

  // Calculate total working hours this month
  const totalHours = attendanceRecords.reduce((sum, record) => {
    if (record.check_out && record.check_in) {
      const checkIn = new Date(`1970-01-01T${record.check_in}`)
      const checkOut = new Date(`1970-01-01T${record.check_out}`)
      const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
      return sum + Math.max(0, hours)
    }
    return sum
  }, 0)

  const isCheckedIn = todayRecord && todayRecord.check_in && !todayRecord.check_out

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Attendance & Time Tracking</h1>
        <p className="text-muted-foreground">Monitor your attendance and working hours</p>
      </div>

      {/* Quick Check-in/out */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-semibold">
                    {todayRecord?.check_in || '--:--'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-semibold">
                    {todayRecord?.check_out || '--:--'}
                  </p>
                </div>
              </div>
              {todayRecord && (
                <Badge 
                  variant={
                    todayRecord.status === 'present' ? 'default' : 
                    todayRecord.status === 'late' ? 'secondary' : 
                    'destructive'
                  }
                >
                  {todayRecord.status}
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              {!todayRecord ? (
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check In
                </Button>
              ) : isCheckedIn ? (
                <Button variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  Check Out
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Day completed
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{attendanceRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present Days</p>
                <p className="text-2xl font-bold">{presentDays}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent Days</p>
                <p className="text-2xl font-bold">{absentDays}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{Math.round(totalHours)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Attendance */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Your attendance history for this month</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length > 0 ? (
                <div className="space-y-3">
                  {attendanceRecords.slice(0, 10).map((record) => {
                    const workingHours = record.check_out && record.check_in
                      ? (() => {
                          const checkIn = new Date(`1970-01-01T${record.check_in}`)
                          const checkOut = new Date(`1970-01-01T${record.check_out}`)
                          const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
                          return Math.max(0, hours).toFixed(1)
                        })()
                      : null

                    return (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            {record.status === 'present' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : record.status === 'late' ? (
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {record.check_in && record.check_out 
                                ? `${record.check_in} - ${record.check_out}`
                                : record.check_in 
                                ? `${record.check_in} - Present`
                                : 'No record'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              record.status === 'present' ? 'default' : 
                              record.status === 'late' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {record.status}
                          </Badge>
                          {workingHours && (
                            <p className="text-sm text-muted-foreground mt-1">{workingHours}h</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No attendance records</h3>
                  <p className="text-muted-foreground">Start checking in to track your attendance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar and Summary */}
        <div className="space-y-6">
          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Working Days</span>
                  <span className="font-semibold">{workingDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Present</span>
                  <span className="font-semibold text-green-600">{presentDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Late</span>
                  <span className="font-semibold text-yellow-600">{lateDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Absent</span>
                  <span className="font-semibold text-red-600">{absentDays}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Hours</span>
                    <span className="font-bold">{Math.round(totalHours)}h</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Check in on time to maintain good attendance</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p>Don't forget to check out when leaving</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CalendarIcon className="h-4 w-4 text-purple-500 mt-0.5" />
                  <p>Plan ahead for leave requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
