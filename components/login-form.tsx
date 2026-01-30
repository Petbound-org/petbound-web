'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createBrowserClient } from '@/lib/supabaseClientBrowser'
import { createShelterProfile } from '@/lib/server-actions'
import { Mail, Loader2, Building2, User } from 'lucide-react'

export type AccountType = 'user' | 'shelter'

function LoginFormContent({ setMessage, setMessageType }: { setMessage: (msg: string | null) => void, setMessageType: (type: 'error' | 'success') => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'auth_failed') {
        setMessage('Authentication failed. Please try again.')
        setMessageType('error')
      } else if (errorParam === 'no_code') {
        setMessage('No authorization code received. Please try again.')
        setMessageType('error')
      }
    }
  }, [searchParams, setMessage, setMessageType])

  return null
}

export function LoginForm({ defaultAccountType = 'user' }: { defaultAccountType?: AccountType }) {
  const [accountType, setAccountType] = useState<AccountType>(defaultAccountType)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [shelterName, setShelterName] = useState('')
  const [shelterPhone, setShelterPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'error' | 'success'>('error')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const isShelter = accountType === 'shelter'
  const showShelterFields = isShelter && isSignUp

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: isShelter
              ? { role: 'shelter', shelter_name: shelterName.trim(), shelter_phone: shelterPhone.trim() || undefined }
              : { role: 'user' },
          },
        })

        if (signUpError) throw signUpError

        if (isShelter && data.user && data.session && shelterName.trim()) {
          const result = await createShelterProfile(shelterName.trim(), shelterPhone.trim() || null)
          if (!result.ok) {
            setMessage(result.error)
            setMessageType('error')
            setIsLoading(false)
            return
          }
        }

        setMessage(
          isShelter && shelterName.trim()
            ? 'Account created. Check your email (and spam folder) to confirm your account.'
            : 'Account created. Check your email (and spam folder) to confirm your account.'
        )
        setMessageType('success')
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        const role = (data.user?.user_metadata?.role as string) ?? 'user'
        if (role === 'shelter') {
          router.push('/shelter/dashboard')
        } else {
          router.push('/')
        }
        router.refresh()
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message)
      } else {
        setMessage('An unexpected error occurred')
      }
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
        <CardDescription>
          {isShelter
            ? isSignUp
              ? 'Create a shelter account to list pets'
              : 'Sign in to your shelter account'
            : isSignUp
              ? 'Create an account to get started'
              : 'Enter your credentials to access your account'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex rounded-lg border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => {
              setAccountType('user')
              setMessage(null)
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              accountType === 'user' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="h-4 w-4" />
            User
          </button>
          <button
            type="button"
            onClick={() => {
              setAccountType('shelter')
              setMessage(null)
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              accountType === 'shelter' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Shelter
          </button>
        </div>

        <Suspense fallback={null}>
          <LoginFormContent setMessage={setMessage} setMessageType={setMessageType} />
        </Suspense>

        {message && (
          <div
            className={`p-3 text-sm rounded-md border ${messageType === 'error'
                ? 'text-destructive bg-destructive/10 border-destructive/20'
                : 'text-green-700 bg-green-100 border-green-200'
              }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {showShelterFields && (
            <>
              <div className="space-y-2">
                <label htmlFor="shelter-name" className="text-sm font-medium">
                  Shelter name
                </label>
                <Input
                  id="shelter-name"
                  type="text"
                  placeholder="e.g. Happy Paws Rescue"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
                  required={isShelter && isSignUp}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="shelter-phone" className="text-sm font-medium">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="shelter-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={shelterPhone}
                  onChange={(e) => setShelterPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isSignUp ? 'Signing up...' : 'Signing in...'}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage(null)
            }}
            className="text-primary hover:underline"
            disabled={isLoading}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="text-center text-sm">
          {!isSignUp && (
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
