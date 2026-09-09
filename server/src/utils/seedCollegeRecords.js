import "dotenv/config";
import connectDB from "../configs/connection.js";
import CollegeRecord from "../models/collegeRecord.js";

const seedCollegeRecords = async () => {
    try {
        await connectDB(process.env.MONGO_URI);

        const records = [
            {
                libraryId: "2327CSE0001",
                name: "Test Student",
                collegeEmail: "test.student@kiet.edu",
                personalEmail: process.env.PERSONAL_EMAIL_ID,
                department: "Computer Science and Engineering",
                batch: "2023-2027",
                type: "STUDENT",
                domain: "Web Development",
            },
            {
                libraryId: "2327CSE0002",
                name: "Test Alumni",
                collegeEmail: "test.alumni@kiet.edu",
                personalEmail: process.env.PERSONAL_EMAIL_ID,
                department: "Computer Science and Engineering",
                batch: "2019-2023",
                type: "ALUMNI",
                domain: "Cloud Infrastructure",
            },
        ];

        await CollegeRecord.deleteMany({
            libraryId: {
                $in: records.map((record) => record.libraryId),
            },
        });

        await CollegeRecord.insertMany(records);

        console.log("✅ Dummy college records inserted successfully");

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to seed college records:", error);
        process.exit(1);
    }
};

seedCollegeRecords();