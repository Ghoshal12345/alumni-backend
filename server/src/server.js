import 'dotenv/config';
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./configs/connection.js";

// routes
import RegistrationRouter from "./routes/registration.js";
import AuthRouter from "./routes/auth.js";
import ProfileRouter from "./routes/profile.js";
import AlumniRouter from "./routes/alumni.js";


const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// General API rate limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "Alumni Relations API is running",
    });
});


// routes
app.use("/api/registration", RegistrationRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/profile", ProfileRouter);
app.use("/api/alumni", AlumniRouter);


// server and DB connection
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // console.log("MONGO_URI:", process.env.MONGO_URI);
        // console.log("PORT:", process.env.PORT);
        // console.log("CLIENT_URL:", process.env.CLIENT_URL);
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT, () => {
            console.log(`🚀 Server started on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
    }
}
startServer();