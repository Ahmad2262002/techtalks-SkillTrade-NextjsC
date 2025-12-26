# 🚀 Email System - Quick Test Commands

## ✅ Your System Status: FULLY CONFIGURED

All required files and environment variables are in place!

---

## 🧪 Quick Tests (Copy & Paste)

### 1. Run Health Check
```bash
node check-email-system.js
```
**Expected:** All ✅ green checkmarks

---

### 2. Start Dev Server
```bash
npm run dev
```
**Watch for:** Email-related console logs when you trigger actions

---

### 3. Test Delayed Email Endpoint (Manual Trigger)
```bash
# In browser or curl:
http://localhost:3000/api/notifications/process-delayed
```

**Expected Response:**
```json
{
  "success": true,
  "summary": {
    "processed": 0,
    "emailsSent": 0,
    "skipped": 0,
    "errors": 0
  },
  "details": [],
  "timestamp": "2025-12-26T18:39:59.000Z"
}
```

---

## 📧 What Emails Are Sent?

### Immediate Emails (Sent Instantly)
| Event | Recipient | Subject |
|-------|-----------|---------|
| New Application | Proposal Owner | "New Application Received" |
| Application Accepted | Applicant | "Application Accepted" |
| Application Rejected | Applicant | "Application Rejected" |

### Delayed Emails (Sent After 1 Minute if Unread)
| Event | Recipient | Subject |
|-------|-----------|---------|
| New Message | Message Recipient | "You have unread messages on SkillSync" |

---

## 🎯 How to Test Each Email Type

### Test 1: New Application Email (30 seconds)
```
1. Open app: http://localhost:3000
2. Log in as User A
3. Create a skill proposal
4. Log out
5. Log in as User B
6. Apply to User A's proposal
7. Check console for: ✅ Email sent to [User A's email]
8. Check User A's email inbox
```

### Test 2: Application Accepted (20 seconds)
```
1. Log in as proposal owner
2. Go to Dashboard → Pending Requests
3. Click "Accept" on an application
4. Check console for: ✅ Email sent to [applicant email]
5. Check applicant's email inbox
```

### Test 3: Delayed Message Email (90 seconds)
```
1. Log in as User A
2. Send message to User B
3. DON'T read as User B (stay logged out)
4. Wait 1 minute
5. Visit: http://localhost:3000/api/notifications/process-delayed
6. Check response: "emailsSent": 1
7. Check User B's email inbox
```

---

## 🔍 Console Log Cheat Sheet

### ✅ Success Messages
```
✅ Email sent to user@example.com: New Application Received
✅ Email sent to user@example.com: Application Accepted
✅ Email sent to user@example.com: Application Rejected
```

### ⚠️ Simulation Mode (No Real Emails)
```
⚠️  RESEND_API_KEY is not set. Email simulation:
   To: user@example.com
   Subject: New Application Received
```
**Fix:** Add RESEND_API_KEY to .env and restart server

### ❌ Error Messages
```
❌ Error sending email: [error details]
```
**Fix:** Check RESEND_API_KEY is valid, check Resend dashboard

---

## 📊 Check Email Delivery (Production)

### Resend Dashboard
```
1. Go to: https://resend.com/emails
2. Log in
3. View sent emails with delivery status
```

### Vercel Logs (Production Only)
```
1. Go to: https://vercel.com
2. Select your project
3. Click "Logs"
4. Filter by: /api/cron
```

---

## 🐛 Quick Troubleshooting

### No Emails Sending?
```bash
# Check environment variable
cat .env | grep RESEND_API_KEY

# Should show: RESEND_API_KEY=re_xxxxx
# If empty, add your API key and restart server
```

### Delayed Emails Not Working?
```
1. Send a message
2. DON'T read it
3. Wait 1 minute (60 seconds)
4. Visit: http://localhost:3000/api/notifications/process-delayed
5. Check response for "emailsSent": 1
```

### Want Faster Testing?
Edit the delay time in:
`src/app/api/notifications/process-delayed/route.ts`

Change line 21:
```typescript
// From 1 minute:
const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

// To 10 seconds:
const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
```

---

## 📈 Success Indicators

Your email system is working if you see:

✅ Console shows: `✅ Email sent to...`  
✅ Emails appear in inbox (check spam folder too)  
✅ Email templates are branded with SkillSync header  
✅ Links in emails work correctly  
✅ `/api/notifications/process-delayed` returns success  

---

## 📚 Full Documentation

- **EMAIL_TESTING_GUIDE.md** - Comprehensive testing guide (you are here)
- **EMAIL_QUICK_START.md** - Quick setup instructions
- **EMAIL_SYSTEM_GUIDE.md** - Full implementation details
- **check-email-system.js** - Health check script

---

## 🎓 Next Steps

Once basic testing works:

1. ✅ Test all 4 email types
2. ✅ Verify emails arrive in inbox
3. ✅ Check email formatting on mobile
4. ✅ Deploy to Vercel
5. ✅ Monitor Resend dashboard

---

**System Status:** ✅ READY TO TEST  
**Last Checked:** Run `node check-email-system.js` to verify  
**Support:** See EMAIL_TESTING_GUIDE.md for detailed troubleshooting
