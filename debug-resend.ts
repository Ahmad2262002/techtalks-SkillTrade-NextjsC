
import { Resend } from 'resend';

// Reading env manually for the test script
const resend = new Resend('re_AnWb6BWi_P77ra33CNW2opJcuaUJUiLkf');

async function checkResend() {
    console.log('--- Resend Diagnostic Start ---');
    const recipients = ['ahmadalkadri2002@gmail.com'];

    for (const to of recipients) {
        console.log(`\nTesting delivery to: ${to}`);
        try {
            const response = await resend.emails.send({
                from: 'SkillSync <onboarding@resend.dev>', // Using their recommended testing address
                to,
                subject: 'SkillSync Delivery Test',
                html: '<strong>Success!</strong> If you see this, your email was delivered.'
            });

            console.log('Response:', JSON.stringify(response, null, 2));

            if (response.error) {
                console.log('❌ Error Name:', response.error.name);
                console.log('❌ Error Message:', response.error.message);

                if (response.error.message.includes('verified')) {
                    console.log('\n💡 DIAGNOSIS: YOUR ACCOUNT IS NOT VERIFIED.');
                    console.log('On the Resend Free Tier, you can ONLY send emails to the address you signed up with.');
                    console.log(`If ${to} is not your signup email, it will fail.`);
                }
            } else {
                console.log('✅ Status: Request accepted by Resend.');
                console.log('ℹ️  Note: If it still doesn\'t arrive, check your SPAM folder.');
            }
        } catch (e) {
            console.error('❌ Exception:', e);
        }
    }
    console.log('\n--- Diagnostic End ---');
}

checkResend();
