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

        // Synchronized Timing: 10 minutes delay for ALL unread notifications
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const unreadNotifications = await prisma.notification.findMany({
            where: {
                type: {
                    in: ["MESSAGE_RECEIVED", "APPLICATION_RECEIVED"]
                },
                isRead: false,
                createdAt: {
                    lte: tenMinutesAgo, // Created at least 10 minutes ago
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
                // Determine email content based on notification type
                let subject = "New Notification on SkillSync";
                let title = "SkillSync Notification";
                let actionText = "View Notification";

                if (notification.type === "MESSAGE_RECEIVED") {
                    subject = "You have unread messages on SkillSync";
                    title = "💬 Unread Message";
                    actionText = "View Message";
                } else if (notification.type === "APPLICATION_RECEIVED") {
                    subject = "New talent application for your proposal";
                    title = "📩 New Application";
                    actionText = "Review Application";
                }

                await sendEmail({
                    to: notification.user.email,
                    subject: subject,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6366f1;">${title}</h2>
              <p>${notification.message}</p>
              <p>This has been waiting for your attention for over 10 minutes.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}${notification.link}" 
                   style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 15px;">
                  ${actionText}
                </a>
              </p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                You're receiving this email because you have unread notifications. 
                Log in to SkillSync to manage your notification preferences.
              </p>
            </div>
          `,
                });

                emailsSent.push(notification.id);

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
