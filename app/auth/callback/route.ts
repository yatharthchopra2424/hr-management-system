import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      await supabase.auth.exchangeCodeForSession(code)

      // Get user data
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (user) {
        console.log("OAuth user authenticated:", user.id)
        
        // First try to get role from user metadata
        let userRole = user.user_metadata?.role as "hr" | "employee" | undefined

        // If not in metadata, try to get from user_profiles table
        if (!userRole) {
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .single()
          
          console.log("Profile lookup result:", { profile, profileError })
          userRole = profile?.role
        }

        // If still no role found, create a profile with default employee role
        if (!userRole) {
          console.log("No profile found, creating default employee profile")
          try {
            const { data: newProfile, error: createError } = await supabase
              .from("user_profiles")
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                role: 'employee', // Default to employee for OAuth users
                contact_info: { email: user.email }
              })
              .select()
              .single()

            if (createError) {
              console.error("Error creating OAuth user profile:", createError)
            } else {
              console.log("Created OAuth user profile:", newProfile)
              userRole = 'employee'
            }
          } catch (profileCreationError) {
            console.error("Failed to create profile for OAuth user:", profileCreationError)
            userRole = 'employee' // Fallback
          }
        }

        // Default to employee if no role found
        const role = userRole || "employee"
        
        console.log("Final OAuth role determined:", role)
        
        const redirectUrl = role === "hr" ? "/hr/dashboard" : "/employee/dashboard"
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    } catch (error) {
      console.error("OAuth callback error:", error)
      // Redirect to login on error
      return NextResponse.redirect(new URL("/auth/login?error=callback_failed", request.url))
    }
  }

  return NextResponse.redirect(new URL("/auth/login", request.url))
}
