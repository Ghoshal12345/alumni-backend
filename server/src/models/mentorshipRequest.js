import mongoose from "mongoose";

const mentorshipRequestSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAccount",
            required: true,
        },

        alumniId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAccount",
            required: true,
        },

        message: {
            type: String,
            trim: true,
            required: true,
            maxlength: 500,
        },

        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "DECLINED", "CANCELLED"],
            default: "PENDING",
        },

        respondedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);


/*
 * Prevent multiple pending requests from the same
 * student to the same alumni.
 * Once a request is accepted, declined, or cancelled,
 * a new request can be created later.
 */
mentorshipRequestSchema.index(
    { studentId: 1, alumniId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: "PENDING",
        },
    }
);

const MentorshipRequest = mongoose.model(
    "MentorshipRequest",
    mentorshipRequestSchema
);

export default MentorshipRequest;