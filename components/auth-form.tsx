"use client"

import type React from "react"
import { useState } from "react"
import { getSupabaseClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Github } from "lucide-react"
import Link from "next/link"

interface AuthFormProps {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"hr" | "employee">("employee")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (mode === "register") {
        console.log("Starting registration with:", { email, role, fullName })
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        })
        
        console.log("Registration response:", { data, error })
        
        if (error) {
          console.error("Registration error:", error)
          throw error
        }

        if (data.user) {
          console.log("User created successfully:", data.user.id)
          
          // Wait for database trigger to create profile
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Try to manually create profile if trigger failed
          try {
            const { data: existingProfile } = await supabase
              .from("user_profiles")
              .select("id")
              .eq("id", data.user.id)
              .single()
            
            if (!existingProfile) {
              console.log("Profile not found, creating manually...")
              const { error: profileError } = await supabase
                .from("user_profiles")
                .insert({
                  id: data.user.id,
                  full_name: fullName,
                  role: role,
                })
              
              if (profileError) {
                console.error("Manual profile creation failed:", profileError)
              } else {
                console.log("Profile created manually")
              }
            } else {
              console.log("Profile already exists")
            }
          } catch (profileError) {
            console.error("Profile check/creation failed:", profileError)
          }
        }

        // Force refresh and redirect
        window.location.href = role === "hr" ? "/hr/dashboard" : "/employee/dashboard"
      } else {
        console.log("Starting login with:", email)
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        console.log("Login response:", { data, error })
        
        if (error) {
          console.error("Login error:", error)
          throw error
        }

        // Wait a moment to ensure session is established
        await new Promise(resolve => setTimeout(resolve, 500))

        // Get user role from metadata first, then from database
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        console.log("Current user after login:", currentUser)

        let userRole = currentUser?.user_metadata?.role as "hr" | "employee" | undefined

        // If not in metadata, check user_profiles table
        if (!userRole && currentUser) {
          console.log("Role not in metadata, checking database...")
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single()
          
          console.log("Profile lookup result:", { profile, profileError })
          userRole = profile?.role
        }

        // Default to employee if no role found
        const finalRole = userRole || "employee"
        console.log("Final role determined:", finalRole)
        
        // Force a hard redirect to ensure proper page load
        window.location.href = finalRole === "hr" ? "/hr/dashboard" : "/employee/dashboard"
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Sign In" : "Create Account"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Enter your credentials to access your account"
            : "Fill in your details to create a new account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">{error}</div>}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "register" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as "hr" | "employee")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="hr">HR Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => handleOAuthSignIn("github")} disabled={loading}>
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button variant="outline" onClick={() => handleOAuthSignIn("google")} disabled={loading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        </div>

        <div className="text-center text-sm">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/auth/login" className="underline">
                Sign in
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
