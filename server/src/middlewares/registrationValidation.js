import { z } from "zod";

const requestRegistrationSchema = z.object({
    libraryId: z
        .string()
        .trim()
        .min(1, "Library ID is required")
        .max(30, "Invalid Library ID"),
});

const completeRegistrationSchema = z.object({
    token: z
        .string()
        .regex(/^[a-fA-F0-9]{64}$/, "Invalid verification token"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password is too long"),
});

const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0].message,
            });
        }

        req.body = result.data;
        next();
    };
};

export {
    requestRegistrationSchema,
    completeRegistrationSchema,
    validate,
};