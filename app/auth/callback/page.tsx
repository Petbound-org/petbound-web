'use client'

import { useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabaseClientBrowser'
import { createShelterProfile } from '@/lib/server-actions'
import { Loader2 } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createBrowserClient(), [])

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const paramKeys = typeof window !== 'undefined' ? Array.from(new URLSearchParams(window.location.search).keys()) : []
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/45c63706-0aeb-433c-b8f8-2ac515f097d3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/callback/page.tsx:handleCallback',message:'callback params',data:{paramKeys,hasCode:!!code,codeLen:code?.length,hasTokenHash:!!tokenHash,type:type||null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1-params'})}).catch(()=>{});
      // #endregion

      if (tokenHash && type) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as 'email' | 'recovery' | 'magiclink' | 'signup' })
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/45c63706-0aeb-433c-b8f8-2ac515f097d3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/callback/page.tsx:verifyOtp',message:error?'verifyOtp failed':'verifyOtp ok',data:{errorMsg:error?.message||null,errorCode:error?.code||null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2-verifyOtp'})}).catch(()=>{});
        // #endregion
        if (error) {
          router.push('/login?error=auth_failed')
          return
        }
        if (type === 'recovery') {
          router.push('/auth/reset-password')
          router.refresh()
          return
        }
        const role = (data.user?.user_metadata?.role as string) ?? 'user'
        if (role === 'shelter') {
          const shelterName = data.user?.user_metadata?.shelter_name as string | undefined
          const shelterPhone = data.user?.user_metadata?.shelter_phone as string | undefined
          if (shelterName?.trim()) {
            await createShelterProfile(shelterName.trim(), shelterPhone?.trim() || null)
          }
          router.push('/shelter/dashboard')
        } else {
          router.push('/')
        }
        router.refresh()
        return
      }

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/45c63706-0aeb-433c-b8f8-2ac515f097d3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/callback/page.tsx:exchangeCode',message:error?'exchange failed':'exchange ok',data:{errorMsg:error?.message||null,errorCode:error?.code||null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3-exchange'})}).catch(()=>{});
        // #endregion
        if (error) {
          router.push('/login?error=auth_failed')
          return
        }

        const role = (data.user?.user_metadata?.role as string) ?? 'user'
        if (role === 'shelter') {
          const shelterName = data.user?.user_metadata?.shelter_name as string | undefined
          const shelterPhone = data.user?.user_metadata?.shelter_phone as string | undefined
          if (shelterName?.trim()) {
            await createShelterProfile(shelterName.trim(), shelterPhone?.trim() || null)
          }
          router.push('/shelter/dashboard')
        } else {
          router.push('/')
        }
        router.refresh()
      } else {
        router.push('/login?error=no_code')
      }
    }

    handleCallback()
  }, [searchParams, router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
