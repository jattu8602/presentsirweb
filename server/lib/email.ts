import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    await resend.emails.send({
      from: 'Present Sir <noreply@presentsir.com>',
      to,
      subject,
      text,
      html,
    })
    console.log('Email sent successfully to:', to)
  } catch (error) {
    console.error('Error sending email:', error)
    // Don't throw error, just log it
  }
}

export function sendWelcomeEmail(
  to: string,
  schoolName: string,
  password: string
) {
  return sendEmail({
    to,
    subject: 'Welcome to Present Sir - School Registration Approved',
    text: `
Dear School Administrator,

Your school "${schoolName}" has been successfully registered with Present Sir. You can now access your school dashboard using the following credentials:

Email: ${to}
Password: ${password}

Please change your password after your first login for security purposes.

Best regards,
Present Sir Team
    `,
  })
}

export function sendRejectionEmail(
  to: string,
  schoolName: string,
  reason: string
) {
  return sendEmail({
    to,
    subject: 'Present Sir - School Registration Update',
    text: `
Dear School Administrator,

We regret to inform you that your school "${schoolName}" registration has been rejected.

Reason: ${reason}

If you believe this is a mistake or would like to provide additional information, please contact our support team.

Best regards,
Present Sir Team
    `,
  })
}

export function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/auth?token=${resetToken}`

  return sendEmail({
    to,
    subject: 'Present Sir - Password Reset Request',
    text: `
Dear User,

You have requested to reset your password. Please click the link below to set a new password:

${resetUrl}

This link will expire in 1 hour. If you did not request this change, please ignore this email.

Best regards,
Present Sir Team
    `,
  })
}
