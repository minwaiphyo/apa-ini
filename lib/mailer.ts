import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP not configured, email would be sent to:', to, subject)
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export async function sendRegistrationConfirmation({
  to,
  activityTitle,
  startsAt,
  location,
}: {
  to: string
  activityTitle: string
  startsAt: Date
  location: string
}) {
  const formattedDate = new Date(startsAt).toLocaleString('en-SG', {
    dateStyle: 'full',
    timeStyle: 'short',
  })

  await sendEmail({
    to,
    subject: `Registration Confirmed: ${activityTitle}`,
    html: `
      <h2>Registration Confirmed!</h2>
      <p>You have successfully registered for:</p>
      <h3>${activityTitle}</h3>
      <p><strong>Date & Time:</strong> ${formattedDate}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p>We look forward to seeing you there!</p>
    `,
    text: `Registration Confirmed: ${activityTitle}\n\nDate & Time: ${formattedDate}\nLocation: ${location}`,
  })
}

export async function sendStaffAlert({
  to,
  subject,
  message,
}: {
  to: string | string[]
  subject: string
  message: string
}) {
  const recipients = Array.isArray(to) ? to.join(', ') : to
  await sendEmail({
    to: recipients,
    subject: `[MindsHub Alert] ${subject}`,
    html: `<h2>${subject}</h2><p>${message}</p>`,
    text: `${subject}\n\n${message}`,
  })
}
