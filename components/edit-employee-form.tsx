"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, ChevronDown } from "lucide-react"
import type { Level, UserProfile } from "@/lib/types"

interface EditEmployeeFormProps {
  employee: UserProfile
  levels: Level[]
}

export function EditEmployeeForm({ employee, levels }: EditEmployeeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    full_name: employee.full_name || "",
    employee_code: employee.employee_code || "",
    department: employee.department || "",
    designation: employee.designation || "",
    qualification: employee.qualification || "",
    total_experience: employee.total_experience || "",
    current_level_id: employee.current_level_id || "",
    remarks: employee.remarks || "",
  })

  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          full_name: formData.full_name,
          employee_code: formData.employee_code || null,
          department: formData.department || null,
          designation: formData.designation || null,
          qualification: formData.qualification || null,
          total_experience: formData.total_experience || null,
          current_level_id: formData.current_level_id || null,
          remarks: formData.remarks || null,
        })
        .eq("id", employee.id)

      if (updateError) throw updateError

      router.push("/hr/employees")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update the employee's basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_code">Employee Code</Label>
              <Input
                id="employee_code"
                value={formData.employee_code}
                onChange={(e) => handleInputChange("employee_code", e.target.value)}
                placeholder="e.g., EMP001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={employee.id} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
          <CardDescription>Update job-related details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="e.g., Engineering, HR, Sales"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                placeholder="e.g., Software Engineer, Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => handleInputChange("qualification", e.target.value)}
                placeholder="e.g., B.Tech, MBA, M.Sc"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_experience">Total Experience</Label>
              <Input
                id="total_experience"
                value={formData.total_experience}
                onChange={(e) => handleInputChange("total_experience", e.target.value)}
                placeholder="e.g., 5 years, 2.5 years"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_level_id">Career Level</Label>
              <div className="relative">
                <select
                  id="current_level_id"
                  value={formData.current_level_id}
                  onChange={(e) => handleInputChange("current_level_id", e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">No level assigned</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name} (Level {level.order_index})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Any additional notes or remarks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              placeholder="Any additional notes about the employee..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
