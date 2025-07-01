import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Play, Clock, Award, Filter, Calendar } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function EmployeeTrainingPage() {
  const profile = await getUserProfile()

  // Redirect if not authenticated or not an employee
  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "employee") {
    redirect("/hr/dashboard")
  }

  const supabase = createServerClient()

  // Fetch training data
  const [trainingProgramsResult, myProgressResult, completedCoursesResult] = await Promise.all([
    supabase
      .from("training_programs")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("employee_training_progress")
      .select(`
        *,
        training_programs(title, description, duration_hours)
      `)
      .eq("employee_id", profile.id)
      .order("started_at", { ascending: false }),
    supabase
      .from("employee_training_progress")
      .select(`
        *,
        training_programs(title, description, duration_hours)
      `)
      .eq("employee_id", profile.id)
      .eq("completed", true)
      .order("completed_at", { ascending: false })
  ])

  const trainingPrograms = trainingProgramsResult.data || []
  const myProgress = myProgressResult.data || []
  const completedCourses = completedCoursesResult.data || []

  // Calculate stats
  const totalCourses = trainingPrograms.length
  const coursesInProgress = myProgress.filter(p => !p.completed).length
  const coursesCompleted = completedCourses.length
  const totalHoursCompleted = completedCourses.reduce((sum, course) => sum + (course.training_programs?.duration_hours || 0), 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Training & Courses</h1>
        <p className="text-muted-foreground">Enhance your skills with our training programs</p>
      </div>

      {/* Training Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Courses</p>
                <p className="text-2xl font-bold">{totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{coursesInProgress}</p>
              </div>
              <Play className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{coursesCompleted}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hours Completed</p>
                <p className="text-2xl font-bold">{totalHoursCompleted}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Progress */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Training Progress</CardTitle>
                  <CardDescription>Current courses and progress</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {myProgress.length > 0 ? (
                <div className="space-y-4">
                  {myProgress.map((progress) => (
                    <div key={progress.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{progress.training_programs?.title}</h3>
                          <p className="text-sm text-muted-foreground">{progress.training_programs?.description}</p>
                        </div>
                        <Badge variant={progress.completed ? "default" : "secondary"}>
                          {progress.completed ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress.progress_percentage}%</span>
                        </div>
                        <Progress value={progress.progress_percentage} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {progress.training_programs?.duration_hours} hours
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Started {new Date(progress.started_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <Button size="sm" variant={progress.completed ? "outline" : "default"}>
                          {progress.completed ? "Review" : "Continue"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No training in progress</h3>
                  <p className="text-muted-foreground mb-4">Start a new course to begin your learning journey</p>
                  <Button>Browse Courses</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Courses */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Available Courses</CardTitle>
              <CardDescription>Explore new training opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search courses..." className="pl-9" />
                </div>
              </div>

              {trainingPrograms.length > 0 ? (
                <div className="space-y-3">
                  {trainingPrograms.slice(0, 5).map((program) => {
                    const isEnrolled = myProgress.some(p => p.training_program_id === program.id)
                    return (
                      <div key={program.id} className="border rounded-lg p-3">
                        <h4 className="font-medium mb-1">{program.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {program.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {program.duration_hours}h
                          </div>
                          <Button size="sm" variant={isEnrolled ? "outline" : "default"} disabled={isEnrolled}>
                            {isEnrolled ? "Enrolled" : "Enroll"}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No courses available</p>
                </div>
              )}

              {trainingPrograms.length > 5 && (
                <Button variant="outline" className="w-full mt-4">
                  View All Courses
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          {completedCourses.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{course.training_programs?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Completed {new Date(course.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
