# Smart Email Notification System - Setup Guide

## Overview

The smart email notification system uses a **hybrid approach**:

### ✅ Immediate Emails (Critical Events)
- **New Application Received** - Proposal owners get instant email
- **Application Accepted** - Applicants get instant email with celebration
- **Application Rejected** - Applicants get instant email with encouragement

### ⏱️ Delayed Emails (Non-Critical Events)
- **New Messages** - Only sent if notification remains unread after 10 minutes
- Prevents email spam when users are actively using the app

---

## Setup Instructions

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your domain (or use their test domain `onboarding@resend.dev`)
4. Copy your API key

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Job Security (generate a random string)
CRON_SECRET=your_random_secret_here_use_openssl_rand_hex_32
```

**Generate CRON_SECRET:**
```bash
# On Mac/Linux:
openssl rand -hex 32

# On Windows PowerShell:
-join ((48..57) + (97..102) | Get-Random -Count 64 | % {[char]$_})
```

### 3. Update Email Sender (Optional)

Once you verify your domain in Resend, update the sender in `src/lib/email.ts`:

```typescript
from: 'SkillSync <notifications@yourdomain.com>'
```

---

## How It Works

### Immediate Emails Flow

```
User applies to proposal
    ↓
Application created
    ↓
Email sent IMMEDIATELY to proposal owner
    ↓
Owner accepts/rejects
    ↓
Email sent IMMEDIATELY to applicant
```

### Delayed Emails Flow

```
User sends message
    ↓
Notification created (isRead: false)
    ↓
Wait 10 minutes (cron job checks every 10 min)
    ↓
Is notification still unread?
    ├─ YES → Send email reminder
    └─ NO  → Skip (user saw it in-app)
```

---

## Testing

### Test Immediate Emails

1. Create an application:
```typescript
// The proposal owner will receive an immediate email
```

2. Accept/Reject an application:
```typescript
// The applicant will receive an immediate email
```

### Test Delayed Emails (Manual Trigger)

1. Send a message in a swap
2. Wait 10+ minutes (or change the time check in the code for testing)
3. Call the manual trigger endpoint:

```bash
# While logged in, visit:
http://localhost:3000/api/notifications/process-delayed
```

This will immediately process any unread notifications older than 10 minutes.

### Test Delayed Emails (Cron - Production Only)

The cron job only works on Vercel in production. To test locally:

1. Temporarily reduce the delay to 1 minute in both files:
   - `src/app/api/cron/send-delayed-emails/route.ts`
   - `src/app/api/notifications/process-delayed/route.ts`

2. Change:
```typescript
const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
// to
const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
```

3. Use the manual trigger endpoint

---

## Deployment to Vercel

1. Push your code to GitHub
2. Deploy to Vercel
3. Add environment variables in Vercel dashboard:
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
   - `CRON_SECRET`

4. The cron job will automatically run every 10 minutes

---

## Monitoring

### Check Cron Job Logs (Vercel)

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Logs" tab
4. Filter by `/api/cron/send-delayed-emails`

### Manual Check

Visit: `https://your-domain.com/api/notifications/process-delayed`

Response shows:
```json
{
  "success": true,
  "summary": {
    "processed": 5,
    "emailsSent": 3,
    "skipped": 1,
    "errors": 1
  },
  "details": [...]
}
```

---

## Email Templates

All emails use responsive HTML with:
- ✅ Professional styling
- ✅ Clear call-to-action buttons
- ✅ Branded colors
- ✅ Mobile-friendly design

### Customization

Edit email templates in:
- `src/actions/applications.ts` - Application emails
- `src/app/api/cron/send-delayed-emails/route.ts` - Message emails
- `src/app/api/notifications/process-delayed/route.ts` - Message emails

---

## Troubleshooting

### Emails Not Sending

1. **Check RESEND_API_KEY is set**
   - Look for console warning: "RESEND_API_KEY is not set"
   - Emails will be simulated but not sent

2. **Check email address exists**
   - Users must have email in database

3. **Check Resend dashboard**
   - View sent emails and delivery status
   - Check for bounces or errors

### Cron Job Not Running

1. **Vercel only** - Cron jobs don't work locally
2. **Check vercel.json** is in root directory
3. **Check CRON_SECRET** matches in both code and env vars
4. **View Vercel logs** for cron execution

### Testing Locally

Use the manual trigger endpoint:
```
http://localhost:3000/api/notifications/process-delayed
```

---

## Future Enhancements

- [ ] User email preferences (opt-out of certain notifications)
- [ ] Email digest (daily summary instead of individual emails)
- [ ] Rich email templates with user avatars
- [ ] Track email open rates
- [ ] A/B test email subject lines

---

## Security Notes

- ✅ Cron endpoint requires `CRON_SECRET` authorization
- ✅ Manual trigger requires user authentication
- ✅ Email addresses are never exposed in logs
- ✅ Rate limiting via Resend (100/day free tier)

---

## Cost Estimation

**Resend Free Tier:**
- 100 emails/day
- 3,000 emails/month

**For 100 active users:**
- ~50 application emails/day (immediate)
- ~30 message emails/day (delayed, only unread)
- **Total: ~80 emails/day** ✅ Within free tier

**Paid Plan ($20/month):**
- 50,000 emails/month
- Supports ~500 active users

---

## Support

For issues or questions:
1. Check Resend documentation: https://resend.com/docs
2. Check Vercel Cron documentation: https://vercel.com/docs/cron-jobs
3. Review application logs in Vercel dashboard
