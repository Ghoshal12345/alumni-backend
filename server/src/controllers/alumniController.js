import UserAccount from "../models/userAccount.js";

const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

async function getAlumniDirectory(req, res) {
    try {
        const { search, domain, page, limit } = req.alumniQuery;

        const skip = (page - 1) * limit;

        const pipeline = [
            {
                $match: {
                    role: "ALUMNI",
                    isActive: true,
                    isSuspended: false,
                },
            },

            {
                $lookup: {
                    from: "collegerecords",
                    localField: "collegeRecordId",
                    foreignField: "_id",
                    as: "collegeRecord",
                },
            },

            {
                $unwind: "$collegeRecord",
            },

            {
                $match: {
                    "collegeRecord.type": "ALUMNI",
                    "collegeRecord.isActive": true,
                    "collegeRecord.isRegistered": true,
                },
            },

            {
                $lookup: {
                    from: "profiles",
                    localField: "_id",
                    foreignField: "userAccountId",
                    as: "profile",
                },
            },

            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        if (domain) {
            pipeline.push({
                $match: {
                    "collegeRecord.domain": {
                        $regex: `^${escapeRegex(domain)}$`,
                        $options: "i",
                    },
                },
            });
        }

        if (search) {
            const searchRegex = escapeRegex(search);

            pipeline.push({
                $match: {
                    $or: [
                        {
                            "collegeRecord.name": {
                                $regex: searchRegex,
                                $options: "i",
                            },
                        },
                        {
                            "collegeRecord.domain": {
                                $regex: searchRegex,
                                $options: "i",
                            },
                        },
                        {
                            "collegeRecord.department": {
                                $regex: searchRegex,
                                $options: "i",
                            },
                        },
                        {
                            "profile.currentCompany": {
                                $regex: searchRegex,
                                $options: "i",
                            },
                        },
                        {
                            "profile.jobTitle": {
                                $regex: searchRegex,
                                $options: "i",
                            },
                        },
                        {
                            "profile.skills": {
                                $regex: searchRegex,
                                $options: "i",
                            },
                        },
                        {
                            "profile.technologies": {
                                $regex: searchRegex,
                                $options: "i",
                            },
                        },
                    ],
                },
            });
        }

        pipeline.push(
            {
                $sort: {
                    "collegeRecord.name": 1,
                },
            },

            {
                $facet: {
                    alumni: [
                        {
                            $skip: skip,
                        },
                        {
                            $limit: limit,
                        },
                        {
                            $project: {
                                _id: 0,
                                libraryId: 1,
                                name: "$collegeRecord.name",
                                department: "$collegeRecord.department",
                                graduationYear: "$collegeRecord.batch",
                                domain: "$collegeRecord.domain",
                                bio: {
                                    $ifNull: ["$profile.bio", ""],
                                },
                                skills: {
                                    $ifNull: ["$profile.skills", []],
                                },
                                technologies: {
                                    $ifNull: ["$profile.technologies", []],
                                },
                                interests: {
                                    $ifNull: ["$profile.interests", []],
                                },
                                githubUrl: {
                                    $ifNull: ["$profile.githubUrl", ""],
                                },
                                linkedinUrl: {
                                    $ifNull: ["$profile.linkedinUrl", ""],
                                },
                                portfolioUrl: {
                                    $ifNull: ["$profile.portfolioUrl", ""],
                                },
                                currentCompany: {
                                    $ifNull: ["$profile.currentCompany", ""],
                                },
                                jobTitle: {
                                    $ifNull: ["$profile.jobTitle", ""],
                                },
                                yearsOfExperience: {
                                    $ifNull: ["$profile.yearsOfExperience", null],
                                },
                                mentorshipAvailable: {
                                    $ifNull: [
                                        "$profile.mentorshipAvailable",
                                        false,
                                    ],
                                },
                            },
                        },
                    ],

                    total: [
                        {
                            $count: "count",
                        },
                    ],
                },
            }
        );

        const [result] = await UserAccount.aggregate(pipeline);

        const alumni = result?.alumni || [];
        const total = result?.total?.[0]?.count || 0;

        return res.status(200).json({
            alumni,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get alumni directory error:", error);

        return res.status(500).json({
            message: "Unable to retrieve alumni directory",
        });
    }
}

async function getAlumniProfile(req, res) {
    try {
        const { libraryId } = req.alumniParams;

        const [alumni] = await UserAccount.aggregate([
            {
                $match: {
                    libraryId: libraryId.toUpperCase(),
                    role: "ALUMNI",
                    isActive: true,
                    isSuspended: false,
                },
            },

            {
                $lookup: {
                    from: "collegerecords",
                    localField: "collegeRecordId",
                    foreignField: "_id",
                    as: "collegeRecord",
                },
            },

            {
                $unwind: "$collegeRecord",
            },

            {
                $match: {
                    "collegeRecord.type": "ALUMNI",
                    "collegeRecord.isActive": true,
                    "collegeRecord.isRegistered": true,
                },
            },

            {
                $lookup: {
                    from: "profiles",
                    localField: "_id",
                    foreignField: "userAccountId",
                    as: "profile",
                },
            },

            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $project: {
                    _id: 0,

                    libraryId: 1,

                    name: "$collegeRecord.name",
                    department: "$collegeRecord.department",
                    graduationYear: "$collegeRecord.batch",
                    domain: "$collegeRecord.domain",

                    bio: {
                        $ifNull: ["$profile.bio", ""],
                    },

                    skills: {
                        $ifNull: ["$profile.skills", []],
                    },

                    technologies: {
                        $ifNull: ["$profile.technologies", []],
                    },

                    interests: {
                        $ifNull: ["$profile.interests", []],
                    },

                    githubUrl: {
                        $ifNull: ["$profile.githubUrl", ""],
                    },

                    linkedinUrl: {
                        $ifNull: ["$profile.linkedinUrl", ""],
                    },

                    portfolioUrl: {
                        $ifNull: ["$profile.portfolioUrl", ""],
                    },

                    currentCompany: {
                        $ifNull: ["$profile.currentCompany", ""],
                    },

                    jobTitle: {
                        $ifNull: ["$profile.jobTitle", ""],
                    },

                    yearsOfExperience: {
                        $ifNull: ["$profile.yearsOfExperience", null],
                    },

                    mentorshipAvailable: {
                        $ifNull: [
                            "$profile.mentorshipAvailable",
                            false,
                        ],
                    },
                },
            },
        ]);

        if (!alumni) {
            return res.status(404).json({
                message: "Alumni not found",
            });
        }

        return res.status(200).json({
            alumni,
        });
    } catch (error) {
        console.error("Get alumni profile error:", error);

        return res.status(500).json({
            message: "Unable to retrieve alumni profile",
        });
    }
}

export {
    getAlumniDirectory,
    getAlumniProfile,
};