import { getUserProfile } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "lucide-react"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const profile = await getUserProfile()

  // Redirect if not authenticated or not an employee
  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "employee") {
    redirect("/hr/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-semibold text-primary">{profile.full_name?.charAt(0) || "U"}</span>
            </div>
            <h3 className="text-lg font-semibold">{profile.full_name}</h3>
            <p className="text-muted-foreground">Employee</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.joined_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={profile.full_name || ""} placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeCode">Employee Code</Label>
                    <Input
                      id="employeeCode"
                      defaultValue={profile.employee_code || ""}
                      placeholder="Employee code (assigned by HR)"
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      defaultValue={profile.department || ""}
                      placeholder="Enter your department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      defaultValue={profile.designation || ""}
                      placeholder="Enter your designation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      defaultValue={profile.qualification || ""}
                      placeholder="Enter your highest qualification"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalExperience">Total Experience</Label>
                    <Input
                      id="totalExperience"
                      defaultValue={profile.total_experience || ""}
                      placeholder="e.g., 5 years"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={profile.id} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed. Contact HR if needed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="Enter your phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Enter your location" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself" rows={4} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    defaultValue={profile.remarks || ""}
                    placeholder="Additional remarks or notes"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
