"use client"

import { getSupabaseClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { UserProfile } from "@/lib/types"
import { LogOut, User } from "lucide-react"
import Link from "next/link"

interface NavbarProps {
  user?: UserProfile | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">HR Management</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.full_name}</span>
                <span className="text-xs text-muted-foreground capitalize">({user.role})</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
