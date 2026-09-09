import UserAccount from "../models/userAccount.js";
import CollegeRecord from "../models/collegeRecord.js";
import { verifyPassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/jwt.js";

async function login(req, res) {
    try {
        const { libraryId, password } = req.body;

        const collegeRecord = await CollegeRecord.findOne({
            libraryId: libraryId.trim().toUpperCase(),
        });

        if (!collegeRecord || !collegeRecord.isActive || !collegeRecord.isRegistered) {
            return res.status(401).json({
                message: "Invalid Library ID or password",
            });
        }

        const user = await UserAccount.findOne({
            libraryId: libraryId.trim().toUpperCase(),
        }).select("+passwordHash");

        if (!user) {
            return res.status(401).json({
                message: "Invalid Library ID or password",
            });
        }

        if (!user.isActive || user.isSuspended) {
            return res.status(403).json({
                message: "Your account is currently suspended or inactive",
            });
        }

        const passwordValid = await verifyPassword(
            user.passwordHash,
            password
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: "Invalid Library ID or password",
            });
        }

        const token = generateAccessToken(user);
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        user.lastLogin = new Date();
        await user.save();

        return res.status(200).json({
            message: "Login successful",
            user: {
                libraryId: user.libraryId,
                role: user.role,
                name: collegeRecord.name,
                collegeEmail: collegeRecord.collegeEmail,
                // personalEmail: collegeRecord.personalEmail,
                department: collegeRecord.department,
                graduationYear: collegeRecord.batch,
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Unable to process login",
        });
    }
};

async function getCurrentUser(req, res) {
    try {
        return res.status(200).json({
            user: {
                libraryId: req.user.libraryId,
                role: req.user.role,
                name: req.user.name,
                collegeEmail: req.user.collegeEmail,
                // personalEmail: req.user.personalEmail,
                department: req.user.department,
                graduationYear: req.user.graduationYear,
            },
        });
    } catch (error) {
        console.error("Get current user error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

async function logout(req, res) {
    try {
        const userId = req.user.id;
        const user = await UserAccount.findById(userId);

        if (user) {
            user.tokenVersion += 1;
            await user.save();
        }

        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Unable to process logout",
        });
    }
};


export {
    login,
    getCurrentUser,
    logout,
};