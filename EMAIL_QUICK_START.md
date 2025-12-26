# Smart Email System - Quick Reference

## 🎯 What Was Implemented

### ✅ Immediate Emails (Critical Events)
- **New Application** → Proposal owner gets email instantly
- **Application Accepted** → Applicant gets celebration email instantly  
- **Application Rejected** → Applicant gets encouragement email instantly

### ⏱️ Delayed Emails (Non-Critical Events)
- **New Messages** → Email sent only if unread after 10 minutes
- Prevents spam when users are active in the app

---

## 📁 Files Created/Modified

### Created Files:
1. `src/app/api/cron/send-delayed-emails/route.ts` - Cron job endpoint
2. `src/app/api/notifications/process-delayed/route.ts` - Manual testing endpoint
3. `vercel.json` - Cron configuration (runs every 10 minutes)
4. `EMAIL_SYSTEM_GUIDE.md` - Comprehensive setup guide
5. `env.example.txt` - Environment variable template

### Modified Files:
1. `src/actions/applications.ts` - Added immediate emails for status updates
2. `src/lib/email.ts` - Enhanced with branded templates and logging

---

## 🚀 Quick Setup (3 Steps)

### 1. Get Resend API Key
```
1. Go to https://resend.com
2. Sign up (free: 100 emails/day)
3. Copy API key
```

### 2. Add to .env
```env
RESEND_API_KEY=re_your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your_random_32_char_secret
```

### 3. Test It
```bash
# Start dev server
npm run dev

# Test immediate email: Create and accept/reject an application
# Test delayed email: Send a message, wait 10 min, visit:
http://localhost:3000/api/notifications/process-delayed
```

---

## 🧪 Testing Endpoints

### Manual Trigger (Testing)
```
GET /api/notifications/process-delayed
```
- Requires: User authentication
- Returns: Detailed processing report
- Use for: Local testing without waiting

### Cron Endpoint (Production)
```
GET /api/cron/send-delayed-emails
```
- Requires: CRON_SECRET header
- Runs: Every 10 minutes (Vercel only)
- Use for: Production automated emails

---

## 📧 Email Types

### 1. New Application Email
**To:** Proposal owner  
**When:** Immediately when someone applies  
**Contains:** Applicant pitch, link to dashboard

### 2. Application Accepted Email
**To:** Applicant  
**When:** Immediately when owner accepts  
**Contains:** Celebration message, link to start collaboration

### 3. Application Rejected Email
**To:** Applicant  
**When:** Immediately when owner rejects  
**Contains:** Encouragement, link to find other opportunities

### 4. Unread Message Email
**To:** Message recipient  
**When:** 10 minutes after message if still unread  
**Contains:** Message preview, link to conversation

---

## 🎨 Email Design

All emails include:
- ✅ Branded header with gradient (SkillSync purple)
- ✅ Professional typography
- ✅ Clear call-to-action buttons
- ✅ Mobile-responsive design
- ✅ Consistent footer

---

## 🔧 Configuration

### Environment Variables
| Variable | Required | Purpose |
|----------|----------|---------|
| `RESEND_API_KEY` | Yes | Send emails via Resend |
| `NEXT_PUBLIC_APP_URL` | Yes | Email links point here |
| `CRON_SECRET` | Yes | Protect cron endpoint |

### Cron Schedule
```json
"schedule": "*/10 * * * *"  // Every 10 minutes
```

Change in `vercel.json` if needed.

---

## 📊 Monitoring

### Check Email Status
1. **Resend Dashboard:** https://resend.com/emails
2. **Vercel Logs:** Project → Logs → Filter by `/api/cron`
3. **Manual Check:** Visit `/api/notifications/process-delayed`

### Console Logs
```
✅ Email sent to user@example.com: Application Accepted
⚠️  RESEND_API_KEY is not set. Email simulation
❌ Error sending email: [error details]
```

---

## 🐛 Troubleshooting

### No Emails Sending?
1. Check `RESEND_API_KEY` is set
2. Check console for simulation warning
3. Verify email exists in user database
4. Check Resend dashboard for errors

### Cron Not Running?
1. Only works on Vercel (not localhost)
2. Check `vercel.json` exists
3. Check `CRON_SECRET` matches
4. View Vercel deployment logs

### Test Locally?
Use manual trigger: `/api/notifications/process-delayed`

---

## 💰 Cost

**Resend Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for MVP

**Paid ($20/month):**
- 50,000 emails/month
- For scaling

---

## 🎯 Next Steps

1. ✅ Add `RESEND_API_KEY` to `.env`
2. ✅ Test immediate emails (create application)
3. ✅ Test delayed emails (send message)
4. ✅ Deploy to Vercel
5. ✅ Monitor email delivery

---

## 📚 Full Documentation

See `EMAIL_SYSTEM_GUIDE.md` for:
- Detailed setup instructions
- Email template customization
- Advanced configuration
- Security best practices
- Future enhancements
