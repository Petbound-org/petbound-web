import { LoginForm } from "@/components/login-form"

type SearchParams = { type?: string }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { type } = await searchParams
  const defaultAccountType = type === "shelter" ? "shelter" : "user"

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm defaultAccountType={defaultAccountType} />
    </div>
  )
}
