import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Users, TrendingUp, Plus, Award, Building2, Activity, BookOpen, Calendar } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function SkillsPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "hr") {
    redirect("/employee/dashboard")
  }

  const supabase = createServerClient()

  // Get real skills data
  const [{ data: employees, count: totalEmployees }, { data: skills, count: totalSkills }, { data: employeeSkills }] =
    await Promise.all([
      supabase.from("user_profiles").select("*", { count: "exact" }).eq("role", "employee"),
      supabase.from("skills").select("*", { count: "exact" }),
      supabase
        .from("employee_skills")
        .select(`
      *,
      user_profiles(full_name, department, departments(name)),
      skills(name, category)
    `)
        .order("assessed_at", { ascending: false }),
    ])

  // Calculate stats
  const expertLevelSkills = employeeSkills?.filter((es) => es.level >= 4).length || 0
  const avgSkillLevel = employeeSkills?.length
    ? (employeeSkills.reduce((sum, es) => sum + es.level, 0) / employeeSkills.length).toFixed(1)
    : 0

  // Group skills by employee
  const employeeSkillsMap =
    employeeSkills?.reduce((acc: any, skill: any) => {
      const userId = skill.user_id
      if (!acc[userId]) {
        acc[userId] = {
          employee: skill.user_profiles,
          skills: [],
        }
      }
      acc[userId].skills.push(skill)
      return acc
    }, {}) || {}

  const getSkillColor = (level: number) => {
    if (level >= 4) return "bg-green-500"
    if (level >= 3) return "bg-blue-500"
    if (level >= 2) return "bg-yellow-500"
    return "bg-gray-400"
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Technical":
        return "bg-blue-100 text-blue-800"
      case "Marketing":
        return "bg-green-100 text-green-800"
      case "Management":
        return "bg-purple-100 text-purple-800"
      case "Soft Skills":
        return "bg-orange-100 text-orange-800"
      case "Analytics":
        return "bg-indigo-100 text-indigo-800"
      case "Finance":
        return "bg-yellow-100 text-yellow-800"
      case "Sales":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelText = (level: number) => {
    switch (level) {
      case 5:
        return "Expert"
      case 4:
        return "Advanced"
      case 3:
        return "Intermediate"
      case 2:
        return "Beginner"
      case 1:
        return "Novice"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Skills Matrix</h1>
          </div>
          <Button asChild>
            <Link href="/hr/skills/new" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Skill</span>
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
                <CardTitle className="text-sm font-medium text-gray-600">Total Skills</CardTitle>
                <Target className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalSkills || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Expert Level</CardTitle>
                <Award className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{expertLevelSkills}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Skill Level</CardTitle>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{avgSkillLevel}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex space-x-4 mb-6">
            <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white">
              <option>All Departments</option>
              <option>Human Resources</option>
              <option>Information Technology</option>
              <option>Marketing</option>
              <option>Finance</option>
              <option>Sales</option>
              <option>Operations</option>
            </select>
            <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white">
              <option>All Skills</option>
              <option>Technical</option>
              <option>Management</option>
              <option>Soft Skills</option>
              <option>Marketing</option>
              <option>Analytics</option>
              <option>Finance</option>
              <option>Sales</option>
            </select>
          </div>

          {/* Skills Overview */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Skills Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.entries(employeeSkillsMap).map(([userId, data]: [string, any]) => {
                  const avgLevel = data.skills.length
                    ? (
                        data.skills.reduce((sum: number, skill: any) => sum + skill.level, 0) / data.skills.length
                      ).toFixed(1)
                    : 0

                  return (
                    <div key={userId} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {data.employee?.full_name || "Unknown Employee"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {data.employee?.departments?.name || data.employee?.department || "No Department"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Average Skill Level</p>
                          <p className="text-2xl font-bold text-gray-900">{avgLevel}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.skills.map((skill: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">{skill.skills?.name}</span>
                                <Badge className={getCategoryColor(skill.skills?.category)}>
                                  {skill.skills?.category}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getSkillColor(skill.level)}`}
                                    style={{ width: `${(skill.level / 5) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-600">{getLevelText(skill.level)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {Object.keys(employeeSkillsMap).length === 0 && (
                  <div className="text-center py-12">
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No skill assessments</h3>
                    <p className="mt-1 text-sm text-gray-500">Start by adding skill assessments for your employees.</p>
                    <div className="mt-6">
                      <Button asChild>
                        <Link href="/hr/skills/assessment">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill Assessment
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
