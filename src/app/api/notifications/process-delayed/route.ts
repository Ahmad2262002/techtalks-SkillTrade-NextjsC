import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getCurrentUserId } from "@/actions/auth";

/**
 * Manual trigger for testing delayed email notifications
 * Call this endpoint to immediately process delayed emails without waiting for cron
 * 
 * Usage: GET /api/notifications/process-delayed
 */
export async function GET(request: NextRequest) {
    try {
        // Optional: Require authentication for manual trigger
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Synchronized Timing: 10 minutes delay for ALL unread notifications
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const unreadNotifications = await prisma.notification.findMany({
            where: {
                // Support multiple notification types for delayed emails
                type: {
                    in: ["MESSAGE_RECEIVED", "APPLICATION_RECEIVED"]
                },
                isRead: false,
                createdAt: {
                    lte: tenMinutesAgo,
                },
            },
            include: {
                user: true,
            },
            take: 50,
        });

        const results = {
            processed: 0,
            emailsSent: 0,
            skipped: 0,
            errors: 0,
            details: [] as any[],
        };

        for (const notification of unreadNotifications) {
            results.processed++;

            if (!notification.user.email) {
                results.skipped++;
                results.details.push({
                    notificationId: notification.id,
                    status: "skipped",
                    reason: "No email address",
                });
                continue;
            }

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

                const emailResult = await sendEmail({
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

                if (emailResult.success) {
                    results.emailsSent++;
                    results.details.push({
                        notificationId: notification.id,
                        status: "sent",
                        type: notification.type,
                        email: notification.user.email,
                    });
                } else {
                    results.errors++;
                    results.details.push({
                        notificationId: notification.id,
                        status: "error",
                        error: emailResult.error,
                    });
                }
            } catch (error) {
                results.errors++;
                results.details.push({
                    notificationId: notification.id,
                    status: "error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                processed: results.processed,
                emailsSent: results.emailsSent,
                skipped: results.skipped,
                errors: results.errors,
            },
            details: results.details,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("Error processing delayed emails:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
