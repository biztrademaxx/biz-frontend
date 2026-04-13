import nodemailer from "nodemailer"

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "mondalrohan201@gmail.com",
    pass: process.env.EMAIL_PASS || "vwpg xiry lmgg jgbp",
  },
})

export async function sendBadgeEmail(email: string, badgeDataUrl: string, attendeeName: string, eventName: string) {
  try {
    // Convert data URL to buffer
    const base64Data = badgeDataUrl.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")

    // Send email with badge as attachment
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your Event Badge - ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${attendeeName},</h2>
          <p>Your event badge for <strong>${eventName}</strong> is ready!</p>
          <p>Please find your badge attached to this email. You can print it or save it to your mobile device.</p>
          <p>We look forward to seeing you at the event!</p>
          <br>
          <p>Best regards,<br>The Event Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `badge-${attendeeName.replace(/\s+/g, "-")}.png`,
          content: buffer,
          contentType: "image/png",
        },
      ],
    })

    console.log("[v0] Badge email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("[v0] Error sending badge email:", error)
    throw error
  }
}
