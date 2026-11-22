import { z } from "zod";

const alumniDirectoryQuerySchema = z.object({
    search: z
        .string()
        .trim()
        .max(100, "Search query is too long")
        .optional(),

    domain: z
        .string()
        .trim()
        .max(100, "Domain is too long")
        .optional(),

    page: z
        .string()
        .regex(/^\d+$/, "Invalid page number")
        .transform(Number)
        .refine((value) => value >= 1, "Invalid page number")
        .default(1),

    limit: z
        .string()
        .regex(/^\d+$/, "Invalid limit")
        .transform(Number)
        .refine((value) => value >= 1 && value <= 50, "Invalid limit")
        .default(12),
});

function validateAlumniDirectoryQuery (req, res, next) {
    const result = alumniDirectoryQuerySchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid query parameters",
            errors: result.error.flatten(),
        });
    }

    req.alumniQuery = result.data;

    next();
};

const alumniProfileParamsSchema = z.object({//before fetching alumni profile, we need to validate the params
    libraryId: z
        .string()
        .trim()
        .min(1, "Library ID is required")
        .max(30, "Library ID is too long"),
});

function validateAlumniProfileParams (req, res, next) {//fn to validate the params before fetching alumni profile
    const result = alumniProfileParamsSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid alumni identifier",
            errors: result.error.flatten(),
        });
    }

    req.alumniParams = result.data;

    next();
};

export {
    alumniDirectoryQuerySchema,
    validateAlumniDirectoryQuery,
    alumniProfileParamsSchema,
    validateAlumniProfileParams,
};