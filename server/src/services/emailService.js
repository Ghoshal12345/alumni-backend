import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, verificationLink) => {
    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verify your Alumni Relations account",
        html: `
            <h2>Alumni Relations</h2>
            <p>Welcome to the Alumni Relations platform.</p>
            <p>Click the button below to verify your email address:</p>

            <p>
                <a href="${verificationLink}">
                    Verify Email
                </a>
            </p>

            <p>This link will expire in 10 minutes.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
        `,
    });
    if (error) {
        throw new Error(`Email delivery failed: ${error.message}`);
    }
    return data;
};

export {
    sendVerificationEmail,
};