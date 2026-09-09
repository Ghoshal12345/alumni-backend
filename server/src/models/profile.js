import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        userAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAccount",
            required: true,
            unique: true,
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        skills: {
            type: [String],
            default: [],
        },

        technologies: {
            type: [String],
            default: [],
        },

        interests: {
            type: [String],
            default: [],
        },

        githubUrl: {
            type: String,
            trim: true,
            default: "",
        },

        linkedinUrl: {
            type: String,
            trim: true,
            default: "",
        },

        portfolioUrl: {
            type: String,
            trim: true,
            default: "",
        },

        currentCompany: {
            type: String,
            trim: true,
            maxlength: 150,
            default: "",
        },

        jobTitle: {
            type: String,
            trim: true,
            maxlength: 150,
            default: "",
        },

        yearsOfExperience: {
            type: Number,
            min: 0,
            max: 60,
            default: null,
        },

        mentorshipAvailable: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;

// this contains profile data for student and alumni both. The userAccountId field is a reference to the UserAccount model, which contains the user's basic information such as name, email, and role.