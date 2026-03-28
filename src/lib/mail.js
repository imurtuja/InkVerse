import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"InkVerse Verification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🔐 Your InkVerse Verification Code: ${otp}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 40px; margin-bottom: 8px;">🪶</div>
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">InkVerse</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 5px; font-weight: 500;">Where Code Meets Poetry</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center;">Verify Your Email</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 24px; text-align: center;">
            Welcome to InkVerse! To complete your signup, please use the 6-digit verification code below. This code will expire in 10 minutes.
          </p>
          
          <div style="margin: 35px 0; text-align: center;">
            <div style="display: inline-block; padding: 16px 32px; background-color: #4f46e5; border-radius: 12px; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #ffffff;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; line-height: 20px; text-align: center; margin-top: 30px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          © 2026 InkVerse Platform. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"InkVerse" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🚀 Welcome to InkVerse, ${name}!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 10px;">🪶</div>
          <h1 style="color: #4f46e5; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px;">InkVerse</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 5px; font-weight: 500;">Your Creative Journey Starts Here</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 20px;">Welcome Aboard, ${name}! ✨</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 26px;">
            We're thrilled to have you in the <b>InkVerse</b> community. Whether you're here to share elegant code snippets or soulful poetry, you've found your home.
          </p>
          
          <div style="margin: 30px 0;">
            <p style="color: #111827; font-weight: 600; margin-bottom: 10px;">Here's what you can do now:</p>
            <ul style="color: #4b5563; padding-left: 20px; line-height: 24px;">
              <li>✍️ Publish your first "Ink" (Code or Poetry)</li>
              <li>🔍 Explore trending creations in the Feed</li>
              <li>👤 Personalize your profile and bio</li>
              <li>🤝 Follow developers and writers you love</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXTAUTH_URL}/feed" style="display: inline-block; padding: 14px 30px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.39);">
              Step Into the Verse
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          © 2026 InkVerse Platform. All rights reserved.<br/>
          If you have any questions, just reply to this email!
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};
