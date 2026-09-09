import "dotenv/config";
import { sendVerificationEmail } from "../services/emailService.js";

const testEmail = async () => {
    try {
        await sendVerificationEmail(
            process.env.PERSONAL_EMAIL_ID,
            "http://localhost:5173/verify-email?token=test-token"
        );

        console.log("✅ Test email sent successfully");
    } catch (error) {
        console.error("❌ Test email failed:", error.message);
    }
};

testEmail();