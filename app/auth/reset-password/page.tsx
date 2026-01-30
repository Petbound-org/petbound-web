'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabaseClientBrowser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Lock } from 'lucide-react'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createBrowserClient(), [])
  const [step, setStep] = useState<'exchanging' | 'form' | 'done' | 'error'>('exchanging')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const paramKeys = typeof window !== 'undefined' ? Array.from(new URLSearchParams(window.location.search).keys()) : []
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/45c63706-0aeb-433c-b8f8-2ac515f097d3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/reset-password/page.tsx:params',message:'reset-password params',data:{paramKeys,hasCode:!!code,hasTokenHash:!!tokenHash,type:type||null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4-reset-params'})}).catch(()=>{});
    // #endregion

    const proceedWithSession = () => setStep('form')

    if (tokenHash && type) {
      const doVerify = async () => {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as 'recovery' | 'email' | 'magiclink' | 'signup' })
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/45c63706-0aeb-433c-b8f8-2ac515f097d3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/reset-password/page.tsx:verifyOtp',message:error?'verifyOtp failed':'verifyOtp ok',data:{errorMsg:error?.message||null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5-reset-verify'})}).catch(()=>{});
        // #endregion
        if (error) {
          setStep('error')
          setErrorMessage(error.message)
          return
        }
        proceedWithSession()
      }
      doVerify()
      return
    }

    if (code) {
      const exchange = async () => {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/45c63706-0aeb-433c-b8f8-2ac515f097d3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/reset-password/page.tsx:exchange',message:error?'exchange failed':'exchange ok',data:{errorMsg:error?.message||null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6-reset-exchange'})}).catch(()=>{});
        // #endregion
        if (error) {
          setStep('error')
          setErrorMessage(error.message)
          return
        }
        proceedWithSession()
      }
      exchange()
      return
    }

    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        proceedWithSession()
        return
      }
      setStep('error')
      setErrorMessage('Invalid or expired reset link. Please request a new one.')
    }
    checkExistingSession()
  }, [searchParams, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setStep('done')
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'exchanging') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying your link...</p>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link invalid or expired</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request a new reset link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Password updated</CardTitle>
            <CardDescription>Your password has been changed. You can now sign in with your new password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Set new password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
