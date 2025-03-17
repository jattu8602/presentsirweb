import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Email plain text content
 * @param {string} [options.from] - Sender email address (defaults to environment variable)
 * @returns {Promise<Object>} The send result
 */
export async function sendEmail({ to, subject, html, text, from }) {
  try {
    const fromEmail = from || process.env.EMAIL_FROM || 'noreply@presentsir.com'

    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    })

    return {
      success: true,
      id: result.id,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Send a welcome email to a new user
 * @param {Object} user - User information
 * @param {string} user.email - User's email address
 * @param {string} user.name - User's name
 * @returns {Promise<Object>} The send result
 */
export async function sendWelcomeEmail(user) {
  const subject = 'Welcome to Present Sir!'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4f46e5;">Welcome to Present Sir!</h1>
      <p>Hello ${user.name},</p>
      <p>Thank you for joining Present Sir. We're excited to have you on board!</p>
      <p>With Present Sir, you can easily manage your school's attendance, fees, and more.</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 5px 0 0; font-weight: bold;">The Present Sir Team</p>
      </div>
    </div>
  `

  const text = `
    Welcome to Present Sir!

    Hello ${user.name},

    Thank you for joining Present Sir. We're excited to have you on board!

    With Present Sir, you can easily manage your school's attendance, fees, and more.

    If you have any questions, please don't hesitate to contact our support team.

    Best regards,
    The Present Sir Team
  `

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text,
  })
}

/**
 * Send a password reset email
 * @param {Object} user - User information
 * @param {string} user.email - User's email address
 * @param {string} user.name - User's name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} The send result
 */
export async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`

  const subject = 'Reset Your Password'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4f46e5;">Reset Your Password</h1>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset for your Present Sir account.</p>
      <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
      <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 5px 0 0; font-weight: bold;">The Present Sir Team</p>
      </div>
    </div>
  `

  const text = `
    Reset Your Password

    Hello ${user.name},

    You requested a password reset for your Present Sir account.

    Please visit the following link to reset your password:
    ${resetUrl}

    This link is valid for 1 hour.

    If you didn't request this, please ignore this email or contact support if you have concerns.

    Best regards,
    The Present Sir Team
  `

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text,
  })
}
