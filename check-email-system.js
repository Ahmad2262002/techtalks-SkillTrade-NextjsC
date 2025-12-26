#!/usr/bin/env node

/**
 * Email System Health Check Script
 * Run this to verify your email system configuration
 * 
 * Usage: node check-email-system.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Smart Email System - Health Check\n');
console.log('='.repeat(50));

// Check 1: Environment Variables
console.log('\n📋 1. Checking Environment Variables...');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('   Create a .env file in the project root');
} else {
    const envContent = fs.readFileSync(envPath, 'utf-8');

    const checks = {
        'RESEND_API_KEY': envContent.includes('RESEND_API_KEY='),
        'NEXT_PUBLIC_APP_URL': envContent.includes('NEXT_PUBLIC_APP_URL='),
        'CRON_SECRET': envContent.includes('CRON_SECRET='),
    };

    Object.entries(checks).forEach(([key, exists]) => {
        if (exists) {
            // Check if it has a value (not just the key)
            const match = envContent.match(new RegExp(`${key}=(.+)`));
            const hasValue = match && match[1].trim().length > 0;

            if (hasValue) {
                console.log(`✅ ${key} is set`);
            } else {
                console.log(`⚠️  ${key} exists but has no value`);
            }
        } else {
            console.log(`❌ ${key} is missing`);
        }
    });
}

// Check 2: Required Files
console.log('\n📁 2. Checking Required Files...');
const requiredFiles = [
    'src/lib/email.ts',
    'src/app/api/notifications/process-delayed/route.ts',
    'src/app/api/cron/send-delayed-emails/route.ts',
    'vercel.json',
];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING!`);
    }
});

// Check 3: Vercel Configuration
console.log('\n⚙️  3. Checking Vercel Cron Configuration...');
const vercelJsonPath = path.join(__dirname, 'vercel.json');

if (fs.existsSync(vercelJsonPath)) {
    try {
        const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));

        if (vercelConfig.crons && vercelConfig.crons.length > 0) {
            console.log('✅ Cron jobs configured:');
            vercelConfig.crons.forEach(cron => {
                console.log(`   - ${cron.path} (${cron.schedule})`);
            });
        } else {
            console.log('⚠️  No cron jobs found in vercel.json');
        }
    } catch (error) {
        console.log('❌ Error parsing vercel.json:', error.message);
    }
} else {
    console.log('⚠️  vercel.json not found (only needed for production)');
}

// Check 4: Email Service Implementation
console.log('\n📧 4. Checking Email Service Implementation...');
const emailLibPath = path.join(__dirname, 'src/lib/email.ts');

if (fs.existsSync(emailLibPath)) {
    const emailContent = fs.readFileSync(emailLibPath, 'utf-8');

    const features = {
        'Resend import': emailContent.includes('from \'resend\''),
        'sendEmail function': emailContent.includes('export async function sendEmail'),
        'Email template wrapper': emailContent.includes('wrapEmailTemplate'),
        'Error handling': emailContent.includes('try') && emailContent.includes('catch'),
        'Simulation mode': emailContent.includes('RESEND_API_KEY is not set'),
    };

    Object.entries(features).forEach(([feature, exists]) => {
        console.log(exists ? `✅ ${feature}` : `❌ ${feature} - MISSING!`);
    });
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:\n');
console.log('Next steps:');
console.log('1. Fix any ❌ issues above');
console.log('2. Restart your dev server: npm run dev');
console.log('3. Test emails using the guide in EMAIL_TESTING_GUIDE.md');
console.log('4. Visit http://localhost:3000/api/notifications/process-delayed');
console.log('\n💡 For detailed testing instructions, see:');
console.log('   - EMAIL_TESTING_GUIDE.md (comprehensive testing)');
console.log('   - EMAIL_QUICK_START.md (quick setup)');
console.log('   - EMAIL_SYSTEM_GUIDE.md (full documentation)');
console.log('\n');
