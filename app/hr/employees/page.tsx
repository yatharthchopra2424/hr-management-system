import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Eye, Edit, Building2, Activity, BookOpen, Target, Calendar } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function EmployeesPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "hr") {
    redirect("/employee/dashboard")
  }

  const supabase = createServerClient()

  const { data: employees } = await supabase
    .from("user_profiles")
    .select(`
      *,
      levels(name, order_index),
      departments(name)
    `)
    .eq("role", "employee")
    .order("created_at", { ascending: false })

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      "Human Resources": "bg-purple-100 text-purple-800",
      "Information Technology": "bg-blue-100 text-blue-800",
      Marketing: "bg-green-100 text-green-800",
      Finance: "bg-yellow-100 text-yellow-800",
      Sales: "bg-red-100 text-red-800",
      Operations: "bg-gray-100 text-gray-800",
    }
    return colors[dept] || "bg-gray-100 text-gray-800"
  }

  return (
    // ...existing code...
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          </div>
          <Button asChild>
            <Link href="/hr/employees/new" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Employee</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">All Employees ({employees?.length || 0})</CardTitle>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search employees..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees?.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {getInitials(employee.full_name || "")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{employee.full_name || "No name"}</h3>
                      <p className="text-sm text-gray-600">{employee.designation || "No designation"}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          className={getDepartmentColor(employee.departments?.name || employee.department || "")}
                        >
                          {employee.departments?.name || employee.department || "No Department"}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/hr/employees/${employee.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {!employees?.length && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No employees</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding a new employee.</p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/hr/employees/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
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
