import { createServerClient } from "@/lib/server"
import { getSupabaseClient } from "@/lib/client"
import type { UserProfile } from "@/lib/types"

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select(`
      *,
      levels(*)
    `)
    .eq("id", user.id)
    .single()

  return profile
}

// Client-side function to ensure user profile exists
export async function ensureUserProfile(userId: string, userData: { email: string, full_name: string, role: "hr" | "employee" }) {
  const supabase = getSupabaseClient()
  
  try {
    // First check if profile already exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (existingProfile) {
      console.log("Profile already exists for user:", userId)
      return existingProfile
    }

    // Create profile if it doesn't exist
    console.log("Creating profile for user:", userId, userData)
    const { data: newProfile, error } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        full_name: userData.full_name,
        role: userData.role,
        contact_info: { email: userData.email } // Store email in contact_info since there's no direct email field
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating profile:", error)
      throw error
    }

    console.log("Profile created successfully:", newProfile)
    return newProfile
  } catch (error) {
    console.error("Error in ensureUserProfile:", error)
    throw error
  }
}
