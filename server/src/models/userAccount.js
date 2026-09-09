import mongoose from "mongoose";

const userAccountSchema = new mongoose.Schema({
    collegeRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CollegeRecord",
        required: true,
        unique: true,
    },

    libraryId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    passwordHash: {
        type: String,
        required: true,
        select: false, // Exclude passwordHash from query results by default
    },

    role: {
        type: String,
        enum: ["STUDENT", "ALUMNI", "ADMIN"],
        required: true,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    isSuspended: {
        type: Boolean,
        default: false,
    },

    tokenVersion: {
        type: Number,
        default: 0,
    },

    lastLogin: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

const UserAccount = mongoose.model("UserAccount", userAccountSchema);

export default UserAccount;

// const UserAccount =
//     mongoose.models.UserAccount ||
//     mongoose.model("UserAccount", userAccountSchema);

// export default UserAccount;



/*
User logs in
    ↓
JWT contains tokenVersion: 0
    ↓
User logs out
    ↓
DB tokenVersion becomes 1
    ↓
Old JWT contains 0
    ↓
Middleware sees 0 ≠ 1
    ↓
Old session rejected

So logout can actually invalidate the existing token instead of merely deleting the browser cookie.

/ ? The JWT will contain only necessary information such as:

{
    userId,
    role,
    tokenVersion
}

 */