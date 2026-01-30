import Link from "next/link"
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" asChild className="gap-2 self-start -ml-2">
          <Link href="/login">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </Button>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
