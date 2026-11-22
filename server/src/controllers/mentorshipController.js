import UserAccount from "../models/userAccount.js";
import CollegeRecord from "../models/collegeRecord.js";
import MentorshipRequest from "../models/mentorshipRequest.js";

async function createMentorshipRequest(req, res) {
    try {
        const { alumniLibraryId, message } = req.mentorshipRequestBody;

        const normalizedLibraryId = alumniLibraryId
            .trim()
            .toUpperCase();

        /*
         * Find an active Alumni account.
         */
        const alumni = await UserAccount.findOne({
            libraryId: normalizedLibraryId,
            role: "ALUMNI",
            isActive: true,
            isSuspended: false,
        });

        if (!alumni) {
            return res.status(404).json({
                message: "Alumni not found",
            });
        }

        /*
         * Verify the linked college record is still active
         * and genuinely belongs to an Alumni.
         */
        const collegeRecord = await CollegeRecord.findOne({
            _id: alumni.collegeRecordId,
            type: "ALUMNI",
            isActive: true,
            isRegistered: true,
        });

        if (!collegeRecord) {
            return res.status(404).json({
                message: "Alumni not found",
            });
        }

        /*
         * The authenticated user must be a Student.
         * The route also enforces this through RBAC, but
         * keeping the check here gives us defense in depth.
         */
        if (req.user.role !== "STUDENT") {
            return res.status(403).json({
                message: "Only students can send mentorship requests",
            });
        }

        /*
         * Prevent an existing pending request.
         * The database unique index provides an additional
         * race-condition safeguard.
         */
        const existingRequest = await MentorshipRequest.findOne({
            studentId: req.user.id,
            alumniId: alumni._id,
            status: "PENDING",
        });

        if (existingRequest) {
            return res.status(409).json({
                message: "A mentorship request is already pending",
            });
        }

        const mentorshipRequest = await MentorshipRequest.create({
            studentId: req.user.id,
            alumniId: alumni._id,
            message,
        });

        return res.status(201).json({
            message: "Mentorship request sent",
            request: {
                id: mentorshipRequest._id,
                alumniLibraryId: alumni.libraryId,
                status: mentorshipRequest.status,
                createdAt: mentorshipRequest.createdAt,
            },
        });
    } catch (error) {
        /*
         * MongoDB duplicate-key error.
         * This protects against two requests arriving
         * simultaneously.
         */
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A mentorship request is already pending",
            });
        }

        console.error("Create mentorship request error:", error);

        return res.status(500).json({
            message: "Unable to send mentorship request",
        });
    }
}

async function getSentMentorshipRequests(req, res) {
    try {
        const requests = await MentorshipRequest.find({
            studentId: req.user.id,
        })
            .populate({
                path: "alumniId",
                select: "libraryId role",
            })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            requests: requests.map((request) => ({
                id: request._id,
                alumniLibraryId: request.alumniId?.libraryId,
                status: request.status,
                message: request.message,
                createdAt: request.createdAt,
                respondedAt: request.respondedAt,
            })),
        });
    } catch (error) {
        console.error("Get sent mentorship requests error:", error);

        return res.status(500).json({
            message: "Unable to retrieve mentorship requests",
        });
    }
}

async function getReceivedMentorshipRequests(req, res) {
    try {
        const requests = await MentorshipRequest.find({
            alumniId: req.user.id,
        })
            .populate({
                path: "studentId",
                select: "libraryId role",
                populate: {
                    path: "collegeRecordId",
                    select: "name department batch domain",
                },
            })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            requests: requests.map((request) => ({
                id: request._id,
                student: request.studentId
                    ? {
                        libraryId: request.studentId.libraryId,
                        name: request.studentId.collegeRecordId?.name,
                        department:
                            request.studentId.collegeRecordId?.department,
                        graduationYear:
                            request.studentId.collegeRecordId?.batch,
                        domain:
                            request.studentId.collegeRecordId?.domain,
                    }
                    : null,
                status: request.status,
                message: request.message,
                createdAt: request.createdAt,
                respondedAt: request.respondedAt,
            })),
        });
    } catch (error) {
        console.error("Get received mentorship requests error:", error);

        return res.status(500).json({
            message: "Unable to retrieve mentorship requests",
        });
    }
}

async function acceptMentorshipRequest(req, res) {
    try {
        const { requestId } = req.mentorshipRequestParams;

        const request = await MentorshipRequest.findOneAndUpdate(
            {
                _id: requestId,
                alumniId: req.user.id,
                status: "PENDING",
            },
            {
                $set: {
                    status: "ACCEPTED",
                    respondedAt: new Date(),
                },
            },
            {
                returnDocument: "after",
            }
        );

        if (!request) {
            return res.status(404).json({
                message: "Pending mentorship request not found",
            });
        }

        return res.status(200).json({
            message: "Mentorship request accepted",
            request: {
                id: request._id,
                status: request.status,
                respondedAt: request.respondedAt,
            },
        });
    } catch (error) {
        console.error("Accept mentorship request error:", error);

        return res.status(500).json({
            message: "Unable to accept mentorship request",
        });
    }
}

async function declineMentorshipRequest(req, res) {
    try {
        const { requestId } = req.mentorshipRequestParams;

        const request = await MentorshipRequest.findOneAndUpdate(
            {
                _id: requestId,
                alumniId: req.user.id,
                status: "PENDING",
            },
            {
                $set: {
                    status: "DECLINED",
                    respondedAt: new Date(),
                },
            },
            {
                returnDocument: "after",
            }
        );

        if (!request) {
            return res.status(404).json({
                message: "Pending mentorship request not found",
            });
        }

        return res.status(200).json({
            message: "Mentorship request declined",
            request: {
                id: request._id,
                status: request.status,
                respondedAt: request.respondedAt,
            },
        });
    } catch (error) {
        console.error("Decline mentorship request error:", error);

        return res.status(500).json({
            message: "Unable to decline mentorship request",
        });
    }
}

async function cancelMentorshipRequest(req, res) {
    try {
        const { requestId } = req.mentorshipRequestParams;

        const request = await MentorshipRequest.findOneAndUpdate(
            {
                _id: requestId,
                studentId: req.user.id,
                status: "PENDING",
            },
            {
                $set: {
                    status: "CANCELLED",
                },
            },
            {
                returnDocument: "after",
            }
        );

        if (!request) {
            return res.status(404).json({
                message: "Pending mentorship request not found",
            });
        }

        return res.status(200).json({
            message: "Mentorship request cancelled",
            request: {
                id: request._id,
                status: request.status,
            },
        });
    } catch (error) {
        console.error("Cancel mentorship request error:", error);

        return res.status(500).json({
            message: "Unable to cancel mentorship request",
        });
    }
}

export {
    createMentorshipRequest,
    getSentMentorshipRequests,
    getReceivedMentorshipRequests,
    acceptMentorshipRequest,
    declineMentorshipRequest,
    cancelMentorshipRequest,
};