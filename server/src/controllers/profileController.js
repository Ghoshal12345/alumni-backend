import Profile from "../models/profile.js";

async function getProfile(req, res) {
    try {
        const profile = await Profile.findOne({
            userAccountId: req.user.id,
        }).select("-_id -userAccountId -__v");

        return res.status(200).json({
            user: {
                libraryId: req.user.libraryId,
                role: req.user.role,
                name: req.user.name,
                collegeEmail: req.user.collegeEmail,
                department: req.user.department,
                graduationYear: req.user.graduationYear,
            },
            profile: profile || null,
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Unable to retrieve profile",
        });
    }
}

async function updateProfile(req, res) {
    try {
        const profile = await Profile.findOneAndUpdate(
            {
                userAccountId: req.user.id,
            },
            {
                $set: req.body,
            },
            {
                returnDocument: "after",
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        ).select("-_id -userAccountId -__v");

        return res.status(200).json({
            message: "Profile updated successfully",
            profile,
        });
    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            message: "Unable to update profile",
        });
    }
}


export {
    getProfile,
    updateProfile,
};