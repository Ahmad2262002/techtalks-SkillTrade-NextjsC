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

        // Find unread MESSAGE_RECEIVED notifications older than 1 minute
        const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

        const unreadNotifications = await prisma.notification.findMany({
            where: {
                type: "MESSAGE_RECEIVED",
                isRead: false,
                createdAt: {
                    lte: oneMinuteAgo,
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
                const emailResult = await sendEmail({
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

                if (emailResult.success) {
                    results.emailsSent++;
                    results.details.push({
                        notificationId: notification.id,
                        status: "sent",
                        email: notification.user.email,
                        simulated: emailResult.simulated || false,
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
