import UserAccount from "../models/userAccount.js";

async function getAlumniDirectory(req, res) {
    try {
        const {
            search,
            domain,
            page,
            limit,
        } = req.query;

        const skip = (page - 1) * limit;

        const filters = {
            role: "ALUMNI",
            isActive: true,
            isSuspended: false,
        };

        const userAccounts = await UserAccount.find(filters)
            .populate({
                path: "collegeRecordId",
                match: {
                    type: "ALUMNI",
                    isActive: true,
                    isRegistered: true,
                    ...(domain
                        ? {
                            domain: {
                                $regex: `^${domain}$`,
                                $options: "i",
                            },
                        }
                        : {}),
                    ...(search
                        ? {
                            name: {
                                $regex: search,
                                $options: "i",
                            },
                        }
                        : {}),
                },
                select: "name collegeEmail department batch domain",
            })
            .select("libraryId collegeRecordId")
            .lean();

        const validAlumni = userAccounts.filter(
            (user) => user.collegeRecordId
        );

        const total = validAlumni.length;

        const paginatedAlumni = validAlumni.slice(
            skip,
            skip + limit
        );

        return res.status(200).json({
            alumni: paginatedAlumni.map((user) => ({
                libraryId: user.libraryId,
                name: user.collegeRecordId.name,
                department: user.collegeRecordId.department,
                graduationYear: user.collegeRecordId.batch,
                domain: user.collegeRecordId.domain,
            })),
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

export {
    getAlumniDirectory,
};