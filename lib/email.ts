import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || "mondalrohan201@gmail.com",
    pass: process.env.EMAIL_PASS || "vwpg xiry lmgg jgbp",
  },
});

export async function sendVerificationEmail(email: string, otp: string) {
  try {
    console.log("📤 Attempting to send email to:", email);
    
    const mailOptions = {
      from: `"BizTradeFairs" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2563eb;">BizTradeFairs Email Verification</h2>
          <p>Hello,</p>
          <p>Your OTP code for email verification is:</p>
          <div style="background: #f3f4f6; padding: 16px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 32px; color: #2563eb; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <br/>
          <p>Best regards,<br/>The BizTradeFairs Team</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", {
      to: email,
      messageId: result.messageId,
      response: result.response
    });
    
    return true;
  } catch (error: any) {
    console.error("🔥 Email sending failed:", {
      error: error.message,
      to: email,
      code: error.code,
      command: error.command
    });
    throw new Error("Failed to send verification email");
  }
}

export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log("✅ Email configuration is correct");
    return true;
  } catch (error: any) {
    console.error("❌ Email configuration error:", {
      error: error.message,
      code: error.code
    });
    return false;
  }
}