# 🧪 Smart Email System - Testing & Monitoring Guide

## 📋 Quick Health Check

Use this checklist to verify your email system is working properly:

### ✅ Configuration Check
- [ ] `RESEND_API_KEY` is set in `.env`
- [ ] `NEXT_PUBLIC_APP_URL` is set in `.env`
- [ ] `CRON_SECRET` is set in `.env` (for production)
- [ ] Resend account is active at https://resend.com

### ✅ Files Exist
- [ ] `src/lib/email.ts` - Email service
- [ ] `src/app/api/notifications/process-delayed/route.ts` - Manual testing endpoint
- [ ] `src/app/api/cron/send-delayed-emails/route.ts` - Production cron endpoint
- [ ] `vercel.json` - Cron configuration (for production)

---

## 🧪 Testing Methods

### Method 1: Check Console Logs (Quickest)

**What to look for:**
```bash
# When RESEND_API_KEY is NOT set (simulation mode):
⚠️  RESEND_API_KEY is not set. Email simulation:
   To: user@example.com
   Subject: New Application Received

# When RESEND_API_KEY IS set (real emails):
✅ Email sent to user@example.com: New Application Received

# Errors:
❌ Error sending email: [error details]
```

**How to test:**
1. Start your dev server: `npm run dev`
2. Perform an action that triggers an email (see "Test Scenarios" below)
3. Watch the terminal/console for email logs

---

### Method 2: Test Immediate Emails (Application Events)

**These send instantly when triggered:**

#### Test 1: New Application Email
```
1. Log in as User A
2. Create a skill proposal
3. Log in as User B
4. Apply to User A's proposal
5. Check console for: "✅ Email sent to [User A's email]: New Application Received"
6. Check User A's email inbox
```

#### Test 2: Application Accepted Email
```
1. Log in as proposal owner
2. Go to dashboard → Pending Requests
3. Accept an application
4. Check console for: "✅ Email sent to [applicant email]: Application Accepted"
5. Check applicant's email inbox
```

#### Test 3: Application Rejected Email
```
1. Log in as proposal owner
2. Go to dashboard → Pending Requests
3. Reject an application
4. Check console for: "✅ Email sent to [applicant email]: Application Rejected"
5. Check applicant's email inbox
```

---

### Method 3: Test Delayed Emails (Message Notifications)

**These send only if message is unread after 1 minute (configurable):**

#### Manual Testing Endpoint
```bash
# Step 1: Send a message
1. Log in as User A
2. Send a message to User B
3. DON'T read it as User B (stay logged out or don't open chat)

# Step 2: Wait 1 minute (or change the delay in the code for faster testing)

# Step 3: Trigger the delayed email processor
Visit: http://localhost:3000/api/notifications/process-delayed

# Step 4: Check the response
{
  "success": true,
  "summary": {
    "processed": 1,
    "emailsSent": 1,
    "skipped": 0,
    "errors": 0
  },
  "details": [
    {
      "notificationId": "...",
      "status": "sent",
      "email": "user@example.com",
      "simulated": false
    }
  ],
  "timestamp": "2025-12-26T18:39:59.000Z"
}
```

**Response Meanings:**
- `processed`: Total notifications checked
- `emailsSent`: Emails successfully sent
- `skipped`: Notifications without email addresses
- `errors`: Failed email sends
- `simulated`: `true` if RESEND_API_KEY not set (test mode)

---

### Method 4: Check Resend Dashboard (Production)

**Best for production monitoring:**

1. Go to https://resend.com/emails
2. Log in to your account
3. View all sent emails with:
   - Delivery status (sent, delivered, bounced, failed)
   - Open rates
   - Click rates
   - Error messages

**What to look for:**
- ✅ **Delivered**: Email successfully sent
- ⚠️ **Bounced**: Invalid email address
- ❌ **Failed**: Resend API error
- 📧 **Opened**: Recipient opened the email

---

## 🎯 Test Scenarios

### Scenario 1: Full Application Flow
> ⚠️ **IMPORTANT (Sandbox Mode):** If you are on the Resend Free Tier, emails to other people will be BLOCKED. User B will only receive the email if their email address is the SAME as your Resend account email.

```
Expected emails: 2

1. User A creates proposal "Learn Guitar"
2. User B applies to proposal
   → Email #1: User A receives "New Application"
3. User A accepts application
   → Email #2: User B receives "Application Accepted"

Check console for 2 email confirmations
Check both inboxes
```

### Scenario 2: Message Notification Flow
```
Expected emails: 1

1. User A sends message to User B
2. User B does NOT read it (stays offline)
3. Wait 1 minute
4. Visit /api/notifications/process-delayed
   → Email: User B receives "Unread Message"

Check console for email confirmation
Check User B's inbox
```

### Scenario 3: No Email Sent (User is Active)
```
Expected emails: 0

1. User A sends message to User B
2. User B reads it immediately (within 1 minute)
3. Visit /api/notifications/process-delayed
   → No email sent (notification is marked as read)

Response should show: "processed": 0
```

---

## 🔍 Debugging Common Issues

### Issue 1: No Emails Sending

**Symptoms:**
- Console shows: `⚠️ RESEND_API_KEY is not set`
- No emails in inbox

**Solution:**
```bash
# Check .env file
cat .env | grep RESEND_API_KEY

# Should show:
RESEND_API_KEY=re_xxxxxxxxxxxxx

# If missing, add it:
echo "RESEND_API_KEY=your_key_here" >> .env

# Restart dev server
npm run dev
```

---

### Issue 2: Emails Simulated (Not Really Sent)

**Symptoms:**
- Console shows: `simulated: true`
- Emails appear in logs but not in inbox

**Cause:** `RESEND_API_KEY` is not set or invalid

**Solution:**
1. Get API key from https://resend.com/api-keys
2. Add to `.env`: `RESEND_API_KEY=re_xxxxxxxxxxxxx`
3. Restart server

---

### Issue 3: Delayed Emails Not Sending

**Symptoms:**
- `/api/notifications/process-delayed` returns `processed: 0`
- Messages exist but no emails

**Possible Causes:**

**A. Messages are being read too quickly**
```
Solution: Wait longer (1 minute) before triggering the endpoint
```

**B. Delay threshold too high**
```
Check: src/app/api/notifications/process-delayed/route.ts
Line 21: const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

For faster testing, change to 10 seconds:
const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
```

**C. Wrong notification type**
```
Only MESSAGE_RECEIVED notifications trigger delayed emails
Check notification type in database
```

---

# 3. Check Vercel logs
# Go to: Vercel Dashboard → Project → Logs
# Filter by: /api/cron
```

---

### Issue 5: Emails Not Delivered to Others (Sandbox Mode)

**Symptoms:**
- Owner gets emails (New Application)
- Applicant does NOT get emails (Accepted/Rejected)
- Resend Dashboard shows "Validation Error" or "Rejected"
- Console shows success, but no email arrives in the other person's inbox.

**Cause: Resend Sandbox Mode.**
By default, Resend Free accounts are in "Sandbox Mode". This means:
*   You can **ONLY** send emails to your own email address (the one you used to sign up for Resend).
*   Any email sent to a different address is automatically blocked by Resend.

**Solution 1 (For Testing):**
To see the "Accepted" or "Rejected" emails in your inbox, you must use your own email address for both sides of the test:
1. Create a test user in the app using your **Resend signup email**.
2. Apply/Interact with that user.
3. Since the recipient is you, Resend will allow the delivery.

**Solution 2 (For Production):**
To send emails to real users (any email address), you must verify a custom domain:
1. Go to [Resend Dashboard → Domains](https://resend.com/domains).
2. Add your domain (e.g., `skillsync.com`).
3. Add the DNS records they provide to your domain provider (GoDaddy, Namecheap, etc.).
4. Once verified, you can send emails to anyone.

**Solution 3 (Check Logs):**
If an email isn't arriving, always check the **[Resend Emails Log](https://resend.com/emails)**. It will tell you the exact reason (e.g., "Unauthorized recipient").


---

## 📊 Monitoring Dashboard

### Key Metrics to Track

**Daily:**
- Total emails sent
- Delivery rate (should be >95%)
- Bounce rate (should be <5%)
- Error rate (should be <1%)

**Weekly:**
- Email open rates
- Click-through rates
- User engagement with notifications

**Monthly:**
- Resend usage vs. free tier limit (100/day, 3000/month)
- Cost if on paid plan

---

## 🛠️ Advanced Testing

### Test Email Templates

Create a test endpoint to preview email templates:

```typescript
// src/app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const result = await sendEmail({
    to: "your-test-email@example.com",
    subject: "Test Email - SkillSync",
    html: `
      <h2>🎉 Test Email</h2>
      <p>This is a test email to verify the email system is working.</p>
      <p>If you receive this, your email configuration is correct!</p>
    `,
  });

  return NextResponse.json(result);
}
```

Visit: `http://localhost:3000/api/test-email`

---

### Load Testing

Test how the system handles multiple emails:

```typescript
// Send 10 test emails
for (let i = 0; i < 10; i++) {
  await sendEmail({
    to: `test${i}@example.com`,
    subject: `Load Test ${i}`,
    html: `<p>Test email ${i}</p>`,
  });
}
```

Monitor:
- Response times
- Error rates
- Resend dashboard for delivery status

---

## 📈 Success Criteria

Your email system is working well if:

✅ **Immediate emails:**
- Send within 1-2 seconds of trigger event
- 100% delivery rate for valid email addresses
- Appear in inbox (not spam)

✅ **Delayed emails:**
- Only send for unread notifications
- Respect the delay threshold (1 minute)
- Don't send duplicates

✅ **User experience:**
- Emails are well-formatted and branded
- Links work correctly
- Mobile-responsive design

✅ **Reliability:**
- No errors in console
- Consistent delivery
- Proper error handling

---

## 🚨 Red Flags

Watch out for these issues:

❌ **High bounce rate (>10%):**
- Invalid email addresses in database
- Email validation not working

❌ **Emails in spam:**
- Need to verify domain with Resend
- Email content triggers spam filters

❌ **Duplicate emails:**
- Cron job running too frequently
- Notifications not being marked as processed

❌ **No emails sending:**
- API key expired or invalid
- Resend account suspended
- Environment variables not set

---

## 🎓 Next Steps

Once basic testing is complete:

1. **Verify domain** (for production):
   - Add DNS records to Resend
   - Use `from: 'SkillSync <noreply@yourdomain.com>'`

2. **Add email preferences**:
   - Let users opt-out of certain emails
   - Add unsubscribe links

3. **Enhance templates**:
   - Add more personalization
   - Include user avatars
   - Better mobile design

4. **Set up monitoring**:
   - Webhook for delivery status
   - Alert on high error rates
   - Dashboard for email analytics

---

## 📞 Support

If you're still having issues:

1. Check Resend documentation: https://resend.com/docs
2. Review conversation history for implementation details
3. Check server logs for detailed error messages
4. Test with a simple email first (use test endpoint above)

---

**Last Updated:** 2025-12-26
**System Version:** Smart Email v1.0
