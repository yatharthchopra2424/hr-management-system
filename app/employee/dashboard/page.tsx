import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { User, Award, TrendingUp, Calendar, Play, BookOpen, Target, Clock } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function EmployeeDashboard() {
  const profile = await getUserProfile()

  // Redirect if not authenticated or not an employee
  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "employee") {
    redirect("/hr/dashboard")
  }

  const supabase = createServerClient()

  // Fetch employee data with better error handling
  const [currentLevelResult, nextLevelResult, recentResultsResult, availableAssessmentsResult] = await Promise.all([
    profile.current_level_id
      ? supabase.from("levels").select("*").eq("id", profile.current_level_id).single()
      : Promise.resolve({ data: null, error: null }),
    profile.current_level_id
      ? supabase.from("levels").select("*").gt("order_index", 1).order("order_index").limit(1).single()
      : supabase.from("levels").select("*").order("order_index").limit(1).single(),
    supabase
      .from("assessment_results")
      .select(`
        *,
        assessments!inner(title)
      `)
      .eq("user_id", profile.id)
      .order("taken_at", { ascending: false })
      .limit(5),
    supabase.from("assessments").select("*").order("created_at", { ascending: false }).limit(3),
  ])

  const currentLevel = currentLevelResult.data
  const nextLevel = nextLevelResult.data
  const recentResults = recentResultsResult.data || []
  const availableAssessments = availableAssessmentsResult.data || []

  const progressToNext =
    currentLevel && nextLevel ? Math.min((currentLevel.order_index / nextLevel.order_index) * 100, 90) : 25

  const totalAssessments = recentResults.length
  const passedAssessments = recentResults.filter((r: any) => r.passed).length
  const averageScore =
    totalAssessments > 0
      ? Math.round(recentResults.reduce((sum: number, r: any) => sum + r.score, 0) / totalAssessments)
      : 0

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">{profile.full_name?.charAt(0) || "U"}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.full_name}!</h1>
              <p className="text-gray-600">Ready to advance your career? Let&apos;s get started.</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Current Level</p>
                  <p className="text-2xl font-bold">{currentLevel?.name || "Unassigned"}</p>
                </div>
                <Target className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Assessments Passed</p>
                  <p className="text-2xl font-bold">
                    {passedAssessments}/{totalAssessments}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Average Score</p>
                  <p className="text-2xl font-bold">{averageScore}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Available Tests</p>
                  <p className="text-2xl font-bold">{availableAssessments.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Career Progress - Larger */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <span>Career Progression</span>
              </CardTitle>
              <CardDescription>Your journey to the next level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {currentLevel?.name || "Not assigned"} → {nextLevel?.name || "Max level"}
                    </span>
                    <span className="text-sm font-bold text-blue-600">{Math.round(progressToNext)}%</span>
                  </div>
                  <Progress value={progressToNext} className="h-3 bg-gray-200" />
                </div>

                {nextLevel && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Next Level: {nextLevel.name}</h4>
                    <p className="text-sm text-blue-700">{nextLevel.criteria}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Joined</p>
                    <p className="font-semibold">{new Date(profile.joined_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <User className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Department</p>
                    <Badge variant="secondary" className="mt-1">
                      {profile.department || "Not assigned"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-600" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Take action to advance your career</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Link href="/employee/assessments">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Assessments
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full border-2 hover:bg-gray-50">
                <Link href="/employee/profile">
                  <User className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>

              {availableAssessments.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-3">Recommended Assessment:</p>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="font-medium text-green-900">{availableAssessments[0].title}</p>
                    <p className="text-xs text-green-700 mb-2">
                      Passing score: {availableAssessments[0].passing_score}%
                    </p>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      <Play className="mr-1 h-3 w-3" />
                      Start Now
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Results */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span>Recent Assessment Results</span>
            </CardTitle>
            <CardDescription>Your latest performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            {recentResults.length > 0 ? (
              <div className="space-y-4">
                {recentResults.map((result: any) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          result.passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {result.passed ? <Award className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{result.assessments.title}</p>
                        <p className="text-sm text-gray-600">
                          Taken on {new Date(result.taken_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{result.score}%</p>
                        <Badge variant={result.passed ? "default" : "destructive"} className="text-xs">
                          {result.passed ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No assessments taken yet</h3>
                <p className="text-gray-600 mb-6">Take your first assessment to get started on your career journey!</p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Link href="/employee/assessments">
                    <Play className="mr-2 h-4 w-4" />
                    Take Your First Assessment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
