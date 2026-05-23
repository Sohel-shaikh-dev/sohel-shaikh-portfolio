import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Use a secret key to secure this webhook
    const secret = request.headers.get('x-webhook-secret')
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    // Determine which table was updated from the Supabase webhook payload
    const table = payload.table
    
    if (table) {
      // Revalidate the tag corresponding to the table name
      revalidateTag(table, 'max')
      console.log(`Revalidated tag: ${table}`)
    } else {
      // Fallback: revalidate everything or common tags
      revalidateTag('projects', 'max')
      revalidateTag('case_studies', 'max')
      revalidateTag('certifications', 'max')
      revalidateTag('experiences', 'max')
    }

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: 'Error processing webhook' }, { status: 500 })
  }
}
