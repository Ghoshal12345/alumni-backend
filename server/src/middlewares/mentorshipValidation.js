import { z } from "zod";

const createMentorshipRequestSchema = z.object({
    alumniLibraryId: z
        .string()
        .trim()
        .min(1, "Alumni Library ID is required")
        .max(30, "Library ID is too long"),

    message: z
        .string()
        .trim()
        .min(10, "Mentorship message must be at least 10 characters")
        .max(500, "Mentorship message is too long"),
});

const mentorshipRequestParamsSchema = z.object({
    requestId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid mentorship request ID"
        ),
});

const validateCreateMentorshipRequest = (req, res, next) => {
    const result = createMentorshipRequestSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid mentorship request",
            errors: result.error.flatten(),
        });
    }

    req.mentorshipRequestBody = result.data;

    next();
};

const validateMentorshipRequestParams = (req, res, next) => {
    const result = mentorshipRequestParamsSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid mentorship request ID",
            errors: result.error.flatten(),
        });
    }

    req.mentorshipRequestParams = result.data;

    next();
};

export {
    createMentorshipRequestSchema,
    mentorshipRequestParamsSchema,
    validateCreateMentorshipRequest,
    validateMentorshipRequestParams,
};