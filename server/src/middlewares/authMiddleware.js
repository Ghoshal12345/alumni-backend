import UserAccount from "../models/userAccount.js";
import CollegeRecord from "../models/collegeRecord.js";
import { verifyAccessToken } from "../utils/jwt.js";

async function authenticate(req, res, next) {
    try {
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const decoded = verifyAccessToken(token);

        const user = await UserAccount.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({
                message: "Session expired",
            });
        }

        if(decoded.role !== user.role) {
            return res.status(401).json({
                message: "Role mismatch",
            });
        }

        if (!user.isActive || user.isSuspended) {
            return res.status(403).json({
                message: "Your account is currently unavailable",
            });
        }

        const collegeRecord = await CollegeRecord.findById(
            user.collegeRecordId
        );

        if (!collegeRecord || !collegeRecord.isActive) {
            return res.status(403).json({
                message: "Your account is currently unavailable",
            });
        }

        req.user = {
            id: user._id,
            libraryId: user.libraryId,
            role: user.role,
            collegeRecordId: user.collegeRecordId,
            name: collegeRecord.name,
            collegeEmail: collegeRecord.collegeEmail,
            // personalEmail: collegeRecord.personalEmail,
            department: collegeRecord.department,
            graduationYear: collegeRecord.batch,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired session",
        });
    }
};

export {
    authenticate,
};