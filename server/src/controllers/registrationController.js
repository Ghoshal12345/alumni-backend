import CollegeRecord from "../models/collegeRecord.js";
import UserAccount from "../models/userAccount.js";
import EmailVerification from "../models/EmailVerification.js";
import { generateVerificationToken, hashToken } from "../utils/token.js";
import { hashPassword } from "../utils/password.js";
import { sendVerificationEmail } from "../services/emailService.js";


const requestRegistration = async (req, res) => {
    try {
        const { libraryId } = req.body;

        if (!libraryId) {
            return res.status(400).json({
                // success: false,
                message: "Library ID is required",
            });
        }

        const collegeRecord = await CollegeRecord.findOne({
            libraryId: libraryId.trim().toUpperCase(),
            isActive: true,
            isRegistered: false,
        });

        // Don't reveal whether a particular Library ID exists.
        if (!collegeRecord) {
            return res.status(200).json({
                // success: true,
                message:
                    "If the provided details are eligible, a verification email will be sent.",
            });
        }

        // Remove previous unused verification tokens.
        await EmailVerification.deleteMany({
            collegeRecordId: collegeRecord._id,
            verified: false,
        });

        const { token, tokenHash } = generateVerificationToken();

        await EmailVerification.create({
            collegeRecordId: collegeRecord._id,
            tokenHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        const verificationLink =
            `${process.env.CLIENT_URL}/verify-email?token=${token}`;

        await sendVerificationEmail(
            collegeRecord.personalEmail,
            verificationLink
        );

        return res.status(200).json({
            // success: true,
            message: "If the provided details are eligible, a verification email will be sent.",
        });
    } catch (error) {
        console.error("Registration request error:", error);

        return res.status(500).json({
            // success: false,
            message: "Unable to process registration request",
        });
    }
};

const completeRegistration = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                // success: false,
                message: "Token and password are required",
            });
        }

        const tokenHash = hashToken(token);

        const verificationEmail = await EmailVerification.findOne({
            tokenHash,
            verified: false,
            expiresAt: { $gt: new Date() },
        });

        if (!verificationEmail) {
            return res.status(400).json({
                // success: false,
                message: "Invalid or expired verification token",
            });
        }

        const collegeRecord = await CollegeRecord.findOne({
            _id: verificationEmail.collegeRecordId,
            isActive: true,
            isRegistered: false,
        });

        if (!collegeRecord) {
            return res.status(400).json({
                // success: false,
                message: "Registration is not available",
            });
        }

        const existingAccount = await UserAccount.findOne({
            collegeRecordId: collegeRecord._id,
        });

        if (existingAccount) {
            return res.status(409).json({
                // success: false,
                message: "Account already exists",
            });
        }

        const passwordHash = await hashPassword(password);

        await UserAccount.create({
            collegeRecordId: collegeRecord._id,
            libraryId: collegeRecord.libraryId,
            passwordHash,
            role: collegeRecord.type,
        });

        collegeRecord.isRegistered = true;
        await collegeRecord.save();

        verificationEmail.verified = true;
        await verificationEmail.save();

        return res.status(201).json({
            // success: true,
            message: "Account created successfully",
        });
    } catch (error) {
        console.error("Registration completion error:", error);

        return res.status(500).json({
            // success: false,
            message: "Unable to complete registration",
        });
    }
};

export {
    requestRegistration,
    completeRegistration,
};