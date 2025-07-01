import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Target, Star, TrendingUp, Plus, Award, BookOpen, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function EmployeeSkillsPage() {
  const profile = await getUserProfile()

  // Redirect if not authenticated or not an employee
  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "employee") {
    redirect("/hr/dashboard")
  }

  const supabase = createServerClient()

  // Fetch skills and goals data
  const [skillsResult, goalsResult, skillCategoriesResult] = await Promise.all([
    supabase
      .from("employee_skills")
      .select(`
        *,
        skills(name, category)
      `)
      .eq("employee_id", profile.id)
      .order("proficiency_level", { ascending: false }),
    supabase
      .from("employee_goals")
      .select("*")
      .eq("employee_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("skills")
      .select("category")
      .order("category")
  ])

  const employeeSkills = skillsResult.data || []
  const goals = goalsResult.data || []
  const skillCategories = [...new Set((skillCategoriesResult.data || []).map(s => s.category))]

  // Group skills by category
  const skillsByCategory = employeeSkills.reduce((acc, skill) => {
    const category = skill.skills?.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {} as Record<string, typeof employeeSkills>)

  // Calculate stats
  const totalSkills = employeeSkills.length
  const expertSkills = employeeSkills.filter(s => s.proficiency_level >= 8).length
  const averageProficiency = employeeSkills.length > 0 
    ? Math.round(employeeSkills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / employeeSkills.length)
    : 0

  const activeGoals = goals.filter(g => g.status === 'in_progress').length
  const completedGoals = goals.filter(g => g.status === 'completed').length

  const getProficiencyLabel = (level: number) => {
    if (level >= 9) return "Expert"
    if (level >= 7) return "Advanced"
    if (level >= 5) return "Intermediate"
    if (level >= 3) return "Beginner"
    return "Novice"
  }

  const getProficiencyColor = (level: number) => {
    if (level >= 9) return "text-green-600 bg-green-50"
    if (level >= 7) return "text-blue-600 bg-blue-50"
    if (level >= 5) return "text-yellow-600 bg-yellow-50"
    if (level >= 3) return "text-orange-600 bg-orange-50"
    return "text-gray-600 bg-gray-50"
  }

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "text-green-600 bg-green-50"
      case 'in_progress': return "text-blue-600 bg-blue-50"
      case 'on_hold': return "text-yellow-600 bg-yellow-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Skills & Goals</h1>
        <p className="text-muted-foreground">Track your professional development and career objectives</p>
      </div>

      {/* Skills & Goals Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Skills</p>
                <p className="text-2xl font-bold">{totalSkills}</p>
              </div>
              <Star className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expert Level</p>
                <p className="text-2xl font-bold">{expertSkills}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{activeGoals}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Proficiency</p>
                <p className="text-2xl font-bold">{averageProficiency}/10</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skills Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Skills</CardTitle>
                  <CardDescription>Your current skill set and proficiency levels</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(skillsByCategory).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(skillsByCategory).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {skills.map((skill) => (
                          <div key={skill.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{skill.skills?.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {skill.years_experience ? `${skill.years_experience} years experience` : 'New skill'}
                                </p>
                              </div>
                              <Badge className={getProficiencyColor(skill.proficiency_level)}>
                                {getProficiencyLabel(skill.proficiency_level)}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Proficiency</span>
                                <span>{skill.proficiency_level}/10</span>
                              </div>
                              <Progress value={skill.proficiency_level * 10} className="h-2" />
                            </div>

                            {skill.last_assessed && (
                              <div className="mt-3 text-xs text-muted-foreground">
                                Last assessed: {new Date(skill.last_assessed).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No skills recorded</h3>
                  <p className="text-muted-foreground mb-4">Start building your skill profile</p>
                  <Button>Add Your First Skill</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Goals and Development */}
        <div className="space-y-6">
          {/* Career Goals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Career Goals</CardTitle>
                  <CardDescription>Your professional objectives</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.slice(0, 5).map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                        <Badge className={getGoalStatusColor(goal.status)} variant="outline">
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {goal.description}
                      </p>

                      {goal.progress_percentage !== null && (
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>{goal.progress_percentage}%</span>
                          </div>
                          <Progress value={goal.progress_percentage} className="h-1" />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </div>
                        {goal.status === 'in_progress' && (
                          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                            Update
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No goals set</p>
                  <Button size="sm">Set Your First Goal</Button>
                </div>
              )}

              {goals.length > 5 && (
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Goals
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Development Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Development Recommendations</CardTitle>
              <CardDescription>Suggested areas for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-1">Strengthen Core Skills</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Focus on improving proficiency in your primary skill areas
                  </p>
                  <Button size="sm" variant="outline" className="h-6">
                    Browse Courses
                  </Button>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-1">Learn New Technologies</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Expand your skillset with emerging technologies
                  </p>
                  <Button size="sm" variant="outline" className="h-6">
                    Explore
                  </Button>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-1">Complete Assessments</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Take skill assessments to validate your expertise
                  </p>
                  <Button size="sm" variant="outline" className="h-6">
                    Take Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Skills Developed</span>
                  <span className="font-semibold">{totalSkills}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Goals Achieved</span>
                  <span className="font-semibold text-green-600">{completedGoals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Goals in Progress</span>
                  <span className="font-semibold text-blue-600">{activeGoals}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Development Score</span>
                    <span className="font-bold text-purple-600">{averageProficiency}/10</span>
                  </div>
                  <Progress value={averageProficiency * 10} className="h-2 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
