import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./emailTemp.js"
import { mailtrapClient, sender } from "./mailtrap.config.js"
import { transporter, sendTestEmail } from "./email.nodemailer.js"

// Decide which mailer to use (Gmail via Nodemailer or Mailtrap) and compute `from`
function getMailerAndFrom() {
    const name = process.env.SENDER_NAME || (sender && sender.name) || "ReelSthan";
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GOOGLE_APP_PASSWORD;

    if (gmailUser && gmailPass && transporter) {
        return { mailer: transporter, from: `${name} <${gmailUser}>` };
    }

    if (process.env.MAILTRAP_TOKEN && mailtrapClient) {
        const from = `${(sender && sender.name) || name} <${(sender && sender.address) || "hello@demomailtrap.co"}>`;
        return { mailer: mailtrapClient, from };
    }

    throw new Error("No email transport configured. Set GMAIL_USER + GOOGLE_APP_PASSWORD or MAILTRAP_TOKEN.");
}

export const sendVerificationEmail = async (email, verificationToken) => {
    if (!email) throw new Error("Recipient email is required for verification email");
    const { mailer, from } = getMailerAndFrom();
    try {
        const response = await mailer.sendMail({
            from,
            to: email,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            text: `Your verification code is ${verificationToken}`
        });
        console.log("Verification email sent", response && response.messageId ? response.messageId : response);
        return response;
    } catch (error) {
        console.log("ERROR in sending email", error);
        throw new Error(`ERROR sending email: ${error && error.message ? error.message : error}`);
    }
}

export const sendForgetPasswordEmail = async (email, resetURL) => {
    if (!email) throw new Error("Recipient email is required for password reset email");
    const { mailer, from } = getMailerAndFrom();
    try {
        const response = await mailer.sendMail({
            from,
            to: email,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            text: `Reset your password here: ${resetURL}`,
        });
        console.log("Password reset email sent", response && response.messageId ? response.messageId : response);
        return response;
    } catch (error) {
        console.log("ERROR in sending email", error);
        throw new Error(`ERROR sending email: ${error && error.message ? error.message : error}`);
    }
}


export const sendWelcomeEmail = async (email, name) => {
    if (!email) throw new Error("Recipient email is required for welcome email");
    const { mailer, from } = getMailerAndFrom();
    try {
        const html = WELCOME_EMAIL_TEMPLATE
            .replace(/{name}/g, name || "there")
            .replace(/{appUrl}/g, process.env.APP_URL || "https://reelsthan.example.com");

        const response = await mailer.sendMail({
            from,
            to: email,
            subject: `Welcome to ReelSthan, ${name || "new user"}`,
            html,
            text: `Welcome ${name || "new user"} to ReelSthan! Visit ${process.env.APP_URL || 'https://reelsthan.example.com'}`
        });

        console.log("Welcome email sent", response && response.messageId ? response.messageId : response);
        return response;
    } catch (error) {
        console.log("ERROR in sending email", error);
        throw new Error(`ERROR sending email: ${error && error.message ? error.message : error}`);
    }
}

export const sendResetPasswordEmail = async (email) => {
    if (!email) throw new Error("Recipient email is required for reset password email");
    const { mailer, from } = getMailerAndFrom();

    try {
        const response = await mailer.sendMail({
            from,
            to: email,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            text: `Your password has been reset successfully. If you did not initiate this change, please contact support immediately.`
        });
        console.log("Password reset success email sent", response && response.messageId ? response.messageId : response);
        return response;
    } catch (error) {
        console.log("ERROR in sending email", error);
        throw new Error(`ERROR sending email: ${error && error.message ? error.message : error}`);
    }
}