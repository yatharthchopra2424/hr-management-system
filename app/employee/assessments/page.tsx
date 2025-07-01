import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Award, Target, Clock, Calendar, TrendingUp, Search, Filter } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function EmployeeAssessmentsPage() {
  const profile = await getUserProfile()

  // Redirect if not authenticated or not an employee
  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "employee") {
    redirect("/hr/dashboard")
  }

  const supabase = createServerClient()

  // Fetch assessment data
  const [assessmentsResult, myResultsResult, pendingAssessmentsResult] = await Promise.all([
    supabase
      .from("assessments")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("assessment_results")
      .select(`
        *,
        assessments(title, description, max_score)
      `)
      .eq("user_id", profile.id)
      .order("taken_at", { ascending: false }),
    supabase
      .from("assessments")
      .select(`
        *,
        assessment_results!left(id, user_id)
      `)
      .is("assessment_results.user_id", null)
      .order("created_at", { ascending: false })
  ])

  const assessments = assessmentsResult.data || []
  const myResults = myResultsResult.data || []
  const pendingAssessments = pendingAssessmentsResult.data || []

  // Calculate stats
  const totalAssessments = assessments.length
  const completedAssessments = myResults.length
  const averageScore = myResults.length > 0 
    ? Math.round(myResults.reduce((sum, result) => sum + result.score, 0) / myResults.length)
    : 0
  const pendingCount = pendingAssessments.length

  // Get recent performance trend
  const recentResults = myResults.slice(0, 5)
  const improvementTrend = recentResults.length >= 2
    ? recentResults[0].score > recentResults[1].score
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Assessments & Performance</h1>
        <p className="text-muted-foreground">Track your skills and performance evaluations</p>
      </div>

      {/* Assessment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
                <p className="text-2xl font-bold">{totalAssessments}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedAssessments}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{averageScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assessment Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Assessment Results</CardTitle>
                  <CardDescription>Your performance history and scores</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {myResults.length > 0 ? (
                <div className="space-y-4">
                  {myResults.map((result) => {
                    const scorePercentage = result.assessments?.max_score 
                      ? Math.round((result.score / result.assessments.max_score) * 100)
                      : result.score
                    
                    const getScoreColor = (score: number) => {
                      if (score >= 90) return "text-green-600 bg-green-50"
                      if (score >= 75) return "text-blue-600 bg-blue-50"
                      if (score >= 60) return "text-yellow-600 bg-yellow-50"
                      return "text-red-600 bg-red-50"
                    }

                    return (
                      <div key={result.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{result.assessments?.title}</h3>
                            <p className="text-sm text-muted-foreground">{result.assessments?.description}</p>
                          </div>
                          <Badge className={getScoreColor(scorePercentage)}>
                            {scorePercentage}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Score</span>
                            <span>{result.score} / {result.assessments?.max_score}</span>
                          </div>
                          <Progress value={scorePercentage} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Taken {new Date(result.taken_at).toLocaleDateString()}
                          </div>
                          {result.feedback && (
                            <Button size="sm" variant="outline">
                              View Feedback
                            </Button>
                          )}
                        </div>

                        {result.feedback && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm">{result.feedback}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No assessments completed</h3>
                  <p className="text-muted-foreground mb-4">Take your first assessment to track your performance</p>
                  <Button>Browse Assessments</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Assessments & Performance Insights */}
        <div className="space-y-6">
          {/* Pending Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Assessments</CardTitle>
              <CardDescription>Complete these to update your profile</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAssessments.length > 0 ? (
                <div className="space-y-3">
                  {pendingAssessments.slice(0, 5).map((assessment) => (
                    <div key={assessment.id} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-1">{assessment.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {assessment.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {assessment.time_limit_minutes || 30} min
                        </div>
                        <Button size="sm">
                          Start Assessment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All assessments completed!</p>
                </div>
              )}

              {pendingAssessments.length > 5 && (
                <Button variant="outline" className="w-full mt-4">
                  View All Pending
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Performance Insights */}
          {myResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>Your progress overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Performance</span>
                    <Badge variant={averageScore >= 75 ? "default" : "secondary"}>
                      {averageScore >= 85 ? "Excellent" : averageScore >= 75 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Average Score</span>
                      <span>{averageScore}%</span>
                    </div>
                    <Progress value={averageScore} className="h-2" />
                  </div>

                  {improvementTrend !== null && (
                    <div className="flex items-center space-x-2">
                      <TrendingUp className={`h-4 w-4 ${improvementTrend ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-sm">
                        {improvementTrend ? 'Improving' : 'Declining'} trend
                      </span>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {averageScore < 75 && (
                        <li>• Focus on training programs to improve skills</li>
                      )}
                      {pendingCount > 0 && (
                        <li>• Complete pending assessments to update your profile</li>
                      )}
                      <li>• Review feedback from previous assessments</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
