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
        .default("1"),

    limit: z
        .string()
        .regex(/^\d+$/, "Invalid limit")
        .transform(Number)
        .refine((value) => value >= 1 && value <= 50, "Invalid limit")
        .default("12"),
});

const validateAlumniDirectoryQuery = (req, res, next) => {
    const result = alumniDirectoryQuerySchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.issues[0].message,
        });
    }

    req.query = result.data;
    next();
};

export {
    alumniDirectoryQuerySchema,
    validateAlumniDirectoryQuery,
};

// what is the purpose of this code?
// Why pagination?
/*
We don't want:

GET /api/alumni
    ↓
return 5,000 alumni
    ↓
huge response
    ↓
slow frontend

Instead:

page = 1
limit = 12

returns only 12.*/