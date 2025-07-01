"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Department {
  id: string
  name: string
}

interface Level {
  id: string
  name: string
  order_index: number
}

interface CreateEmployeeFormProps {
  departments: Department[]
  levels: Level[]
}

export default function CreateEmployeeForm({ departments, levels }: CreateEmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    employeeCode: "",
    department: "",
    designation: "",
    currentLevel: "",
    contactInfo: "",
  })

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: "employee",
          },
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      // Create user profile
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: authData.user.id,
        full_name: formData.fullName,
        role: "employee",
        employee_code: formData.employeeCode || null,
        department: formData.department || null,
        department_id: departments.find((d) => d.name === formData.department)?.id || null,
        designation: formData.designation || null,
        current_level_id: formData.currentLevel || null,
        contact_info: formData.contactInfo ? JSON.parse(formData.contactInfo) : {},
        joined_at: new Date().toISOString(),
      })

      if (profileError) {
        throw new Error(profileError.message)
      }

      router.push("/hr/employees")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the employee")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Employee</CardTitle>
        <CardDescription>Create a new employee account and profile</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="employee@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                placeholder="Minimum 6 characters"
                minLength={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code</Label>
              <Input
                id="employeeCode"
                value={formData.employeeCode}
                onChange={(e) => handleInputChange("employeeCode", e.target.value)}
                placeholder="EMP001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentLevel">Career Level (Optional)</Label>
            <Select value={formData.currentLevel} onValueChange={(value) => handleInputChange("currentLevel", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select career level (optional)" />
              </SelectTrigger>
              <SelectContent>
                {levels
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Information (JSON format)</Label>
            <Textarea
              id="contactInfo"
              value={formData.contactInfo}
              onChange={(e) => handleInputChange("contactInfo", e.target.value)}
              placeholder='{"phone": "+1234567890", "address": "123 Main St"}'
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Employee"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
