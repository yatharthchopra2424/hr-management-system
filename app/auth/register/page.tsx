import { AuthForm } from "@/components/auth-form"

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-3.5rem)] py-8">
      <AuthForm mode="register" />
    </div>
  )
}
