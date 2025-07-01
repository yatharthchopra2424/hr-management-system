import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, employee_code, position, department, level_id } = body

    console.log("Creating employee with data:", { email, full_name, position, department })

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Generate employee code if not provided
    const finalEmployeeCode = employee_code || `EMP${Date.now().toString().slice(-6)}`

    // Create user in auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: "employee",
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log("Auth user created:", authUser.user?.id)

    // Create profile
    const { error: profileError } = await supabaseAdmin.from("user_profiles").insert({
      id: authUser.user!.id,
      email,
      full_name,
      role: "employee",
      employee_code: finalEmployeeCode,
      position,
      department,
      level_id: level_id || null,
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user!.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    console.log("Employee created successfully")

    return NextResponse.json({
      success: true,
      message: "Employee created successfully",
      employee_id: authUser.user!.id,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
