import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface PageProps {
  params: {
    id: string
  }
}

export default async function RateEmployeePage({ params }: PageProps) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== "hr") {
    redirect("/unauthorized")
  }

  const supabase = createServerClient()

  // Get employee details
  const { data: employee } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", params.id)
    .eq("role", "employee")
    .single()

  if (!employee) {
    redirect("/hr/employees")
  }

  // Get latest rating for this employee
  const { data: latestRating } = await supabase
    .from("assessment_ratings")
    .select("*")
    .eq("employee_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/hr/employees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employees
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Rate Employee</h1>
        <p className="text-muted-foreground">Provide performance assessment for {employee.full_name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Employee Info Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold text-primary">{employee.full_name?.charAt(0) || "U"}</span>
              </div>
              <h3 className="font-semibold">{employee.full_name}</h3>
              <p className="text-sm text-muted-foreground">{employee.designation || "No designation"}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Employee Code:</span>
                <p className="text-muted-foreground">{employee.employee_code || "Not assigned"}</p>
              </div>
              <div>
                <span className="font-medium">Department:</span>
                <p className="text-muted-foreground">{employee.department || "Not assigned"}</p>
              </div>
              <div>
                <span className="font-medium">Experience:</span>
                <p className="text-muted-foreground">{employee.total_experience || "Not specified"}</p>
              </div>
              <div>
                <span className="font-medium">Qualification:</span>
                <p className="text-muted-foreground">{employee.qualification || "Not specified"}</p>
              </div>
              <div>
                <span className="font-medium">Joined:</span>
                <p className="text-muted-foreground">{new Date(employee.joined_at).toLocaleDateString()}</p>
              </div>
            </div>

            {latestRating && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Latest Rating:</p>
                <Badge variant="outline" className="text-xs">
                  {latestRating.rating_period} - {latestRating.overall_rating}/5 ⭐
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Form */}
        <div className="lg:col-span-3">
          <form className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Rating</CardTitle>
                <CardDescription>Rate the employee on various performance criteria (1-5 scale)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating_period">Rating Period</Label>
                    <Input
                      id="rating_period"
                      placeholder="e.g., Q1 2024, Annual 2024"
                      defaultValue={`Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overall_rating">Overall Rating</Label>
                    <Select>
                      <SelectValue placeholder="Select rating" />
                      <SelectItem value="5">5 - Excellent</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="2">2 - Below Average</SelectItem>
                      <SelectItem value="1">1 - Poor</SelectItem>
                    </Select>
                  </div>
                </div>

                {/* Rating Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "technical_skills", label: "Technical Skills" },
                    { key: "communication", label: "Communication" },
                    { key: "teamwork", label: "Teamwork" },
                    { key: "leadership", label: "Leadership" },
                    { key: "problem_solving", label: "Problem Solving" },
                    { key: "punctuality", label: "Punctuality" },
                    { key: "initiative", label: "Initiative" },
                  ].map((category) => (
                    <div key={category.key} className="space-y-2">
                      <Label htmlFor={category.key}>{category.label}</Label>
                      <Select>
                        <SelectValue placeholder="Rate 1-5" />
                        <SelectItem value="5">5 ⭐⭐⭐⭐⭐</SelectItem>
                        <SelectItem value="4">4 ⭐⭐⭐⭐</SelectItem>
                        <SelectItem value="3">3 ⭐⭐⭐</SelectItem>
                        <SelectItem value="2">2 ⭐⭐</SelectItem>
                        <SelectItem value="1">1 ⭐</SelectItem>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Feedback</CardTitle>
                <CardDescription>Provide detailed comments and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goals_achieved">Goals Achieved</Label>
                  <Textarea
                    id="goals_achieved"
                    placeholder="List the goals and objectives achieved by the employee..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areas_for_improvement">Areas for Improvement</Label>
                  <Textarea
                    id="areas_for_improvement"
                    placeholder="Identify areas where the employee can improve..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training_recommendations">Training Recommendations</Label>
                  <Textarea
                    id="training_recommendations"
                    placeholder="Suggest training programs or courses..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hr_comments">HR Comments</Label>
                  <Textarea id="hr_comments" placeholder="Additional HR comments and observations..." rows={4} />
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button type="submit" variant="default" className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Submit Rating
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
