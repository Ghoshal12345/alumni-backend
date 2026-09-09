import { z } from "zod";

const updateProfileSchema = z.object({
    bio: z
        .string()
        .trim()
        .max(1000, "Bio is too long")
        .optional(),

    skills: z
        .array(
            z.string()
                .trim()
                .min(1, "Skill cannot be empty")
                .max(50, "Skill is too long")
        )
        .max(30, "Too many skills")
        .optional(),

    technologies: z
        .array(
            z.string()
                .trim()
                .min(1, "Technology cannot be empty")
                .max(50, "Technology is too long")
        )
        .max(30, "Too many technologies")
        .optional(),

    interests: z
        .array(
            z.string()
                .trim()
                .min(1, "Interest cannot be empty")
                .max(50, "Interest is too long")
        )
        .max(30, "Too many interests")
        .optional(),

    githubUrl: z
        .string()
        .url("Invalid GitHub URL")
        .max(300, "GitHub URL is too long")
        .optional(),

    linkedinUrl: z
        .string()
        .url("Invalid LinkedIn URL")
        .max(300, "LinkedIn URL is too long")
        .optional(),

    portfolioUrl: z
        .string()
        .url("Invalid portfolio URL")
        .max(300, "Portfolio URL is too long")
        .optional(),

    currentCompany: z
        .string()
        .trim()
        .max(150, "Company name is too long")
        .optional(),

    jobTitle: z
        .string()
        .trim()
        .max(150, "Job title is too long")
        .optional(),

    yearsOfExperience: z
        .number()
        .int("Experience must be a whole number")
        .min(0, "Experience cannot be negative")
        .max(60, "Invalid experience")
        .optional(),

    mentorshipAvailable: z
        .boolean()
        .optional(),
});

const validateProfileUpdate = (req, res, next) => {
    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.issues[0].message,
        });
    }

    req.body = result.data;
    next();
};

export {
    updateProfileSchema,
    validateProfileUpdate,
};