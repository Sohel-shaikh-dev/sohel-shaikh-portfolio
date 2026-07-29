import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  try {
    console.log('[Auth Callback] Starting PKCE exchange flow...')
    console.log('[Auth Callback] Request URL:', request.url)
    console.log('[Auth Callback] Origin:', origin)
    console.log('[Auth Callback] Extracted code:', code ? 'Code present' : 'Code missing')

    if (code) {
      console.log('[Auth Callback] Creating Supabase client...')
      const supabase = await createClient()
      
      console.log('[Auth Callback] Calling exchangeCodeForSession()...')
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        console.log('[Auth Callback] Exchange successful! Building redirect URL...')
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalhost = process.env.NODE_ENV === 'development'

        // Hardcoded to reset-password since this callback is exclusively used for recovery
        const next = '/admin/reset-password'
        let redirectUrl = ''
        
        if (isLocalhost) {
          redirectUrl = `${origin}${next}`
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`
        } else {
          redirectUrl = `${origin}${next}`
        }
        
        console.log('[Auth Callback] Final Redirect URL:', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      } else {
        console.error('[Auth Callback] Exchange Error:', error.message)
      }
    }

    console.warn('[Auth Callback] Falling back to login page redirect due to missing code or exchange failure')
    return NextResponse.redirect(`${origin}/admin/login?message=Invalid or expired reset link.`)
    
  } catch (err) {
    console.error('[Auth Callback] FATAL INTERNAL ERROR:', err)
    const fallbackOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${fallbackOrigin}/admin/login?message=Internal server error during authentication.`)
  }
}
