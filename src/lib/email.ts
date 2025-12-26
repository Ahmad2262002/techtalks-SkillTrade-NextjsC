
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️  RESEND_API_KEY is not set. Email simulation:");
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        return { success: true, simulated: true };
    }

    try {
        console.log(`🚀 Attempting to send REAL email to ${to}...`);
        const data = await resend.emails.send({
            from: 'SkillSync <notifications@resend.dev>', // Update this with your verified domain
            to,
            subject,
            html: wrapEmailTemplate(html),
            text: text || html.replace(/<[^>]*>?/gm, ''), // Simple fallback for text version
        });

        if (data.error) {
            console.error(`❌ Resend API Error for ${to}:`, data.error);
            return { success: false, error: data.error };
        }

        console.log(`✅ Email successfully accepted by Resend for ${to}: ${subject}`);
        return { success: true, data };
    } catch (error) {
        console.error(`❌ Fatal Error sending email to ${to}:`, error);
        return { success: false, error };
    }
}

/**
 * Wraps email content in a consistent branded template
 */
function wrapEmailTemplate(content: string): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SkillSync Notification</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">SkillSync</h1>
                                    <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Exchange Skills, Build Connections</p>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    ${content}
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                                    <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                                        You're receiving this email because you're a member of SkillSync.
                                    </p>
                                    <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                                        © ${new Date().getFullYear()} SkillSync. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}
