import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}) {
  const recipients = Array.isArray(to) ? to : [to];
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: recipients,
    subject,
    text,
    html,
  });
}

export async function sendPurchaseConfirmationEmail({
  to,
  userName,
  productName,
}: {
  to: string;
  userName: string;
  productName: string;
}) {
  return sendEmail({
    to,
    subject: `Thank you for purchasing ${productName}`,
    html: `
     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: green;">Purchase Successful</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for purchasing <strong>${productName}</strong>. You can access your content at the below link.</p>
        <a href="/courses" style="background-color: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Reset Password</a>
        <p>Best regards,<br>Your App Team</p>
      </div>
    <p>Hi ${userName},</p><p>Thank you for purchasing <strong>${productName}</strong>. You can access your content at <a href="/courses">My Courses</a>.</p>
    
    `,
    text: `Hi ${userName},\n\nThank you for purchasing ${productName}. You can access your content at /courses.`,
  });
}
