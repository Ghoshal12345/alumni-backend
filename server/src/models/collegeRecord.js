import mongoose from "mongoose";

const collegeRecordSchema = new mongoose.Schema({
    libraryId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    collegeEmail: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },

    personalEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },

    department: {
        type: String,
        required: true,
        trim: true,
    },

    type: {
        type: String,
        enum: ["STUDENT", "ALUMNI", "ADMIN"],
        required: true,
    },

    domain: {
        type: String,
        trim: true,
        default: null,
        required: function () {
            return this.type !== "ADMIN";
        },
    },

    batch: {
        type: String,
        trim: true,
        default: null,
        required: function () {
            return this.type !== "ADMIN";
        },
    },

    isRegistered: {
        type: Boolean,
        default: false,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const CollegeRecord = mongoose.model("CollegeRecord", collegeRecordSchema);

export default CollegeRecord;