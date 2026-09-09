import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema(
    {
        collegeRecordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CollegeRecord",
            required: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

emailVerificationSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const EmailVerification = mongoose.model("EmailVerification",emailVerificationSchema);

export default EmailVerification;