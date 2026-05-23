'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitContactForm(formData: FormData) {
  try {
    // 1. Basic spam check (honeypot)
    const honeypot = formData.get('website_url')
    if (honeypot) {
      // Spam bot filled the hidden field, silently reject
      return { success: true }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!name || !email || !subject || !message) {
      return { success: false, error: 'Please fill all required fields.' }
    }

    // 2. Save to Supabase
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert([
        {
          sender_name: name,
          sender_email: email,
          sender_phone: phone,
          subject: subject,
          message: message,
          status: 'UNREAD'
        }
      ])

    if (dbError) {
      console.error('Supabase Error:', dbError)
      return { success: false, error: 'Failed to save message. Please try again later.' }
    }

    // 3. Send Email Notification via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: ['sohel82.shaikh@gmail.com'],
      subject: `New Portfolio Message: ${subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F1014; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a1a;">
          <div style="padding: 32px; background: linear-gradient(135deg, rgba(255,1,79,0.1) 0%, rgba(15,16,20,1) 100%); border-bottom: 1px solid #1a1a1a;">
            <h2 style="margin: 0; color: #ff014f; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">New Message Received</h2>
            <p style="margin: 8px 0 0 0; color: #888888; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Portfolio Contact Form</p>
          </div>
          
          <div style="padding: 32px;">
            <div style="margin-bottom: 24px;">
              <p style="margin: 0 0 4px 0; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Sender Details</p>
              <div style="background-color: #16171B; padding: 16px; border-radius: 12px; border: 1px solid #1a1a1a;">
                <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #ff014f; text-decoration: none;">${email}</a></p>
                <p style="margin: 0; font-size: 15px;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <p style="margin: 0 0 4px 0; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Message Subject</p>
              <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #ffffff;">${subject}</h3>
              
              <p style="margin: 0 0 4px 0; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Message Content</p>
              <div style="background-color: #16171B; padding: 20px; border-radius: 12px; border: 1px solid #1a1a1a; white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #e5e7eb;">${message}</div>
            </div>
          </div>
          
          <div style="padding: 24px 32px; background-color: #0a0a0c; text-align: center; border-top: 1px solid #1a1a1a;">
            <p style="margin: 0; color: #666666; font-size: 12px;">This email was sent automatically from your portfolio website.</p>
          </div>
        </div>
      `
    });

    if (emailError) {
      console.error('Resend Error:', emailError)
      // Even if email fails, message was saved, so we could return success, or tell user about failure.
      // But for a contact form, it's safer to consider it a success so they don't retry endlessly, 
      // as it's safely in the database.
      return { success: true, warning: 'Message saved, but email notification failed.' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Form Submit Error:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
