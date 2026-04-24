import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const { type, to, name, eventTitle, eventDate, eventLocation } = await request.json()

  let subject = ''
  let html = ''

  if (type === 'pending') {
    subject = 'Your application is being reviewed'
    html = `
      <p>Hi ${name},</p>
      <p>Thanks for signing up. Your application is currently being reviewed by an admin.</p>
      <p>You will receive an email as soon as you are approved and can access the app.</p>
      <p>Talk soon,<br/>The Team</p>
    `
  }

  if (type === 'approved') {
    subject = "You are approved - welcome!"
    html = `
      <p>Hi ${name},</p>
      <p>Great news - your application has been approved. You can now log in and see upcoming events.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Log in now</a>
      <p>Welcome aboard,<br/>The Team</p>
    `
  }

  if (type === 'removed') {
    subject = 'Your account has been updated'
    html = `
      <p>Hi ${name},</p>
      <p>Your account access has been removed. If you think this is a mistake please reply to this email.</p>
      <p>The Team</p>
    `
  }

  if (type === 'event_created') {
    subject = "New event: " + eventTitle
    html = `
      <p>Hi ${name},</p>
      <p>A new event has been posted:</p>
      <h2>${eventTitle}</h2>
      <p><strong>When:</strong> ${eventDate}</p>
      <p><strong>Where:</strong> ${eventLocation}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View and RSVP</a>
      <p>See you there,<br/>The Team</p>
    `
  }

  if (type === 'event_reminder_7') {
    subject = "Reminder: " + eventTitle + " is in 7 days"
    html = `
      <p>Hi ${name},</p>
      <p>Just a reminder that <strong>${eventTitle}</strong> is coming up in 7 days.</p>
      <p><strong>When:</strong> ${eventDate}</p>
      <p><strong>Where:</strong> ${eventLocation}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View and RSVP</a>
      <p>See you there,<br/>The Team</p>
    `
  }

  if (type === 'event_reminder_1') {
    subject = "Tomorrow: " + eventTitle
    html = `
      <p>Hi ${name},</p>
      <p><strong>${eventTitle}</strong> is tomorrow!</p>
      <p><strong>When:</strong> ${eventDate}</p>
      <p><strong>Where:</strong> ${eventLocation}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View details</a>
      <p>See you tomorrow,<br/>The Team</p>
    `
  }

  const { error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject,
    html
  })

  if (error) {
    return Response.json({ error }, { status: 500 })
  }

  return Response.json({ success: true })
}