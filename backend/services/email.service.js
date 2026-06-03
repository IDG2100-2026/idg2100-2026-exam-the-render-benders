import nodemailer from "nodemailer";

const {
    GMAIL_USER,
    GMAIL_APP_PASSWORD
} = process.env;

const transporter = GMAIL_USER && GMAIL_APP_PASSWORD ?
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD
        }
    }) :
    null;

export async function sendVerificationEmail(user, code) {
    if (transporter) {
        await transporter.sendMail({
            from: `"Spanish Poker Dice" <${GMAIL_USER}>`,
            to: user.email,
            subject: "Verify your Spanish Poker Dice account",
            html: /*html*/ `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:0;background:#f0ece4;border-radius:12px;overflow:hidden;">
        <div style="background:#1a1a2e;padding:2rem;border:1px solid #c9a84c33;border-radius:12px;">
            <h2 style="color:#c9a84c;margin:0 0 0.25rem 0;font-size:1.3rem;">🎲 Spanish Poker Dice</h2>
            <hr style="border:none;border-top:1px solid #c9a84c33;margin:1rem 0;" />
            <p style="color:#c9b99a;margin:0 0 0.5rem 0;">Hi, here is your verification code to get started:</p>
            <div style="font-size:2.2rem;font-weight:800;letter-spacing:0.5rem;color:#c9a84c;padding:1rem 0;">${code}</div>
            <p style="color:#c9b99a;font-size:0.85rem;margin:1rem 0 1.5rem 0;">This code expires in 15 minutes. If you did not request this, you can ignore this email.</p>
            <hr style="border:none;border-top:1px solid #c9a84c22;margin:0 0 1rem 0;" />
            <p style="color:#c9b99a55;font-size:0.75rem;margin:0;text-align:center;">Spanish Poker Dice - do not reply to this email</p>
        </div>
    </div>
    `,
            text: `Your verification code is: ${code}. This code expires in 15 minutes.`
        });
    } else {
        console.log(`Email verification code for ${user.email}: ${code}`);
    }
}