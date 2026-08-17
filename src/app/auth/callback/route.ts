import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  
  try {
    console.log('[Auth Callback] Starting PKCE exchange flow...')
    console.log('[Auth Callback] Request URL:', request.url)
    console.log('[Auth Callback] Next URL Origin:', request.nextUrl.origin)
    console.log('[Auth Callback] Extracted code:', code ? 'Code present' : 'Code missing')

    if (code) {
      console.log('[Auth Callback] Creating Supabase client...')
      const supabase = await createClient()
      
      console.log('[Auth Callback] Calling exchangeCodeForSession()...')
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        console.log('[Auth Callback] Exchange successful! Building redirect URL...')
        
        // Hardcoded to reset-password since this callback is exclusively used for recovery
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/admin/reset-password'
        redirectUrl.searchParams.delete('code')
        
        console.log('[Auth Callback] Final Redirect URL:', redirectUrl.toString())
        return NextResponse.redirect(redirectUrl)
      } else {
        console.error('[Auth Callback] Exchange Error:', error.message)
      }
    }

    console.warn('[Auth Callback] Falling back to login page redirect due to missing code or exchange failure')
    const errorUrl = request.nextUrl.clone()
    errorUrl.pathname = '/admin/login'
    errorUrl.searchParams.delete('code')
    errorUrl.searchParams.set('message', 'Invalid or expired reset link.')
    return NextResponse.redirect(errorUrl)
    
  } catch (err) {
    console.error('[Auth Callback] FATAL INTERNAL ERROR:', err)
    const fatalErrorUrl = request.nextUrl.clone()
    fatalErrorUrl.pathname = '/admin/login'
    fatalErrorUrl.searchParams.delete('code')
    fatalErrorUrl.searchParams.set('message', 'Internal server error during authentication.')
    return NextResponse.redirect(fatalErrorUrl)
  }
}
