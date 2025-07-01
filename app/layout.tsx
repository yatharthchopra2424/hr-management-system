import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { getUserProfile } from "@/lib/auth"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "HR Management System",
  description: "Complete HR management solution with assessments and analytics",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userProfile = await getUserProfile()
  const headersList = headers()
  const pathname = headersList.get("x-pathname") || ""
  
  // Don't show navbar on auth pages
  const isAuthPage = pathname.startsWith("/auth/")

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isAuthPage && <Navbar user={userProfile} />}
        <main className={`min-h-screen bg-background ${!isAuthPage ? "" : "pt-0"}`}>
          {children}
        </main>
      </body>
    </html>
  )
}
