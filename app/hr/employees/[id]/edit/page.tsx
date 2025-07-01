import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { EditEmployeeForm } from "@/components/edit-employee-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditEmployeePage({ params }: PageProps) {
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

  // Get levels for dropdown
  const { data: levels } = await supabase.from("levels").select("*").order("order_index")

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
        <h1 className="text-3xl font-bold">Edit Employee</h1>
        <p className="text-muted-foreground">Update {employee.full_name}'s profile</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <EditEmployeeForm employee={employee} levels={levels || []} />
      </div>
    </div>
  )
}
