import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// /**
//  * Background job to send delayed email notifications
//  * This endpoint should be called by a cron job every 10-15 minutes
//  * 
//  * Setup with Vercel Cron:
//  * Add to vercel.json:
//  * {
//  *   "crons": [{
//  *     "path": "/api/cron/send-delayed-emails",
//  *     "schedule": "*/10  "
//        }]
//   }
//  **/
export async function GET(request: NextRequest) {
    try {
        // Security: Verify this is called by Vercel Cron or has auth token
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find unread MESSAGE_RECEIVED notifications older than 1 minute
        const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

        const unreadNotifications = await prisma.notification.findMany({
            where: {
                type: "MESSAGE_RECEIVED",
                isRead: false,
                createdAt: {
                    lte: oneMinuteAgo, // Created at least 1 minute ago
                },
            },
            include: {
                user: true,
            },
            take: 50, // Process in batches
        });

        const emailsSent: string[] = [];
        const errors: string[] = [];

        for (const notification of unreadNotifications) {
            // Skip if user has no email
            if (!notification.user.email) continue;

            try {
                await sendEmail({
                    to: notification.user.email,
                    subject: "You have unread messages on SkillSync",
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6366f1;">💬 Unread Message</h2>
              <p>${notification.message}</p>
              <p>You received this message over 10 minutes ago and haven't read it yet.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}${notification.link}" 
                   style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 15px;">
                  View Message
                </a>
              </p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                You're receiving this email because you have unread messages. 
                Log in to SkillSync to manage your notification preferences.
              </p>
            </div>
          `,
                });

                emailsSent.push(notification.id);

                // Mark notification as processed (we could add a field for this, but for now we'll leave it)
                // Optionally: Update notification to mark that email was sent

            } catch (error) {
                console.error(`Failed to send email for notification ${notification.id}:`, error);
                errors.push(notification.id);
            }
        }

        return NextResponse.json({
            success: true,
            processed: unreadNotifications.length,
            emailsSent: emailsSent.length,
            errors: errors.length,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("Error in delayed email cron job:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
