import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Fetch site settings for the resume path
    const { data: siteSettings } = await supabase
      .from('site_settings')
      .select('cv_pdf_path')
      .limit(1)
      .single()

    if (!siteSettings || !siteSettings.cv_pdf_path) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;"><h1>Resume is currently unavailable. Please check back later.</h1></body></html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Generate public URL
    const { data: publicUrlData } = supabase.storage
      .from('portfolio-media')
      .getPublicUrl(siteSettings.cv_pdf_path, { download: true })

    const cvUrl = publicUrlData.publicUrl

    // Verify if the file actually exists by making a lightweight HEAD request
    try {
      // getPublicUrl returns a URL with ?download=, so we split it to get the raw URL for the HEAD request
      const rawUrl = cvUrl.split('?')[0]
      const verifyRes = await fetch(rawUrl, { method: 'HEAD', cache: 'no-store' })
      
      if (!verifyRes.ok) {
        console.error(`[Resume API] File not found in storage: ${siteSettings.cv_pdf_path}`)
        return new NextResponse(
          `<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;"><h1>Resume is currently unavailable. Please check back later.</h1></body></html>`,
          { status: 404, headers: { 'Content-Type': 'text/html' } }
        )
      }
    } catch (verifyError) {
      console.error(`[Resume API] Error verifying file existence:`, verifyError)
      // Fallback: continue and try to redirect anyway if HEAD request fails for network reasons
    }

    // Instantly redirect to the correct Supabase Storage URL
    return NextResponse.redirect(cvUrl, {
      // use 307 Temporary Redirect so browsers don't cache the redirect itself
      status: 307,
    })

  } catch (error) {
    console.error('[Resume API] Unexpected error:', error)
    return new NextResponse(
      `<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;"><h1>Something went wrong. Please check back later.</h1></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }
}
