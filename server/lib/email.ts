import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})



export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

  await transporter.sendMail({
    from: '"Present Sir" <no-reply@presentsir.com>',
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Present Sir</h1>
        <p>Hi there,</p>
        <p>Someone requested a password reset for your account. If this was you, click the link below to reset your password:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Thanks,<br>The Present Sir Team</p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(email: string, password: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth`

  await transporter.sendMail({
    from: '"Present Sir" <no-reply@presentsir.com>',
    to: email,
    subject: 'Welcome to Present Sir - Your Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Welcome to Present Sir!</h1>
        <p>Congratulations! Your school registration has been approved.</p>
        <p>You can now log in to your account using the following credentials:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p>We recommend changing your password after your first login.</p>
        <p style="margin: 20px 0;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
        </p>
        <p>You can also log in using Google authentication with the same email address.</p>
        <p>Thanks for choosing Present Sir!</p>
        <p>Best regards,<br>The Present Sir Team</p>
      </div>
    `,
  })
}
