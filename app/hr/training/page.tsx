import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, TrendingUp, Plus, Clock, User, Building2, Activity, Target, Calendar } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function TrainingPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "hr") {
    redirect("/employee/dashboard")
  }

  const supabase = createServerClient()

  // Get real training data
  const [{ data: trainingSessions, count: totalTrainings }, { data: participants }] = await Promise.all([
    supabase
      .from("training_sessions")
      .select(
        `
      *,
      training_participants(count)
    `,
        { count: "exact" },
      )
      .order("start_date", { ascending: false }),
    supabase.from("training_participants").select("*"),
  ])

  const scheduledSessions = trainingSessions?.filter((s) => s.status === "scheduled").length || 0
  const totalParticipants = participants?.length || 0
  const completedSessions = trainingSessions?.filter((s) => s.status === "completed").length || 0
  const completionRate = totalTrainings ? Math.round((completedSessions / totalTrainings) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Technical":
        return "bg-purple-100 text-purple-800"
      case "Leadership":
        return "bg-orange-100 text-orange-800"
      case "Compliance":
        return "bg-red-100 text-red-800"
      case "Soft Skills":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Training Management</h1>
          </div>
          <Button asChild>
            <Link href="/hr/training/new" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Schedule Training</span>
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
                <CardTitle className="text-sm font-medium text-gray-600">Total Trainings</CardTitle>
                <BookOpen className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalTrainings || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
                <Clock className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{scheduledSessions}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
                <Users className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalParticipants}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Training Schedule */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Training Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trainingSessions?.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                          {session.category && (
                            <Badge className={getCategoryColor(session.category)}>{session.category}</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{session.description || "No description available"}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Date:</span>
                            <span className="ml-1 text-gray-600">
                              {new Date(session.start_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Time:</span>
                            <span className="ml-1 text-gray-600">
                              {new Date(session.start_date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Duration:</span>
                            <span className="ml-1 text-gray-600">{session.duration_hours || 0} hours</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Trainer:</span>
                            <span className="ml-1 text-gray-600">{session.trainer_name || "TBD"}</span>
                          </div>
                        </div>

                        <div className="flex items-center mt-4 space-x-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            {session.training_participants?.[0]?.count || 0} participants
                          </div>
                          <Badge variant="outline">{session.department || "All Departments"}</Badge>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/hr/training/${session.id}/edit`}>Edit</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/hr/training/${session.id}/manage`}>Manage</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {!trainingSessions?.length && (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No training sessions</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by scheduling your first training session.</p>
                    <div className="mt-6">
                      <Button asChild>
                        <Link href="/hr/training/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Schedule Training
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  )
}
